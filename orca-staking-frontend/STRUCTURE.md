# Frontend Structure

This document outlines the professional folder structure of the ORCA Staking dApp frontend.

## Directory Structure

```
src/
├── abi/                    # Smart contract ABIs
│   ├── erc20.js
│   └── stakingWithEmissions.js
│
├── components/             # React UI components
│   ├── Header.jsx         # App header with wallet connection
│   ├── AccountOverview.jsx # Balance display cards
│   ├── TabNavigation.jsx   # Tab switcher component
│   ├── StakeTab.jsx        # Stake ETH tab content
│   ├── UnstakeTab.jsx      # Unstake ETH tab content
│   ├── ClaimTab.jsx        # Claim rewards tab content
│   ├── Warnings.jsx        # Network and wallet warnings
│   └── index.js            # Component exports
│
├── constants/              # Application constants
│   └── index.js           # Default values, configs
│
├── hooks/                  # Custom React hooks
│   ├── useWallet.js       # Wallet connection & management
│   ├── useBalances.js     # Balance fetching & state
│   ├── useStaking.js      # Staking operations
│   └── useToast.jsx       # Toast notifications
│
├── utils/                  # Utility functions
│   ├── formatters.js      # Balance & address formatting
│   ├── validators.js      # Input validation
│   └── network.js         # Network utilities
│
├── config.js              # Environment configuration
├── App.jsx                # Main application component
├── main.jsx              # Application entry point
└── index.css             # Global styles
```

## Architecture Overview

### **Components** (`/components`)
Reusable UI components that handle presentation logic:
- **Header**: Wallet connection UI and network status
- **AccountOverview**: Displays user balances and stats
- **TabNavigation**: Navigation between Stake/Unstake/Claim
- **StakeTab/UnstakeTab/ClaimTab**: Tab-specific forms and actions
- **Warnings**: Error messages for network/wallet issues

### **Hooks** (`/hooks`)
Custom React hooks that encapsulate business logic:
- **useWallet**: Manages wallet connection, provider, signer, and network
- **useBalances**: Handles fetching and updating all balance types
- **useStaking**: Manages staking transactions and form state
- **useToast**: Toast notification system

### **Utils** (`/utils`)
Pure utility functions:
- **formatters**: Format ETH/token values and addresses
- **validators**: Validate user inputs (e.g., parseEtherSafe)
- **network**: Network checking and chain ID utilities

### **Constants** (`/constants`)
Application-wide constants:
- Default balances, token metadata
- Tab configuration
- Zero address and other constants

### **Config** (`/config`)
Environment-based configuration loaded from `.env`:
- Contract addresses
- Target chain ID and network name

## Benefits of This Structure

1. **Separation of Concerns**: UI, logic, and utilities are clearly separated
2. **Reusability**: Components and hooks can be easily reused or extended
3. **Maintainability**: Easy to locate and update specific features
4. **Testability**: Pure functions and isolated hooks are easier to test
5. **Scalability**: Easy to add new features without cluttering files

## Adding New Features

### Add a new component:
1. Create file in `components/YourComponent.jsx`
2. Export from `components/index.js`
3. Import in `App.jsx`

### Add a new hook:
1. Create file in `hooks/useYourHook.js`
2. Import and use in `App.jsx` or other components

### Add utility functions:
1. Add to appropriate file in `utils/` or create new file
2. Import where needed

