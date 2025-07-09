import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description"),
  category: text("category").notNull(), // politics, sports, entertainment, crypto
  imageUrl: text("image_url"),
  marketType: text("market_type").notNull().default("binary"), // binary, multiple
  startTime: timestamp("start_time").notNull(),
  lockTime: timestamp("lock_time").notNull(),
  resolutionDate: timestamp("resolution_date").notNull(),
  creatorFee: decimal("creator_fee", { precision: 5, scale: 2 }).default("1.00"),
  minimumBet: decimal("minimum_bet", { precision: 10, scale: 2 }).default("1.00"),
  totalVolume: decimal("total_volume", { precision: 15, scale: 2 }).default("0.00"),
  totalTraders: integer("total_traders").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketOptions = pgTable("market_options", {
  id: serial("id").primaryKey(),
  marketId: integer("market_id").references(() => markets.id).notNull(),
  label: text("label").notNull(), // YES/NO or custom labels
  price: decimal("price", { precision: 5, scale: 2 }).notNull(), // price in cents
  priceChange: decimal("price_change", { precision: 5, scale: 2 }).default("0.00"),
  volume: decimal("volume", { precision: 15, scale: 2 }).default("0.00"),
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  totalVolume: true,
  totalTraders: true,
  createdAt: true,
});

export const insertMarketOptionSchema = createInsertSchema(marketOptions).omit({
  id: true,
  volume: true,
});

export type Market = typeof markets.$inferSelect;
export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type MarketOption = typeof marketOptions.$inferSelect;
export type InsertMarketOption = z.infer<typeof insertMarketOptionSchema>;

export interface MarketWithOptions extends Market {
  options: MarketOption[];
}
