# 🔐 ORCA Staking Smart Contracts

Solidity smart contracts for the ORCA Staking platform. Built with Foundry and OpenZeppelin.

## 📋 Table of Contents

- [Overview](#overview)
- [Contracts](#contracts)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Compilation](#compilation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Security](#security)
- [API Reference](#api-reference)

## 🎯 Overview

The ORCA Staking contracts enable users to stake ETH and earn ORCA tokens as rewards. The system uses a time-based reward mechanism where rewards accumulate in real-time based on staking duration and amount.

## 📄 Contracts

### StakingContract_Original

Main staking contract that handles ETH deposits, withdrawals, and reward distribution.

**Key Features**:
- ETH staking with real-time reward calculation
- Unstaking with immediate ETH return
- Reward accumulation and claiming
- User balance tracking

### OrcaCoin

ERC20 reward token contract with restricted minting.

**Key Features**:
- Standard ERC20 functionality
- Minting restricted to staking contract
- Owner-controlled staking contract address

## ✨ Features

- 💰 **ETH Staking**: Stake ETH with simple interface
- 🎁 **Reward System**: 1 ORCA per second per ETH staked
- ⏱️ **Real-time Rewards**: Rewards accumulate automatically
- 🔄 **Flexible Unstaking**: Unstake anytime
- 📊 **Transparent**: All balances and rewards are publicly viewable
- 🛡️ **Secure**: Built with OpenZeppelin contracts

## 🔧 Prerequisites

- **Foundry** (v0.2.0+)
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Node.js** (for dependencies)
- **Sepolia ETH** (for deployment)

## 📦 Installation

1. **Clone and navigate**
   ```bash
   cd StakingContract_Orca
   ```

2. **Install dependencies**
   ```bash
   forge install
   ```

3. **Set up environment**
   ```bash
   # Create .env file
   echo "PRIVATE_KEY=0xYourPrivateKey" > .env
   echo "RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" >> .env
   echo "ETHERSCAN_API_KEY=YOUR_KEY" >> .env
   ```

## 🔨 Compilation

```bash
# Compile contracts
forge build

# Compile with verbose output
forge build -vv
```

Compiled artifacts will be in the `out/` directory.

## 🧪 Testing

### Run All Tests

```bash
forge test
```

### Run with Verbose Output

```bash
# Level 2: Logs for failing tests
forge test -v

# Level 3: Logs for all tests
forge test -vv

# Level 4: Stack traces
forge test -vvv

# Level 5: Stack traces and setup traces
forge test -vvvv
```

### Run Specific Test File

```bash
forge test --match-path test/StakingContract.t.sol
```

### Test Coverage

```bash
forge coverage
```

## 🚀 Deployment

### Deploy to Sepolia

1. **Set environment variables**
   ```bash
   export PRIVATE_KEY=0x...
   export RPC_URL=https://sepolia.infura.io/v3/...
   ```

2. **Deploy contracts**
   ```bash
   forge script script/DeployContracts.s.sol:DeployOriginal \
     --rpc-url sepolia \
     --broadcast \
     --slow
   ```

3. **Verify on Etherscan** (optional)
   ```bash
   forge script script/DeployContracts.s.sol:DeployOriginal \
     --rpc-url sepolia \
     --broadcast \
     --verify
   ```

### Deployment Script

The deployment script (`DeployContracts.s.sol`) performs:
1. Deploy OrcaCoin token
2. Deploy StakingContract with OrcaCoin address
3. Link staking contract address to OrcaCoin

### Manual Deployment

If you prefer manual deployment:

```solidity
// 1. Deploy OrcaCoin
OrcaCoin orcaCoin = new OrcaCoin();

// 2. Deploy StakingContract
StakingContract_Original staking = new StakingContract_Original(
    IOrcaCoin(address(orcaCoin))
);

// 3. Link addresses
orcaCoin.updateStakingContractAddress(address(staking));
```

## 🏗️ Architecture

### Contract Interaction Flow

```
User
  │
  ├─> stake(uint256) ──────> StakingContract
  │                              │
  │                              ├─> Updates userInfo
  │                              ├─> Updates totalStaked
  │                              └─> Updates stakers_Balance
  │
  ├─> unstake(uint256) ─────> StakingContract
  │                              │
  │                              ├─> Updates balances
  │                              └─> Transfers ETH to user
  │
  ├─> claimRewards() ───────> StakingContract
  │                              │
  │                              └─> Calls orcaCoin.mint()
  │                                      │
  │                                      └─> Mints ORCA to user
  │
  └─> getRewards() ─────────> StakingContract
                                  │
                                  └─> Returns pending rewards
```

### Reward Calculation

```solidity
rewards = (timeDiff * amountStaked * REWARD_PER_SEC_PER_ETH) / 1e18
```

Where:
- `timeDiff` = Current time - Last reward time
- `amountStaked` = Amount of ETH staked
- `REWARD_PER_SEC_PER_ETH` = 1 (constant)

## 🔒 Security

### Security Features

- ✅ Input validation on all functions
- ✅ Safe math operations
- ✅ Access control on minting
- ✅ Reentrancy protection (via OpenZeppelin)
- ✅ Owner-only functions for critical operations

### Audit Recommendations

Before mainnet deployment, consider:
- [ ] Professional security audit
- [ ] Formal verification
- [ ] Bug bounty program
- [ ] Gas optimization review
- [ ] Multi-sig wallet for owner functions

### Known Considerations

- Reward rate is fixed (1 ORCA/sec/ETH)
- No maximum staking limit
- No minimum staking period
- Unstaking is immediate (no lock period)

## 📚 API Reference

### StakingContract_Original

#### stake(uint256 _amount)
Stake ETH into the contract.

**Parameters**:
- `_amount`: Amount of ETH to stake (in wei)

**Requirements**:
- `_amount > 0`
- `msg.value > 0`
- `msg.value == _amount`

**Effects**:
- Updates user's staked balance
- Updates total staked
- Updates reward tracking

---

#### unstake(uint256 _amount)
Unstake ETH from the contract.

**Parameters**:
- `_amount`: Amount of ETH to unstake (in wei)

**Requirements**:
- `_amount > 0`
- User has sufficient staked balance

**Effects**:
- Transfers ETH to user
- Updates user's staked balance
- Updates total staked

---

#### claimRewards()
Claim accumulated ORCA rewards.

**Effects**:
- Mints ORCA tokens to user
- Resets user's reward debt

---

#### getRewards() → uint256
View function to check pending rewards.

**Returns**: Amount of pending ORCA rewards (in wei)

---

#### userInfo(address) → (uint256, uint256, uint256)
View user's staking information.

**Returns**:
- `amountStaked`: ETH staked by user
- `lastRewardTime`: Last time rewards were updated
- `rewardDebt`: Accumulated rewards not yet claimed

---

#### stakers_Balance(address) → uint256
View user's staked balance.

**Returns**: Amount of ETH staked by user

---

#### totalStaked() → uint256
View total ETH staked in contract.

**Returns**: Total ETH staked across all users

### OrcaCoin

#### mint(address _to, uint256 _amount)
Mint ORCA tokens (only callable by staking contract).

**Parameters**:
- `_to`: Address to mint tokens to
- `_amount`: Amount to mint

**Requirements**:
- `msg.sender == stakingContract`

---

#### updateStakingContractAddress(address _stakingContract)
Update staking contract address (only owner).

**Parameters**:
- `_stakingContract`: New staking contract address

**Requirements**:
- `msg.sender == owner`

## 📊 Gas Estimates

Approximate gas costs (Sepolia testnet):

| Function | Gas Cost |
|----------|----------|
| `stake()` | ~150,000 |
| `unstake()` | ~120,000 |
| `claimRewards()` | ~100,000 |
| `getRewards()` | ~30,000 (view) |

*Actual costs may vary based on network conditions*

## 🔍 Verification

### Verify on Etherscan

```bash
forge verify-contract \
  --chain-id 11155111 \
  --num-of-optimizations 200 \
  --watch \
  --constructor-args $(cast abi-encode "constructor(address)" 0x...) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  <CONTRACT_ADDRESS> \
  src/StakingContract_Original.sol:StakingContract_Original
```

## 📝 License

This project is licensed under the Unlicense.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 🐛 Troubleshooting

### Compilation Errors

**Problem**: Import errors
- **Solution**: Run `forge install` to install dependencies

### Deployment Failures

**Problem**: Insufficient funds
- **Solution**: Ensure deployer wallet has enough ETH for gas

**Problem**: Nonce errors
- **Solution**: Wait for pending transactions to clear

### Test Failures

**Problem**: Tests failing
- **Solution**: Check Foundry version compatibility
- Run with `-vvv` for detailed error messages

## 📞 Support

For issues and questions:
- Check test files for usage examples
- Review OpenZeppelin documentation
- Open an issue on GitHub

## 🔗 Useful Links

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

---

**Built with Foundry and OpenZeppelin** 🔐
