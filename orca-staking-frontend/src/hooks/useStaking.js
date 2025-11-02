import { useState, useEffect } from 'react'
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

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle transaction success/error
  useEffect(() => {
    if (isSuccess) {
      showToast('success', 'Transaction confirmed!')
      refreshBalances()
      setIsLoading({ stake: false, unstake: false, claim: false })
    } else if (isError || error) {
      showToast('error', error?.message ?? 'Transaction failed')
      setIsLoading({ stake: false, unstake: false, claim: false })
    }
  }, [isSuccess, isError, error, showToast, refreshBalances])

  const handleStake = async () => {
    const amountWei = parseEtherSafe(inputs.stake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to stake')
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
        functionName: 'claimEmissions',
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
