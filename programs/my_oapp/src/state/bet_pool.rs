use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BetPool {
    pub id: u64, // Unique pool id
    pub creator: Pubkey, // Pool creator
    #[max_len(256)]
    pub question: String, // Prediction question
    pub status: PoolStatus, // Open, Closed, Resolved
    pub winning_option: u8, // Index of winning option
    pub start_time: i64, // When betting opens
    pub lock_time: i64, // When betting closes
    pub end_time: i64, // When market resolves
    pub unique_bettors: u64, // Number of unique bettors
    pub pool_amount: u64, // Total amount in pool
    #[max_len(8)]
    pub option_amounts: Vec<u64>, // Total amount bet per option
    pub is_result_set: bool, // Has result been set
    pub result: u8, // Winning option (redundant with winning_option for clarity)
    pub bump: u8, // PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PoolStatus {
    Open,
    Closed,
    Resolved,
} 