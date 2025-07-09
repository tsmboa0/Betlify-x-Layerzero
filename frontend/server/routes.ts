import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMarketSchema, insertMarketOptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all markets
  app.get("/api/markets", async (req, res) => {
    try {
      const markets = await storage.getMarkets();
      res.json(markets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch markets" });
    }
  });

  // Get markets by category
  app.get("/api/markets/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const markets = await storage.getMarketsByCategory(category);
      res.json(markets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch markets by category" });
    }
  });

  // Get single market
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid market ID" });
      }

      const market = await storage.getMarket(id);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      res.json(market);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market" });
    }
  });

  // Create new market
  app.post("/api/markets", async (req, res) => {
    try {
      const validatedData = insertMarketSchema.parse(req.body);
      const market = await storage.createMarket(validatedData);

      // Create default YES/NO options for binary markets
      if (validatedData.marketType === "binary") {
        await storage.createMarketOption({
          marketId: market.id,
          label: "YES",
          price: "50.00",
          priceChange: "0.00",
        });

        await storage.createMarketOption({
          marketId: market.id,
          label: "NO",
          price: "50.00",
          priceChange: "0.00",
        });
      }

      const marketWithOptions = await storage.getMarket(market.id);
      res.status(201).json(marketWithOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create market" });
    }
  });

  // Create market option
  app.post("/api/markets/:id/options", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      if (isNaN(marketId)) {
        return res.status(400).json({ message: "Invalid market ID" });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      const validatedData = insertMarketOptionSchema.parse({
        ...req.body,
        marketId,
      });

      const option = await storage.createMarketOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid option data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create market option" });
    }
  });

  // Update market
  app.patch("/api/markets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid market ID" });
      }

      const validatedData = insertMarketSchema.partial().parse(req.body);
      const market = await storage.updateMarket(id, validatedData);

      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      res.json(market);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid market data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update market" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const markets = await storage.getMarkets();
      const totalVolume = markets.reduce((sum, market) => 
        sum + parseFloat(market.totalVolume || "0"), 0
      );
      const totalUsers = markets.reduce((sum, market) => 
        sum + (market.totalTraders || 0), 0
      );

      res.json({
        totalMarkets: markets.filter(m => m.isActive).length,
        totalVolume: `$${(totalVolume / 1000000).toFixed(1)}M`,
        totalUsers: totalUsers.toLocaleString(),
        totalCreators: Math.floor(markets.length * 0.65), // Approximate creators count
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
