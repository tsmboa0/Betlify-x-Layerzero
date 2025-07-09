// import { Connection, PublicKey, Transaction } from '@solana/web3.js'; 
// import { Program, AnchorProvider, Idl, BN } from '@project-serum/anchor';
// import idl from './my_oapp.json'; 

// // Solana program configuration
// const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // Change to mainnet when ready
// const PROGRAM_ID = new PublicKey('F488VcDUsLjNFRBhsiLjbVp88h594X5mM5HpPVUWsy4G'); // Replace with your deployed program ID

// export class SolanaContractService {
//   private connection: Connection | null = null;
//   private wallet: any = null; // Solana wallet adapter wallet
//   private toast: any = null; // Toast function will be set later

//   constructor() {
//     // Don't initialize toast here - it will be set when needed
//   }

//   // Set the toast function
//   setToast(toast: any) {
//     this.toast = toast;
//   }

//   // Initialize the service with a Solana wallet
//   async initialize(wallet: any): Promise<boolean> {
//     try {
//       this.wallet = wallet;
//       this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      
//       if (!this.wallet || !this.wallet.publicKey) {
//         if (this.toast) {
//           this.toast.toast({
//             title: "Wallet Not Connected",
//             description: "Please connect your Solana wallet first.",
//             variant: "destructive",
//           });
//         }
//         return false;
//       }

//       if (this.toast) {
//         this.toast.toast({
//           title: "Solana Wallet Connected",
//           description: `Connected to ${this.wallet.publicKey.toString().slice(0, 6)}...${this.wallet.publicKey.toString().slice(-4)}`,
//         });
//       }

//       return true;
//     } catch (error) {
//       console.error('Failed to initialize Solana contract service:', error);
//       if (this.toast) {
//         this.toast.toast({
//           title: "Connection Failed",
//           description: "Failed to connect to Solana wallet. Please try again.",
//           variant: "destructive",
//         });
//       }
//       return false;
//     }
//   }

//   // Create a bet pool on Solana
//   async createPool(marketData: {
//     title: string;
//     description: string;
//     startTime: Date;
//     lockTime: Date;
//     resolutionDate: Date;
//     creatorFee: string;
//     minimumBet: string;
//   }): Promise<string> {
//     if (!this.connection || !this.wallet || !this.wallet.publicKey) {
//       throw new Error('Solana wallet not initialized');
//     }

//     try {
//       // For now, we'll simulate the transaction
//       // In a real implementation, you would:
//       // 1. Create the instruction to call your Solana program
//       // 2. Build the transaction with the instruction
//       // 3. Sign and send the transaction
      
//       if (this.toast) {
//         this.toast.toast({
//           title: "Creating Bet Pool",
//           description: "Creating bet pool on Solana...",
//         });
//       }

//       // Simulate transaction delay
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       // Generate a mock transaction signature
//       const mockSignature = 'mock_signature_' + Date.now();

//       if (this.toast) {
//         this.toast.toast({
//           title: "Bet Pool Created!",
//           description: `Successfully created bet pool on Solana. Signature: ${mockSignature.slice(0, 10)}...`,
//         });
//       }

//       return mockSignature;
//     } catch (error: any) {
//       console.error('Failed to create Solana pool:', error);
      
//       if (error.message?.includes('insufficient funds')) {
//         throw new Error('Insufficient SOL for transaction');
//       } else {
//         throw new Error('Failed to create bet pool on Solana');
//       }
//     }
//   }

//   // Place a bet on Solana
//   async placeBet(betData: {
//     poolId: string;
//     option: string;
//     amount: string;
//   }): Promise<string> {
//     if (!this.connection || !this.wallet || !this.wallet.publicKey) {
//       throw new Error('Solana wallet not initialized');
//     }

//     try {
//       // For now, we'll simulate the transaction
//       // In a real implementation, you would:
//       // 1. Create the instruction to call your Solana program
//       // 2. Build the transaction with the instruction
//       // 3. Sign and send the transaction
      
//       if (this.toast) {
//         this.toast.toast({
//           title: "Placing Bet",
//           description: "Placing bet on Solana...",
//         });
//       }

//       // Simulate transaction delay
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       // Generate a mock transaction signature
//       const mockSignature = 'mock_bet_signature_' + Date.now();

//       if (this.toast) {
//         this.toast.toast({
//           title: "Bet Placed Successfully!",
//           description: `Successfully placed bet on Solana. Signature: ${mockSignature.slice(0, 10)}...`,
//         });
//       }

//       return mockSignature;
//     } catch (error: any) {
//       console.error('Failed to place Solana bet:', error);
      
//       if (error.message?.includes('insufficient funds')) {
//         throw new Error('Insufficient SOL for transaction');
//       } else {
//         throw new Error('Failed to place bet on Solana');
//       }
//     }
//   }

//   // Get current wallet address
//   getCurrentAddress(): string | null {
//     if (!this.wallet || !this.wallet.publicKey) return null;
//     return this.wallet.publicKey.toString();
//   }

//   // Get SOL balance
//   async getBalance(): Promise<string | null> {
//     if (!this.connection || !this.wallet || !this.wallet.publicKey) return null;
    
//     try {
//       const balance = await this.connection.getBalance(this.wallet.publicKey);
//       return (balance / 1e9).toString(); // Convert lamports to SOL
//     } catch (error) {
//       console.error('Failed to get SOL balance:', error);
//       return null;
//     }
//   }

//   async getPoolsCount(){
//     const connection = new Connection(SOLANA_RPC_URL);
//     const provider = new AnchorProvider(connection, {} as any, {});
//     const program = new Program(idl as Idl, PROGRAM_ID, provider);

//     const storePda = new PublicKey('7zT3rAb8tNAK8mSewyxRz7ubbDtnXEcSaoJnyVyg4f8n');
//     const store: any = await program.account.store.fetch(storePda);
//     console.log('🔍 [SolanaContractService] Pools count:', store.poolsCount.toNumber());
//     return store.poolsCount.toNumber();
//   }

//   // Disconnect
//   disconnect(): void {
//     this.connection = null;
//     this.wallet = null;
//   }
// }

// // Export singleton instance
// export const solanaContractService = new SolanaContractService(); 