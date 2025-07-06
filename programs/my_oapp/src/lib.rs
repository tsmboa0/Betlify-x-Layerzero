mod errors;
mod instructions;
mod msg_codec;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use oapp::{endpoint::MessagingFee, endpoint_cpi::LzAccount, LzReceiveParams};
use solana_helper::program_id_from_env;
use state::*;

// Import Betlify instruction types
use crate::instructions::create_pool::{CreatePool, CreatePoolParams};
use crate::instructions::place_bet::{PlaceBet, PlaceBetParams};
use crate::instructions::resolve_market::{ResolveMarket, ResolveMarketParams};
use crate::instructions::claim_winnings::{ClaimWinnings, ClaimWinningsParams};

// to build in verifiable mode and using environment variable (what the README instructs), run:
// anchor build -v -e MYOAPP_ID=<OAPP_PROGRAM_ID>
// to build in normal mode and using environment, run:
// MYOAPP_ID=$PROGRAM_ID anchor build 
declare_id!(anchor_lang::solana_program::pubkey::Pubkey::new_from_array(program_id_from_env!(
    "MYOAPP_ID",
    "EzSWvfipsRAQxPspMFm9QVot1jHwAGxKYWtnNi8YFT5R" // It's not necessary to change the ID here if you are building using environment variable
)));

const LZ_RECEIVE_TYPES_SEED: &[u8] = b"LzReceiveTypes"; // The Executor relies on this exact seed to derive the LzReceiveTypes PDA. Keep it the same.
const STORE_SEED: &[u8] = b"Store"; // You are free to edit this seed.
const PEER_SEED: &[u8] = b"Peer"; // The Executor relies on this exact seed to derive the LzReceiveTypes PDA. Keep it the same.

#[program]
pub mod my_oapp {
    use super::*;

    // ============================== Initializers ==============================
    // In this example, init_store can be called by anyone and can be called only once. Ensure you implement your own access control logic if needed.
    pub fn init_store(mut ctx: Context<InitStore>, params: InitStoreParams) -> Result<()> {
        InitStore::apply(&mut ctx, &params)
    }

    // ============================== Admin ==============================
    // admin instruction to set or update cross-chain peer configuration parameters.
    pub fn set_peer_config(
        mut ctx: Context<SetPeerConfig>,
        params: SetPeerConfigParams,
    ) -> Result<()> {
        SetPeerConfig::apply(&mut ctx, &params)
    }

    // ============================== Public ==============================
    // public instruction returning the estimated MessagingFee for sending a message.
    pub fn quote_send(ctx: Context<QuoteSend>, params: QuoteSendParams) -> Result<MessagingFee> {
        QuoteSend::apply(&ctx, &params)
    }

    // public instruction to send a message to a cross-chain peer.
    pub fn send(mut ctx: Context<Send>, params: SendMessageParams) -> Result<()> {
        Send::apply(&mut ctx, &params)
    }

    // handler for processing incoming cross-chain messages and executing the LzReceive logic
    pub fn lz_receive(mut ctx: Context<LzReceive>, params: LzReceiveParams) -> Result<()> {
        LzReceive::apply(&mut ctx, &params)
    }

    // handler that returns the list of accounts required to execute lz_receive
    pub fn lz_receive_types(
        ctx: Context<LzReceiveTypes>,
        params: LzReceiveParams,
    ) -> Result<Vec<LzAccount>> {
        LzReceiveTypes::apply(&ctx, &params)
    }

    // ============================== Betlify ==============================
    pub fn create_pool(
        mut ctx: Context<CreatePool>,
        params: CreatePoolParams,
        pool_id: u64,
    ) -> Result<()> {
        CreatePool::apply(&mut ctx, &params, pool_id)
    }

    pub fn place_bet(
        mut ctx: Context<PlaceBet>,
        params: PlaceBetParams,
    ) -> Result<()> {
        PlaceBet::apply(&mut ctx, &params)
    }

    pub fn resolve_market(
        mut ctx: Context<ResolveMarket>,
        params: ResolveMarketParams,
    ) -> Result<()> {
        ResolveMarket::apply(&mut ctx, &params)
    }

    pub fn claim_winnings(
        mut ctx: Context<ClaimWinnings>,
        params: ClaimWinningsParams,
    ) -> Result<()> {
        ClaimWinnings::apply(&mut ctx, &params)
    }
}
