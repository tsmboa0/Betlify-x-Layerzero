use crate::*;
use anchor_lang::prelude::*;
use oapp::{
    endpoint::{
        cpi::accounts::Clear,
        instructions::ClearParams,
        ConstructCPIContext, ID as ENDPOINT_ID,
    },
    LzReceiveParams,
};
use anchor_lang::solana_program::system_program;

use crate::state::{bet_pool::BetPool, bet::Bet, PoolStatus};
use crate::{PlaceBetError};

#[derive(Accounts)]
#[instruction(params: LzReceiveParams)]
pub struct LzReceive<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [PEER_SEED, &store.key().to_bytes(), &params.src_eid.to_be_bytes()],
        bump = peer.bump,
        constraint = params.sender == peer.peer_address
    )]
    pub peer: Account<'info, PeerConfig>,

    #[account(mut, seeds = [STORE_SEED], bump = store.bump)]
    pub store: Account<'info, Store>,

    #[account(init_if_needed, payer = payer, seeds = [b"betpool", store.key().as_ref(), &store.pools_count.to_le_bytes()], bump, space = 8 + BetPool::INIT_SPACE)]
    pub bet_pool: Account<'info, BetPool>,

    #[account(init_if_needed, payer = payer, seeds = [b"bet", params.sender.as_ref(), bet_pool.key().as_ref()], bump, space = 8 + Bet::INIT_SPACE)]
    pub bet: Account<'info, Bet>,

    pub system_program: Program<'info, System>,
}

impl<'info> LzReceive<'info> {
    pub fn apply(ctx: &mut Context<Self>, params: &LzReceiveParams) -> Result<()> {
        let seeds: &[&[u8]] = &[STORE_SEED, &[ctx.accounts.store.bump]];
        let clear_accounts = &ctx.remaining_accounts[0..Clear::MIN_ACCOUNTS_LEN];

        oapp::endpoint_cpi::clear(
            ENDPOINT_ID,
            ctx.accounts.store.key(),
            clear_accounts,
            seeds,
            ClearParams {
                receiver: ctx.accounts.store.key(),
                src_eid: params.src_eid,
                sender: params.sender,
                nonce: params.nonce,
                guid: params.guid,
                message: params.message.clone(),
            },
        )?;


        match msg_codec::decode_betlify_message(&params.message) {
            Ok(betlify_msg) => {
                match betlify_msg {
                    msg_codec::BetlifyMessage::CreatePool { question, options, start_time, lock_time, end_time, pool_id } => {
                        msg!("Creating pool {}", pool_id);

                        let bet_pool = &mut ctx.accounts.bet_pool;
                        let store = &mut ctx.accounts.store;

                        bet_pool.id = pool_id;
                        bet_pool.creator = ctx.accounts.payer.key();
                        bet_pool.question = question;
                        bet_pool.status = PoolStatus::Open;
                        bet_pool.winning_option = 0; // Default to first option
                        bet_pool.start_time = start_time;
                        bet_pool.lock_time = lock_time;
                        bet_pool.end_time = end_time;
                        bet_pool.unique_bettors = 0;
                        bet_pool.pool_amount = 0;
                        bet_pool.option_amounts = vec![0; options.len()];
                        bet_pool.is_result_set = false;
                        bet_pool.result = 0; // Default to first option

                        store.pools_count = store.pools_count.checked_add(1).unwrap();
                    }

                    msg_codec::BetlifyMessage::PlaceBet { pool_id, option, amount } => {
                        msg!("Placing bet on pool {}", pool_id);

                        let bet = &mut ctx.accounts.bet; 

                        let pool = &mut ctx.accounts.bet_pool;
                        let clock = Clock::get()?;

                        // Enforce time window
                        require!(clock.unix_timestamp >= pool.start_time && clock.unix_timestamp < pool.lock_time, PlaceBetError::BettingClosed);
                        // Enforce valid option (check against option_amounts length)
                        require!((option as usize) < pool.option_amounts.len(), PlaceBetError::InvalidOption);
                        // Prevent duplicate bets (if bet already exists, Anchor will error on init)
                        // Update pool amounts
                        pool.pool_amount = pool.pool_amount.checked_add(amount).unwrap();
                        pool.option_amounts[option as usize] = pool.option_amounts[option as usize].checked_add(amount).unwrap();
                        // Update unique bettors
                        pool.unique_bettors = pool.unique_bettors.checked_add(1).unwrap();
                        // Set bet fields
                        bet.user = params.sender;
                        bet.pool = ctx.accounts.bet_pool.key();
                        bet.option = option;
                        bet.amount = amount;
                        bet.claimed = false;
                    }

                    msg_codec::BetlifyMessage::ResolveMarket { pool_id, .. } => {
                        msg!("Resolving pool {}", pool_id);

                        // TODO: Implement resolve market logic
                    }

                    msg_codec::BetlifyMessage::ClaimWinnings { pool_id, .. } => {
                        msg!("Claiming winnings for pool {}", pool_id);
                        // TODO: Implement claim winnings logic using OFT for cross-chain payouts
                    }
                }
            }

            Err(err) => {
                msg!("Decode error: {:?}", err);
                return Err(BetlifyError::InvalidMessage.into());
            }
        }

        Ok(())
    }
}

#[error_code]
pub enum BetlifyError {
    #[msg("Missing pool account")] MissingPoolAccount,
    #[msg("Missing bet account")] MissingBetAccount,
    #[msg("Invalid pool account")] InvalidPoolAccount,
    #[msg("Invalid bet account")] InvalidBetAccount,
    #[msg("Market not ended")] MarketNotEnded,
    #[msg("Result already set")] ResultAlreadySet,
    #[msg("Invalid option")] InvalidOption,
    #[msg("Missing system program")] MissingSystemProgram,
    #[msg("Missing rent sysvar")] MissingRentSysvar,
    #[msg("Failed to decode message")] InvalidMessage,
}
