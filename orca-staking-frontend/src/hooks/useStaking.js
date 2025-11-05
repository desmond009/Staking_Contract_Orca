import { useState, useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { parseEtherSafe } from '../utils/validators'
import { STAKING_CONTRACT_ADDRESS } from '../config'

export const useStaking = (account, isCorrectNetwork, balances, refreshBalances, refreshRewardsOnly, showToast) => {
  const [inputs, setInputs] = useState({ stake: '', unstake: '' })
  const [isLoading, setIsLoading] = useState({
    stake: false,
    unstake: false,
    claim: false,
  })

  // Track which transaction hash we've already processed to prevent duplicate toasts
  const processedHashRef = useRef(null)

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  // Track the last transaction type to handle post-success actions
  const lastTxTypeRef = useRef(null)

  // Handle transaction success/error - only process each hash once
  useEffect(() => {
    // Only process if we have a hash and haven't processed it yet
    if (isSuccess && hash && processedHashRef.current !== hash) {
      processedHashRef.current = hash // Mark as processed
      showToast('success', 'Transaction confirmed!')
      setIsLoading({ stake: false, unstake: false, claim: false })
      
      // For claim transactions, refresh rewards after a delay to show updated balance
      if (lastTxTypeRef.current === 'claim') {
        setTimeout(() => {
          // Use specific rewards refresh function for better performance
          if (refreshRewardsOnly) {
            refreshRewardsOnly()
          } else if (refreshBalances) {
            refreshBalances()
          }
        }, 3000) // Wait 3 seconds for blockchain state to update
      }
      // For other transactions (stake/unstake), don't auto-refresh to avoid rate limiting
      // User can manually refresh if needed
    } else if ((isError || error) && hash && processedHashRef.current !== hash) {
      processedHashRef.current = hash // Mark as processed
      showToast('error', error?.message ?? 'Transaction failed')
      setIsLoading({ stake: false, unstake: false, claim: false })
    }
    
    // Reset processed hash when hash changes (new transaction started)
    if (hash && hash !== processedHashRef.current && !isSuccess && !isError) {
      processedHashRef.current = null
    }
  }, [isSuccess, isError, error, hash, refreshBalances, refreshRewardsOnly]) // Added refresh functions to dependencies

  const handleStake = async () => {
    const amountWei = parseEtherSafe(inputs.stake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to stake')
      return
    }

    if (!STAKING_CONTRACT_ADDRESS || STAKING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      showToast('error', 'Staking contract address not configured')
      return
    }

    setIsLoading((prev) => ({ ...prev, stake: true }))
    lastTxTypeRef.current = 'stake' // Track transaction type
    showToast('pending', 'Transaction pending...')

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingWithEmissionsAbi,
        functionName: 'stake',
        args: [amountWei],
        value: amountWei,
      })
      setInputs((prev) => ({ ...prev, stake: '' }))
    } catch (err) {
      console.error('Stake failed', err)
      showToast('error', err?.message ?? 'Transaction failed')
      setIsLoading((prev) => ({ ...prev, stake: false }))
      lastTxTypeRef.current = null // Reset on error
    }
  }

  const handleUnstake = async () => {
    const amountWei = parseEtherSafe(inputs.unstake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to unstake')
      return
    }

    setIsLoading((prev) => ({ ...prev, unstake: true }))
    lastTxTypeRef.current = 'unstake' // Track transaction type
    showToast('pending', 'Transaction pending...')

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingWithEmissionsAbi,
        functionName: 'unstake',
        args: [amountWei],
      })
      setInputs((prev) => ({ ...prev, unstake: '' }))
    } catch (err) {
      console.error('Unstake failed', err)
      showToast('error', err?.message ?? 'Transaction failed')
      setIsLoading((prev) => ({ ...prev, unstake: false }))
      lastTxTypeRef.current = null // Reset on error
    }
  }

  const handleClaim = async () => {
    setIsLoading((prev) => ({ ...prev, claim: true }))
    lastTxTypeRef.current = 'claim' // Track that this is a claim transaction
    showToast('pending', 'Transaction pending...')

    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingWithEmissionsAbi,
        functionName: 'claimRewards',
      })
    } catch (err) {
      console.error('Claim failed', err)
      showToast('error', err?.message ?? 'Transaction failed')
      setIsLoading((prev) => ({ ...prev, claim: false }))
      lastTxTypeRef.current = null // Reset on error
    }
  }

  const maxStake = () => {
    setInputs((prev) => ({ ...prev, stake: formatEther(balances.eth) }))
  }

  const maxUnstake = () => {
    setInputs((prev) => ({ ...prev, unstake: formatEther(balances.staked) }))
  }

  const stakeAmountWei = parseEtherSafe(inputs.stake)
  const unstakeAmountWei = parseEtherSafe(inputs.unstake)

  const stakeDisabled =
    !account ||
    !isCorrectNetwork ||
    !stakeAmountWei ||
    stakeAmountWei > balances.eth ||
    !STAKING_CONTRACT_ADDRESS ||
    isLoading.stake ||
    isPending ||
    isConfirming

  const unstakeDisabled =
    !account ||
    !isCorrectNetwork ||
    !unstakeAmountWei ||
    unstakeAmountWei > balances.staked ||
    !STAKING_CONTRACT_ADDRESS ||
    isLoading.unstake ||
    isPending ||
    isConfirming

  const claimDisabled =
    !account ||
    !isCorrectNetwork ||
    balances.pending === 0n ||
    !STAKING_CONTRACT_ADDRESS ||
    isLoading.claim ||
    isPending ||
    isConfirming

  return {
    inputs,
    setInputs,
    isLoading: {
      ...isLoading,
      stake: isLoading.stake || isPending || isConfirming,
      unstake: isLoading.unstake || isPending || isConfirming,
      claim: isLoading.claim || isPending || isConfirming,
    },
    setIsLoading,
    handleStake,
    handleUnstake,
    handleClaim,
    maxStake,
    maxUnstake,
    stakeDisabled,
    unstakeDisabled,
    claimDisabled,
    stakeAmountWei,
    unstakeAmountWei,
  }
}
