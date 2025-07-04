import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from '../../target/idl/my_oapp.json';

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // or your testnet endpoint
const PROGRAM_ID = new PublicKey('F488VcDUsLjNFRBhsiLjbVp88h594X5mM5HpPVUWsy4G');
const EVM_SENDER = '0x64772107fC23f7370C90EA0aBd29ee6117B97f77';
const POOL_ID = 1; // Change to your actual poolId

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

  const [betPoolPda] = getBetPoolPda(EVM_SENDER, POOL_ID);
  console.log('BetPool PDA:', betPoolPda.toBase58());

  try {
    const betPool = await program.account.betPool.fetch(betPoolPda);
    console.log('BetPool data:', betPool);
  } catch (e) {
    console.error('Could not fetch BetPool:', e);
  }
}

// If run directly, execute
if (require.main === module) {
  verifyBetPool();
} 