import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/contexts/WalletContext";
import { betlifyContractService } from "@/lib/contracts";

import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BetDetails {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  imageUrl?: string;
  marketType: "binary" | "multiple";
  startTime: string;
  lockTime: string;
  resolutionDate: string;
  creatorFee: string;
  minimumBet: string;
  isActive: boolean;
  creator: string;
  totalVolume?: string;
  totalBets?: number;
  createdAt: string;
}

interface BetOption {
  id: string;
  text: string;
  odds?: string;
  percentage?: number;
}

export default function BetDetails() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { walletState } = useWalletContext();
  const [betDetails, setBetDetails] = useState<BetDetails | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [betAmount, setBetAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betOptions, setBetOptions] = useState<BetOption[]>([]);

  // Get bet ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const betId = urlParams.get('id');

  useEffect(() => {
    if (betId) {
      loadBetDetails(betId);
    }
  }, [betId]);

  useEffect(() => {
    // Set toast function on contract services
    betlifyContractService.setToast(toast);
  }, [toast]);

  const loadBetDetails = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Load bet data from localStorage
      const existingBets = JSON.parse(localStorage.getItem('betlify_bets') || '[]');
      const betData = existingBets.find((bet: any) => bet.id === id);
      
      if (!betData) {
        throw new Error("Bet not found");
      }

      setBetDetails(betData);

      // Set up betting options based on market type
      if (betData.marketType === "binary") {
        setBetOptions([
          { id: "yes", text: "YES", odds: "2.1", percentage: 65 },
          { id: "no", text: "NO", odds: "1.8", percentage: 35 }
        ]);
      } else {
        // For multiple choice, you would parse the options from the data
        setBetOptions([
          { id: "option1", text: "Option 1", odds: "3.2", percentage: 25 },
          { id: "option2", text: "Option 2", odds: "2.5", percentage: 40 },
          { id: "option3", text: "Option 3", odds: "4.1", percentage: 35 }
        ]);
      }
    } catch (error) {
      console.error("Failed to load bet details:", error);
      toast({
        title: "Error Loading Bet",
        description: "Failed to load bet details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bet.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedOption || !betAmount) {
      toast({
        title: "Missing Information",
        description: "Please select an option and enter bet amount.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);

    try {
      if (walletState.walletType === 'metamask') {
        const initialized = await betlifyContractService.initialize();
        if (!initialized) {
          throw new Error("Failed to initialize contract service");
        }

        const betData = {
          poolId: betDetails?.id || "1",
          option: selectedOption,
          amount: betAmount,
        };

        const txHash = await betlifyContractService.placeBet(betData);
        console.log('Bet placed via contract:', txHash);
        
        toast({
          title: "Bet Placed Successfully!",
          description: `Your bet of ${betAmount} USDC has been placed.`,
        });
      } else if (walletState.walletType === 'solana') {
        toast({
          title: "Solana Not Supported",
          description: "Solana wallet integration is not available yet.",
          variant: "destructive",
        });
      }

      setSelectedOption("");
      setBetAmount("");
    } catch (error) {
      console.error('Failed to place bet:', error);
      toast({
        title: "Bet Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "politics": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "sports": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "entertainment": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "crypto": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-solana-dark text-white pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" text="Loading bet details..." />
          </div>
        </div>
      </div>
    );
  }

  if (!betDetails) {
    return (
      <div className="min-h-screen bg-solana-dark text-white pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Bet not found. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solana-dark text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1">
            <Card className="bg-solana-gray/50 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                {/* Market Image */}
                {betDetails.imageUrl && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <img
                      src={betDetails.imageUrl}
                      alt={betDetails.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(betDetails.category)}>
                    <span className="capitalize">{betDetails.category}</span>
                  </Badge>
                  <Badge variant={betDetails.isActive ? "default" : "secondary"}>
                    {betDetails.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Market Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Volume</span>
                    <span className="text-white font-semibold">${betDetails.totalVolume || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Bets</span>
                    <span className="text-white font-semibold">{betDetails.totalBets || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Creator Fee</span>
                    <span className="text-white font-semibold">{betDetails.creatorFee}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Min Bet</span>
                    <span className="text-white font-semibold">${betDetails.minimumBet} USDC</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Starts:</span>
                      <span className="text-white">{formatDate(betDetails.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Locks:</span>
                      <span className="text-white">{formatDate(betDetails.lockTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Resolves:</span>
                      <span className="text-white">{formatDate(betDetails.resolutionDate)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details and Betting */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Title and Description */}
            <Card className="bg-solana-gray/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{betDetails.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">{betDetails.description}</p>
                
                {betDetails.fullDescription && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Detailed Description</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{betDetails.fullDescription}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Created by {betDetails.creator}</span>
                  <span>•</span>
                  <span>{formatDate(betDetails.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Betting Section */}
            <Card className="bg-solana-gray/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Place Your Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Connection Alert */}
                {!walletState.isConnected && (
                  <Alert className="border-yellow-500/20 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      Please connect your wallet to place a bet.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Betting Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Select Outcome</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {betOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                          selectedOption === option.id
                            ? 'border-solana-purple bg-solana-purple/20 shadow-lg shadow-solana-purple/20'
                            : 'border-white/20 hover:border-solana-purple/50 hover:bg-solana-purple/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium">{option.text}</div>
                            {option.odds && (
                              <div className="text-sm text-gray-400 mt-1">
                                Odds: {option.odds}x • {option.percentage}% of bets
                              </div>
                            )}
                          </div>
                          {selectedOption === option.id && (
                            <CheckCircle className="w-5 h-5 text-solana-purple" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Bet Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder={`Minimum: ${betDetails.minimumBet} USDC`}
                    min={betDetails.minimumBet}
                    step="0.1"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-solana-purple focus:outline-none"
                  />
                </div>

                {/* Place Bet Button */}
                <Button
                  onClick={handlePlaceBet}
                  disabled={!walletState.isConnected || !selectedOption || !betAmount || isPlacingBet}
                  className="w-full gradient-solana text-black font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {isPlacingBet ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Placing Bet...
                    </>
                  ) : (
                    "Place Bet"
                  )}
                </Button>

                {/* Potential Winnings */}
                {selectedOption && betAmount && (
                  <div className="p-4 bg-solana-purple/10 border border-solana-purple/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Potential Winnings</div>
                      <div className="text-lg font-bold text-solana-purple">
                        ${(parseFloat(betAmount) * (parseFloat(betOptions.find(o => o.id === selectedOption)?.odds || "1"))).toFixed(2)} USDC
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 