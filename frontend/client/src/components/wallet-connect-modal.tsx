import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Wallet, ExternalLink, LogOut, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext, WalletState } from "@/contexts/WalletContext";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  walletType: 'metamask' | 'solana';
  isInstalled?: boolean;
  installUrl?: string;
}

export function WalletConnectModal({ 
  isOpen, 
  onClose
}: WalletConnectModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { walletState, connectMetaMask, connectSolanaWallet, disconnectWallet, getTruncatedAddress, isConnecting } = useWalletContext();
  const { setVisible } = useWalletModal();

  // Check if wallets are installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum?.isMetaMask;

  const walletOptions: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: "🦊",
      walletType: 'metamask',
      isInstalled: isMetaMaskInstalled,
      installUrl: "https://metamask.io/download/"
    },
    {
      id: "solana",
      name: "Solana Wallets",
      description: "Connect using Phantom, Solflare, or other Solana wallets",
      icon: "👻",
      walletType: 'solana',
      isInstalled: true,
    }
  ];

  const handleWalletConnect = async (wallet: WalletOption) => {
    console.log('handleWalletConnect called with wallet:', wallet);
    if (wallet.walletType === 'metamask') {
      if (!wallet.isInstalled && wallet.installUrl) {
        console.log('MetaMask not installed, opening install URL');
        window.open(wallet.installUrl, '_blank');
        return;
      }
      console.log('Attempting to connect MetaMask...');
      const success = await connectMetaMask();
      console.log('MetaMask connection result:', success);
      if (success) {
        console.log('MetaMask connected successfully, closing modal');
        onClose(); // Close modal on successful connection
      } else {
        console.log('MetaMask connection failed');
      }
    } else if (wallet.walletType === 'solana') {
      console.log('Opening Solana wallet modal');
      onClose(); // Close the current modal
      setVisible(true); // Open Solana wallet modal
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  const copyAddress = async () => {
    if (!walletState.address) return;
    
    try {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] bg-solana-gray border-white/20 text-white">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-solana-purple" />
              {walletState.isConnected ? "Wallet Settings" : "Connect Wallet"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {walletState.isConnected 
              ? "Manage your wallet connection" 
              : "Choose a wallet to connect to Betlify.Fun"
            }
          </p>
        </DialogHeader>

        {walletState.isConnected ? (
          // Connected wallet view
          <div className="space-y-4 pt-6">
            <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/10">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {walletState.walletType === 'metamask' ? '🦊' : '👻'}
                </div>
                <div>
                  <div className="text-lg font-medium text-white">
                    {walletState.walletName}
                  </div>
                  <div className="text-sm text-green-400">
                    Connected
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {getTruncatedAddress()}
                  </div>
                  {walletState.network && (
                    <div className="text-xs text-gray-500 mt-1">
                      Network: {walletState.network}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={copyAddress}
                variant="outline"
                className="w-full p-3 border-white/20 text-white hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Address Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full p-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          // Wallet selection view
          <div className="space-y-4 pt-6">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletConnect(wallet)}
                disabled={isConnecting}
                className="w-full p-4 rounded-lg border border-white/20 hover:border-solana-purple/50 hover:bg-white/5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{wallet.icon}</div>
                    <div>
                      <div className="text-lg font-medium text-white group-hover:text-solana-purple transition-colors">
                        {wallet.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {wallet.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!wallet.isInstalled && wallet.installUrl && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Install</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </div>
                    )}
                    
                    {wallet.isInstalled && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    
                    {isConnecting && (
                      <div className="w-5 h-5 border-2 border-solana-purple border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-gray-500 text-center">
            By connecting a wallet, you agree to our{" "}
            <button className="text-solana-purple hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-solana-purple hover:underline">
              Privacy Policy
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}