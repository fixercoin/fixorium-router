use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("Fg1s6RyhV1otJ6M862xiTNy9D292haSM1YMtn6RcoMWb");

pub const PLATFORM_FEE_BPS: u16 = 1; // 0.01%

// Strategy status constants
pub const STATUS_ACTIVE: u8 = 0;
pub const STATUS_COMPLETED: u8 = 1;
pub const STATUS_WITHDRAWN: u8 = 2;

#[program]
pub mod max_dca {
    use super::*;

    pub fn create_strategy(
        ctx: Context<CreateStrategy>,
        strategy_id: u64,
        input_mint: Pubkey,
        output_mint: Pubkey,
        total_amount: u64,
        amount_per_cycle: u64,
        cycle_seconds: u64,
        total_cycles: u64,
    ) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        let now = Clock::get()?.unix_timestamp;

        strategy.owner = ctx.accounts.user.key();
        strategy.strategy_id = strategy_id;
        strategy.input_mint = input_mint;
        strategy.output_mint = output_mint;
        strategy.total_amount = total_amount;
        strategy.remaining_amount = total_amount;
        strategy.amount_per_cycle = amount_per_cycle;
        strategy.cycle_seconds = cycle_seconds;
        strategy.total_cycles = total_cycles;
        strategy.completed_cycles = 0;
        strategy.last_execution = now;
        strategy.next_execution = now + (cycle_seconds as i64);
        strategy.status = STATUS_ACTIVE;
        strategy.fee_paid = 0;

        // Transfer total amount to escrow
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_input_token.to_account_info(),
                to: ctx.accounts.escrow_input_token.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, total_amount)?;

        msg!("DCA strategy {} created: {} cycles of {} every {} seconds",
             strategy_id, total_cycles, amount_per_cycle, cycle_seconds);
        Ok(())
    }

    pub fn execute_cycle(ctx: Context<ExecuteCycle>, strategy_id: u64) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        let now = Clock::get()?.unix_timestamp;

        require!(strategy.status == STATUS_ACTIVE, ErrorCode::StrategyNotActive);
        require!(now >= strategy.next_execution, ErrorCode::TooEarly);
        require!(strategy.remaining_amount >= strategy.amount_per_cycle, ErrorCode::InsufficientFunds);

        // Calculate fee (0.01%)
        let fee = (strategy.amount_per_cycle as u128 * PLATFORM_FEE_BPS as u128 / 10000) as u64;
        let user_amount = strategy.amount_per_cycle - fee;

        // Transfer output to user
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.escrow_output_token.to_account_info(),
                to: ctx.accounts.user_output_token.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, user_amount)?;

        // Transfer fee to treasury
        if fee > 0 {
            let fee_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.escrow_output_token.to_account_info(),
                    to: ctx.accounts.treasury_token.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
            );
            token::transfer(fee_ctx, fee)?;
        }

        strategy.remaining_amount -= strategy.amount_per_cycle;
        strategy.completed_cycles += 1;
        strategy.last_execution = now;
        strategy.next_execution = now + (strategy.cycle_seconds as i64);
        strategy.fee_paid += fee;

        if strategy.completed_cycles >= strategy.total_cycles {
            strategy.status = STATUS_COMPLETED;
            // Return any remaining dust to user
            if strategy.remaining_amount > 0 {
                let dust_ctx = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::Transfer {
                        from: ctx.accounts.escrow_input_token.to_account_info(),
                        to: ctx.accounts.user_input_token.to_account_info(),
                        authority: ctx.accounts.escrow_authority.to_account_info(),
                    },
                );
                token::transfer(dust_ctx, strategy.remaining_amount)?;
                strategy.remaining_amount = 0;
            }
        }

        msg!("DCA cycle executed for strategy {}", strategy_id);
        Ok(())
    }

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, strategy_id: u64) -> Result<()> {
        let strategy = &mut ctx.accounts.strategy;
        require!(strategy.owner == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(strategy.status == STATUS_ACTIVE, ErrorCode::StrategyNotActive);

        let remaining = strategy.remaining_amount;
        strategy.remaining_amount = 0;
        strategy.status = STATUS_WITHDRAWN;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.escrow_input_token.to_account_info(),
                to: ctx.accounts.user_input_token.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, remaining)?;

        msg!("Funds withdrawn from DCA strategy {}", strategy_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateStrategy<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 8)]
    pub strategy: Account<'info, DCAStrategy>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_input_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_input_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteCycle<'info> {
    #[account(mut)]
    pub strategy: Account<'info, DCAStrategy>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_output_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_output_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token: Account<'info, TokenAccount>,
    /// CHECK: Escrow authority PDA
    pub escrow_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(mut)]
    pub strategy: Account<'info, DCAStrategy>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_input_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_input_token: Account<'info, TokenAccount>,
    /// CHECK: Escrow authority PDA
    pub escrow_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct DCAStrategy {
    pub owner: Pubkey,
    pub strategy_id: u64,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
    pub total_amount: u64,
    pub remaining_amount: u64,
    pub amount_per_cycle: u64,
    pub cycle_seconds: u64,
    pub total_cycles: u64,
    pub completed_cycles: u64,
    pub last_execution: i64,
    pub next_execution: i64,
    pub status: u8,
    pub fee_paid: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Strategy is not active")]
    StrategyNotActive,
    #[msg("Too early for next cycle")]
    TooEarly,
    #[msg("Insufficient funds in escrow")]
    InsufficientFunds,
}
