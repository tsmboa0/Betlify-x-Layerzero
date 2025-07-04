import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { Connection } from '@solana/web3.js';
dotenv.config();

// Replace with your deployed contract address and ABI
const BETLIFY_EVM_ADAPTER_ADDRESS = '0xBf2E634F8DA4C8C02979C1A2CcAD113eFb259132';
const BETLIFY_EVM_ADAPTER_ABI = require('../../artifacts/contracts/BetlifyOApp.sol/BetlifyEvmAdapter.json').abi;

// Replace with your LayerZero destination EID for Solana
const DST_EID = 40168;

export async function sendCreatePoolEvm({
    providerUrl,
    privateKey,
    question,
    options,
    start_time,
    lock_time,
    end_time,
    poolId,
    dstEid = DST_EID,
    optionsData = '0x',
    solanaRpcUrl = 'https://api.devnet.solana.com',
}: {
    providerUrl: string;
    privateKey: string;
    question: string;
    options: string[];
    start_time: number;
    lock_time: number;
    end_time: number;
    poolId: number;
    dstEid?: number;
    optionsData?: string;
    solanaRpcUrl?: string;
}) {
    // Calculate rent for BetPool PDA on Solana
    const connection = new Connection(solanaRpcUrl);
    // Use the same space calculation as in createBetPoolSolana.ts
    const space = 8 + 32 + 4 + 256 + 1 + 1 + 8 * 3 + 8 + 8 + 4 + (8 * 8) + 1 + 1 + 1; // rough estimate
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    // Encode rent as 8-byte little-endian buffer
    const rentBuf = Buffer.alloc(8);
    rentBuf.writeBigUInt64LE(BigInt(lamports));
    // Set optionsData to rentBuf hex string
    optionsData = '0x' + rentBuf.toString('hex');

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(BETLIFY_EVM_ADAPTER_ADDRESS, BETLIFY_EVM_ADAPTER_ABI, wallet);

    // Estimate fee using the contract's quoteSend (if available)
    // You may need to adjust this if your contract exposes a different fee estimation method
    // For now, we'll use 0 as a placeholder and let the contract revert if not enough is sent
    // If your contract exposes quoteSend for createPool, use it here
    let fee = ethers.BigNumber.from('0');
    if (contract.quoteSend) {
        try {
            fee = await contract.quoteSend(dstEid, question, options, start_time, lock_time, end_time, poolId, optionsData);
            if (fee.isZero()) {
                console.warn('Estimated fee is zero, using fallback value.');
                fee = ethers.utils.parseEther('0.001');
            }
        } catch (e) {
            console.warn('Could not estimate fee, using fallback value.');
            fee = ethers.utils.parseEther('0.001');
        }
    } else {
        fee = ethers.utils.parseEther('0.001');
    }

    // Call the high-level createPool function
    console.log('Creating pool...');
    const tx = await contract.createPool(
        dstEid,
        question,
        options,
        start_time,
        lock_time,
        end_time,
        poolId,
        optionsData,
        { value: fee }
    );
    console.log('Sent create pool message. Tx:', tx.hash);
    await tx.wait();
    console.log('Transaction confirmed.');
}

// If run directly, execute with example args
if (require.main === module) {
    (async () => {
        const providerUrl = process.env.ETH_RPC_URL || '';
        const privateKey = process.env.PRIVATE_KEY || '';
        const question = 'Will BTC reach $100k?';
        const options = ['Yes', 'No'];
        const now = Math.floor(Date.now() / 1000);
        const start_time = now + 60;
        const lock_time = now + 3600;
        const end_time = now + 7200;
        const poolId = 1;
        await sendCreatePoolEvm({ providerUrl, privateKey, question, options, start_time, lock_time, end_time, poolId });
    })();
} 