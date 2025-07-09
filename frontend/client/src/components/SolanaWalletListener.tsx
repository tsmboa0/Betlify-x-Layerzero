import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWalletContext } from '@/contexts/WalletContext';

export const SolanaWalletListener = () => {
  const { wallet, connected, publicKey, disconnect } = useWallet();
  const { setSolanaWalletState, disconnectWallet } = useWalletContext();
  const { setVisible } = useWalletModal();
  const lastProcessedState = useRef<{ connected: boolean; publicKey: string | undefined } | null>(null);

  useEffect(() => {
    const currentState = { connected, publicKey: publicKey?.toString() };
    
    // Check if we've already processed this exact state to prevent infinite loops
    if (lastProcessedState.current && 
        lastProcessedState.current.connected === currentState.connected && 
        lastProcessedState.current.publicKey === currentState.publicKey) {
      return;
    }
    
    // Only log when there's actually a wallet to avoid spam
    if (wallet) {
      console.log('SolanaWalletListener - connected:', connected, 'publicKey:', publicKey?.toString(), 'wallet:', wallet?.adapter.name);
    }
    
    if (connected && publicKey && wallet) {
      const walletState = {
        isConnected: true,
        walletName: wallet.adapter.name,
        walletType: 'solana' as const,
        address: publicKey.toString(),
        network: 'solana',
      };
      console.log('SolanaWalletListener - Setting wallet state:', walletState);
      setSolanaWalletState(walletState);
      
      // Expose wallet to window for contract service access
      (window as any).solanaWallet = wallet;
      
      // Close the Solana wallet modal after successful connection
      setVisible(false);
    } else if (!connected && wallet && publicKey) {
      // Only disconnect if we were previously connected to a Solana wallet AND we have both wallet and publicKey
      // This prevents the listener from interfering with MetaMask connections or uninitialized wallets
      const walletState = {
        isConnected: false,
        walletName: null,
        walletType: null,
        address: null,
      };
      console.log('SolanaWalletListener - Disconnecting Solana wallet state:', walletState);
      setSolanaWalletState(walletState);
      
      // Remove wallet from window
      delete (window as any).solanaWallet;
    }
    
    // Update the last processed state
    lastProcessedState.current = currentState;
  }, [connected, publicKey, wallet, setSolanaWalletState, setVisible]);

  // Remove this useEffect as it's causing the infinite loop
  // The main useEffect above handles all wallet state changes

  return null; // This component doesn't render anything
}; 