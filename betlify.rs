use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Mint, MintTo, mint_to, TokenAccount, Token};
// use anchor_spl::associated_token::AssociatedToken;
// use solana_program::native_token::LAMPORTS_PER_SOL;
// use std::str::FromStr;
use solana_program::program::invoke;
use solana_program::system_instruction::transfer;
// automatically when you build the project.
declare_id!("BPkp6UKXSFBVjkw8Zk4mxS2AYd7UHwxrJM8xSRSMov8K");

// const MINIMUM_BET_AMOUNT: u64 = LAMPORTS_PER_SOL / 10; //0.1 sol

#[program]
mod bet_house {
    use super::*;

    pub fn init_bet_house(ctx: Context<InitBetHouse>)->Result<()>{
        let bet_house : &mut Account<BetHouse> = &mut ctx.accounts.bet_house;
        let treasury = &ctx.accounts.treasury;

        bet_house.authority = ctx.accounts.owner.key();
        bet_house.treasury = treasury.key();

        msg!("Bet House Initialized successfully!");

        Ok(())
    }

    pub fn create_tf_pool(
        ctx: Context<CreateTFPool>,
        title: String,
        start_time: i64,
        lock_time: i64,
        end_time: i64,
        min_bet_amount: u64,
        house_fee: u64,
    ) -> Result<()> {
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;

        require!(pool.pool_title.len() <= 50, CustomErrors::PoolTitleTooLong);
        require!(start_time < lock_time, CustomErrors::InvalidTiming);
        require!(lock_time < end_time, CustomErrors::InvalidTiming);
        require!(house_fee <= 6 && house_fee >0, CustomErrors::InvalidHouseFee);

        pool.authority = ctx.accounts.manager.key();
        pool.treasury = ctx.accounts.treasury.key();
        pool.start_time = start_time;
        pool.lock_time = lock_time;
        pool.end_time = end_time;
        pool.house_fee = house_fee;
        pool.pool_title = title;
        pool.min_bet_amount = min_bet_amount;
        pool.result = 0;
        pool.is_result_set = false;
        pool.no_of_true = 100000000;
        pool.no_of_false = 100000000;
        pool.pool_amount = 200000000;

        msg!("True or False Pool Created");

        Ok(())
    }

    pub fn place_bet_tf(
        ctx: Context<PlaceBetTF>,
        _title: String,
        _manager: Pubkey,
        _pool_id: Pubkey,
        amount: u64,
        option: u8,
    ) -> Result<()> {
        let user_bet: &mut Account<BetTF> = &mut ctx.accounts.user_bet;
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        let pool_treasury = &mut ctx.accounts.pool_treasury;
        let clock: Clock = Clock::get().unwrap();

        // require!(amount >= MINIMUM_BET_AMOUNT, CustomErrors::BetAmountTooLow);
        require!(
            clock.unix_timestamp < pool.lock_time,
            CustomErrors::BetTooSoon
        );

        let transfer_funds = transfer(&ctx.accounts.bettor.key(), &pool_treasury.key(), amount);

        invoke(
            &transfer_funds,
            &[
                ctx.accounts.bettor.to_account_info(),
                pool_treasury.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        user_bet.authority = ctx.accounts.bettor.key();
        pool.pool_amount += amount;
        
        if option == 1 {
            let shares = pool.pool_amount.checked_mul(amount).unwrap().checked_div(pool.no_of_true).unwrap();
            user_bet.true_amount += amount;
            user_bet.true_shares += shares;
            user_bet.bet_true = true;
            pool.no_of_true += amount;
        } else {
            let shares = pool.pool_amount.checked_mul(amount).unwrap().checked_div(pool.no_of_false).unwrap();
            user_bet.false_amount += amount;
            user_bet.false_shares += shares;
            user_bet.bet_false = true;
            pool.no_of_false += amount;
        }

        msg!("Bet placed successfully...");

        Ok(())
    }

    pub fn edit_tf_lock_time(
        ctx: Context<EditTFLockTime>,
        _title: String,
        time: i64,
    ) -> Result<()> {
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        require!(
            pool.authority == ctx.accounts.manager.key(),
            CustomErrors::UnAuthorized
        );

        pool.lock_time = time;

        msg!("Lock Time Updated...");
        Ok(())
    }

    pub fn edit_tf_end_time(ctx: Context<EditTFEndTime>, _title: String, time: i64) -> Result<()> {
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        require!(
            pool.authority == ctx.accounts.manager.key(),
            CustomErrors::UnAuthorized
        );

        pool.end_time = time;

        msg!("End Time Updated...");
        Ok(())
    }

    pub fn set_tf_result(ctx: Context<SetTFResult>, _title:String, _manager:Pubkey, result: u8) -> Result<()> {
         
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        // let result_aggregator = Pubkey::from_str(AGGREGATOR).unwrap();
        //requiire that the result is either 1 or 2
        require!(result == 1 || result == 2, CustomErrors::InvalidResult);
        // require!(
        //     result_aggregator == ctx.accounts.aggregator.key(),
        //     CustomErrors::UnAuthorized
        // );

        pool.result = result;
        pool.is_result_set = true;

        msg!("Pool Result Set...");
        Ok(())
    }

    pub fn claim_tf_win(ctx: Context<ClaimTFWin>, _title: String, _manager: Pubkey, _pool_id: Pubkey,) -> Result<()> {
        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        let user_bet: &mut Account<BetTF> = &mut ctx.accounts.user_bet;
        let pool_treasury: &mut AccountInfo = &mut ctx.accounts.pool_treasury;
        let clock: Clock = Clock::get().unwrap();

        require!(
            user_bet.authority == ctx.accounts.bettor.key(),
            CustomErrors::UnAuthorized
        );
        require!(
            ((user_bet.bet_false || user_bet.bet_true) && pool.end_time < clock.unix_timestamp) && pool.is_result_set,
            CustomErrors::BetNotFound
        );

        let rewards_claimable: u64 = pool 
            .pool_amount
            .checked_mul(100 - pool.house_fee)
            .unwrap()
            .checked_div(100)
            .unwrap();

        if pool.result == 1 &&  user_bet.bet_true && !user_bet.true_claimed {
            let yes: u64 = pool.no_of_true;
            let payout1: u64 = rewards_claimable
                .checked_mul(user_bet.true_amount)
                .unwrap()
                .checked_div(yes)
                .unwrap();

            require!(payout1 > 4000000, CustomErrors::PayoutTooLow);

            **pool_treasury.try_borrow_mut_lamports()? -= payout1;
            **ctx.accounts.bettor.try_borrow_mut_lamports()? += payout1;

            user_bet.true_claimed = true;

            msg!("Payout Claimed Successfully...");

        } else if pool.result == 2 && user_bet.bet_false && !user_bet.false_claimed {
            let no: u64 = pool.no_of_false;
            let payout2: u64 = rewards_claimable
                .checked_mul(user_bet.false_amount)
                .unwrap()
                .checked_div(no)
                .unwrap();

            require!(payout2 > 4000000, CustomErrors::PayoutTooLow);

            **pool_treasury.try_borrow_mut_lamports()? -= payout2;
            **ctx.accounts.bettor.try_borrow_mut_lamports()? += payout2;

            user_bet.false_claimed = true;

            msg!("Payout Claimed Successfully...");
        }else{
            msg!("Bet Lost! No Rewards");
        };

        Ok(())
    }

    pub fn sell_position(ctx: Context<SellPosition>, _title: String, _manager: Pubkey, _pool_id: Pubkey, position: u8) -> Result<()>{

        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        let user_bet: &mut Account<BetTF> = &mut ctx.accounts.user_bet;
        let bettor = &ctx.accounts.bettor;
        let pool_treasury = &mut ctx.accounts.pool_treasury;
        let clock: Clock = Clock::get().unwrap();

        require!(clock.unix_timestamp < pool.lock_time, CustomErrors::PoolLocked);
        require!(user_bet.authority == bettor.key(), CustomErrors::UnAuthorized);

        if position == 1 {
            require!(user_bet.bet_true, CustomErrors::NoShares);
            let new_total = pool.pool_amount - user_bet.true_amount;
            let new_true = pool.no_of_true - user_bet.true_amount;
            let payout = new_true.checked_mul(user_bet.true_shares).unwrap().checked_div(new_total).unwrap();

            **pool_treasury.try_borrow_mut_lamports()? -= payout;
            **bettor.try_borrow_mut_lamports()? += payout;

            user_bet.true_amount = 0;
            user_bet.bet_true = false;
            user_bet.true_shares = 0;
            pool.pool_amount -= user_bet.true_amount;
            pool.no_of_true -= user_bet.true_amount;

            msg!("Position sold successfully...");
            Ok(()) 
        }else if position == 2 {
            require!(user_bet.bet_false, CustomErrors::NoShares);

            let new_total = pool.pool_amount - user_bet.false_amount;
            let new_false = pool.no_of_true - user_bet.false_amount;
            let payout = new_false.checked_mul(user_bet.false_shares).unwrap().checked_div(new_total).unwrap();
            
            **pool_treasury.try_borrow_mut_lamports()? -= payout;
            **bettor.try_borrow_mut_lamports()? += payout;

            user_bet.false_amount = 0;
            user_bet.bet_false = false;
            user_bet.false_shares = 0;
            pool.pool_amount -= user_bet.false_amount;
            pool.no_of_false -= user_bet.false_amount;

            msg!("Position sold successfully...");
            Ok(())
        }else{
            msg!("You have not bet on any position.");
            Ok(())
        }

        
    }

    pub fn admin_claim_tf(ctx: Context<AdminClaimTF>, _title: String, _pool_id:Pubkey) -> Result<()> {

        let pool: &mut Account<TrueOrFalsePool> = &mut ctx.accounts.pool;
        let pool_treasury : &mut AccountInfo = &mut ctx.accounts.pool_treasury;
        let clock: Clock = Clock::get().unwrap();

        require!(
            pool.end_time < clock.unix_timestamp && !pool.is_admin_claim,
            CustomErrors::FatalError
        );
        require!(
            pool.authority == ctx.accounts.manager.key(),
            CustomErrors::UnAuthorized
        );

        let house_fee = pool
            .pool_amount
            .checked_mul(pool.house_fee)
            .unwrap()
            .checked_div(100)
            .unwrap();

        if house_fee > 4000000 {
            **pool_treasury.try_borrow_mut_lamports()? -= house_fee;
            **ctx.accounts.manager.try_borrow_mut_lamports()? += house_fee;

            msg!("Admin house fee claimed successfully...");
        } else {
            msg!("Failed to calim");
        };

        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitBetHouse<'info>{
    #[account(init, seeds=[b"house", owner.key().as_ref()], bump, payer=owner, space= 8 + BetHouse::INIT_SPACE)]
    pub bet_house : Account<'info, BetHouse>,
    #[account(init, seeds=[b"treasury", owner.key().as_ref()], bump, payer=owner, space=0)]
    pub treasury : AccountInfo<'info>,
    #[account(mut)]
    pub owner : Signer<'info>,
    pub system_program : Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateTFPool<'info> {
    #[account(init, seeds=[title.as_bytes(), manager.key().as_ref()], bump, space= 8 + TrueOrFalsePool::INIT_SPACE, payer = manager)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(init, seeds=[b"treasury", pool.key().as_ref()], bump, payer=manager, space=0)]
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title : String)]
pub struct EditTFLockTime<'info> {
    #[account(mut, seeds=[title.as_bytes(), manager.key().as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(title : String)]
pub struct EditTFEndTime<'info> {
    #[account(mut, seeds=[title.as_bytes(), manager.key().as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(title : String, manager:Pubkey,)]
pub struct SetTFResult<'info> {
    #[account(mut, seeds=[title.as_bytes(), manager.as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut)]
    pub aggregator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title : String, manager:Pubkey, pool_id : Pubkey)]
pub struct PlaceBetTF<'info> {
    #[account(init_if_needed, seeds=[pool_id.as_ref(), bettor.key().as_ref()], bump, payer = bettor, space= 8 + BetTF::INIT_SPACE)]
    pub user_bet: Account<'info, BetTF>,
    #[account(mut, seeds=[title.as_bytes(), manager.as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut, seeds=[b"treasury", pool_id.as_ref()], bump)]
    pub pool_treasury: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title : String, manager:Pubkey, pool_id : Pubkey)]
pub struct SellPosition<'info>{
    #[account(mut, seeds=[title.as_bytes(), manager.key().as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut, seeds=[pool_id.as_ref(), bettor.key().as_ref()], bump)]
    pub user_bet: Account<'info, BetTF>,
    #[account(mut, seeds=[b"treasury", pool_id.as_ref()], bump)]
    pub pool_treasury: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title : String, manager : Pubkey, pool_id: Pubkey)]
pub struct ClaimTFWin<'info> {
    #[account(mut, seeds=[title.as_bytes(), manager.key().as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut, seeds=[pool_id.as_ref(), bettor.key().as_ref()], bump)]
    pub user_bet: Account<'info, BetTF>,
    #[account(mut, seeds=[b"treasury", pool_id.as_ref()], bump)]
    pub pool_treasury: AccountInfo<'info>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct AdminClaimTF<'info> {
    #[account(mut, seeds=[title.as_bytes(), manager.key().as_ref()], bump)]
    pub pool: Account<'info, TrueOrFalsePool>,
    #[account(mut, seeds=[b"treasury", pool.key().as_ref()], bump)]
    pub pool_treasury: AccountInfo<'info>,
    #[account(mut)]
    pub manager: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
enum CustomErrors {
    #[msg("Unauthorized. You are not the pool manager")]
    UnAuthorized,
    // #[msg("Bet amount too low. Please increase your stake")]
    // BetAmountTooLow,
    #[msg("You did not bet on this pool")]
    BetNotFound,
    #[msg("Pool Title Too Long. Make it 50 characters or less")]
    PoolTitleTooLong,
    #[msg("Too Soon or Too Late To Place Your Bet.")]
    BetTooSoon,
    #[msg("Unable to perorm this operation")]
    FatalError,
    #[msg("Payout amount is less than 0")]
    PayoutTooLow,
    #[msg("House fee cannot be greater than 6 or less than 0")]
    InvalidHouseFee,
    #[msg("Inalid Timings. Start Time must be greater than Lock Time, Lock Time must be greater than end Time")]
    InvalidTiming,
    #[msg("Invalid Result Provided. Must be either 1 or 2")]
    InvalidResult,
    #[msg("Request Rejected, Pool Has Been Locked")]
    PoolLocked,
    #[msg("You dont have a share for this option")]
    NoShares
}

#[account]
#[derive(InitSpace)]
pub struct TrueOrFalsePool {
    pub authority: Pubkey,
    pub treasury: Pubkey, 
    #[max_len(100)]
    pub pool_title: String,
    pub no_of_true: u64,
    pub no_of_false: u64,
    pub start_time: i64,
    pub lock_time: i64,
    pub end_time: i64,
    pub result: u8,
    pub house_fee: u64,
    pub is_result_set: bool,
    pub min_bet_amount: u64,
    pub pool_amount: u64,
    pub rewards_claimable: u64,
    pub is_admin_claim: bool,
}

#[account]
#[derive(InitSpace)]
pub struct BetTF {
    pub authority: Pubkey,
    pub true_claimed: bool,
    pub false_claimed: bool,
    pub true_amount: u64,
    pub false_amount: u64,
    pub bet_true: bool,
    pub bet_false: bool,
    pub true_shares: u64,
    pub false_shares: u64
}

#[account]
#[derive(InitSpace)]
pub struct BetHouse{
    pub authority: Pubkey,
    pub treasury: Pubkey,
}

// const AGGREGATOR: &str = "9nDqF4FPokbje1bJwEpgYSLtrvWTePBWGcY8YsMWz1pP";