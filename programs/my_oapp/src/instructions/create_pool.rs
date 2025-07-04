use anchor_lang::prelude::*;
use crate::state::bet_pool::{BetPool, PoolStatus};
use crate::state::store::Store;
use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreatePoolParams {
    pub question: String,
    pub options: Vec<String>,
    pub start_time: i64,
    pub lock_time: i64,
    pub end_time: i64,
    pub pool_id: u64,
}

#[derive(Accounts)]
#[instruction(params: CreatePoolParams)]
pub struct CreatePool<'info> {
    #[account(
        init_if_needed,
        payer = creator,
        seeds = [b"betpool", creator.key().as_ref(), &params.pool_id.to_le_bytes()],
        bump,
        space = BetPool::INIT_SPACE,  //8 + 32 + 4 + 256 + 4 + (32 * 8) + 1 + 1 + (8 * 8) + 1 + 8*3 + 8 + 4 + (8*8) + 1 + 1 + 1
    )]
    pub bet_pool: Account<'info, BetPool>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(seeds = [STORE_SEED], bump = store.bump)]
    pub store: Account<'info, Store>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreatePool<'info> {
    pub fn apply(ctx: &mut Context<Self>, params: &CreatePoolParams, pool_id: u64) -> Result<()> {
        let bet_pool = &mut ctx.accounts.bet_pool;
        let store = &mut ctx.accounts.store;
        
        bet_pool.id = pool_id;
        bet_pool.creator = ctx.accounts.creator.key();
        bet_pool.question = params.question.clone();
        bet_pool.status = PoolStatus::Open;
        bet_pool.winning_option = 0; // Default to first option
        bet_pool.start_time = params.start_time;
        bet_pool.lock_time = params.lock_time;
        bet_pool.end_time = params.end_time;
        bet_pool.unique_bettors = 0;
        bet_pool.pool_amount = 0;
        bet_pool.option_amounts = vec![0; params.options.len()];
        bet_pool.is_result_set = false;
        bet_pool.result = 0; // Default to first option

        store.pools_count = store.pools_count.checked_add(1).unwrap();
        Ok(())
    }
} 