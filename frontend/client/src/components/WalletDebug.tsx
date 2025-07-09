import React from 'react';
import { useWalletContext } from '@/contexts/WalletContext';

export const WalletDebug = () => {
  const { walletState, getTruncatedAddress } = useWalletContext();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Wallet Debug</h3>
      <div className="space-y-1">
        <div>Connected: {walletState.isConnected ? 'Yes' : 'No'}</div>
        <div>Wallet: {walletState.walletName || 'None'}</div>
        <div>Type: {walletState.walletType || 'None'}</div>
        <div>Address: {walletState.address || 'None'}</div>
        <div>Truncated: "{getTruncatedAddress()}"</div>
        <div>Network: {walletState.network || 'None'}</div>
      </div>
    </div>
  );
}; 