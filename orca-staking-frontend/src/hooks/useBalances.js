import { useState, useEffect } from 'react'
import { useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { erc20Abi } from '../abi/erc20'
import {
  STAKING_CONTRACT_ADDRESS,
  ORCA_TOKEN_ADDRESS,
} from '../config'
import { ZERO_ADDRESS, DEFAULT_BALANCES } from '../constants'

// Helper to detect timeout errors
const isTimeoutError = (error) => {
  if (!error) return false
  const message = error.message || error.toString()
  return message.includes('timeout') || 
         message.includes('timed out') || 
         message.includes('signal timed out') ||
         error.name === 'TimeoutError'
}

// Helper to detect rate limit errors (429)
const isRateLimitError = (error) => {
  if (!error) return false
  const message = error.message || error.toString()
  const status = error?.status || error?.statusCode
  return status === 429 ||
         message.includes('429') ||
         message.includes('Too Many Requests') ||
         message.includes('rate limit') ||
         message.includes('Rate limit')
}

// Helper to detect resource exhaustion errors
const isResourceError = (error) => {
  if (!error) return false
  const message = error.message || error.toString()
  return message.includes('ERR_INSUFFICIENT_RESOURCES') ||
         message.includes('Insufficient resources') ||
         message.includes('net::ERR_INSUFFICIENT_RESOURCES') ||
         message.includes('too many requests') ||
         message.includes('resource')
}

export const useBalances = (account, isConnected) => {
  const [balances, setBalances] = useState(DEFAULT_BALANCES)
  const [tokenMeta, setTokenMeta] = useState({ symbol: 'ORCA', decimals: 18 })
  const [enableFetch1, setEnableFetch1] = useState(false)
  const [enableFetch2, setEnableFetch2] = useState(false)
  const [enableFetch3, setEnableFetch3] = useState(false)
  const [enableFetch4, setEnableFetch4] = useState(false)

  // Stagger initial fetches to avoid hitting rate limits
  useEffect(() => {
    if (account && isConnected) {
      // Enable first fetch immediately
      setEnableFetch1(true)
      // Enable subsequent fetches with delays
      const timer2 = setTimeout(() => setEnableFetch2(true), 1000)
      const timer3 = setTimeout(() => setEnableFetch3(true), 2000)
      const timer4 = setTimeout(() => setEnableFetch4(true), 3000)
      
      return () => {
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    } else {
      // Reset when disconnected
      setEnableFetch1(false)
      setEnableFetch2(false)
      setEnableFetch3(false)
      setEnableFetch4(false)
    }
  }, [account, isConnected])

  // Fetch ETH balance using wagmi (first priority)
  const { data: ethBalance, refetch: refetchEth, error: ethBalanceError } = useBalance({
    address: account,
    enabled: enableFetch1 && !!account && isConnected,
    query: {
      refetchInterval: false, // Disable auto-refetch to reduce concurrent requests
      retry: (failureCount, error) => {
        // Don't retry on 429 errors - let fallback providers handle it
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      retryDelay: (attemptIndex, error) => {
        // Longer delay for rate limit or resource errors
        if (isRateLimitError(error) || isResourceError(error)) {
          return 30000 // 30 seconds
        }
        return Math.min(5000 * (attemptIndex + 1), 20000) // Normal backoff: 5s, 10s, max 20s
      },
      staleTime: 120000, // Consider data fresh for 2 minutes
    },
  })

  const hasStakingContract =
    STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS

  const hasTokenContract =
    ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS

  // Fetch user info from staking contract (may fail for empty structs, so we have fallback)
  // DISABLED: Only fetch if stakersBalance is not available to reduce concurrent requests
  const { data: userInfo, refetch: refetchUserInfo, error: userInfoError } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'userInfo',
    args: account ? [account] : undefined,
    enabled: false, // Disabled - only fetch manually if needed
    query: {
      refetchInterval: false, // Disabled
      retry: false, // Don't retry if it fails, use fallback instead
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  })

  // Fetch stakers_Balance as fallback (more reliable for checking staked amount) - second priority
  const { data: stakersBalance, refetch: refetchStakersBalance, error: stakersBalanceError } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'stakers_Balance',
    args: account ? [account] : undefined,
    enabled: enableFetch2 && !!account && isConnected && hasStakingContract,
    query: {
      refetchInterval: false, // Disable auto-refetch to reduce concurrent requests
      retry: (failureCount, error) => {
        // Don't retry on 429 errors - let fallback providers handle it
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      retryDelay: (attemptIndex, error) => {
        // Longer delay for rate limit or resource errors
        if (isRateLimitError(error) || isResourceError(error)) {
          return 30000 // 30 seconds
        }
        return Math.min(5000 * (attemptIndex + 1), 20000) // Normal backoff: 5s, 10s, max 20s
      },
      staleTime: 120000, // Consider data fresh for 2 minutes
    },
  })

  // Fetch pending rewards - third priority
  const { data: pendingRewards, refetch: refetchRewards, error: pendingRewardsError } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'getRewards',
    enabled: enableFetch3 && !!account && isConnected && hasStakingContract,
    query: {
      refetchInterval: false, // Disable auto-refetch to reduce concurrent requests
      retry: (failureCount, error) => {
        // Don't retry on 429 errors - let fallback providers handle it
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      retryDelay: (attemptIndex, error) => {
        // Longer delay for rate limit or resource errors
        if (isRateLimitError(error) || isResourceError(error)) {
          return 30000 // 30 seconds
        }
        return Math.min(5000 * (attemptIndex + 1), 20000) // Normal backoff: 5s, 10s, max 20s
      },
      staleTime: 120000, // Consider data fresh for 2 minutes
    },
  })

  // Fetch total staked - fourth priority
  const { data: totalStaked, refetch: refetchTotalStaked, error: totalStakedError } = useReadContract({
    address: hasStakingContract && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS ? STAKING_CONTRACT_ADDRESS : undefined,
    abi: stakingWithEmissionsAbi,
    functionName: 'totalStaked',
    enabled: enableFetch4 && hasStakingContract,
    query: {
      refetchInterval: false, // Disable auto-refetch to reduce concurrent requests
      retry: (failureCount, error) => {
        // Don't retry on 429 errors - let fallback providers handle it
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1 // Only retry once for other errors
      },
      retryDelay: (attemptIndex, error) => {
        // Longer delay for rate limit or resource errors
        if (isRateLimitError(error) || isResourceError(error)) {
          return 30000 // 30 seconds
        }
        return Math.min(5000 * (attemptIndex + 1), 20000) // Normal backoff: 5s, 10s, max 20s
      },
      staleTime: 180000, // Consider data fresh for 3 minutes
    },
  })

  // Log errors and data for debugging (moved after all hook declarations)
  useEffect(() => {
    // Only log non-critical errors (userInfo empty is normal for new stakers)
    if (userInfoError && !stakersBalance) {
      // Only warn if we don't have stakersBalance fallback
      console.debug('⚠️ userInfo returned empty (this is normal for new stakers), using stakers_Balance instead')
    }
    
    // Only log network errors that are not timeouts, rate limits, or resource errors
    const shouldLogError = (error) => {
      return error && 
             !isTimeoutError(error) && 
             !isRateLimitError(error) && 
             !isResourceError(error)
    }
    
    if (shouldLogError(ethBalanceError)) {
      console.warn('⚠️ Error fetching ETH balance:', ethBalanceError.message)
    } else if (isResourceError(ethBalanceError)) {
      console.debug('⏳ Resource limit reached, reducing request frequency...')
    } else if (isRateLimitError(ethBalanceError)) {
      console.debug('⏳ Rate limited, will retry with backoff...')
    }
    
    if (shouldLogError(stakersBalanceError)) {
      console.warn('⚠️ Error fetching stakers balance:', stakersBalanceError.message)
    } else if (isResourceError(stakersBalanceError)) {
      console.debug('⏳ Resource limit reached, reducing request frequency...')
    } else if (isRateLimitError(stakersBalanceError)) {
      console.debug('⏳ Rate limited, will retry with backoff...')
    }
    
    if (shouldLogError(pendingRewardsError)) {
      console.warn('⚠️ Error fetching pending rewards:', pendingRewardsError.message)
    } else if (isResourceError(pendingRewardsError)) {
      console.debug('⏳ Resource limit reached, reducing request frequency...')
    } else if (isRateLimitError(pendingRewardsError)) {
      console.debug('⏳ Rate limited, will retry with backoff...')
    }
    
    if (shouldLogError(totalStakedError)) {
      console.warn('⚠️ Error fetching total staked:', totalStakedError.message)
    } else if (isResourceError(totalStakedError)) {
      console.debug('⏳ Resource limit reached, reducing request frequency...')
    } else if (isRateLimitError(totalStakedError)) {
      console.debug('⏳ Rate limited, will retry with backoff...')
    }
  }, [userInfoError, ethBalanceError, stakersBalanceError, pendingRewardsError, totalStakedError, stakersBalance])

  useEffect(() => {
    if (userInfo !== undefined || stakersBalance !== undefined) {
      console.log('📊 Staking data received:', {
        account,
        userInfo,
        stakersBalance: stakersBalance?.toString(),
        stakingContract: STAKING_CONTRACT_ADDRESS,
      })
    }
  }, [userInfo, stakersBalance, account])

  // Fetch ORCA token balance - enabled with fetch2 (same time as stakersBalance)
  const { data: orcaBalance, refetch: refetchOrca } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    enabled: enableFetch2 && !!account && isConnected && hasTokenContract,
    query: {
      refetchInterval: false, // Disable auto-refetch
      retry: (failureCount, error) => {
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1
      },
      staleTime: 120000,
    },
  })

  // Fetch token metadata (decimals and symbol) - fetch once, cache forever (enabled with fetch1)
  const { data: tokenDecimals } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    enabled: enableFetch1 && hasTokenContract,
    query: {
      refetchInterval: false, // Never refetch - metadata doesn't change
      retry: (failureCount, error) => {
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1
      },
      staleTime: Infinity, // Cache forever
    },
  })

  const { data: tokenSymbol } = useReadContract({
    address: hasTokenContract && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS ? ORCA_TOKEN_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'symbol',
    enabled: enableFetch1 && hasTokenContract,
    query: {
      refetchInterval: false, // Never refetch - metadata doesn't change
      retry: (failureCount, error) => {
        if (isRateLimitError(error) || isResourceError(error)) {
          return false
        }
        return failureCount < 1
      },
      staleTime: Infinity, // Cache forever
    },
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
    
    // Use stakers_Balance as primary source (more reliable)
    // Fallback to userInfo.amountStaked if available
    let userStake = 0n
    
    // First try stakers_Balance (most reliable)
    if (stakersBalance !== undefined && stakersBalance !== null) {
      userStake = BigInt(stakersBalance) ?? 0n
    }
    // Fallback to userInfo if stakers_Balance is not available
    else if (userInfo) {
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
      console.log('💰 Balance update:', {
        account,
        stakingContract: STAKING_CONTRACT_ADDRESS,
        eth: eth.toString(),
        stakersBalance: stakersBalance?.toString() || 'undefined',
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
  }, [account, isConnected, ethBalance, userInfo, stakersBalance, pendingRewards, totalStaked, orcaBalance, hasStakingContract])

  // Removed aggressive refresh interval - relying on refetchInterval in hooks instead

  // Watch for new blocks to auto-refresh balances (disabled to reduce RPC load)
  // The regular refetch intervals above will handle updates
  // useWatchBlockNumber({
  //   onBlockNumber: () => {
  //     if (account && isConnected) {
  //       // Small delay to ensure blockchain state is updated
  //       setTimeout(() => {
  //         refetchEth()
  //         if (hasStakingContract) {
  //           refetchUserInfo()
  //           refetchRewards()
  //           refetchTotalStaked()
  //         }
  //         if (hasTokenContract) {
  //           refetchOrca()
  //         }
  //       }, 1000)
  //     }
  //   },
  // })

  const refreshBalances = async () => {
    if (account && isConnected) {
      try {
        // Wait for blockchain state to update
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Sequential refetch with longer delays to avoid resource exhaustion
        try {
          await refetchEth()
        } catch (error) {
          // Only warn for non-recoverable errors
          if (!isRateLimitError(error) && !isTimeoutError(error) && !isResourceError(error)) {
            console.warn('Failed to refresh ETH balance:', error.message)
          }
        }
        
        // Wait longer between requests to avoid resource exhaustion
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (hasStakingContract) {
          // Refetch critical data first with delays to avoid rate limits
          try {
            await refetchStakersBalance() // Primary source for staked amount
          } catch (error) {
            if (!isRateLimitError(error) && !isTimeoutError(error) && !isResourceError(error)) {
              console.warn('Failed to refresh stakers balance:', error.message)
            }
          }
          
          // Add longer delay between requests to avoid resource exhaustion
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          try {
            await refetchRewards()
          } catch (error) {
            if (!isRateLimitError(error) && !isTimeoutError(error) && !isResourceError(error)) {
              console.warn('Failed to refresh rewards:', error.message)
            }
          }
          
          // Optional: Try other data but don't fail if it errors
          // Use longer delays for less critical data
          setTimeout(() => {
            refetchTotalStaked().catch(() => {})
          }, 3000)
        }
        
        if (hasTokenContract) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          try {
            await refetchOrca()
          } catch (error) {
            if (!isRateLimitError(error) && !isTimeoutError(error) && !isResourceError(error)) {
              console.warn('Failed to refresh ORCA balance:', error.message)
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing balances:', error)
        // Don't throw - allow UI to continue with stale data
      }
    }
  }

  // Check if there are any critical errors (excluding timeouts, rate limits, and resource errors)
  const hasNetworkErrors = !!(
    (ethBalanceError && !isTimeoutError(ethBalanceError) && !isRateLimitError(ethBalanceError) && !isResourceError(ethBalanceError)) ||
    (stakersBalanceError && !userInfo && !isTimeoutError(stakersBalanceError) && !isRateLimitError(stakersBalanceError) && !isResourceError(stakersBalanceError)) ||
    (pendingRewardsError && !isTimeoutError(pendingRewardsError) && !isRateLimitError(pendingRewardsError) && !isResourceError(pendingRewardsError)) ||
    (totalStakedError && !isTimeoutError(totalStakedError) && !isRateLimitError(totalStakedError) && !isResourceError(totalStakedError))
  )

  return {
    balances,
    tokenMeta,
    refreshBalances,
    refreshPendingRewards: refetchRewards,
    hasNetworkErrors,
  }
}


