import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { WalletConnectModal } from "./wallet-connect-modal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useWalletContext } from "@/contexts/WalletContext";
import { Menu, Sun, Moon, Wallet, TrendingUp, Trophy, Users, Star } from "lucide-react";

export function Navigation() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { walletState, getTruncatedAddress } = useWalletContext();

  // Debug logging (only when connected to reduce spam)
  if (walletState.isConnected) {
    console.log('Navigation - Connected Wallet State:', walletState);
    console.log('Navigation - Truncated Address:', getTruncatedAddress());
  }

  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  const navItems = [
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Trophy, label: "Sports", href: "/category/sports" },
    { icon: Users, label: "Politics", href: "/category/politics" },
    { icon: Star, label: "Entertainment", href: "/category/entertainment" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="text-2xl font-bold gradient-solana bg-clip-text text-transparent cursor-pointer">
              Betlify.Fun
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center space-x-1 lg:space-x-2 text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors cursor-pointer">
                  <item.icon className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </Button>
            
            {/* Connect Wallet Button */}
            <Button
              onClick={handleConnectWallet}
              size="sm"
              className={`font-medium px-3 text-sm min-w-[80px] ${
                walletState.isConnected 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "gradient-solana text-black hover:opacity-90"
              }`}
            >
              <Wallet className="w-3 h-3 mr-1" />
              {walletState.isConnected ? (
                <span className="truncate">{getTruncatedAddress()}</span>
              ) : (
                "Connect"
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-solana-gray border-white/10">
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors cursor-pointer">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Mobile Connect Wallet Button */}
                  <div className="pt-4 border-t border-white/10">
                    <Button
                      onClick={handleConnectWallet}
                      className={`w-full font-medium ${
                        walletState.isConnected 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "gradient-solana text-black hover:opacity-90"
                      }`}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {walletState.isConnected ? (
                        <span className="truncate">{getTruncatedAddress()}</span>
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal 
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </nav>
  );
}
