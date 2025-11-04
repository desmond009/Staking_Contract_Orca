import { useState, useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { parseEtherSafe } from '../utils/validators'
import { STAKING_CONTRACT_ADDRESS } from '../config'

export const useStaking = (account, isCorrectNetwork, balances, refreshBalances, showToast) => {
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

  // Handle transaction success/error - only process each hash once
  useEffect(() => {
    // Only process if we have a hash and haven't processed it yet
    if (isSuccess && hash && processedHashRef.current !== hash) {
      processedHashRef.current = hash // Mark as processed
      showToast('success', 'Transaction confirmed!')
      setIsLoading({ stake: false, unstake: false, claim: false })
      
      // Don't automatically refresh balances - it causes unnecessary RPC calls
      // The UI will update naturally through normal refetch mechanisms
      // User can manually refresh if needed via the refresh button
      // This prevents rate limiting after transactions
    } else if ((isError || error) && hash && processedHashRef.current !== hash) {
      processedHashRef.current = hash // Mark as processed
      showToast('error', error?.message ?? 'Transaction failed')
      setIsLoading({ stake: false, unstake: false, claim: false })
    }
    
    // Reset processed hash when hash changes (new transaction started)
    if (hash && hash !== processedHashRef.current && !isSuccess && !isError) {
      processedHashRef.current = null
    }
  }, [isSuccess, isError, error, hash]) // Removed showToast from dependencies to prevent infinite loop

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
    }
  }

  const handleUnstake = async () => {
    const amountWei = parseEtherSafe(inputs.unstake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to unstake')
      return
    }

    setIsLoading((prev) => ({ ...prev, unstake: true }))
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
    }
  }

  const handleClaim = async () => {
    setIsLoading((prev) => ({ ...prev, claim: true }))
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
