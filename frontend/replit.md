# Betlify.Fun - Prediction Market Platform

## Overview

Betlify.Fun is a modern prediction market platform built with a full-stack TypeScript architecture. The application allows users to create and participate in prediction markets across various categories including politics, sports, entertainment, and cryptocurrency. The platform features a Solana-inspired design with dark theme aesthetics and provides a comprehensive betting interface with real-time market data.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Theme**: Dark/light theme support with custom Solana-inspired color palette

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with TypeScript interfaces
- **Development**: Hot module replacement with Vite integration
- **Storage**: In-memory storage implementation with interface for easy database migration

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations
- **Current Implementation**: Memory-based storage with structured interfaces for production database integration

## Key Components

### Database Schema
- **Markets Table**: Core market information including title, description, category, resolution date, fees, and activity status
- **Market Options Table**: Individual betting options for each market with pricing and volume data
- **Relationships**: One-to-many relationship between markets and market options

### API Structure
- `GET /api/markets` - Retrieve all markets with options
- `GET /api/markets/category/:category` - Fetch markets by category
- `GET /api/markets/:id` - Get specific market details
- `POST /api/markets` - Create new markets
- Market option management endpoints

### Frontend Pages
- **Home Page**: Featured markets, category carousels, platform statistics
- **Create Market Page**: Form-based market creation with validation
- **Market Detail Modal**: Interactive betting interface with payout calculations
- **Category Pages**: Filtered market views by category

### UI Components
- **Market Cards**: Responsive cards displaying market information and pricing
- **Market Carousel**: Horizontal scrolling sections for different categories
- **Navigation**: Fixed header with theme toggle and wallet integration
- **Forms**: Validated forms using React Hook Form with Zod schemas

## Data Flow

1. **Market Data**: Markets are fetched from the API and cached using TanStack Query
2. **Real-time Updates**: Market prices and statistics are displayed with live data
3. **User Interactions**: Betting actions trigger API calls with optimistic updates
4. **State Management**: Server state is managed through React Query with automatic refetching
5. **Form Handling**: Market creation and betting forms use controlled components with validation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette functionality

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Development server and build tool

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Development migrations with Drizzle Kit
- **Environment**: Development-specific logging and error handling

### Production
- **Build Process**: 
  1. Frontend built with Vite to static assets
  2. Backend bundled with esbuild for Node.js deployment
  3. Static assets served from Express server
- **Database**: PostgreSQL connection via environment variables
- **Server**: Express server serving both API and static files
- **Optimization**: Production builds with minification and tree shaking

### Configuration
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **TypeScript**: Strict mode with modern ES modules
- **Path Aliases**: Configured for clean imports (@/, @shared/, etc.)

## Recent Changes
- July 03, 2025: Initial setup completed with full prediction market platform
- July 03, 2025: UI improvements - reduced hero section size, smaller fonts, compact cards (224px width), tighter spacing between sections, removed stats section from hero
- July 03, 2025: Added 16 sample markets across all categories (politics, sports, entertainment, crypto) for better horizontal scrolling demonstration
- July 03, 2025: Fixed navigation bar sizing - smaller connect wallet button and theme toggle to prevent overflow
- July 03, 2025: Enhanced mobile responsiveness - responsive market cards (192px mobile, 224px desktop), improved carousel scrolling, mobile-optimized text sizes and spacing
- July 03, 2025: Created comprehensive wallet connection modal with MetaMask, Phantom, Solflare, and WalletConnect support, including wallet detection, loading states, and toast notifications
- July 03, 2025: Improved hero section headline - larger text sizes (5xl/6xl) and single-line display for medium and large screens

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Smaller text sizes, compact layouts, minimal spacing between sections, prefer smaller card designs.