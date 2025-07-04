import { Connection, clusterApiUrl } from '@solana/web3.js';
import { createBetPoolAccount } from './createBetPoolSolana';
import { sendCreatePoolEvm } from './sendCreatePoolEvm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    // Example arguments
    const creator = '0x1234567890abcdef1234567890abcdef12345678'; // EVM address as string
    const poolId = 2;
    const question = 'Will BTC reach $1m?';
    const options = ['Yes', 'No'];
    const now = Math.floor(Date.now() / 1000);
    const start_time = now + 60; // 1 min from now
    const lock_time = now + 3600; // 1 hour from now
    const end_time = now + 7200; // 2 hours from now

    // Solana setup
    const solanaConnection = new Connection(clusterApiUrl('devnet'));
    console.log('Step 1: Creating BetPool account on Solana...');
    await createBetPoolAccount(solanaConnection, creator, poolId, question, start_time, lock_time, end_time, options);
    // Note: createBetPoolAccount loads the default keypair internally

    // EVM setup
    const providerUrl = process.env.ETH_RPC_URL || 'https://sepolia.optimism.io';
    const privateKey = process.env.PRIVATE_KEY || '';
    console.log('Step 2: Sending create pool message from EVM...');
    await sendCreatePoolEvm({ providerUrl, privateKey, question, options, start_time, lock_time, end_time, poolId });

    console.log('Done!');
}

main().catch((err) => {
    console.error('Error in betlify-test:', err);
    process.exit(1);
}); 