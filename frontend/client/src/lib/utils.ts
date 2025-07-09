import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toLocaleString()}`;
}

export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `${num.toFixed(1)}¢`;
}

export function formatPriceChange(change: string | number): { formatted: string; isPositive: boolean } {
  const num = typeof change === 'string' ? parseFloat(change) : change;
  const isPositive = num >= 0;
  return {
    formatted: `${isPositive ? '+' : ''}${num.toFixed(1)}%`,
    isPositive
  };
}
