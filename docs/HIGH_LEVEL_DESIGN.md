# OrcaEarn — High-Level Design (HLD)

## 1. Purpose & Scope

OrcaEarn lets a user stake ETH and earn a fixed-rate ERC-20 reward (ORCA) over
time, then unstake or claim on demand. This document describes the major
subsystems, their responsibilities, interfaces, and the primary use-case flows.
It intentionally stays above implementation detail — see `ARCHITECTURE.md` for
module/file-level structure and `SYSTEM_DESIGN.md` for deep-dive mechanics,
edge cases, and non-functional analysis.

## 2. Major Subsystems

| # | Subsystem | Responsibility |
|---|---|---|
| 1 | Wallet Connectivity | Connect/disconnect a browser wallet, detect account & chain, enforce correct network |
| 2 | On-chain Read Pipeline | Pull ETH balance, staked balance, pending rewards, total staked, ORCA balance/metadata |
| 3 | On-chain Write Pipeline | Submit `stake`, `unstake`, `claimRewards` transactions and track their lifecycle |
| 4 | Staking Contract | Hold staked ETH, accrue rewards per user, authorize minting |
| 5 | Reward Token (OrcaCoin) | ERC-20 token whose supply is minted only by the Staking Contract |
| 6 | Notification/UX Feedback | Toasts for pending/success/error, warnings for wrong network/disconnected wallet |

## 3. Use Case: Stake ETH

**Actor**: connected wallet user, correct network (Sepolia).

```
1. User enters an ETH amount in StakeTab, clicks "Stake".
2. useStaking.handleStake():
     a. Validates amount via parseEtherSafe (rejects 0/invalid).
     b. Confirms STAKING_CONTRACT_ADDRESS is configured.
     c. Calls writeContract(stake(amountWei), value=amountWei).
3. Wallet (MetaMask) prompts the user to sign & pay gas.
4. StakingContract_Original.stake():
     a. Validates amount == msg.value > 0.
     b. _updateRewards(user)   → settles any prior accrued rewards first.
     c. userInfo[user].amountStaked += amount
     d. totalStaked += amount
     e. stakers_Balance[user] += amount
5. Transaction mines; useWaitForTransactionReceipt resolves isSuccess.
6. Toast "Transaction confirmed!" shown; input field cleared.
   (Balances are not auto-refetched here by design — see §7 below —
   user can pull-to-refresh or the next staggered poll will pick it up.)
```

## 4. Use Case: Unstake ETH

```
1. User enters an amount in UnstakeTab (≤ their staked balance), clicks "Unstake".
2. useStaking.handleUnstake() validates and calls writeContract(unstake(amountWei)).
3. StakingContract_Original.unstake():
     a. require(amountStaked >= amount)
     b. _updateRewards(user)              → settle rewards before balance shrinks
     c. amountStaked -= amount; totalStaked -= amount; stakers_Balance -= amount
     d. payable(user).transfer(amount)    → ETH sent back immediately, no lock-up
4. Confirmation toast shown on receipt.
```

## 5. Use Case: Claim Rewards

```
1. User clicks "Claim" in ClaimTab (enabled only if balances.pending > 0).
2. useStaking.handleClaim() calls writeContract(claimRewards()).
3. StakingContract_Original.claimRewards():
     a. _updateRewards(user)              → finalize rewardDebt up to `now`
     b. orcaCoin.mint(user, rewardDebt)   → OrcaCoin checks msg.sender == stakingContract
     c. rewardDebt = 0
4. On confirmed receipt, useStaking marks lastTxType='claim';
   after a 3s delay, useBalances.refreshRewardsOnly() re-reads
   getRewards() and ORCA balanceOf() to reflect the fresh 0 pending / higher ORCA balance.
```

## 6. Use Case: View Live Dashboard (read-only)

```
1. On wallet connect, useWallet exposes {account, isConnected, isCorrectNetwork}.
2. useBalances stages 4 waves of reads (0s / 2s / 4s / 6s) to avoid RPC
   rate-limit errors:
     wave 1 → ETH balance, ORCA token decimals/symbol
     wave 2 → stakers_Balance, ORCA balanceOf
     wave 3 → getRewards() (pending rewards)
     wave 4 → totalStaked()
3. Results are merged into a single `balances` object:
     { eth, staked, pending, orca, totalStaked }
   `staked` prefers stakers_Balance, falling back to userInfo.amountStaked.
4. AccountOverview renders the merged balances; StakeTab/UnstakeTab use
   `balances.eth` / `balances.staked` for "max" buttons and validation caps.
```

## 7. Cross-Cutting Design Decisions

| Decision | Rationale |
|---|---|
| No auto-refetch after stake/unstake (only after claim) | Avoid compounding RPC rate-limit errors right after a write; user can refresh manually |
| `stakers_Balance` treated as primary source of truth over `userInfo.amountStaked` | Empirically more reliable to read (struct decoding for new stakers can be flaky); both are updated identically on-chain |
| Staggered/delayed enabling of read hooks | A single wallet connect otherwise fires 6+ simultaneous RPC calls, tripping free-tier rate limits |
| Toast de-duplication via `processedHashRef` | `useWaitForTransactionReceipt` state can re-render multiple times per tx; guard prevents duplicate toasts |
| Rewards computed lazily on-chain (`_updateRewards`) rather than via a keeper/cron | Removes any off-chain infrastructure dependency; every state-changing call self-settles |
| Single fixed reward rate constant, no governance | Deliberately simple MVP/testnet scope |

## 8. External Interfaces

- **Wallet Provider**: MetaMask / any EIP-1193 injected provider, via Wagmi
  `injected()` and `metaMask()` connectors.
- **RPC Provider**: Infura (or equivalent) endpoint from `VITE_RPC_URL`, wrapped
  in a Viem `http` transport; optional `fallback()` chain if multiple providers
  are configured.
- **Block Explorer**: Sepolia Etherscan, used for manual verification (`forge
  verify-contract`) and by users to inspect transactions — not integrated
  programmatically.

## 9. Non-Functional Targets (current, testnet scope)

| Attribute | Target / Current Behavior |
|---|---|
| Consistency | Reads are eventually consistent with chain state; no local write-through cache masking stale data |
| Latency | Bounded by Sepolia block time (~12s) + RPC round-trip; UI shows pending state throughout |
| Resilience | Retries with backoff on rate-limit/timeout; falls back across RPC providers if configured |
| Security | Wallet-signed transactions only; no private key handling in the app; contract-level access control on minting |
| Portability | Static SPA — deployable to any static host (Vercel/Netlify/S3) |

## 10. Out of Scope (today)

- Multi-chain / mainnet support (Sepolia-only `chains = [sepolia]`).
- Governance of reward rate or staking parameters.
- Slashing, lock-up periods, or staking caps.
- Off-chain indexing/analytics service.
- Contract upgradeability / proxy pattern.
