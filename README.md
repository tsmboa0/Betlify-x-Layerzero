# Betlify.fun: A No-Code, Cross-Chain Prediction Market on Solana

## Overview

**Betlify.fun** is an innovative, no-code platform that empowers anyone to create, own, and profit from custom prediction markets on the Solana blockchain. Unlike traditional platforms such as Polymarket—where users are restricted to markets curated by a central team—Betlify.fun puts the power in your hands. You can launch markets around any topic or event, invite participation, and earn a share of the pool funds as a market creator.

But Betlify.fun goes even further: thanks to the integration of [LayerZero v2 OApp](https://layerzero.network/), users from any blockchain network can seamlessly interact with Betlify. Whether you want to create a pool, place a bet, or claim winnings, you can do it all from your native chain. This cross-chain capability is a game-changer for prediction markets, breaking down silos and opening up liquidity and participation from across the blockchain ecosystem.

---

## Why Betlify.fun?

- **No-Code Market Creation:** Anyone can spin up a prediction market without writing a single line of code.
- **Decentralized Ownership:** Market creators own their markets and earn a percentage of the pool, incentivizing high-quality, engaging markets.
- **Unlimited Topics:** No more being limited to a handful of curated markets—create markets around anything that matters to you or your community.
- **Cross-Chain Participation:** Thanks to LayerZero v2 OApp, users from any supported blockchain can participate, dramatically increasing reach and liquidity.
- **Open, Permissionless, and Composable:** Built on Solana for speed and low fees, with a vision for open composability and integration with other DeFi and Web3 protocols.

---

## How LayerZero v2 OApp Supercharges Betlify

LayerZero is a leading cross-chain messaging protocol, and its v2 OApp (Omnichain Application) framework enables truly seamless interoperability between blockchains. In Betlify.fun, LayerZero v2 OApp is used to:

- **Enable Cross-Chain Actions:** Users can create pools, place bets, and claim winnings from any supported chain, not just Solana.
- **Facilitate Cross-Chain Payouts:** With the planned integration of OFT (Omnichain Fungible Token), winnings and payouts can be sent directly to users on their native chain, removing friction and onboarding barriers.
- **Expand Market Liquidity:** By opening up Betlify to users and liquidity from all LayerZero-supported chains, markets become deeper and more dynamic.

This repository demonstrates the foundational integration of LayerZero v2 OApp into Betlify.fun, serving as a blueprint for how cross-chain prediction markets can be built.

---

## Technical Details

- **Solana Smart Contracts:** The core logic for market creation, betting, and settlement is implemented as Solana programs (see `programs/my_oapp/`).
- **LayerZero OApp Integration:** The contracts and scripts in this repo show how to wire up Solana programs with LayerZero v2 OApp, enabling cross-chain messaging and actions.
- **OFT (Omnichain Fungible Token):** The next step is to integrate OFT for cross-chain payouts, allowing users to receive winnings on any supported chain.
- **Frontend:** A modern, user-friendly frontend (in `frontend/client/`) allows users to create and interact with markets, with wallet connection and cross-chain UX.
- **Deployment Scripts:** Scripts and configs for deploying contracts and setting up LayerZero endpoints are included in `deploy/` and `lib/`.

### Key Directories

- `programs/my_oapp/` — Solana smart contracts (Anchor framework)
- `contracts/` — Solidity contracts for EVM compatibility and LayerZero integration
- `frontend/client/` — React-based frontend for market creation and participation
- `lib/` — LayerZero client logic, cross-chain scripts, and utilities
- `deploy/` — Deployment scripts and configuration

---

## Project Status

> **Note:** This project is in its very early stages. The current implementation is a basic demonstration of how LayerZero v2 OApp can be integrated into Betlify.fun. Many features are experimental or under active development. Feedback and contributions are welcome!

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/betlify.fun.git
   cd betlify.fun
   ```
2. **Install dependencies:**
   - For Solana programs: see `programs/my_oapp/`
   - For frontend: see `frontend/client/`
   - For deployment and scripts: see `lib/` and `deploy/`
3. **Configure LayerZero endpoints:**
   - Update configuration files in `lib/` and `deploy/` as needed for your environment.
4. **Run the frontend:**
   ```bash
   cd frontend/client
   npm install
   npm run dev
   ```
5. **Deploy contracts:**
   - See scripts in `deploy/` and `lib/scripts/` for deployment instructions.

---

## Roadmap

- [ ] Full OFT integration for cross-chain payouts
- [ ] Advanced market resolution and dispute mechanisms
- [ ] Enhanced frontend UX for cross-chain actions
- [ ] Community governance and market curation
- [ ] Open API for third-party integrations

---

## Contributing

We welcome contributions! Please open issues or pull requests for bugs, features, or ideas. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [LayerZero](https://layerzero.network/) for cross-chain messaging infrastructure
- [Anchor](https://www.anchor-lang.com/) for Solana smart contract development
- [Solana](https://solana.com/) for a fast, scalable blockchain

---

**Betlify.fun — Own the market. Predict the future.**
