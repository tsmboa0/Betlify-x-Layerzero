use anchor_lang::prelude::*;
use crate::state::bet_pool::{BetPool, PoolStatus};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ResolveMarketParams {
    pub winning_option: u8,
}

#[derive(Accounts)]
#[instruction(params: ResolveMarketParams)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub bet_pool: Account<'info, BetPool>,
    pub creator: Signer<'info>,
}

#[error_code]
pub enum ResolveMarketError {
    #[msg("Market not ended")] 
    MarketNotEnded,
    #[msg("Result already set")] 
    ResultAlreadySet,
    #[msg("Invalid option")] 
    InvalidOption,
}

impl<'info> ResolveMarket<'info> {
    pub fn apply(ctx: &mut Context<Self>, params: &ResolveMarketParams) -> Result<()> {
        let pool = &mut ctx.accounts.bet_pool;
        let clock = Clock::get()?;

        // Only allow resolution after end time
        require!(clock.unix_timestamp >= pool.end_time, ResolveMarketError::MarketNotEnded);
        require!(!pool.is_result_set, ResolveMarketError::ResultAlreadySet);
        require!((params.winning_option as usize) < pool.option_amounts.len(), ResolveMarketError::InvalidOption);

        pool.status = PoolStatus::Resolved;
        pool.winning_option = params.winning_option;
        pool.is_result_set = true;
        pool.result = params.winning_option;
        Ok(())
    }
} 