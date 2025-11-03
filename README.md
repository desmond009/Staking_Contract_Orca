# 🐋 ORCA Staking Platform

A decentralized staking platform built on Ethereum Sepolia testnet that allows users to stake ETH and earn ORCA token emissions in real-time.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Components](#components)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ORCA Staking is a full-stack Web3 application that enables users to:
- **Stake ETH** into a smart contract
- **Earn ORCA tokens** as rewards based on staking duration and amount
- **Unstake ETH** at any time
- **Claim rewards** anytime to receive accumulated ORCA tokens

The platform consists of:
- **Smart Contracts**: Solidity contracts deployed on Sepolia testnet
- **Frontend**: React-based web application with wallet integration
- **Real-time Updates**: Automatic balance and reward tracking

## ✨ Features

- 🔐 **Wallet Integration**: Connect with MetaMask or any injected wallet
- 💰 **ETH Staking**: Stake ETH with simple interface
- 🎁 **Reward System**: Earn ORCA tokens at 1 ORCA per second per ETH staked
- 📊 **Real-time Dashboard**: View staked amount, pending rewards, and pool statistics
- 🔄 **Instant Unstaking**: Unstake your ETH anytime
- ⚡ **Fast Transactions**: Optimized for low gas fees
- 🛡️ **Secure**: Built with OpenZeppelin contracts and best practices

## 📁 Project Structure

```
Web3_Week_23.1/
├── orca-staking-frontend/     # React frontend application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # Configuration files
│   │   ├── abi/               # Contract ABIs
│   │   └── utils/             # Utility functions
│   └── package.json
│
└── StakingContract_Orca/      # Solidity smart contracts
    ├── src/                   # Contract source files
    ├── script/                # Deployment scripts
    ├── test/                  # Test files
    └── foundry.toml           # Foundry configuration
```

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Foundry** (for contract development)
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (for testing - get from [faucets](https://sepoliafaucet.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Web3_Week_23.1
```

### 2. Set Up Environment Variables

#### Frontend (.env in `orca-staking-frontend/`)
```env
VITE_STAKING_CONTRACT_ADDRESS=0x...
VITE_ORCA_TOKEN_ADDRESS=0x...
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_TARGET_CHAIN_ID=11155111
VITE_TARGET_NETWORK_NAME=Sepolia
```

#### Contracts (.env in `StakingContract_Orca/`)
```env
PRIVATE_KEY=0x...
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_KEY
```

### 3. Install Dependencies

#### Frontend
```bash
cd orca-staking-frontend
npm install
```

#### Contracts
```bash
cd StakingContract_Orca
forge install
```

### 4. Deploy Contracts

```bash
cd StakingContract_Orca
forge script script/DeployContracts.s.sol:DeployOriginal --rpc-url sepolia --broadcast --slow
```

### 5. Run Frontend

```bash
cd orca-staking-frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📦 Components

### Smart Contracts

- **StakingContract_Original**: Main staking contract
  - `stake(uint256)`: Stake ETH
  - `unstake(uint256)`: Unstake ETH
  - `claimRewards()`: Claim accumulated ORCA rewards
  - `getRewards()`: View pending rewards

- **OrcaCoin**: ERC20 reward token
  - Standard ERC20 functionality
  - Minting restricted to staking contract

### Frontend

- **Account Overview**: Real-time staking statistics
- **Stake Tab**: Interface for staking ETH
- **Unstake Tab**: Interface for unstaking ETH
- **Claim Tab**: Interface for claiming rewards
- **Wallet Integration**: MetaMask and injected wallet support

## 🔐 Environment Variables

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STAKING_CONTRACT_ADDRESS` | Deployed staking contract address | `0x...` |
| `VITE_ORCA_TOKEN_ADDRESS` | Deployed ORCA token address | `0x...` |
| `VITE_RPC_URL` | RPC endpoint URL | `https://sepolia.infura.io/v3/...` |
| `VITE_TARGET_CHAIN_ID` | Network chain ID | `11155111` (Sepolia) |
| `VITE_TARGET_NETWORK_NAME` | Network name | `Sepolia` |

### Contract Required Variables

| Variable | Description |
|----------|-------------|
| `PRIVATE_KEY` | Deployer private key (with 0x prefix) |
| `RPC_URL` | RPC endpoint for deployment |
| `ETHERSCAN_API_KEY` | Etherscan API key for verification (optional) |

## 🧪 Testing

### Test Contracts

```bash
cd StakingContract_Orca
forge test
```

### Test with Verbose Output

```bash
forge test -vvv
```

## 📤 Deployment

### Deploy to Sepolia

1. Fund your deployer wallet with Sepolia ETH
2. Set environment variables
3. Run deployment script:

```bash
forge script script/DeployContracts.s.sol:DeployOriginal \
  --rpc-url sepolia \
  --broadcast \
  --slow \
  --verify
```

### Update Frontend After Deployment

After deployment, update the frontend `.env` file with the new contract addresses.

## 🏗️ Architecture

### Reward Mechanism

- **Reward Rate**: 1 ORCA per second per ETH staked
- **Calculation**: `rewards = (timeDiff * amountStaked * REWARD_PER_SEC_PER_ETH) / 1e18`
- **Accumulation**: Rewards accumulate in real-time and can be claimed anytime

### Security Features

- OpenZeppelin contracts for standard implementations
- Access control on minting functions
- Input validation on all functions
- Safe math operations

## 📝 License

This project is licensed under the Unlicense - see the LICENSE files in each directory for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Check the component-specific READMEs
- Review the test files for usage examples
- Open an issue on GitHub

## 🔗 Useful Links

- [Foundry Documentation](https://book.getfoundry.sh/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

---

**Note**: This is a testnet deployment. Do not use real funds on mainnet without proper auditing.

