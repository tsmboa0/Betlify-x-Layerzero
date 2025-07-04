use crate::*;
use oapp::{LzReceiveParams, endpoint_cpi::{LzAccount, get_accounts_for_clear}};
use anchor_lang::solana_program::{system_program};
use msg_codec;

#[derive(Accounts)]
pub struct LzReceiveTypes<'info> {
    #[account(seeds = [STORE_SEED], bump = store.bump)]
    pub store: Account<'info, Store>,
}

impl LzReceiveTypes<'_> {
    pub fn apply(
        ctx: &Context<LzReceiveTypes>,
        params: &LzReceiveParams,
    ) -> Result<Vec<LzAccount>> {
        let store = ctx.accounts.store.key();
        let peer_seeds = [PEER_SEED, &store.to_bytes(), &params.src_eid.to_be_bytes()];
        let (peer, _) = Pubkey::find_program_address(&peer_seeds, ctx.program_id);

        let mut accounts = vec![
            // 0. payer (placeholder, Executor fills this)
            LzAccount {
                pubkey: Pubkey::default(),
                is_signer: true,
                is_writable: true,
            },
            // 1. peer PDA
            LzAccount {
                pubkey: peer,
                is_signer: false,
                is_writable: false,
            },
            // 2. store PDA
            LzAccount {
                pubkey: store,
                is_signer: false,
                is_writable: true,
            },
        ];

        // Try to decode and dynamically add message-specific accounts
        if let Ok(betlify_msg) = msg_codec::decode_betlify_message(&params.message) {
            match betlify_msg {
                msg_codec::BetlifyMessage::CreatePool { pool_id, .. } => {
                    let store = ctx.accounts.store.key();
                    let seeds = [b"betpool", store.as_ref(), &pool_id.to_le_bytes()];
                    let (bet_pool, _) = Pubkey::find_program_address(&seeds, ctx.program_id);

                    accounts.extend_from_slice(&[
                        // 3. bet_pool (to be initialized)
                        LzAccount {
                            pubkey: bet_pool,
                            is_signer: false,
                            is_writable: true,
                        },
                        // A dummy bet account to satisfy anchor requirements
                        LzAccount {
                            pubkey: Pubkey::default(),
                            is_signer: false,
                            is_writable: true,
                        },
                        // 4. system_program
                        LzAccount {
                            pubkey: system_program::ID,
                            is_signer: false,
                            is_writable: false,
                        }
                    ]);
                }

                msg_codec::BetlifyMessage::PlaceBet { pool_id, .. } => {
                    let store = ctx.accounts.store.key();
                    let pool_seeds = [b"betpool", store.as_ref(), &pool_id.to_le_bytes()];
                    let (bet_pool, _) = Pubkey::find_program_address(&pool_seeds, ctx.program_id);

                    let bet_pool_key = bet_pool.key();
                    let bet_seeds = [b"bet", params.sender.as_ref(), bet_pool_key.as_ref()];
                    let (bet_pda, _) = Pubkey::find_program_address(&bet_seeds, ctx.program_id);

                    accounts.extend_from_slice(&[
                        // 3. bet_pool
                        LzAccount {
                            pubkey: bet_pool,
                            is_signer: false,
                            is_writable: true,
                        },
                        // 4. bet (to be initialized)
                        LzAccount {
                            pubkey: bet_pda,
                            is_signer: false,
                            is_writable: true,
                        },
                        // 5. system_program
                        LzAccount {
                            pubkey: system_program::ID,
                            is_signer: false,
                            is_writable: false,
                        },
                    ]);
                }

                msg_codec::BetlifyMessage::ResolveMarket { pool_id, .. } => {
                    let store = ctx.accounts.store.key();
                    let seeds = [b"betpool", store.as_ref(), &pool_id.to_le_bytes()];
                    let (bet_pool, _) = Pubkey::find_program_address(&seeds, ctx.program_id);

                    accounts.push(LzAccount {
                        pubkey: bet_pool,
                        is_signer: false,
                        is_writable: true,
                    });
                }

                msg_codec::BetlifyMessage::ClaimWinnings { pool_id, .. } => {
                    let store = ctx.accounts.store.key();
                    let seeds = [b"bet", store.as_ref(), &pool_id.to_le_bytes()];
                    let (bet_pda, _) = Pubkey::find_program_address(&seeds, ctx.program_id);

                    accounts.extend_from_slice(&[
                        // bet_pool
                        LzAccount {
                            pubkey: bet_pda,
                            is_signer: false,
                            is_writable: true,
                        },
                        // bet
                        LzAccount {
                            pubkey: bet_pda,
                            is_signer: false,
                            is_writable: true,
                        },
                    ]);
                }
            }
        }

        // Append accounts for Endpoint::clear (replay protection)
        let clear_accounts = get_accounts_for_clear(
            oapp::endpoint::ID,
            &store,
            params.src_eid,
            &params.sender,
            params.nonce,
        );
        accounts.extend(clear_accounts);

        Ok(accounts)
    }
}
