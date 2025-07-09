import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { SolanaWalletProviderWrapper } from "@/components/SolanaWalletProvider";
import { SolanaWalletListener } from "@/components/SolanaWalletListener";
import { WalletProvider } from "@/contexts/WalletContext";

import Home from "@/pages/home";
import CreateMarket from "@/pages/create-market";
import BetDetails from "@/pages/bet-details";
import TestWallet from "@/pages/test-wallet";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={CreateMarket} />
        <Route path="/bet-details" component={BetDetails} />
        <Route path="/test-wallet" component={TestWallet} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SolanaWalletProviderWrapper>
            <WalletProvider>
              <SolanaWalletListener />
              <Toaster />
              <Router />
            </WalletProvider>
          </SolanaWalletProviderWrapper>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
