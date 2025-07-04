use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub authority: Pubkey,
    pub user: [u8; 32],
    pub pool: Pubkey, // Pool being bet on
    pub option: u8, // Option index
    pub amount: u64, // Amount bet
    pub claimed: bool, // Whether winnings have been claimed
    pub bump: u8, // PDA bump
} 