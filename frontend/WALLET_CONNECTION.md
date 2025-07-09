# Wallet Connection Implementation

This document describes the wallet connection system implemented for Betlify, which supports both MetaMask (EVM) and Solana wallet connections.

## Overview

The wallet connection system allows users to connect their wallets to interact with the Betlify prediction market platform. It supports:

- **MetaMask**: For EVM-based transactions (Ethereum, Optimism, etc.)
- **Solana Wallets**: Phantom, Solflare, and other Solana wallet adapters

## Architecture

### Components

1. **WalletProvider** (`contexts/WalletContext.tsx`)
   - Manages wallet connection state
   - Handles MetaMask connections
   - Provides wallet context to the entire app

2. **SolanaWalletProviderWrapper** (`components/SolanaWalletProvider.tsx`)
   - Configures Solana wallet adapters
   - Provides Solana wallet connection infrastructure

3. **SolanaWalletListener** (`components/SolanaWalletListener.tsx`)
   - Listens to Solana wallet connection changes
   - Updates the wallet context when Solana wallets connect/disconnect

4. **WalletConnectModal** (`components/wallet-connect-modal.tsx`)
   - UI for wallet connection selection
   - Shows connection status and wallet management

5. **Navigation** (`components/navigation.tsx`)
   - Displays wallet connection status in the header
   - Shows truncated wallet address when connected

## Features

### MetaMask Integration
- Automatic detection of MetaMask installation
- Account connection and address retrieval
- Network detection and chain ID tracking
- Account change and network change listeners
- Automatic disconnection handling

### Solana Wallet Integration
- Support for Phantom, Solflare, and other Solana wallets
- Automatic wallet detection and connection
- Public key retrieval and address display
- Connection state management

### UI Features
- Modal-based wallet selection
- Connection status indicators
- Truncated address display
- Copy address functionality
- Disconnect functionality
- Loading states during connection

## Usage

### Connecting MetaMask
1. Click "Connect" in the navigation
2. Select "MetaMask" from the wallet options
3. Approve the connection in MetaMask
4. The wallet address will be displayed in the navigation

### Connecting Solana Wallet
1. Click "Connect" in the navigation
2. Select "Solana Wallets" from the wallet options
3. Choose your preferred Solana wallet from the modal
4. Approve the connection in your wallet
5. The wallet address will be displayed in the navigation

### Testing
Visit `/test-wallet` to test the wallet connections and view debug information.

## State Management

The wallet state is stored in localStorage and includes:
- Connection status
- Wallet type (metamask/solana)
- Wallet name
- Wallet address
- Network information
- Chain ID (for EVM wallets)

## Dependencies

### Required Packages
- `ethers`: For MetaMask integration
- `@solana/wallet-adapter-base`: Solana wallet adapter base
- `@solana/wallet-adapter-react`: React integration for Solana wallets
- `@solana/wallet-adapter-react-ui`: UI components for Solana wallets
- `@solana/wallet-adapter-wallets`: Wallet adapters for various Solana wallets
- `@solana/web3.js`: Solana Web3 library

### Wallet Adapters Included
- Phantom Wallet
- Solflare Wallet

## Error Handling

The system includes comprehensive error handling for:
- MetaMask not installed
- Connection rejection
- Network switching failures
- Wallet disconnection
- Invalid wallet states

## Future Enhancements

Potential improvements:
- Support for more Solana wallets
- Wallet switching functionality
- Multi-wallet support
- Transaction signing integration
- Cross-chain transaction support via LayerZero 