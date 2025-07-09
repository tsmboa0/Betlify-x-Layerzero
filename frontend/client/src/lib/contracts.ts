import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { encodeBetlifyMessage } from './encodeBetlifyMessage';
import { BN } from '@project-serum/anchor';
// import { SolanaContractService } from './solana-contracts';

// BetlifyOApp contract ABI - using the actual deployed contract
const BETLIFY_OAPP_ABI = [
  "function sendBetlifyAction(uint32 dstEid, bytes calldata message, bytes calldata optionsData) external payable returns (tuple(bytes32 guid, uint64 nonce, bytes32 receipt))",
  "function quoteSend(uint32 dstEid, bytes calldata message, bytes calldata optionsData) external view returns (uint256 nativeFee, uint256 lzTokenFee)",
  "event MessagingReceipt(bytes32 indexed guid, uint64 indexed nonce, bytes32 receipt)"
];

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  optimismTestnet: '0x2ED9929e3AA3CAd3553aA90014894300D3Fa224d', // From test file - this seems to be the correct one

};

// Network configurations
const NETWORKS = {
  optimismTestnet: {
    chainId: '0xaa37dc', // 11155420 in hex (Optimism Sepolia)
    chainName: 'Optimism Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
  },
};

const encodeMessage = (message: any) => {
  return encodeBetlifyMessage(message);
};

// LayerZero destination EID for Solana
const SOLANA_DST_EID = 40168;

export class BetlifyContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private toast: ReturnType<typeof useToast>;

  constructor() {
    // Initialize with a default toast function that just logs
    this.toast = {
      toast: (props: any) => {
        console.log('Toast (default):', props);
        // If we're in a browser environment and have access to a toast function, use it
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(props);
        }
      },
    } as any;
  }

  // Set toast function
  setToast(toast: any) {
    console.log('🔧 [ContractService] Setting toast function:', !!toast);
    this.toast = toast;
  }

  // Safe toast function that checks if toast exists
  private safeToast(props: any) {
    if (this.toast && typeof this.toast.toast === 'function') {
      this.toast.toast(props);
    } else {
      console.log('⚠️ [ContractService] Toast not available, logging instead:', props);
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask;
  }

  // Check if connected to the correct network
  async checkNetwork(): Promise<boolean> {
    if (!this.provider) return false;
    
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(parseInt(NETWORKS.optimismTestnet.chainId, 16));
    } catch (error) {
      console.error('Failed to check network:', error);
      return false;
    }
  }

  // Switch to Optimism testnet
  async switchToOptimismTestnet(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      this.safeToast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const ethereum = (window as any).ethereum;
      
      // Request network switch
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS.optimismTestnet.chainId }],
      });
      
      this.safeToast({
        title: "Network Switched",
        description: "Successfully switched to Optimism testnet",
      });
      
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS.optimismTestnet],
          });
          
          this.safeToast({
            title: "Network Added",
            description: "Optimism testnet has been added to MetaMask",
          });
          
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          this.safeToast({
            title: "Network Error",
            description: "Failed to add Optimism testnet to MetaMask",
            variant: "destructive",
          });
          return false;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        this.safeToast({
          title: "Network Error",
          description: "Failed to switch to Optimism testnet",
          variant: "destructive",
        });
        return false;
      }
    }
  }

  // Initialize provider and signer
  async initialize(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) {
      this.safeToast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        this.safeToast({
          title: "No Account Found",
          description: "Please connect your MetaMask account.",
          variant: "destructive",
        });
        return false;
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const isCorrectNetwork = await this.checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await this.switchToOptimismTestnet();
        if (!switched) return false;
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESSES.optimismTestnet,
        BETLIFY_OAPP_ABI,
        this.signer
      );

      this.safeToast({
        title: "Connected Successfully",
        description: `Connected to ${await this.signer.getAddress()}`,
      });

      return true;
    } catch (error: any) {
      console.error('Failed to initialize contract service:', error);
      
      if (error.code === 4001) {
        this.safeToast({
          title: "Connection Rejected",
          description: "You rejected the MetaMask connection request.",
          variant: "destructive",
        });
      } else {
        this.safeToast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask. Please try again.",
          variant: "destructive",
        });
      }
      
      return false;
    }
  }

  // Quote the fee for creating a bet pool
  async quoteCreatePool(marketData: {
    title: string;
    description: string;
    startTime: Date;
    lockTime: Date;
    resolutionDate: Date;
    creatorFee: string;
    minimumBet: string;
  }): Promise<{ nativeFee: bigint; lzTokenFee: bigint }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // For binary markets, we'll use Yes/No options
      const options = ['Yes', 'No'];
      
      // Encode the create pool message
      const message = encodeBetlifyMessage({
        variant: 0, // CreatePool
        question: marketData.title,
        options: options,
        pool_id: new BN(1), // poolId - we'll use 1 for now, in production this should be generated
        start_time: new BN(Math.floor(marketData.startTime.getTime() / 1000)),
        lock_time: new BN(Math.floor(marketData.lockTime.getTime() / 1000)),
        end_time: new BN(Math.floor(marketData.resolutionDate.getTime() / 1000)),
      });

      // Calculate rent for Solana PDA (simplified)
      const optionsData = '0x0000000000000000'; // 8 bytes of zeros for rent

      const [nativeFee, lzTokenFee] = await this.contract.quoteSend(
        SOLANA_DST_EID,
        message,
        optionsData
      );
      
      console.log('Quote result:', {
        nativeFee: nativeFee.toString(),
        lzTokenFee: lzTokenFee.toString(),
      });

      return { nativeFee, lzTokenFee };
    } catch (error) {
      console.error('Failed to quote create pool:', error);
      throw new Error('Failed to get fee quote');
    }
  }

  // Create a bet pool
  async createPool(marketData: {
    title: string;
    description: string;
    startTime: Date;
    lockTime: Date;
    resolutionDate: Date;
    creatorFee: string;
    minimumBet: string;
    poolId: number;
  }): Promise<string> {
    console.log('📦 [ContractService] Entering createPool...');
    
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized');
    }


    try {
      // Get signer address and balance
      console.log(`🔍 [ContractService] Signer: ${await this.signer.getAddress()}`);
      const signerAddress = await this.signer.getAddress();
      console.log('📦 [ContractService] Signer address:', signerAddress);

      // For binary markets, we'll use Yes/No options
      const options = ['Yes', 'No'];
      
      // Encode the create pool message
      const message = encodeBetlifyMessage({
        variant: 0, // CreatePool
        question: marketData.title,
        options: options,
        pool_id: new BN(marketData.poolId),
        start_time: new BN(Math.floor(marketData.startTime.getTime() / 1000)),
        lock_time: new BN(Math.floor(marketData.lockTime.getTime() / 1000)),
        end_time: new BN(Math.floor(marketData.resolutionDate.getTime() / 1000)),
      });

      console.log('📦 [ContractService] Encoded message length:', message.length, 'bytes');
      console.log('📦 [ContractService] Encoded message (hex):', message.toString('hex'));

      // Calculate rent for Solana PDA (simplified)
      const optionsData = '0x'; // 8 bytes of zeros for rent
      
      // Check if user has sufficient balance
      const balance = await this.provider!.getBalance(signerAddress);
      console.log('📦 [ContractService] Balance:', ethers.formatEther(balance), 'ETH');
      
      // Send the cross-chain message with estimated gas
      console.log('📦 [ContractService] Sending transaction...');
      const tx = await this.contract.sendBetlifyAction(
        SOLANA_DST_EID,
        message,
        optionsData,
        {
          value: ethers.parseEther('0.001'),
        }
      );

      console.log('📦 [ContractService] Transaction sent:', tx.hash);

      this.safeToast({
        title: "Transaction Sent",
        description: `Creating bet pool... Hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for confirmation with timeout
      console.log('📦 [ContractService] Waiting for transaction confirmation...');
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 2 minutes')), 120000)
        )
      ]);
      
      console.log('📦 [ContractService] Transaction confirmed:', receipt);

      this.safeToast({
        title: "Bet Pool Created!",
        description: `Successfully sent create pool message to Solana via LayerZero`,
      });

      return tx.hash;
    } catch (error: any) {
      console.error('📦 [ContractService] Failed to create pool:', error);
      
      // Log more details for debugging
      if (error.code) {
        console.error('📦 [ContractService] Error code:', error.code);
      }
      if (error.data) {
        console.error('📦 [ContractService] Error data:', error.data);
      }
      if (error.transaction) {
        console.error('📦 [ContractService] Failed transaction:', error.transaction);
      }
      
      // Provide more specific error messages
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH balance for transaction');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected by user');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection');
      } else if (error.message?.includes('gas')) {
        throw new Error('Gas estimation failed. Please try again');
      } else if (error.message?.includes('execution reverted')) {
        throw new Error('Transaction reverted. Check contract state and parameters.');
      } else {
        throw new Error(`Failed to create bet pool: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Get current account address
  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Get account balance
  async getBalance(): Promise<string | null> {
    if (!this.signer || !this.provider) return null;
    
    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  // Place a bet
  async placeBet(betData: {
    poolId: string;
    option: string;
    amount: string;
  }): Promise<string> {
    console.log('📦 [ContractService] Entering placeBet...');
    if (!this.contract || !this.signer) {
      throw new Error('Contract not initialized');
    }

    try {
      // Create the message for placing a bet
      const message = encodeBetlifyMessage({
        variant: 1, // PlaceBet variant
        pool_id: new BN(parseInt(betData.poolId) || 0),
        option: betData.option === 'yes' ? 0 : 1, // Convert string to number (0 for yes, 1 for no)
        amount: new BN(Math.floor(parseFloat(betData.amount) * 1e6)), // Convert to USDC units
      });

      console.log('📦 [ContractService] Place bet message:', message);

      // Calculate rent for Solana PDA
      const optionsData = '0x';
      
      // Estimate gas for the transaction
      console.log('📦 [ContractService] Estimating gas for place bet transaction...');
      const gasEstimate = await this.contract.sendBetlifyAction.estimateGas(
        SOLANA_DST_EID,
        message,
        optionsData
      );
      
      console.log('📦 [ContractService] Gas estimate for place bet:', gasEstimate.toString());
      

      // Send the transaction
      const tx = await this.contract.sendBetlifyAction(
        SOLANA_DST_EID,
        message,
        optionsData,
        {
          value: ethers.parseEther('0.001'),
        }
      );

      console.log('📦 [ContractService] Place bet transaction sent:', tx.hash);
      
      this.safeToast({
        title: "Bet Transaction Sent",
        description: `Placing bet... Transaction hash: ${tx.hash.substring(0, 10)}...`,
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('📦 [ContractService] Place bet transaction confirmed:', receipt);
      
      this.safeToast({
        title: "Bet Placed Successfully!",
        description: `Your bet of ${betData.amount} USDC has been placed.`,
      });

      return tx.hash;
    } catch (error) {
      console.error('📦 [ContractService] Error in placeBet:', error);
      this.safeToast({
        title: "Bet Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Disconnect
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }
}

// Export singleton instance
export const betlifyContractService = new BetlifyContractService();