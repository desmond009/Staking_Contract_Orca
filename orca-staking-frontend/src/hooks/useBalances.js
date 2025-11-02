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
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds when enabled
    },
  })

  const hasStakingContract =
    STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS

  const hasTokenContract =
    ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS

  // Fetch user info from staking contract
  const { data: userInfo, refetch: refetchUserInfo, error: userInfoError } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'userInfo',
    args: account ? [account] : undefined,
    enabled: !!account && isConnected && hasStakingContract,
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds when enabled
    },
  })

  // Log errors for debugging
  useEffect(() => {
    if (userInfoError) {
      console.error('Error fetching userInfo:', userInfoError)
    }
  }, [userInfoError])

  // Fetch pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'getRewards',
    enabled: !!account && isConnected && hasStakingContract,
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds when enabled
    },
  })

  // Fetch total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'totalStaked',
    enabled: hasStakingContract,
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds when enabled
    },
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
    
    // userInfo returns a tuple: [amountStaked, lastRewardTime, rewardDebt]
    let userStake = 0n
    if (userInfo) {
      if (Array.isArray(userInfo)) {
        userStake = userInfo[0] ?? 0n
      } else if (typeof userInfo === 'object') {
        userStake = userInfo.amountStaked ?? userInfo.stakedAmount ?? userInfo[0] ?? 0n
      }
    }
    
    const pending = pendingRewards ?? 0n
    const total = totalStaked ?? 0n
    const orca = orcaBalance ?? 0n

    // Debug logging
    if (hasStakingContract && account) {
      console.log('Balance update:', {
        eth: eth.toString(),
        userInfo,
        userStake: userStake.toString(),
        pending: pending.toString(),
        total: total.toString(),
        orca: orca.toString(),
      })
    }

    setBalances({
      eth,
      staked: userStake,
      pending,
      orca,
      totalStaked: total,
    })
  }, [account, isConnected, ethBalance, userInfo, pendingRewards, totalStaked, orcaBalance, hasStakingContract])

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
        // Small delay to ensure blockchain state is updated
        setTimeout(() => {
          refetchEth()
          if (hasStakingContract) {
            refetchUserInfo()
            refetchRewards()
            refetchTotalStaked()
          }
          if (hasTokenContract) {
            refetchOrca()
          }
        }, 1000)
      }
    },
  })

  const refreshBalances = async () => {
    if (account && isConnected) {
      try {
        // Refetch all balances - wait a bit for blockchain state to update
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const promises = [refetchEth()]
        
        if (hasStakingContract) {
          promises.push(
            refetchUserInfo(),
            refetchRewards(),
            refetchTotalStaked()
          )
        }
        
        if (hasTokenContract) {
          promises.push(refetchOrca())
        }
        
        await Promise.all(promises)
        
        // Force another refetch after a short delay to ensure we get the latest state
        setTimeout(() => {
          refetchEth()
          if (hasStakingContract) {
            refetchUserInfo()
            refetchRewards()
            refetchTotalStaked()
          }
          if (hasTokenContract) {
            refetchOrca()
          }
        }, 3000)
      } catch (error) {
        console.error('Error refreshing balances:', error)
      }
    }
  }

  return {
    balances,
    tokenMeta,
    refreshBalances,
    refreshPendingRewards: refetchRewards,
  }
}
