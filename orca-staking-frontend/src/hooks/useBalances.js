import { useState, useEffect } from 'react'
import { Contract } from 'ethers'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { erc20Abi } from '../abi/erc20'
import {
  STAKING_CONTRACT_ADDRESS,
  ORCA_TOKEN_ADDRESS,
} from '../config'
import { ZERO_ADDRESS, DEFAULT_BALANCES } from '../constants'

export const useBalances = (provider, signer, account, stakingContract, stakingReadContract, tokenContract) => {
  const [balances, setBalances] = useState(DEFAULT_BALANCES)
  const [tokenMeta, setTokenMeta] = useState({ symbol: 'ORCA', decimals: 18 })

  const loadTokenMetadata = async (contractOverride) => {
    const contractToUse = contractOverride ?? tokenContract
    if (!contractToUse) return
    try {
      const [decimals, symbol] = await Promise.all([
        contractToUse.decimals(),
        contractToUse.symbol(),
      ])
      setTokenMeta({
        decimals: Number(decimals),
        symbol: symbol || 'ORCA',
      })
    } catch (error) {
      console.warn('Unable to load token metadata', error)
    }
  }

  const refreshBalances = async ({
    providerOverride,
    signerOverride,
    accountOverride,
    stakingOverride,
    stakingReadOverride,
    tokenOverride,
  } = {}) => {
    const providerToUse = providerOverride ?? provider
    const signerToUse = signerOverride ?? signer
    const accountToUse = accountOverride ?? account

    // Always fetch ETH balance if we have provider and account
    if (!providerToUse || !accountToUse) {
      return
    }

    const hasStakingContract =
      STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS

    const hasTokenContract =
      ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS

    // Fetch ETH balance first (always available)
    let ethBalance = 0n
    try {
      ethBalance = await providerToUse.getBalance(accountToUse)
    } catch (error) {
      console.error('Failed to fetch ETH balance', error)
    }

    // If contracts aren't configured, just update ETH balance
    if (!hasStakingContract) {
      setBalances((prev) => ({
        ...prev,
        eth: ethBalance,
        staked: 0n,
        pending: 0n,
        orca: 0n,
        totalStaked: 0n,
      }))
      return
    }

    // If we don't have signer, we can only fetch ETH balance
    if (!signerToUse) {
      setBalances((prev) => ({
        ...prev,
        eth: ethBalance,
      }))
      return
    }

    // Setup contract instances for staking
    const stakingForAccount =
      stakingOverride ??
      stakingContract ??
      new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerToUse)

    const stakingForReads =
      stakingReadOverride ??
      stakingReadContract ??
      new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, providerToUse)

    const tokenForReads =
      tokenOverride ??
      tokenContract ??
      (hasTokenContract ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerToUse) : null)

    // Fetch contract data
    try {
      const contractPromises = [
        stakingForAccount.userInfo(accountToUse).catch(() => null),
        stakingForAccount.getRewards().catch(() => 0n),
        stakingForReads?.totalStake?.().catch(() => 0n) ?? Promise.resolve(0n),
        tokenForReads
          ? tokenForReads.balanceOf(accountToUse).catch(() => 0n)
          : Promise.resolve(0n),
      ]

      const [userData, pendingRewards, totalStakeValue, orcaBalance] =
        await Promise.all(contractPromises)

      const userStake =
        userData?.stakedAmount ?? userData?.amountStaked ?? userData?.[0] ?? 0n

      setBalances({
        eth: ethBalance,
        staked: userStake,
        pending: pendingRewards ?? 0n,
        orca: orcaBalance ?? 0n,
        totalStaked: totalStakeValue ?? 0n,
      })
    } catch (error) {
      console.error('Failed to refresh contract balances', error)
      // Still update ETH balance even if contract calls fail
      setBalances((prev) => ({
        ...prev,
        eth: ethBalance,
      }))
    }
  }

  const refreshPendingRewards = async () => {
    if (!stakingContract || !account) return
    try {
      const pendingRewards = await stakingContract.getRewards()
      setBalances((prev) => ({ ...prev, pending: pendingRewards }))
    } catch (error) {
      console.error('Failed to fetch pending rewards', error)
    }
  }

  // Refresh balances when account or contracts change
  useEffect(() => {
    if (!account) {
      setBalances(DEFAULT_BALANCES)
      return
    }

    // Always refresh balances when account changes (even if contracts aren't configured)
    refreshBalances()

    // Only load token metadata if token contract is configured
    if (tokenContract) {
      loadTokenMetadata()
    }

    // Only poll for rewards if staking contract is configured
    if (stakingContract) {
      const interval = setInterval(() => {
        refreshPendingRewards()
      }, 10000)

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, stakingContract, tokenContract])

  return {
    balances,
    tokenMeta,
    refreshBalances,
    refreshPendingRewards,
    loadTokenMetadata,
  }
}

