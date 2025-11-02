import { useState, useEffect, useMemo } from 'react'
import { useBalance, useReadContract, useWatchBlockNumber } from 'wagmi'
import { formatUnits } from 'viem'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { erc20Abi } from '../abi/erc20'
import {
  STAKING_CONTRACT_ADDRESS,
  ORCA_TOKEN_ADDRESS,
} from '../config'
import { ZERO_ADDRESS, DEFAULT_BALANCES } from '../constants'

export const useBalances = (account, isConnected) => {
  const [balances, setBalances] = useState(DEFAULT_BALANCES)
  const [tokenMeta, setTokenMeta] = useState({ symbol: 'ORCA', decimals: 18 })

  // Fetch ETH balance using wagmi
  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: account,
    enabled: !!account && isConnected,
  })

  const hasStakingContract =
    STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS

  const hasTokenContract =
    ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS

  // Fetch user info from staking contract
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'userInfo',
    args: account ? [account] : undefined,
    enabled: !!account && isConnected && hasStakingContract,
  })

  // Fetch pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'getRewards',
    enabled: !!account && isConnected && hasStakingContract,
  })

  // Fetch total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'totalStake',
    enabled: hasStakingContract,
  })

  // Fetch ORCA token balance
  const { data: orcaBalance, refetch: refetchOrca } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    enabled: !!account && isConnected && hasTokenContract,
  })

  // Fetch token metadata (decimals and symbol)
  const { data: tokenDecimals } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    enabled: hasTokenContract,
  })

  const { data: tokenSymbol } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'symbol',
    enabled: hasTokenContract,
  })

  // Update token metadata
  useEffect(() => {
    if (tokenDecimals !== undefined && tokenSymbol) {
      setTokenMeta({
        decimals: Number(tokenDecimals),
        symbol: tokenSymbol || 'ORCA',
      })
    }
  }, [tokenDecimals, tokenSymbol])

  // Update balances whenever data changes
  useEffect(() => {
    if (!account || !isConnected) {
      setBalances(DEFAULT_BALANCES)
      return
    }

    const eth = ethBalance?.value ?? 0n
    const userStake = userInfo?.stakedAmount ?? userInfo?.amountStaked ?? userInfo?.[0] ?? 0n
    const pending = pendingRewards ?? 0n
    const total = totalStaked ?? 0n
    const orca = orcaBalance ?? 0n

    setBalances({
      eth,
      staked: userStake,
      pending,
      orca,
      totalStaked: total,
    })
  }, [account, isConnected, ethBalance, userInfo, pendingRewards, totalStaked, orcaBalance])

  // Refresh rewards every 10 seconds
  useEffect(() => {
    if (!account || !isConnected || !hasStakingContract) return

    const interval = setInterval(() => {
      refetchRewards()
    }, 10000)

    return () => clearInterval(interval)
  }, [account, isConnected, hasStakingContract, refetchRewards])

  // Watch for new blocks to auto-refresh balances
  useWatchBlockNumber({
    onBlockNumber: () => {
      if (account && isConnected) {
        refetchEth()
        if (hasStakingContract) {
          refetchUserInfo()
          refetchRewards()
          refetchTotalStaked()
        }
        if (hasTokenContract) {
          refetchOrca()
        }
      }
    },
  })

  const refreshBalances = async () => {
    if (account && isConnected) {
      await Promise.all([
        refetchEth(),
        hasStakingContract && Promise.all([
          refetchUserInfo(),
          refetchRewards(),
          refetchTotalStaked(),
        ]),
        hasTokenContract && refetchOrca(),
      ])
    }
  }

  return {
    balances,
    tokenMeta,
    refreshBalances,
    refreshPendingRewards: refetchRewards,
  }
}
