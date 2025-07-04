use anchor_lang::prelude::*;
use crate::state::bet_pool::{BetPool, PoolStatus};
use crate::state::bet::Bet;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ClaimWinningsParams {
    // No parameters needed for this instruction
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub bet_pool: Account<'info, BetPool>,
    #[account(mut)]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ClaimWinningsError {
    #[msg("Result not set")] 
    ResultNotSet,
    #[msg("Market not resolved")] 
    MarketNotResolved,
    #[msg("Already claimed")] 
    AlreadyClaimed,
    #[msg("Invalid bet for this pool")] 
    InvalidBet,
}

impl<'info> ClaimWinnings<'info> {
    pub fn apply(ctx: &mut Context<Self>, _params: &ClaimWinningsParams) -> Result<()> {
        let pool = &ctx.accounts.bet_pool;
        let bet = &mut ctx.accounts.bet;

        // Validate pool is resolved
        require!(pool.is_result_set, ClaimWinningsError::ResultNotSet);
        require!(pool.status == PoolStatus::Resolved, ClaimWinningsError::MarketNotResolved);

        // Validate bet belongs to this pool
        require_keys_eq!(bet.pool, pool.key(), ClaimWinningsError::InvalidBet);

        // Check if bet is already claimed
        require!(!bet.claimed, ClaimWinningsError::AlreadyClaimed);

        // Mark as claimed (actual payout logic would go here)
        bet.claimed = true;
        Ok(())
    }
} 