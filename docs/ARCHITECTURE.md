# OrcaEarn — Architecture Design

## 1. What OrcaEarn Is

OrcaEarn (ORCA Staking Platform) is a decentralized application (dApp) that lets a
user stake ETH into a smart contract and continuously earn an ERC-20 reward token
(**ORCA**) for as long as the ETH stays staked. It is a two-component system:

| Component | Location | Role |
|---|---|---|
| Smart Contracts | `StakingContract_Orca/` (Foundry) | Source of truth: holds staked ETH, computes rewards, mints ORCA |
| Frontend | `orca-staking-frontend/` (React + Vite) | Wallet-connected UI that reads/writes the contracts |

There is **no backend server / database / off-chain indexer**. All state (balances,
staked amounts, pending rewards) lives on-chain and is read directly by the browser
via an RPC provider. This is a classic **thin-client dApp** architecture.

## 2. System Context Diagram

```
                          ┌───────────────────────────┐
                          │        End User            │
                          │  (browser + MetaMask)      │
                          └──────────────┬─────────────┘
                                         │ HTTPS
                                         ▼
                          ┌───────────────────────────┐
                          │   OrcaEarn Frontend (SPA)   │
                          │  React 19 + Vite + Wagmi    │
                          │  Hosted on Vercel/Netlify   │
                          └──────────────┬─────────────┘
                        JSON-RPC (read)  │  Signed Tx (write, via wallet)
                                         ▼
                          ┌───────────────────────────┐
                          │     RPC Provider (Infura)   │
                          │  + fallback endpoints        │
                          └──────────────┬─────────────┘
                                         ▼
                          ┌───────────────────────────┐
                          │   Ethereum Sepolia Testnet  │
                          │ ┌─────────────────────────┐│
                          │ │ StakingContract_Original ││
                          │ └────────────┬────────────┘│
                          │              │ mint()       │
                          │ ┌────────────▼────────────┐│
                          │ │        OrcaCoin (ERC20)  ││
                          │ └─────────────────────────┘│
                          └───────────────────────────┘
```

## 3. Layered View

```
┌──────────────────────────────────────────────────────────────────┐
│ Presentation Layer (React Components)                             │
│  Header · AccountOverview · TabNavigation ·                       │
│  StakeTab · UnstakeTab · ClaimTab · Warnings                      │
├──────────────────────────────────────────────────────────────────┤
│ Application/State Layer (Custom Hooks)                             │
│  useWallet · useBalances · useStaking · useToast                  │
├──────────────────────────────────────────────────────────────────┤
│ Integration Layer                                                  │
│  Wagmi (connectors, config) · Viem (encoding/decoding) ·          │
│  TanStack Query (caching, retries) · Contract ABIs                │
├──────────────────────────────────────────────────────────────────┤
│ Transport Layer                                                    │
│  JSON-RPC over HTTPS → Infura (primary) → public RPC fallbacks    │
├──────────────────────────────────────────────────────────────────┤
│ On-chain Layer (Solidity, Sepolia testnet)                         │
│  StakingContract_Original · OrcaCoin (ERC-20, OpenZeppelin)       │
└──────────────────────────────────────────────────────────────────┘
```

## 4. Smart Contract Architecture

### 4.1 Contracts

- **`StakingContract_Original.sol`** — the protocol. Holds ETH, tracks each staker's
  balance and reward accrual, and instructs `OrcaCoin` to mint rewards.
- **`OrcaCoin.sol`** — an OpenZeppelin `ERC20` + `Ownable` token. `mint()` is
  restricted to `msg.sender == stakingContract`; the owner sets which address that
  is via `updateStakingContractAddress()`.

There is also an in-progress `StakingContract.sol` in `src/` alongside the
"Original" — the deployment script (`DeployContracts.s.sol` / `DeployOriginal`)
wires up `StakingContract_Original` + `OrcaCoin`, so that pair is the deployed,
canonical version.

### 4.2 Contract Relationship

```
┌────────────────────────┐        deploy-time linking        ┌───────────────────┐
│ StakingContract_Original│ ─────────────────────────────────▶│      OrcaCoin      │
│                          │                                    │  (ERC20, Ownable) │
│  constructor(IOrcaCoin)  │◀── orcaCoin address passed in ────│                    │
│                          │                                    │ stakingContract =  │
│  orcaCoin.mint(user, amt)│ ───────────────────────────────▶  │   set by owner     │
└────────────────────────┘        claimRewards() → mint()      └───────────────────┘
```

Deployment order (`DeployOriginal.run()`):
1. Deploy `OrcaCoin` (empty constructor, deployer becomes owner).
2. Deploy `StakingContract_Original`, passing the `OrcaCoin` address.
3. Call `orcaCoin.updateStakingContractAddress(stakingContract)` to complete the
   circular reference (only the staking contract may call `mint`).

### 4.3 Core Data Model (on-chain)

```solidity
mapping(address => uint256) public stakers_Balance;   // simple staked-ETH ledger

struct UserInfo {
    uint256 amountStaked;
    uint256 lastRewardTime;
    uint256 rewardDebt;       // accrued, unclaimed ORCA (wei)
}
mapping(address => UserInfo) public userInfo;

uint256 public totalStaked;
uint256 public constant REWARD_PER_SEC_PER_ETH = 1;
```

Two parallel views of "how much did this user stake" exist (`stakers_Balance` and
`userInfo.amountStaked`) — both are updated together on every `stake`/`unstake`.
The frontend treats `stakers_Balance` as authoritative and falls back to
`userInfo.amountStaked` if it is unavailable.

### 4.4 Reward Mechanism

Rewards accrue continuously and are lazily materialized on any state-changing call:

```
_updateRewards(user):
    if lastRewardTime == 0: lastRewardTime = now; return   // first touch, no accrual yet
    timeDiff = now - lastRewardTime
    rewardDebt += timeDiff * amountStaked * REWARD_PER_SEC_PER_ETH
    lastRewardTime = now
```

`REWARD_PER_SEC_PER_ETH = 1` combined with 18-decimal wei math means the effective
rate is **1 ORCA per second per 1 ETH staked**. `_updateRewards` runs at the start
of `stake`, `unstake`, and `claimRewards`, so `rewardDebt` is always brought current
before balances change. `getRewards()` is a pure view that projects the same formula
without mutating state, so the UI can show live pending rewards.

### 4.5 Contract Interaction Flow

```
User ──stake(amount){value:amount}──▶ StakingContract_Original
                                          ├─ _updateRewards(user)
                                          ├─ userInfo[user].amountStaked += amount
                                          ├─ totalStaked += amount
                                          └─ stakers_Balance[user] += amount

User ──unstake(amount)──▶ StakingContract_Original
                              ├─ require(amountStaked >= amount)
                              ├─ _updateRewards(user)
                              ├─ balances -= amount
                              └─ payable(user).transfer(amount)   // ETH sent back

User ──claimRewards()──▶ StakingContract_Original
                              ├─ _updateRewards(user)
                              ├─ orcaCoin.mint(user, rewardDebt)  ── only staking
                              └─ rewardDebt = 0                      contract may call
```

### 4.6 Security Posture (as implemented today)

- Access control: `OrcaCoin.mint` gated to the staking contract address; owner-only
  address rotation via `Ownable`.
- Input validation: non-zero amount checks, exact `msg.value` match on stake,
  sufficient-balance check on unstake.
- **Known gaps** (explicitly called out in the contract README, not yet mitigated):
  no reentrancy guard on `unstake`'s raw `.transfer`, no pausability, no staking
  cap, no lock-up period, fixed non-governable reward rate, no formal audit yet.
  Currently testnet-only (Sepolia) by design.

## 5. Frontend Architecture

### 5.1 Tech Stack

React 19, Vite 7, Wagmi 2, Viem 2, TanStack Query 5, Tailwind CSS, `ethers` v6
(present as a secondary dependency), Lucide icons.

### 5.2 Module Structure

```
src/
├── abi/            stakingWithEmissions.js, erc20.js — typed ABI fragments used by wagmi
├── components/      presentational React components (Header, AccountOverview,
│                    TabNavigation, StakeTab, UnstakeTab, ClaimTab, Warnings)
├── hooks/            useWallet, useBalances, useStaking, useToast — all contract
│                    and wallet logic lives here, kept out of components
├── config/           wagmi.js — chain, connectors, RPC transport/fallback setup
├── constants/        default balances, zero address, tab config
├── utils/            formatters, validators (parseEtherSafe), network helpers
├── config.js         reads VITE_* env vars → contract addresses / chain id
└── App.jsx / main.jsx  composition root
```

### 5.3 Responsibility Split (hooks)

- **`useWallet`** — connect/disconnect, active account, chain-id/network
  correctness check, loading state.
- **`useBalances`** — orchestrates 6 read calls (`useBalance` for ETH,
  `userInfo`, `stakers_Balance`, `getRewards`, `totalStaked`, ORCA `balanceOf`
  + `decimals`/`symbol`), staggers their first fetch (0s/2s/4s/6s) to avoid
  RPC rate-limiting, reconciles `stakers_Balance` vs `userInfo` into one
  `balances` object, and exposes manual `refreshBalances()` /
  `refreshRewardsOnly()` for post-transaction refresh.
- **`useStaking`** — builds and submits the three write transactions
  (`stake`, `unstake`, `claimRewards`) via `useWriteContract` +
  `useWaitForTransactionReceipt`, derives per-action disabled/loading state,
  and triggers a reward-only refresh 3s after a successful claim.
- **`useToast`** — lightweight success/error/pending notification state.

### 5.4 RPC Resilience Strategy

`config/wagmi.js` wraps the configured `VITE_RPC_URL` (Infura/QuickNode/etc.) in a
`viem` `http` transport with `retryCount: 0` (no per-transport retry — fail fast).
If multiple providers are configured, Wagmi's `fallback()` transport chains them
with its own bounded retry/backoff, specifically detecting `429`/`ERR_INSUFFICIENT_RESOURCES`
to back off longer rather than hammering a rate-limited endpoint. `useBalances`
layers additional application-level backoff (`staleTime`, capped retries,
staggered enablement) on top, because Sepolia public RPCs are rate-limit prone.

### 5.5 Data Flow (read path)

```
App mounts → useWallet detects connected account & chain
           → useBalances hooks fire (staggered) via Wagmi → Viem → RPC → Sepolia
           → contract state decoded → merged into `balances` object
           → passed down to AccountOverview / StakeTab / UnstakeTab / ClaimTab
```

### 5.6 Data Flow (write path)

```
User submits StakeTab form
   → useStaking.handleStake() validates amount (parseEtherSafe)
   → writeContract({stake, value: amountWei}) → wallet prompts signature
   → useWaitForTransactionReceipt polls for confirmation
   → on success: toast shown; for claim, refreshRewardsOnly() re-reads
     getRewards() + ORCA balanceOf after a short delay
```

## 6. Deployment Architecture

```
┌───────────────────────────┐        ┌──────────────────────────┐
│  Contracts (Foundry)        │        │  Frontend (Vite build)     │
│  forge script Deploy...     │        │  npm run build → dist/     │
│  --rpc-url sepolia --verify │        │  deployed to Vercel/       │
│                              │        │  Netlify (static hosting)  │
└──────────────┬──────────────┘        └─────────────┬────────────┘
               │ contract addresses recorded             │
               └───────────────► written into ────────────┘
                          frontend .env (VITE_STAKING_CONTRACT_ADDRESS,
                                         VITE_ORCA_TOKEN_ADDRESS)
```

The frontend is a purely static SPA — no server-side rendering or backend
process — so deployment is "build once, serve static files," with contract
addresses injected at build time via environment variables.

## 7. Key Architectural Characteristics

| Attribute | Current State |
|---|---|
| State ownership | Fully on-chain; no off-chain DB or indexer |
| Trust model | Trustless for reward accrual math; trusted `Ownable` admin key controls which contract can mint |
| Scalability | Bounded by Ethereum L1/testnet throughput; no batching or L2 usage |
| Availability | Depends on a single configured RPC provider + best-effort fallback |
| Upgradability | None — contracts are not proxied/upgradeable; a new deployment is required for logic changes |
| Network | Ethereum Sepolia testnet only (chain id 11155111) |
