import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from '../../target/idl/my_oapp.json';

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // or your testnet endpoint
const EVM_SENDER = '0x64772107fC23f7370C90EA0aBd29ee6117B97f77';
const POOL_ID = 100; // Change to your actual poolId

// Replace with your deployed program ID
const PROGRAM_ID = new PublicKey('CjcLEbUxoZkstmzfJWhWSLzFado4TbPWZMfio4WL1ZZB');

function loadDefaultKeypair(): Keypair {
    const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
    return Keypair.fromSecretKey(secret);
}

export async function createBetPoolAccount(
    connection: Connection,
    creator: string, // EVM address as string (for PDA seed)
    poolId: number,
    question: string,
    start_time: number,
    lock_time: number,
    end_time: number,
    options: string[]
) {
    const payer = loadDefaultKeypair();

    class NodeWallet {
        constructor(readonly payer: Keypair) {}

        async signTransaction(tx: Transaction): Promise<Transaction> {
            tx.partialSign(this.payer);
            return tx;
        }

        async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
            return txs.map((tx) => {
            tx.partialSign(this.payer);
            return tx;
            });
        }

        get publicKey() {
            return this.payer.publicKey;
        }
    }

    const wallet = new NodeWallet(payer);
    const provider = new AnchorProvider(connection, wallet as any, {});

    const program = new Program(idl as Idl, PROGRAM_ID, provider);
    // Derive the BetPool PDA (correct: strip 0x and use hex encoding)
    console.log(`payer.publicKey: ${payer.publicKey.toBase58()}`);
    const [betPoolPda, bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('betpool'),
            payer.publicKey.toBuffer(),
            new BN(poolId).toArrayLike(Buffer, 'le', 8)
        ],
        PROGRAM_ID
    );

    console.log(`Creating BetPool account: ${betPoolPda.toBase58()}`);
    console.log(`Pool ID: ${poolId}`);
    console.log(`Creator: ${creator}`);
    console.log(`Question: ${question}`);
    console.log(`Start: ${start_time}, Lock: ${lock_time}, End: ${end_time}`);
    console.log(`Options: ${options.join(', ')}`);

    const params = {
        question: question,
        options: options,
        startTime:  new BN(start_time),
        lockTime: new BN(lock_time),
        endTime: new BN(end_time),
    };
      

    try {
        const tx = await program.methods.createPool(params, new BN(poolId))
        .accounts({
            betPool: betPoolPda,
            creator: payer.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();

        console.log(`BetPool account created. Tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        return betPoolPda;
    } catch (error) {
        console.error('Error creating BetPool account:', error);
        throw error;
    }
}

// If run directly, execute with example args
if (require.main === module) {
    (async () => {
        const connection = new Connection('https://api.devnet.solana.com');
        const payer = loadDefaultKeypair();
        // Example usage:
        const creator = '0x1234567890abcdef1234567890abcdef12345678';
        const poolId = 10234;
        const question = 'Will BTC reach $100k?';
        const now = Math.floor(Date.now() / 1000);
        const start_time = now + 60; // 1 min from now
        const lock_time = now + 3600; // 1 hour from now
        const end_time = now + 7200; // 2 hours from now
        const options = ['Yes', 'No'];
        await createBetPoolAccount(connection, creator, poolId, question, start_time, lock_time, end_time, options);
    })();
} 