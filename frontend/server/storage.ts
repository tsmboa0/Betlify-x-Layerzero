import { markets, marketOptions, type Market, type InsertMarket, type MarketOption, type InsertMarketOption, type MarketWithOptions } from "@shared/schema";

export interface IStorage {
  // Market operations
  getMarkets(): Promise<MarketWithOptions[]>;
  getMarketsByCategory(category: string): Promise<MarketWithOptions[]>;
  getMarket(id: number): Promise<MarketWithOptions | undefined>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: number, market: Partial<InsertMarket>): Promise<Market | undefined>;
  
  // Market option operations
  createMarketOption(option: InsertMarketOption): Promise<MarketOption>;
  updateMarketOption(id: number, option: Partial<InsertMarketOption>): Promise<MarketOption | undefined>;
  getMarketOptions(marketId: number): Promise<MarketOption[]>;
}

export class MemStorage implements IStorage {
  private markets: Map<number, Market>;
  private marketOptions: Map<number, MarketOption>;
  private currentMarketId: number;
  private currentOptionId: number;

  constructor() {
    this.markets = new Map();
    this.marketOptions = new Map();
    this.currentMarketId = 1;
    this.currentOptionId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Politics Markets
    const politicsMarket1 = this.createMarketSync({
      title: "2024 US Presidential Election Winner",
      description: "Will the Republican candidate win the 2024 US Presidential Election?",
      fullDescription: "This market will resolve to 'YES' if the Republican party candidate wins the 2024 US Presidential Election, and 'NO' if any other party candidate wins. The market will resolve based on the official results as confirmed by the Electoral College.",
      category: "politics",
      imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      startTime: new Date("2024-01-01T00:00:00Z"),
      lockTime: new Date("2024-11-05T23:59:59Z"),
      resolutionDate: new Date("2024-12-01T00:00:00Z"),
      creatorFee: "2.0",
      minimumBet: "1.00",
      isActive: true,
      totalVolume: "2400000.00",
      totalTraders: 8942,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket1.id,
      label: "YES",
      price: "52.40",
      priceChange: "1.20",
      volume: "1200000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket1.id,
      label: "NO",
      price: "47.60",
      priceChange: "-1.20",
      volume: "1200000.00",
    });

    const politicsMarket2 = this.createMarketSync({
      title: "Biden Re-election 2024",
      description: "Will Joe Biden be re-elected as President in 2024?",
      fullDescription: "This market resolves to YES if Joe Biden wins the 2024 Presidential Election.",
      category: "politics",
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-11-05T00:00:00Z"),
      creatorFee: "1.5",
      minimumBet: "1.00",
      totalVolume: "1800000.00",
      totalTraders: 6542,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket2.id,
      label: "YES",
      price: "48.20",
      priceChange: "-0.80",
      volume: "900000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket2.id,
      label: "NO",
      price: "51.80",
      priceChange: "0.80",
      volume: "900000.00",
    });

    const politicsMarket3 = this.createMarketSync({
      title: "Senate Control 2024",
      description: "Which party will control the US Senate after 2024 elections?",
      fullDescription: "Market resolves based on which party has majority control of the US Senate after the 2024 elections.",
      category: "politics",
      imageUrl: "https://cdn.sanity.io/images/3tzzh18d/production/be76c37815c0e502689a9e904492c7b47035ad68-1200x675.png",
      marketType: "binary",
      resolutionDate: new Date("2024-11-06T00:00:00Z"),
      creatorFee: "2.0",
      minimumBet: "1.00",
      totalVolume: "950000.00",
      totalTraders: 3241,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket3.id,
      label: "REPUBLICAN",
      price: "55.60",
      priceChange: "2.30",
      volume: "475000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket3.id,
      label: "DEMOCRAT",
      price: "44.40",
      priceChange: "-2.30",
      volume: "475000.00",
    });

    const politicsMarket4 = this.createMarketSync({
      title: "Trump 2024 Nomination",
      description: "Will Donald Trump win the Republican nomination for 2024?",
      fullDescription: "Market resolves based on the official Republican Party nominee for President in 2024.",
      category: "politics",
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-07-15T00:00:00Z"),
      creatorFee: "1.5",
      minimumBet: "1.00",
      totalVolume: "3200000.00",
      totalTraders: 12450,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket4.id,
      label: "YES",
      price: "78.50",
      priceChange: "5.20",
      volume: "1600000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket4.id,
      label: "NO",
      price: "21.50",
      priceChange: "-5.20",
      volume: "1600000.00",
    });

    // Sports Markets
    const sportsMarket1 = this.createMarketSync({
      title: "Super Bowl 2024 Winner",
      description: "Which team will win Super Bowl LVIII?",
      fullDescription: "This market will resolve based on the official Super Bowl LVIII winner as determined by the NFL.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-02-11T00:00:00Z"),
      creatorFee: "1.5",
      minimumBet: "5.00",
      totalVolume: "5200000.00",
      totalTraders: 12450,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket1.id,
      label: "CHIEFS",
      price: "42.30",
      priceChange: "2.10",
      volume: "2200000.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket1.id,
      label: "49ERS",
      price: "38.70",
      priceChange: "-0.80",
      volume: "2000000.00",
    });

    const sportsMarket2 = this.createMarketSync({
      title: "NBA Championship 2024",
      description: "Which team will win the 2024 NBA Championship?",
      fullDescription: "Market resolves based on the official NBA Finals winner.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-06-20T00:00:00Z"),
      creatorFee: "2.0",
      minimumBet: "2.00",
      totalVolume: "2800000.00",
      totalTraders: 8340,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket2.id,
      label: "CELTICS",
      price: "28.50",
      priceChange: "1.50",
      volume: "800000.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket2.id,
      label: "LAKERS",
      price: "22.30",
      priceChange: "-0.70",
      volume: "640000.00",
    });

    const sportsMarket3 = this.createMarketSync({
      title: "World Series 2024",
      description: "Which team will win the 2024 World Series?",
      fullDescription: "Market resolves based on the official MLB World Series champion.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-10-31T00:00:00Z"),
      creatorFee: "1.8",
      minimumBet: "3.00",
      totalVolume: "1500000.00",
      totalTraders: 5230,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket3.id,
      label: "DODGERS",
      price: "18.50",
      priceChange: "0.90",
      volume: "270000.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket3.id,
      label: "YANKEES",
      price: "16.20",
      priceChange: "-0.30",
      volume: "243000.00",
    });

    const sportsMarket4 = this.createMarketSync({
      title: "UEFA Euro 2024 Winner",
      description: "Which country will win UEFA Euro 2024?",
      fullDescription: "Market resolves based on the official UEFA Euro 2024 champion.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-07-14T00:00:00Z"),
      creatorFee: "1.5",
      minimumBet: "2.00",
      totalVolume: "3400000.00",
      totalTraders: 15230,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket4.id,
      label: "FRANCE",
      price: "22.80",
      priceChange: "1.20",
      volume: "775200.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket4.id,
      label: "ENGLAND",
      price: "19.50",
      priceChange: "-0.50",
      volume: "663000.00",
    });

    // Entertainment Markets
    const entertainmentMarket1 = this.createMarketSync({
      title: "Oscars 2024 Best Picture",
      description: "Which film will win Best Picture at the 2024 Academy Awards?",
      fullDescription: "This market will resolve based on the official Academy Awards Best Picture winner as announced during the ceremony.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-03-10T00:00:00Z"),
      creatorFee: "2.5",
      minimumBet: "2.00",
      totalVolume: "4700000.00",
      totalTraders: 9830,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket1.id,
      label: "OPPENHEIMER",
      price: "45.70",
      priceChange: "3.20",
      volume: "2100000.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket1.id,
      label: "BARBIE",
      price: "28.30",
      priceChange: "-1.50",
      volume: "1300000.00",
    });

    const entertainmentMarket2 = this.createMarketSync({
      title: "Grammy 2024 Album of the Year",
      description: "Which album will win Album of the Year at the 2024 Grammys?",
      fullDescription: "Market resolves based on the official Grammy Awards Album of the Year winner.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-02-04T00:00:00Z"),
      creatorFee: "2.0",
      minimumBet: "1.50",
      totalVolume: "1200000.00",
      totalTraders: 4520,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket2.id,
      label: "TAYLOR SWIFT",
      price: "38.90",
      priceChange: "2.10",
      volume: "467000.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket2.id,
      label: "BEYONCE",
      price: "24.50",
      priceChange: "-1.20",
      volume: "294000.00",
    });

    const entertainmentMarket3 = this.createMarketSync({
      title: "Netflix Top Series 2024",
      description: "Will Stranger Things be Netflix's most watched series in 2024?",
      fullDescription: "Market resolves based on Netflix's official viewing statistics for 2024.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "1.8",
      minimumBet: "1.00",
      totalVolume: "850000.00",
      totalTraders: 3420,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket3.id,
      label: "YES",
      price: "42.30",
      priceChange: "1.80",
      volume: "425000.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket3.id,
      label: "NO",
      price: "57.70",
      priceChange: "-1.80",
      volume: "425000.00",
    });

    const entertainmentMarket4 = this.createMarketSync({
      title: "Marvel Phase 5 Success",
      description: "Will Marvel's Phase 5 average over $800M per movie?",
      fullDescription: "Market resolves based on the average box office performance of Marvel Phase 5 movies.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "2.2",
      minimumBet: "2.00",
      totalVolume: "1800000.00",
      totalTraders: 6740,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket4.id,
      label: "YES",
      price: "35.60",
      priceChange: "-2.40",
      volume: "900000.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket4.id,
      label: "NO",
      price: "64.40",
      priceChange: "2.40",
      volume: "900000.00",
    });

    // Crypto Markets
    const cryptoMarket1 = this.createMarketSync({
      title: "Bitcoin $100K by 2024",
      description: "Will Bitcoin reach $100,000 by December 31, 2024?",
      fullDescription: "Market resolves based on Bitcoin's price reaching $100,000 USD on any major exchange by the end of 2024.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "1.5",
      minimumBet: "1.00",
      totalVolume: "8200000.00",
      totalTraders: 18340,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket1.id,
      label: "YES",
      price: "68.50",
      priceChange: "4.20",
      volume: "4100000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket1.id,
      label: "NO",
      price: "31.50",
      priceChange: "-4.20",
      volume: "4100000.00",
    });

    const cryptoMarket2 = this.createMarketSync({
      title: "Ethereum 2.0 Full Launch",
      description: "Will Ethereum 2.0 complete its full launch in 2024?",
      fullDescription: "Market resolves based on official Ethereum Foundation announcements about the complete rollout of Ethereum 2.0.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "2.0",
      minimumBet: "2.00",
      totalVolume: "3400000.00",
      totalTraders: 9230,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket2.id,
      label: "YES",
      price: "72.80",
      priceChange: "1.90",
      volume: "1700000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket2.id,
      label: "NO",
      price: "27.20",
      priceChange: "-1.90",
      volume: "1700000.00",
    });

    // Add 2 more Politics Markets (5 & 6)
    const politicsMarket5 = this.createMarketSync({
      title: "House Control 2024",
      description: "Which party will control the US House after 2024 elections?",
      fullDescription: "Market resolves based on which party has majority control of the US House of Representatives after the 2024 elections.",
      category: "politics",
      imageUrl: "https://cdn.sanity.io/images/3tzzh18d/production/be76c37815c0e502689a9e904492c7b47035ad68-1200x675.png",
      marketType: "binary",
      startTime: new Date("2024-01-01T00:00:00Z"),
      lockTime: new Date("2024-11-05T23:59:59Z"),
      resolutionDate: new Date("2024-11-06T00:00:00Z"),
      creatorFee: "1.8",
      minimumBet: "1.00",
      totalVolume: "1200000.00",
      totalTraders: 4560,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket5.id,
      label: "REPUBLICAN",
      price: "48.90",
      priceChange: "-1.20",
      volume: "600000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket5.id,
      label: "DEMOCRAT",
      price: "51.10",
      priceChange: "1.20",
      volume: "600000.00",
    });

    const politicsMarket6 = this.createMarketSync({
      title: "Supreme Court Vacancy 2024",
      description: "Will there be a Supreme Court vacancy in 2024?",
      fullDescription: "Market resolves to YES if any Supreme Court justice announces retirement, resignation, or passes away in 2024.",
      category: "politics",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "2.2",
      minimumBet: "2.00",
      totalVolume: "2800000.00",
      totalTraders: 8920,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: politicsMarket6.id,
      label: "YES",
      price: "32.40",
      priceChange: "-0.80",
      volume: "1400000.00",
    });

    this.createMarketOptionSync({
      marketId: politicsMarket6.id,
      label: "NO",
      price: "67.60",
      priceChange: "0.80",
      volume: "1400000.00",
    });

    // Add 2 more Sports Markets (5 & 6)
    const sportsMarket5 = this.createMarketSync({
      title: "Champions League 2024 Winner",
      description: "Which team will win the 2024 UEFA Champions League?",
      fullDescription: "Market resolves based on the official UEFA Champions League winner for the 2023/24 season.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-06-01T00:00:00Z"),
      creatorFee: "1.8",
      minimumBet: "2.50",
      totalVolume: "4100000.00",
      totalTraders: 13450,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket5.id,
      label: "MAN CITY",
      price: "24.60",
      priceChange: "1.80",
      volume: "1008600.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket5.id,
      label: "REAL MADRID",
      price: "21.30",
      priceChange: "-0.50",
      volume: "873300.00",
    });

    const sportsMarket6 = this.createMarketSync({
      title: "NHL Stanley Cup 2024",
      description: "Which team will win the 2024 NHL Stanley Cup?",
      fullDescription: "Market resolves based on the official NHL Stanley Cup champion for the 2023/24 season.",
      category: "sports",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-06-30T00:00:00Z"),
      creatorFee: "1.6",
      minimumBet: "2.00",
      totalVolume: "1800000.00",
      totalTraders: 6230,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: sportsMarket6.id,
      label: "BRUINS",
      price: "18.40",
      priceChange: "0.90",
      volume: "331200.00",
    });

    this.createMarketOptionSync({
      marketId: sportsMarket6.id,
      label: "OILERS",
      price: "15.20",
      priceChange: "-0.30",
      volume: "273600.00",
    });

    // Add 2 more Entertainment Markets (5 & 6)
    const entertainmentMarket5 = this.createMarketSync({
      title: "Golden Globe Best Drama 2024",
      description: "Which TV series will win Best Drama at the 2024 Golden Globes?",
      fullDescription: "Market resolves based on the official Golden Globe Awards Best Television Series - Drama winner.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "multiple",
      resolutionDate: new Date("2024-01-07T00:00:00Z"),
      creatorFee: "2.1",
      minimumBet: "1.50",
      totalVolume: "950000.00",
      totalTraders: 3840,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket5.id,
      label: "SUCCESSION",
      price: "42.80",
      priceChange: "2.50",
      volume: "406400.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket5.id,
      label: "THE CROWN",
      price: "28.90",
      priceChange: "-1.20",
      volume: "274550.00",
    });

    const entertainmentMarket6 = this.createMarketSync({
      title: "Spotify Top Artist 2024",
      description: "Will Taylor Swift be Spotify's most streamed artist in 2024?",
      fullDescription: "Market resolves based on Spotify's official year-end statistics for 2024.",
      category: "entertainment",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "1.9",
      minimumBet: "1.00",
      totalVolume: "2200000.00",
      totalTraders: 7840,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket6.id,
      label: "YES",
      price: "58.70",
      priceChange: "3.40",
      volume: "1100000.00",
    });

    this.createMarketOptionSync({
      marketId: entertainmentMarket6.id,
      label: "NO",
      price: "41.30",
      priceChange: "-3.40",
      volume: "1100000.00",
    });

    // Add 4 more Crypto Markets (3, 4, 5, 6)
    const cryptoMarket3 = this.createMarketSync({
      title: "Solana $200 by 2024",
      description: "Will Solana reach $200 by December 31, 2024?",
      fullDescription: "Market resolves based on Solana's price reaching $200 USD on any major exchange by the end of 2024.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "1.8",
      minimumBet: "1.50",
      totalVolume: "5600000.00",
      totalTraders: 12450,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket3.id,
      label: "YES",
      price: "45.20",
      priceChange: "2.80",
      volume: "2800000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket3.id,
      label: "NO",
      price: "54.80",
      priceChange: "-2.80",
      volume: "2800000.00",
    });

    const cryptoMarket4 = this.createMarketSync({
      title: "DeFi TVL $100B by 2024",
      description: "Will total DeFi TVL exceed $100 billion by end of 2024?",
      fullDescription: "Market resolves based on DeFi Pulse or similar aggregator showing total TVL exceeding $100 billion.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "2.1",
      minimumBet: "2.00",
      totalVolume: "3800000.00",
      totalTraders: 10230,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket4.id,
      label: "YES",
      price: "62.40",
      priceChange: "1.60",
      volume: "1900000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket4.id,
      label: "NO",
      price: "37.60",
      priceChange: "-1.60",
      volume: "1900000.00",
    });

    const cryptoMarket5 = this.createMarketSync({
      title: "NFT Market Recovery 2024",
      description: "Will the NFT market cap exceed $50B in 2024?",
      fullDescription: "Market resolves based on total NFT market capitalization exceeding $50 billion at any point in 2024.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "1.7",
      minimumBet: "1.00",
      totalVolume: "2400000.00",
      totalTraders: 7840,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket5.id,
      label: "YES",
      price: "38.90",
      priceChange: "-1.20",
      volume: "1200000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket5.id,
      label: "NO",
      price: "61.10",
      priceChange: "1.20",
      volume: "1200000.00",
    });

    const cryptoMarket6 = this.createMarketSync({
      title: "LayerZero Token Launch",
      description: "Will LayerZero launch its token in 2024?",
      fullDescription: "Market resolves based on official LayerZero token launch announcement and trading on major exchanges.",
      category: "crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      marketType: "binary",
      resolutionDate: new Date("2024-12-31T00:00:00Z"),
      creatorFee: "2.3",
      minimumBet: "2.50",
      totalVolume: "5200000.00",
      totalTraders: 14560,
      isActive: true,
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket6.id,
      label: "YES",
      price: "78.30",
      priceChange: "4.50",
      volume: "2600000.00",
    });

    this.createMarketOptionSync({
      marketId: cryptoMarket6.id,
      label: "NO",
      price: "21.70",
      priceChange: "-4.50",
      volume: "2600000.00",
    });
  }

  private createMarketSync(market: Omit<InsertMarket, 'createdAt'> & { totalVolume?: string; totalTraders?: number }): Market {
    const id = this.currentMarketId++;
    const newMarket: Market = {
      title: market.title,
      description: market.description,
      fullDescription: market.fullDescription || null,
      category: market.category,
      imageUrl: market.imageUrl || null,
      marketType: market.marketType || "binary",
      startTime: market.startTime,
      lockTime: market.lockTime,
      resolutionDate: market.resolutionDate,
      creatorFee: market.creatorFee || "1.00",
      minimumBet: market.minimumBet || "1.00",
      totalVolume: market.totalVolume || "0.00",
      totalTraders: market.totalTraders || 0,
      isActive: market.isActive !== false,
      id,
      createdAt: new Date(),
    };
    this.markets.set(id, newMarket);
    return newMarket;
  }

  private createMarketOptionSync(option: InsertMarketOption & { volume?: string }): MarketOption {
    const id = this.currentOptionId++;
    const newOption: MarketOption = {
      id,
      marketId: option.marketId,
      label: option.label,
      price: option.price,
      priceChange: option.priceChange || "0.00",
      volume: option.volume || "0.00",
    };
    this.marketOptions.set(id, newOption);
    return newOption;
  }

  async getMarkets(): Promise<MarketWithOptions[]> {
    const marketsArray = Array.from(this.markets.values());
    const result: MarketWithOptions[] = [];

    for (const market of marketsArray) {
      const options = await this.getMarketOptions(market.id);
      result.push({ ...market, options });
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMarketsByCategory(category: string): Promise<MarketWithOptions[]> {
    const allMarkets = await this.getMarkets();
    return allMarkets.filter(market => market.category === category);
  }

  async getMarket(id: number): Promise<MarketWithOptions | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;

    const options = await this.getMarketOptions(id);
    return { ...market, options };
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = this.currentMarketId++;
    const market: Market = {
      ...insertMarket,
      id,
      totalVolume: "0.00",
      totalTraders: 0,
      createdAt: new Date(),
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarket(id: number, updates: Partial<InsertMarket>): Promise<Market | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;

    const updatedMarket = { ...market, ...updates };
    this.markets.set(id, updatedMarket);
    return updatedMarket;
  }

  async createMarketOption(option: InsertMarketOption): Promise<MarketOption> {
    const id = this.currentOptionId++;
    const newOption: MarketOption = {
      ...option,
      id,
      volume: "0.00",
    };
    this.marketOptions.set(id, newOption);
    return newOption;
  }

  async updateMarketOption(id: number, updates: Partial<InsertMarketOption>): Promise<MarketOption | undefined> {
    const option = this.marketOptions.get(id);
    if (!option) return undefined;

    const updatedOption = { ...option, ...updates };
    this.marketOptions.set(id, updatedOption);
    return updatedOption;
  }

  async getMarketOptions(marketId: number): Promise<MarketOption[]> {
    return Array.from(this.marketOptions.values()).filter(option => option.marketId === marketId);
  }
}

export const storage = new MemStorage();
