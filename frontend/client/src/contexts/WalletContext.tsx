import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

export interface WalletState {
  isConnected: boolean;
  walletName: string | null;
  walletType: 'metamask' | 'solana' | null;
  address: string | null;
  chainId?: number;
  network?: string;
}

interface WalletContextType {
  walletState: WalletState;
  connectMetaMask: () => Promise<boolean>;
  connectSolanaWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  getTruncatedAddress: () => string;
  isConnecting: boolean;
  setSolanaWalletState: (state: Partial<WalletState>) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletName: null,
    walletType: null,
    address: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Load wallet state from localStorage on component mount
  useEffect(() => {
    const savedWalletState = localStorage.getItem('walletState');
    console.log('Loading saved wallet state:', savedWalletState);
    if (savedWalletState) {
      try {
        const parsed = JSON.parse(savedWalletState);
        console.log('Parsed wallet state:', parsed);
        
        // Only restore the state if it's a MetaMask wallet, since Solana wallets need to be reconnected
        if (parsed.walletType === 'metamask') {
          // For MetaMask, we can restore the state but we should verify the connection
          setWalletState(parsed);
          
          // Verify MetaMask connection is still valid
          if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
              .then((accounts: string[]) => {
                if (accounts.length === 0 || accounts[0] !== parsed.address) {
                  // MetaMask is not connected or account changed, clear the state
                  console.log('MetaMask not connected or account changed, clearing state');
                  setWalletState({
                    isConnected: false,
                    walletName: null,
                    walletType: null,
                    address: null,
                  });
                  localStorage.removeItem('walletState');
                }
              })
              .catch(() => {
                // MetaMask not available, clear the state
                console.log('MetaMask not available, clearing state');
                setWalletState({
                  isConnected: false,
                  walletName: null,
                  walletType: null,
                  address: null,
                });
                localStorage.removeItem('walletState');
              });
          } else {
            // MetaMask not available, clear the state
            console.log('MetaMask not available, clearing state');
            setWalletState({
              isConnected: false,
              walletName: null,
              walletType: null,
              address: null,
            });
            localStorage.removeItem('walletState');
          }
        } else {
          // For Solana wallets, don't restore the state as they need to be reconnected
          console.log('Solana wallet state found, not restoring (needs reconnection)');
          localStorage.removeItem('walletState');
        }
      } catch (error) {
        console.error('Failed to parse saved wallet state:', error);
        localStorage.removeItem('walletState');
      }
    }
  }, []);

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (walletState.isConnected) {
      console.log('Saving connected wallet state to localStorage:', walletState);
    }
    
    // Only save MetaMask wallet states to localStorage
    // Solana wallets should be reconnected each time
    if (walletState.walletType === 'metamask') {
      localStorage.setItem('walletState', JSON.stringify(walletState));
    } else if (walletState.walletType === 'solana') {
      // Don't save Solana wallet states
      localStorage.removeItem('walletState');
    } else if (!walletState.isConnected) {
      // Clear localStorage when disconnected
      localStorage.removeItem('walletState');
    }
  }, [walletState]);

  // Debug wallet state changes (only log when connected to reduce spam)
  useEffect(() => {
    if (walletState.isConnected) {
      console.log('Wallet state changed:', walletState);
    }
  }, [walletState]);

  const setSolanaWalletState = (state: Partial<WalletState>) => {
    if (state.isConnected) {
      console.log('setSolanaWalletState called with:', state);
    }
    setWalletState(prev => {
      const newState = { ...prev, ...state };
      if (newState.isConnected) {
        console.log('New connected wallet state:', newState);
      }
      return newState;
    });
  };

  const connectMetaMask = async () => {
    console.log('connectMetaMask called');
    if (typeof window === 'undefined' || !window.ethereum) {
      console.log('MetaMask not found');
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return false;
    }

    console.log('MetaMask found, requesting accounts...');
    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('MetaMask accounts received:', accounts);
      
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log('MetaMask network:', network);
        
        const newWalletState = {
          isConnected: true,
          walletName: 'MetaMask',
          walletType: 'metamask' as const,
          address: accounts[0],
          chainId: Number(network.chainId),
          network: network.name,
        };
        
        console.log('MetaMask - Setting wallet state:', newWalletState);
        setWalletState(newWalletState);

        toast({
          title: "MetaMask Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletState(prev => ({
              ...prev,
              address: accounts[0],
            }));
          } else {
            disconnectWallet();
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId: string) => {
          setWalletState(prev => ({
            ...prev,
            chainId: parseInt(chainId, 16),
          }));
        });

        return true; // Indicate successful connection
      }
      return false; // No accounts found
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect MetaMask. Please try again.",
        variant: "destructive",
      });
      return false; // Indicate failed connection
    } finally {
      setIsConnecting(false);
    }
  };

  const connectSolanaWallet = async (walletName: string) => {
    // This will be handled by the Solana wallet adapter modal
    // The actual connection will be managed by the SolanaWalletProviderWrapper
    setIsConnecting(true);
    try {
      // The wallet state will be updated via setSolanaWalletState from the Solana provider
      toast({
        title: "Opening Wallet",
        description: "Please select your Solana wallet from the modal",
      });
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect Solana wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      walletName: null,
      walletType: null,
      address: null,
    });

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const getTruncatedAddress = () => {
    console.log('getTruncatedAddress - walletState:', walletState);
    if (!walletState.address) {
      console.log('getTruncatedAddress - No address found');
      return '';
    }
    const truncated = `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`;
    console.log('getTruncatedAddress - Truncated address:', truncated);
    return truncated;
  };

  const value: WalletContextType = {
    walletState,
    connectMetaMask,
    connectSolanaWallet,
    disconnectWallet,
    getTruncatedAddress,
    isConnecting,
    setSolanaWalletState,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 