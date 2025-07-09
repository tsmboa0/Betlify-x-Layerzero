import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Wallet } from "lucide-react";
import type { MarketWithOptions } from "@shared/schema";
import { formatCurrency, formatPrice, formatPriceChange } from "@/lib/utils";

interface MarketDetailModalProps {
  market: MarketWithOptions | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MarketDetailModal({ market, isOpen, onClose }: MarketDetailModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [betAmount, setBetAmount] = useState<string>("");
  const [isWalletConnected] = useState(false); // This would come from wallet context

  if (!market) return null;

  const calculatePayout = () => {
    if (!betAmount || !selectedOption) return { payout: 0, profit: 0 };
    
    const amount = parseFloat(betAmount);
    const option = market.options.find(opt => opt.label === selectedOption);
    if (!option) return { payout: 0, profit: 0 };
    
    const price = parseFloat(option.price) / 100; // Convert cents to dollars
    const payout = amount / price;
    const profit = payout - amount;
    
    return { payout, profit };
  };

  const { payout, profit } = calculatePayout();

  const getOptionColorClass = (label: string, index: number) => {
    if (label === "YES") return "bg-green-500/20 border-green-500/50 hover:border-green-400";
    if (label === "NO") return "bg-red-500/20 border-red-500/50 hover:border-red-400";
    
    const colors = [
      "bg-blue-500/20 border-blue-500/50 hover:border-blue-400",
      "bg-purple-500/20 border-purple-500/50 hover:border-purple-400",
      "bg-yellow-500/20 border-yellow-500/50 hover:border-yellow-400",
      "bg-orange-500/20 border-orange-500/50 hover:border-orange-400",
    ];
    
    return colors[index % colors.length];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto bg-solana-gray border-white/20 text-white">
        <DialogHeader className="border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{market.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 pt-6">
          {/* Left Column - Image and Details */}
          <div>
            {market.imageUrl && (
              <img 
                src={market.imageUrl} 
                alt={market.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Market Description</h3>
                <p className="text-gray-300">
                  {market.fullDescription || market.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Resolution Criteria</h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Market resolves on {new Date(market.resolutionDate).toLocaleDateString()}</li>
                  <li>• Based on official sources and verified outcomes</li>
                  <li>• Creator fee: {market.creatorFee}%</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Total Volume</div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(market.totalVolume || "0")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Traders</div>
                  <div className="text-xl font-bold text-white">
                    {(market.totalTraders || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Trading Interface */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Place Your Bet</h3>
              
              {/* Market Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {market.options.map((option, index) => {
                  const priceChange = formatPriceChange(option.priceChange || "0");
                  const isSelected = selectedOption === option.label;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.label)}
                      className={`rounded-lg p-4 text-center border-2 transition-colors ${
                        getOptionColorClass(option.label, index)
                      } ${isSelected ? 'ring-2 ring-solana-purple' : ''}`}
                    >
                      <div className="font-medium mb-1">{option.label}</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatPrice(option.price)}
                      </div>
                      {option.priceChange && parseFloat(option.priceChange) !== 0 && (
                        <div className={`text-xs ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {priceChange.formatted}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bet Amount Input */}
              <div className="mb-4">
                <Label className="text-gray-400 mb-2 block">Bet Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-500 pr-16"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">USDC</div>
                </div>
              </div>

              {/* Potential Payout */}
              {betAmount && selectedOption && (
                <div className="mb-6 bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Potential Payout</span>
                    <span>${payout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Potential Profit</span>
                    <span className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                      ${profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {isWalletConnected ? (
                  <Button 
                    className="w-full gradient-solana text-black font-bold py-3"
                    disabled={!selectedOption || !betAmount}
                  >
                    Place Bet
                  </Button>
                ) : (
                  <Button 
                    className="w-full border border-white/20 text-white font-semibold py-3 hover:bg-white/10"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet to Bet
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
