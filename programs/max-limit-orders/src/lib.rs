use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("Fg1s6RyhV1otJ6M862xiTNy9D292haSM1YMtn6RcoMWb");

pub const PLATFORM_FEE_BPS: u16 = 1; // 0.01%

// Order status constants
pub const ORDER_STATUS_ACTIVE: u8 = 0;
pub const ORDER_STATUS_CANCELLED: u8 = 1;
pub const ORDER_STATUS_FILLED: u8 = 2;
pub const ORDER_STATUS_EXPIRED: u8 = 3;

#[program]
pub mod max_limit_orders {
    use super::*;

    pub fn create_order(
        ctx: Context<CreateOrder>,
        order_id: u64,
        input_mint: Pubkey,
        output_mint: Pubkey,
        input_amount: u64,
        trigger_price: u64,  // Price in basis points (e.g., 1.50 SOL = 1500000)
        expiry: i64,          // Unix timestamp
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        order.owner = ctx.accounts.user.key();
        order.order_id = order_id;
        order.input_mint = input_mint;
        order.output_mint = output_mint;
        order.input_amount = input_amount;
        order.trigger_price = trigger_price;
        order.filled_amount = 0;
        order.status = ORDER_STATUS_ACTIVE;
        order.created_at = Clock::get()?.unix_timestamp;
        order.expiry = expiry;
        order.fee_paid = 0;

        // Transfer input tokens to escrow
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.user_input_token.to_account_info(),
                to: ctx.accounts.escrow_input_token.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, input_amount)?;

        msg!("Limit order created: {} - {} {} at price {}",
             order_id, input_amount, input_mint, trigger_price);
        Ok(())
    }

    pub fn cancel_order(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require!(order.owner == ctx.accounts.user.key(), ErrorCode::Unauthorized);
        require!(order.status == ORDER_STATUS_ACTIVE, ErrorCode::OrderNotActive);

        let remaining_amount = order.input_amount - order.filled_amount;
        if remaining_amount > 0 {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.escrow_input_token.to_account_info(),
                    to: ctx.accounts.user_input_token.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
            );
            token::transfer(cpi_ctx, remaining_amount)?;
        }

        order.status = ORDER_STATUS_CANCELLED;
        msg!("Limit order {} cancelled", order_id);
        Ok(())
    }

    pub fn execute_order(ctx: Context<ExecuteOrder>, order_id: u64, current_price: u64) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require!(order.status == ORDER_STATUS_ACTIVE, ErrorCode::OrderNotActive);
        require!(current_price <= order.trigger_price, ErrorCode::PriceNotMet);
        require!(Clock::get()?.unix_timestamp <= order.expiry, ErrorCode::OrderExpired);

        // Calculate fee (0.01%)
        let fee = (order.input_amount as u128 * PLATFORM_FEE_BPS as u128 / 10000) as u64;
        let user_amount = order.input_amount - fee;

        // Transfer output to user (swapped amount)
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

        order.filled_amount = order.input_amount;
        order.status = ORDER_STATUS_FILLED;
        order.fee_paid = fee;

        msg!("Limit order {} executed at price {}", order_id, current_price);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateOrder<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 8 + 8)]
    pub order: Account<'info, OrderState>,
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
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub order: Account<'info, OrderState>,
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

#[derive(Accounts)]
pub struct ExecuteOrder<'info> {
    #[account(mut)]
    pub order: Account<'info, OrderState>,
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

#[account]
pub struct OrderState {
    pub owner: Pubkey,
    pub order_id: u64,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
    pub input_amount: u64,
    pub trigger_price: u64,
    pub filled_amount: u64,
    pub status: u8,
    pub created_at: i64,
    pub expiry: i64,
    pub fee_paid: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Order is not active")]
    OrderNotActive,
    #[msg("Trigger price not met")]
    PriceNotMet,
    #[msg("Order has expired")]
    OrderExpired,
}
