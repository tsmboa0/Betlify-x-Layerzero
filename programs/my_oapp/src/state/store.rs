use crate::*;

#[account]
#[derive(InitSpace)]
pub struct Store {
    pub admin: Pubkey,
    pub bump: u8,
    pub endpoint_program: Pubkey,
    pub pools_count: u64,
}

impl Store {
    pub const MAX_STRING_LENGTH: usize = 256;
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>() + Self::MAX_STRING_LENGTH;
}

// The LzReceiveTypesAccounts PDA is used by the Executor as a prerequisite to calling `lz_receive`.
#[account]
pub struct LzReceiveTypesAccounts {
    pub store: Pubkey, // This is required and should be consistent.
}

impl LzReceiveTypesAccounts {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}


