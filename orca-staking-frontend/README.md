# 🎨 ORCA Staking Frontend

Modern React-based frontend for the ORCA Staking platform. Built with Vite, Wagmi, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Project Structure](#project-structure)
- [Components](#components)
- [Hooks](#hooks)
- [Environment Variables](#environment-variables)
- [Building](#building)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The ORCA Staking frontend is a responsive, user-friendly interface for interacting with the staking smart contracts. It provides real-time balance updates, transaction handling, and a seamless wallet connection experience.

## ✨ Features

- 🔌 **Wallet Integration**: MetaMask and injected wallet support
- 💰 **Real-time Balances**: Automatic updates every 30-60 seconds
- 📊 **Dashboard**: Account overview with staking stats
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast**: Built with Vite for optimal performance
- 🔄 **Auto-refresh**: Smart caching and polling strategies
- 🛡️ **Error Handling**: Graceful error handling and user feedback
- 📱 **Responsive**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

## 📦 Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet access

## 🚀 Installation

1. **Navigate to frontend directory**
   ```bash
   cd orca-staking-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your contract addresses and RPC URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_STAKING_CONTRACT_ADDRESS=0xYourStakingContractAddress
VITE_ORCA_TOKEN_ADDRESS=0xYourOrcaTokenAddress
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
VITE_TARGET_CHAIN_ID=11155111
VITE_TARGET_NETWORK_NAME=Sepolia
```

### RPC Configuration

The app uses a fallback RPC strategy:
1. Primary: Infura (from `VITE_RPC_URL`)
2. Fallbacks: PublicNode, rpc.sepolia.org, 1rpc.io

If the primary RPC fails, it automatically switches to fallback endpoints.

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Server

The dev server runs on `http://localhost:5173` with:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps
- Error overlay

## 📁 Project Structure

```
src/
├── abi/                    # Contract ABIs
│   ├── erc20.js
│   └── stakingWithEmissions.js
│
├── components/             # React components
│   ├── AccountOverview.jsx
│   ├── ClaimTab.jsx
│   ├── Header.jsx
│   ├── StakeTab.jsx
│   ├── TabNavigation.jsx
│   ├── UnstakeTab.jsx
│   └── Warnings.jsx
│
├── config/                 # Configuration
│   └── wagmi.js           # Wagmi setup
│
├── constants/             # Constants
│   └── index.js
│
├── hooks/                 # Custom hooks
│   ├── useBalances.js     # Balance fetching
│   ├── useStaking.js      # Staking operations
│   ├── useToast.jsx       # Toast notifications
│   └── useWallet.js       # Wallet connection
│
├── utils/                 # Utility functions
│   ├── formatters.js      # Formatting helpers
│   ├── network.js         # Network utilities
│   └── validators.js      # Validation helpers
│
├── App.jsx                # Main app component
├── config.js              # App configuration
└── main.jsx               # Entry point
```

## 🧩 Components

### AccountOverview
Displays real-time staking statistics:
- Staked ETH
- Pending ORCA rewards
- Wallet balance
- Pool total

### StakeTab
Interface for staking ETH:
- Amount input with max button
- Balance display
- Stake button with validation

### UnstakeTab
Interface for unstaking ETH:
- Amount input with max button
- Staked balance display
- Unstake button with validation

### ClaimTab
Interface for claiming rewards:
- Pending rewards display
- Claim button
- Success/error feedback

### Header
Top navigation bar:
- Wallet connection
- Network indicator
- Account address

## 🎣 Hooks

### useBalances
Fetches and manages all balance data:
- ETH balance
- Staked amount
- Pending rewards
- Total staked
- ORCA token balance

**Features**:
- Automatic refetch intervals (30-60s)
- Fallback to `stakers_Balance` if `userInfo` fails
- Error handling and retry logic

### useStaking
Handles staking operations:
- Stake ETH
- Unstake ETH
- Claim rewards
- Input validation
- Transaction status

### useWallet
Manages wallet connection:
- Connect/disconnect wallet
- Network switching
- Account management
- Loading states

### useToast
Toast notification system:
- Success messages
- Error messages
- Pending transaction notifications
- Auto-dismiss

## 🔄 Data Fetching Strategy

### Refetch Intervals
- ETH Balance: 30 seconds
- Staking Data: 30 seconds
- Pending Rewards: 30 seconds
- Total Staked: 60 seconds

### Caching
- Stale time: 30 seconds
- Cache time: 5 minutes
- Automatic retries with exponential backoff

### Error Handling
- Automatic fallback to alternative RPC endpoints
- Retry logic with delays
- User-friendly error messages

## 🏗️ Building

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploy

You can deploy to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🐛 Troubleshooting

### Wallet Connection Issues

**Problem**: Wallet not connecting
- **Solution**: Ensure MetaMask is installed and unlocked
- Check browser console for errors
- Verify network is set to Sepolia

### RPC Errors

**Problem**: `ERR_INSUFFICIENT_RESOURCES` or rate limiting
- **Solution**: The app automatically falls back to alternative RPCs
- Check your Infura API key rate limits
- Consider using a different RPC provider

### Balance Not Updating

**Problem**: Staked balance shows 0
- **Solution**: 
  - Verify contract addresses in `.env`
  - Check browser console for errors
  - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
  - Ensure you're connected to the correct network

### Transaction Failures

**Problem**: Transactions failing
- **Solution**:
  - Check you have enough ETH for gas
  - Verify contract addresses are correct
  - Ensure you're on Sepolia network
  - Check transaction in Etherscan

## 📝 Code Style

- Use functional components with hooks
- Follow React best practices
- Use TypeScript-style prop validation
- Consistent naming conventions
- Error boundaries for error handling

## 🔒 Security Notes

- Never commit `.env` files
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize contract addresses
- Use HTTPS in production

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Built with ❤️ for the ORCA Staking platform**
