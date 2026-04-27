use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("MAXRouter1111111111111111111111111111111111");

#[program]
pub mod max_router {
    use super::*;

    pub fn swap(ctx: Context<Swap>, amount_in: u64, min_amount_out: u64) -> Result<()> {
        let amount_out = (ctx.accounts.pool.reserve_b * amount_in) / (ctx.accounts.pool.reserve_a + amount_in);
        require!(amount_out >= min_amount_out, ErrorCode::SlippageExceeded);
        
        let fee = (amount_out * 1) / 10000;
        let amount_to_user = amount_out - fee;
        
        ctx.accounts.pool.reserve_a += amount_in;
        ctx.accounts.pool.reserve_b -= amount_out;
        
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
                from: ctx.accounts.user_source.to_account_info(),
                to: ctx.accounts.pool_source.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            }),
            amount_in,
        )?;
        
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
                from: ctx.accounts.pool_dest.to_account_info(),
                to: ctx.accounts.user_dest.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            }),
            amount_to_user,
        )?;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_dest: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_dest: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub total_liquidity: u64,
    pub is_active: bool,
}

#[error_code]
pub enum ErrorCode {
    SlippageExceeded,
}
