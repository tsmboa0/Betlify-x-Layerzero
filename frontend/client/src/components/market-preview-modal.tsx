import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import type { InsertMarket } from "@shared/schema";

interface MarketPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marketData: InsertMarket & {
    startTime: string;
    lockTime: string;
    resolutionDate: string;
  };
  isLoading?: boolean;
}

export function MarketPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  marketData,
  isLoading = false,
}: MarketPreviewModalProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, "PPP 'at' p");
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "politics":
        return "bg-red-100 text-red-800";
      case "sports":
        return "bg-green-100 text-green-800";
      case "crypto":
        return "bg-yellow-100 text-yellow-800";
      case "entertainment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Preview Market</DialogTitle>
          <DialogDescription>
            Review your market details before creating it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Image */}
          {marketData.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={marketData.imageUrl}
                alt={marketData.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Market Title & Category */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{marketData.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(marketData.category)}>
                {marketData.category}
              </Badge>
              <Badge variant="outline">
                {marketData.marketType === "binary" ? "Binary" : "Multiple Choice"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{marketData.description}</p>
                  </div>
                </div>
                {marketData.fullDescription && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <h4 className="font-medium">Full Description</h4>
                      <p className="text-sm text-gray-600">{marketData.fullDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Details */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Market Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Start Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(marketData.startTime || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Lock Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(marketData.lockTime || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Resolution Date</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(marketData.resolutionDate || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Creator Fee</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(marketData.creatorFee)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Minimum Bet</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(marketData.minimumBet)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Market"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 