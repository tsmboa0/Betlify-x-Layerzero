import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MarketCard } from "./market-card";
import type { MarketWithOptions } from "@shared/schema";

interface MarketCarouselProps {
  title: string;
  description: string;
  markets: MarketWithOptions[];
  onMarketClick: (market: MarketWithOptions) => void;
  onViewAll: () => void;
  icon?: React.ReactNode;
  categoryColor?: string;
}

export function MarketCarousel({ 
  title, 
  description, 
  markets, 
  onMarketClick, 
  onViewAll,
  icon,
  categoryColor = "text-solana-purple"
}: MarketCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    // Responsive scroll amount: smaller on mobile, larger on desktop
    const isMobile = window.innerWidth < 640;
    const scrollAmount = isMobile ? 200 : 248; // Mobile: 192px + 8px gap, Desktop: 224px + 24px gap
    const currentScroll = scrollRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  if (markets.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                {icon && <span className="mr-3">{icon}</span>}
                {title}
              </h2>
              <p className="text-gray-400">{description}</p>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400">No markets available in this category yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 flex items-center">
              {icon && <span className="mr-1 sm:mr-2 text-sm sm:text-base">{icon}</span>}
              <span className="truncate">{title}</span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">{description}</p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={onViewAll}
              className="text-solana-green hover:text-solana-purple font-medium text-xs sm:text-sm hidden sm:flex"
            >
              View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {markets.map((market) => (
              <div key={market.id} style={{ scrollSnapAlign: 'start' }} className="flex-shrink-0">
                <MarketCard
                  market={market}
                  onClick={() => onMarketClick(market)}
                  categoryColor={categoryColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
