import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN } from '@project-serum/anchor';
import idl from '../../target/idl/my_oapp.json'; 

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // or your testnet endpoint
const PROGRAM_ID = new PublicKey('9CtJ2mHpsNMPPCpEsmRTYDhbZTACFpD2pMFFJiT13qfG');

// Correct PDA derivation (strip 0x and use hex encoding)
function getBetPoolPda(creator: string, poolId: number): [PublicKey, number] {
  const { PublicKey } = require('@solana/web3.js');
  const BN = require('bn.js');
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('betpool'),
      Buffer.from(creator.replace(/^0x/, ''), 'hex'),
      new BN(poolId).toArrayLike(Buffer, 'le', 8)
    ],
    PROGRAM_ID
  );
}

export async function verifyBetPool() {
  const connection = new Connection(SOLANA_RPC_URL);
  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  const storePda = new PublicKey('7zT3rAb8tNAK8mSewyxRz7ubbDtnXEcSaoJnyVyg4f8n');
  const poolPda = new PublicKey('GR3kGrt3n7e5DP1sd7zoKnDyAkmt9xj8vrjoFZwtLM3f');
  console.log('Store PDA:', storePda.toBase58());
  console.log('BetPool PDA:', poolPda.toBase58());

  try {
    const store = await program.account.store.fetch(storePda);
    const pool = await program.account.betPool.fetch(poolPda);  
    console.log('Store data:', JSON.stringify(store, null, 2));
    console.log('Pool data:', JSON.stringify(pool, null, 2));
  } catch (e) {
    console.error('Could not fetch BetPool:', e);
  }
}

async function fetchLzReceiveTypes() {
  const connection = new Connection(SOLANA_RPC_URL);
  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(idl as Idl, PROGRAM_ID, provider);

  const storePda = new PublicKey('EEoxz78vk2ffFozmwrmh5XzguFqjqbTrvKxAiazgAyJ5');

  const message = Buffer.from([0, 11, 0, 0, 0, 99, 115, 118, 100, 99, 97, 120, 99, 115, 99, 120, 2, 0, 0, 0, 3, 0, 0, 0, 89, 101, 115, 2, 0, 0, 0, 78, 111, 0, 0, 0, 0, 0, 0, 0, 0, 128, 163, 115, 104, 0, 0, 0, 0, 0, 245, 116, 104, 0, 0, 0, 0, 188, 70, 118, 104, 0, 0, 0, 0])
  const optionsData = '0x';
  const msgSender = '0x64772107fC23f7370C90EA0aBd29ee6117B97f77'
  const msgValue = new BN(1000)

  const params = {
    src_eid: 40168,
    message,
    optionsData,
    msgValue,
    msgSender,
  }

  const txn = await program.methods.lzReceiveTypes(params)
  .accounts({
    store: storePda
  })
  .signers([])
  .rpc();
  
  console.log(`the accounts are : ${JSON.stringify(txn, null, 2)}`)
}

// If run directly, execute
if (require.main === module) {
  verifyBetPool();
  // fetchLzReceiveTypes();
} 