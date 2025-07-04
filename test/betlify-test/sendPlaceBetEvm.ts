import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { Connection } from '@solana/web3.js';
dotenv.config();

// Replace with your deployed contract address and ABI
const BETLIFY_EVM_ADAPTER_ADDRESS = '0xBf2E634F8DA4C8C02979C1A2CcAD113eFb259132';
const BETLIFY_EVM_ADAPTER_ABI = require('../../artifacts/contracts/BetlifyOApp.sol/BetlifyEvmAdapter.json').abi;

// Replace with your LayerZero destination EID for Solana
const DST_EID = 40168;

export async function sendPlaceBetEvm({
    providerUrl,
    privateKey,
    authority,
    pool,
    option,
    amount,
    dstEid = DST_EID,
    optionsData = '0x',
    solanaRpcUrl = 'https://api.devnet.solana.com',
}: {
    providerUrl: string;
    privateKey: string;
    authority: string;
    pool: number;
    option: number;
    amount: number;
    dstEid?: number;
    optionsData?: string;
    solanaRpcUrl?: string;
}) {
    // Calculate rent for Bet PDA on Solana
    const connection = new Connection(solanaRpcUrl);
    // Bet PDA size calculation (see Bet struct):
    // 8 (discriminator) + 4+64 (authority string) + 32 (user) + 32 (pool) + 1 (option) + 8 (amount) + 1 (claimed) + 1 (bump) = 151 bytes
    const betSpace = 8 + 4 + 64 + 32 + 32 + 1 + 8 + 1 + 1;
    const betLamports = await connection.getMinimumBalanceForRentExemption(betSpace);
    // Encode rent as 8-byte little-endian buffer
    const betRentBuf = Buffer.alloc(8);
    betRentBuf.writeBigUInt64LE(BigInt(betLamports));
    // Set optionsData to betRentBuf hex string
    optionsData = '0x' + betRentBuf.toString('hex');

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(BETLIFY_EVM_ADAPTER_ADDRESS, BETLIFY_EVM_ADAPTER_ABI, wallet);

    // Estimate fee using the contract's quoteSend (if available)
    let fee = ethers.BigNumber.from('0');
    if (contract.quoteSend) {
        try {
            fee = await contract.quoteSend(dstEid, authority, pool, option, amount, optionsData);
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

    // Call the high-level placeBet function
    console.log('Placing bet...');
    const tx = await contract.placeBet(
        dstEid,
        authority,
        pool,
        option,
        amount,
        optionsData,
        { value: fee }
    );
    console.log('Sent place bet message. Tx:', tx.hash);
    await tx.wait();
    console.log('Transaction confirmed.');
}

// If run directly, execute with example args
if (require.main === module) {
    (async () => {
        const providerUrl = process.env.ETH_RPC_URL || '';
        const privateKey = process.env.PRIVATE_KEY || '';
        const authority = '0x1234567890abcdef1234567890abcdef12345678';
        const pool = 1;
        const option = 0;
        const amount = 1000000; // Example amount
        await sendPlaceBetEvm({ providerUrl, privateKey, authority, pool, option, amount });
    })();
} 