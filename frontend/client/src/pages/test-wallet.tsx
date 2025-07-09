import React from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnectModal } from '@/components/wallet-connect-modal';
import { useState } from 'react';

export default function TestWallet() {
  const { walletState, connectMetaMask, disconnectWallet, getTruncatedAddress } = useWalletContext();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleDirectMetaMaskConnect = async () => {
    console.log('Direct MetaMask connect button clicked');
    const result = await connectMetaMask();
    console.log('Direct MetaMask connect result:', result);
  };

  return (
    <div className="min-h-screen bg-solana-dark text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Wallet Test Page</h1>
          <p className="text-gray-400 text-lg">Test your wallet connection and functionality</p>
        </div>

        <Card className="bg-solana-gray/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Wallet Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Connection Status:</span>
              <Badge variant={walletState.isConnected ? "default" : "secondary"}>
                {walletState.isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Wallet Type */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Wallet Type:</span>
              <Badge variant="outline">
                {walletState.walletType || "None"}
              </Badge>
            </div>

            {/* Wallet Name */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Wallet Name:</span>
              <span className="text-white">{walletState.walletName || "None"}</span>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Address:</span>
              <span className="text-white font-mono">
                {walletState.address ? getTruncatedAddress() : "None"}
              </span>
            </div>

            {/* Network */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Network:</span>
              <span className="text-white">{walletState.network || "None"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              {!walletState.isConnected ? (
                <>
                  <Button
                    onClick={() => setShowWalletModal(true)}
                    className="gradient-solana text-black font-bold hover:opacity-90"
                  >
                    Connect Wallet
                  </Button>
                  <Button
                    onClick={handleDirectMetaMaskConnect}
                    variant="outline"
                    className="border-white/20 text-white font-semibold hover:bg-white/10"
                  >
                    Direct MetaMask
                  </Button>
                </>
              ) : (
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="border-white/20 text-white font-semibold hover:bg-white/10"
                >
                  Disconnect Wallet
                </Button>
              )}
            </div>


          </CardContent>
        </Card>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
} 