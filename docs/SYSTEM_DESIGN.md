# OrcaEarn — System Design

Deep-dive companion to `ARCHITECTURE.md` (structural view) and
`HIGH_LEVEL_DESIGN.md` (subsystem/use-case view). This document covers data
modeling, math correctness, failure modes, and where the system would need to
evolve to grow beyond its current testnet MVP scope.

## 1. On-Chain Data Model

```
StakingContract_Original
├── totalStaked : uint256                          // sum of all staked ETH (wei)
├── stakers_Balance : mapping(address → uint256)    // per-user staked ETH (wei)
├── userInfo : mapping(address → UserInfo)
│     UserInfo {
│         amountStaked   : uint256   // wei, mirrors stakers_Balance
│         lastRewardTime : uint256   // unix timestamp of last accrual
│         rewardDebt     : uint256   // wei, accrued & unclaimed ORCA
│     }
└── orcaCoin : IOrcaCoin                              // immutable reference set at deploy

OrcaCoin (ERC20, Ownable)
├── stakingContract : address        // only address allowed to mint
└── standard ERC20 storage (balances, allowances, totalSupply) from OpenZeppelin
```

**Redundancy note**: `stakers_Balance[addr]` and `userInfo[addr].amountStaked`
always hold the same value (both mutated together in `stake`/`unstake`). This
is not sharding or caching — it is two mappings storing the same fact, kept in
sync by convention rather than by a single source write. The frontend picks
`stakers_Balance` as primary and `userInfo` as fallback purely because it has
proven more reliable to decode over flaky RPC.

## 2. Reward Accounting Model

This is a **lazy, per-user linear accrual** model (not a global reward-per-share
index like MasterChef-style contracts). Each user has independent
`lastRewardTime`/`rewardDebt` state; there is no shared accumulator, so gas cost
per user action is O(1) regardless of total staker count — a good property for
scalability of the accrual mechanism itself, even though the surrounding
contract has other limits (see §5).

```
rewardDebt(t) = rewardDebt(t_last) + (t - t_last) × amountStaked × RATE
```

Where `RATE = 1` (ORCA-wei per second per ETH-wei, since both use 18 decimals,
this cancels out to 1 ORCA/sec per 1 ETH staked). Because `_updateRewards` runs
before every balance mutation, `amountStaked` used in the formula is always the
balance that was in effect for the *elapsed* interval — i.e., accrual correctly
uses the pre-change stake amount, not the post-change one.

**Correctness property**: total ORCA that can ever be minted for a user equals
the time-integral of their staked amount × RATE, regardless of how many
stake/unstake operations they perform in between — because each operation
"closes out" the interval before changing the balance.

## 3. Sequence Diagrams

### 3.1 Stake (happy path)

```
User        Frontend(useStaking)     Wallet        StakingContract     OrcaCoin
 │  amount        │                      │                 │                │
 ├───────────────▶│                      │                 │                │
 │                ├─ validate ──────────▶│                 │                │
 │                ├─ writeContract(stake)│                 │                │
 │                │─────────────────────▶│ sign & send tx  │                │
 │                │                      │────────────────▶│                │
 │                │                      │                 ├ _updateRewards │
 │                │                      │                 ├ balances += amt│
 │                │                      │◀─ receipt ──────┤                │
 │                │◀──isSuccess──────────┤                 │                │
 │◀── toast ──────┤                      │                 │                │
```

### 3.2 Claim (happy path, cross-contract call)

```
User    useStaking     Wallet    StakingContract         OrcaCoin
 │ claim     │            │              │                    │
 ├──────────▶│ writeContract(claimRewards)                    │
 │            │───────────▶│ sign & send │                    │
 │            │            │────────────▶│                    │
 │            │            │              ├ _updateRewards     │
 │            │            │              ├ mint(user,debt) ──▶│
 │            │            │              │                    ├ require(msg.sender==stakingContract)
 │            │            │              │                    ├ _mint(user, debt)
 │            │            │              │◀── ok ─────────────┤
 │            │            │              ├ rewardDebt = 0     │
 │            │            │◀─ receipt ───┤                    │
 │            │◀─isSuccess─┤              │                    │
 │            ├─ +3s delay → refreshRewardsOnly()               │
 │            │   → getRewards(), balanceOf(user) re-read       │
 │◀── toast ──┤                                                 │
```

## 4. Failure Modes & Handling

| Failure | Where Handled | Behavior |
|---|---|---|
| RPC 429 / rate limit | `wagmi.js` transport + `useBalances` retry logic | Skip retry on that transport, let `fallback()` (if configured) try next provider; app-level retryDelay of 30s |
| RPC timeout | `useBalances` (`isTimeoutError`) | Logged at debug level only, not surfaced as a hard error to avoid alarming the user for a transient issue |
| `ERR_INSUFFICIENT_RESOURCES` (browser-level) | Both transport and hook layers | Treated like rate limiting — backoff, no aggressive retry |
| Wrong network selected in wallet | `useWallet` (`isCorrectNetwork`) | `Warnings` component blocks staking actions until user switches to Sepolia |
| Wallet disconnected mid-session | `useWallet` | Actions disabled (`stakeDisabled` etc. all check `!account`) |
| Contract address not configured (`0x0…0`) | `config.js` + hook `enabled` guards | Reads/writes short-circuited; explicit toast "Staking contract address not configured" |
| Empty `userInfo` for a brand-new staker | Contract returns zeroed struct; frontend `console.debug`s, not `warn`s | Not treated as an error — expected for anyone who hasn't staked yet |
| Transaction reverts on-chain (e.g., insufficient balance to unstake) | `useWaitForTransactionReceipt` `isError` / `error` | Toast shows revert reason if available |
| Duplicate toast on re-render | `processedHashRef` in `useStaking` | Each tx hash processed exactly once |

## 5. Known Limitations / Risk Register

These are current, real gaps — not hypothetical — called out here so they are
tracked rather than rediscovered:

1. **No reentrancy guard** on `unstake`'s `payable(msg.sender).transfer(amount)`.
   `.transfer` forwards a fixed 2300 gas stipend, which mitigates classic
   reentrancy, but the contract does not follow checks-effects-interactions as
   defensively as it could (state is updated before transfer, which is good,
   but there's no explicit `nonReentrant` modifier as defense-in-depth).
2. **No cap on total stake or per-user stake** — a single large staker can
   dominate `totalStaked` and mint proportionally large ORCA amounts; token
   supply is fully uncapped and inflationary by design (1 ORCA/sec/ETH forever).
3. **Fixed reward rate**, not governable/adjustable without redeploying.
4. **No pausability / circuit breaker** — if a bug is found, the only mitigation
   is to redeploy and migrate, since the contract is not upgradeable.
5. **No lock-up period** — instant unstake means no economic security assumption
   should be built on top of "staked = committed capital."
6. **Single RPC provider by default** — if `VITE_RPC_URL` is unset or exhausted
   and no fallback list is configured, the app has no read path at all
   (the code explicitly avoids free public RPCs due to past
   `ERR_INSUFFICIENT_RESOURCES` issues, trading resilience for reliability).
7. **No off-chain indexing** — every dashboard load is N direct contract calls;
   this does not scale to features like "leaderboard of all stakers" or
   historical charts without adding an indexer (e.g., subgraph).

## 6. Non-Functional Analysis

### 6.1 Scalability
- **Contract**: O(1) storage/gas per user action; no loops over stakers. Scales
  to arbitrary staker counts at the contract level.
- **Frontend**: scales to one user's dashboard; does *not* scale to
  platform-wide analytics (e.g., "top 10 stakers") without an indexer, since
  there's no enumeration of the `stakers_Balance` mapping on-chain.

### 6.2 Availability
- Single point of dependency: the configured RPC provider. Mitigated partially
  by Wagmi's `fallback()` transport when multiple providers are supplied, but
  the default `.env.example` pattern implies a single provider.
- No dependency on any OrcaEarn-operated backend — once contracts are deployed,
  the frontend could be served from anywhere (or entirely statically cached)
  and would keep functioning as long as an RPC endpoint and a wallet are
  available.

### 6.3 Security
- Trust boundary: user's private key never leaves their wallet; the frontend
  only requests signatures.
- Contract owner (deployer) holds a privileged `Ownable` key that can
  repoint `OrcaCoin.stakingContract` — a centralization risk if that key is
  compromised, since it could redirect minting rights to a malicious contract.
- No professional audit yet (explicitly flagged in `StakingContract_Orca/README.md`
  as a pre-mainnet TODO).

### 6.4 Observability
- Client-side only: `console.log`/`console.warn`/`console.debug` statements in
  `useBalances` for balance updates and categorized error logging. No
  server-side logging, metrics, or alerting exists (consistent with there
  being no backend).

## 7. Evolution Path (if this were to grow beyond current scope)

Not built today, but the natural next steps if requirements expanded:

1. **Add a subgraph / indexer** (e.g., The Graph) to support historical charts,
   leaderboards, and reduce direct RPC load from the frontend.
2. **Make the staking contract upgradeable** (UUPS/Transparent proxy) or at
   least add a `Pausable` circuit breaker before any mainnet deployment.
3. **Add `nonReentrant` guards and a professional audit** before handling real
   value.
4. **Parameterize the reward rate** behind governance or a timelocked
   owner-only setter, rather than a hardcoded constant.
5. **Multi-chain support**: extend `chains` array in `wagmi.js` and make
   contract addresses chain-keyed rather than single env vars.
6. **Consolidate `stakers_Balance` and `userInfo.amountStaked`** into a single
   source of truth to remove the current dual-read/fallback complexity in
   `useBalances`.
