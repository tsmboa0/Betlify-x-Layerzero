import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

// This script pre-creates BetPool and Bet accounts for cross-chain operations
// since LayerZero messages cannot create new accounts directly

// You'll need to replace this with your actual program ID after deployment
const PROGRAM_ID = new PublicKey("F488VcDUsLjNFRBhsiLjbVp88h594X5mM5HpPVUWsy4G");

export async function createBetPoolAccount(
    connection: Connection,
    payer: Keypair,
    creator: string, // EVM address as string
    poolId: number,
    question: string,
    options: string[],
    start_time: number,
    lock_time: number,
    end_time: number
) {
    // Derive the BetPool PDA (correct: strip 0x and use hex encoding)
    const [betPoolPda, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('betpool'),
            Buffer.from(creator.replace(/^0x/, ''), 'hex'),
            new BN(poolId).toArrayLike(Buffer, 'le', 8)
        ],
        PROGRAM_ID
    );

    console.log(`Creating BetPool account: ${betPoolPda.toString()}`);
    console.log(`Pool ID: ${poolId}`);
    console.log(`Creator: ${creator}`);
    console.log(`Question: ${question}`);
    console.log(`Options: ${options.join(", ")}`);
    console.log(`Start: ${start_time}, Lock: ${lock_time}, End: ${end_time}`);
    try {
        // Create the account with the required space
        const tx = new Transaction();
        
        // Add instruction to create the account
        tx.add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: betPoolPda,
                lamports: await connection.getMinimumBalanceForRentExemption(1024), // Adjust size as needed
                space: 1024, // Adjust based on your BetPool size
                programId: new PublicKey(PROGRAM_ID)
            })
        );

        const signature = await connection.sendTransaction(tx, [payer]);
        console.log(`BetPool account created: ${signature}`);
        
        return betPoolPda;
    } catch (error) {
        console.error("Error creating BetPool account:", error);
        throw error;
    }
}

export async function createBetAccount(
    connection: Connection,
    payer: Keypair,
    authority: string, // EVM address as "0x..." format
    poolAddress: string
) {
    // Derive the Bet PDA
    const [betPda, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("bet"),
            Buffer.from(authority),
            new PublicKey(poolAddress).toBuffer()
        ],
        new PublicKey(PROGRAM_ID)
    );

    console.log(`Creating Bet account: ${betPda.toString()}`);
    console.log(`Authority: ${authority}`);
    console.log(`Pool: ${poolAddress}`);

    try {
        // Create the account with the required space
        const tx = new Transaction();
        
        // Add instruction to create the account
        tx.add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: betPda,
                lamports: await connection.getMinimumBalanceForRentExemption(256), // Adjust size as needed
                space: 256, // Adjust based on your Bet size
                programId: new PublicKey(PROGRAM_ID)
            })
        );

        const signature = await connection.sendTransaction(tx, [payer]);
        console.log(`Bet account created: ${signature}`);
        
        return betPda;
    } catch (error) {
        console.error("Error creating Bet account:", error);
        throw error;
    }
}

// Example usage:
// createBetPoolAccount(connection, payer, "0x1234...", 1, "Will BTC reach $100k?", ["Yes", "No"]);
// createBetAccount(connection, payer, "0x1234...", "poolAddress"); 