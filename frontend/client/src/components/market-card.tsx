import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketWithOptions } from "@shared/schema";
import { formatCurrency, formatPrice, formatPriceChange } from "@/lib/utils";

interface MarketCardProps {
  market: MarketWithOptions;
  onClick: () => void;
  categoryColor?: string;
}

export function MarketCard({ market, onClick, categoryColor = "text-solana-purple" }: MarketCardProps) {
  const primaryOption = market.options[0];
  const secondaryOption = market.options[1];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "politics":
        return "🗳️";
      case "sports":
        return "🏈";
      case "entertainment":
        return "🎬";
      case "crypto":
        return "₿";
      default:
        return "📊";
    }
  };

  const getOptionColorClass = (label: string, index: number) => {
    if (label === "YES") return "bg-green-500/20 border-green-500/30 text-green-400";
    if (label === "NO") return "bg-red-500/20 border-red-500/30 text-red-400";
    
    const colors = [
      "bg-blue-500/20 border-blue-500/30 text-blue-400",
      "bg-purple-500/20 border-purple-500/30 text-purple-400",
      "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      "bg-orange-500/20 border-orange-500/30 text-orange-400",
    ];
    
    return colors[index % colors.length];
  };

  return (
    <Card 
      className="w-48 sm:w-56 bg-solana-gray/50 backdrop-blur-sm border-white/10 p-2 sm:p-3 hover:border-solana-purple/50 transition-all cursor-pointer group flex-shrink-0"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Market Image */}
        {market.imageUrl && (
          <img 
            src={market.imageUrl} 
            alt={market.title}
            className="w-full h-24 sm:h-28 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
          />
        )}
        
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
            <span className="text-xs">{getCategoryIcon(market.category)}</span>
            <span className="ml-1 hidden sm:inline">{market.category.charAt(0).toUpperCase() + market.category.slice(1)}</span>
          </Badge>
        </div>

        {/* Market Details */}
        <div className="mb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 line-clamp-2 leading-tight">
            {market.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-1 hidden sm:block">
            {market.description}
          </p>
        </div>

        {/* Market Options */}
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mb-2">
          {market.options.slice(0, 2).map((option, index) => {
            const priceChange = formatPriceChange(option.priceChange || "0");
            return (
              <div 
                key={option.id} 
                className={`rounded-lg p-1 sm:p-1.5 border ${getOptionColorClass(option.label, index)}`}
              >
                <div className="text-xs font-medium mb-1">{option.label}</div>
                <div className="text-white font-bold text-xs">{formatPrice(option.price)}</div>
                {option.priceChange && parseFloat(option.priceChange) !== 0 && (
                  <div className={`text-xs ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange.formatted}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Market Stats */}
        <div className="flex justify-between text-xs text-gray-400">
          <span className="truncate">{formatCurrency(market.totalVolume || "0")}</span>
          <span className="text-xs ml-1">{new Date(market.resolutionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
