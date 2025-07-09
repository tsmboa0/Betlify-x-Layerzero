import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MarketCarousel } from "@/components/market-carousel";
import { MarketDetailModal } from "@/components/market-detail-modal";
import { Users, Trophy, Star } from "lucide-react";
import type { MarketWithOptions } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedMarket, setSelectedMarket] = useState<MarketWithOptions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all markets
  const { data: allMarkets = [], isLoading } = useQuery<MarketWithOptions[]>({
    queryKey: ["/api/markets"],
  });



  // Filter markets by category
  const politicsMarkets = allMarkets.filter(market => market.category === "politics");
  const sportsMarkets = allMarkets.filter(market => market.category === "sports");
  const entertainmentMarkets = allMarkets.filter(market => market.category === "entertainment");
  const cryptoMarkets = allMarkets.filter(market => market.category === "crypto");

  const handleMarketClick = (market: MarketWithOptions) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  const handleViewAll = (category: string) => {
    setLocation(`/category/${category}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-solana-dark flex items-center justify-center">
        <div className="text-white text-lg">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-solana-dark dark:bg-solana-dark text-white dark:text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-solana-purple/20 via-transparent to-solana-green/20"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-solana-purple/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-solana-green/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-8 sm:py-12">
            {/* Main Headlines */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
              <span className="gradient-solana bg-clip-text text-transparent block md:inline">
                Create Custom
              </span>
              <br className="md:hidden" />
              <span className="text-white block md:inline md:ml-4">
                Prediction Markets
              </span>
            </h1>
            
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-300 mb-2">
              with zero coding
            </h2>
            
            <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-sm sm:max-w-xl mx-auto leading-relaxed px-4">
              Just like Polymarket but you can create custom prediction markets to monetize your engagements and followers. 
              Build, share, and profit from your community's predictions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <Button 
                onClick={() => setLocation("/create")}
                className="gradient-solana text-black font-medium px-4 sm:px-5 py-2 text-xs sm:text-sm hover:scale-105 transition-transform w-full sm:w-auto"
              >
                Start Creating Markets
                <span className="ml-1 sm:ml-2">→</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/markets")}
                className="border-white/20 text-white font-medium px-4 sm:px-5 py-2 text-xs sm:text-sm hover:bg-white/10 w-full sm:w-auto"
              >
                Explore Markets
                <span className="ml-1 sm:ml-2">🔍</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Politics Markets */}
      <MarketCarousel
        title="Politics Markets"
        description="Predict political outcomes and major policy decisions"
        markets={politicsMarkets}
        onMarketClick={handleMarketClick}
        onViewAll={() => handleViewAll("politics")}
        icon={<Users className="w-8 h-8 text-solana-purple" />}
        categoryColor="text-solana-purple"
      />

      {/* Sports Markets */}
      <MarketCarousel
        title="Sports Markets"
        description="Bet on your favorite teams and sporting events"
        markets={sportsMarkets}
        onMarketClick={handleMarketClick}
        onViewAll={() => handleViewAll("sports")}
        icon={<Trophy className="w-8 h-8 text-solana-green" />}
        categoryColor="text-solana-green"
      />

      {/* Entertainment Markets */}
      <MarketCarousel
        title="Entertainment Markets"
        description="Predict entertainment trends, awards, and pop culture events"
        markets={entertainmentMarkets}
        onMarketClick={handleMarketClick}
        onViewAll={() => handleViewAll("entertainment")}
        icon={<Star className="w-8 h-8 text-yellow-400" />}
        categoryColor="text-yellow-400"
      />

      {/* Crypto Markets */}
      <MarketCarousel
        title="Crypto Markets"
        description="Predict cryptocurrency prices and blockchain developments"
        markets={cryptoMarkets}
        onMarketClick={handleMarketClick}
        onViewAll={() => handleViewAll("crypto")}
        icon={<span className="text-2xl">₿</span>}
        categoryColor="text-blue-400"
      />

      {/* Market Detail Modal */}
      <MarketDetailModal
        market={selectedMarket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold gradient-solana bg-clip-text text-transparent mb-4">
                Betlify.Fun
              </div>
              <p className="text-gray-400 text-sm">
                Create custom prediction markets with zero coding required.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Markets</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => handleViewAll("politics")} className="hover:text-white transition-colors">Politics</button></li>
                <li><button onClick={() => handleViewAll("sports")} className="hover:text-white transition-colors">Sports</button></li>
                <li><button onClick={() => handleViewAll("entertainment")} className="hover:text-white transition-colors">Entertainment</button></li>
                <li><button onClick={() => handleViewAll("crypto")} className="hover:text-white transition-colors">Crypto</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fees</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Betlify.Fun. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
