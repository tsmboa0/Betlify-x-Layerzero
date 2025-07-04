use anchor_lang::prelude::*;
use crate::state::bet_pool::BetPool;
use crate::state::bet::Bet;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlaceBetParams {
    pub user: Pubkey,
    pub option: u8,
    pub amount: u64,
}

#[derive(Accounts)]
#[instruction(place_bet_params: PlaceBetParams)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bet_pool: Account<'info, BetPool>,
    #[account(
        init_if_needed,
        payer = user,
        space =  Bet::INIT_SPACE, // 8 + 4 + 64 + 32 + 32 + 1 + 8 + 1 + 1, // 4+64 for authority string
        seeds = [b"bet", user.key().as_ref(), bet_pool.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum PlaceBetError {
    #[msg("Betting is not open for this pool")] 
    BettingClosed,
    #[msg("Duplicate bet from this authority")] 
    DuplicateBet,
    #[msg("Invalid option")] 
    InvalidOption,
}

impl<'info> PlaceBet<'info> {
    pub fn apply(ctx: &mut Context<Self>, params: &PlaceBetParams) -> Result<()> {
        let bet = &mut ctx.accounts.bet;
        let pool = &mut ctx.accounts.bet_pool;
        let clock = Clock::get()?;

        // Enforce time window
        require!(clock.unix_timestamp >= pool.start_time && clock.unix_timestamp < pool.lock_time, PlaceBetError::BettingClosed);
        // Enforce valid option (check against option_amounts length)
        require!((params.option as usize) < pool.option_amounts.len(), PlaceBetError::InvalidOption);
        // Prevent duplicate bets (if bet already exists, Anchor will error on init)
        // Update pool amounts
        pool.pool_amount = pool.pool_amount.checked_add(params.amount).unwrap();
        pool.option_amounts[params.option as usize] = pool.option_amounts[params.option as usize].checked_add(params.amount).unwrap();
        // Update unique bettors
        pool.unique_bettors = pool.unique_bettors.checked_add(1).unwrap();
        // Set bet fields
        bet.authority = ctx.accounts.user.key();
        bet.pool = ctx.accounts.bet_pool.key();
        bet.option = params.option;
        bet.amount = params.amount;
        bet.claimed = false;
        Ok(())
    }
} 