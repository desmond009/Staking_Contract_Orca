import { useState } from 'react'
import { formatEther } from 'ethers'
import { parseEtherSafe } from '../utils/validators'

export const useStaking = (stakingContract, signer, account, isCorrectNetwork, balances, refreshBalances, showToast) => {
  const [inputs, setInputs] = useState({ stake: '', unstake: '' })
  const [isLoading, setIsLoading] = useState({
    stake: false,
    unstake: false,
    claim: false,
    connect: false,
  })

  const executeTransaction = async (action, callback) => {
    if (!signer || !stakingContract) {
      showToast('error', 'Connect your wallet to continue')
      return
    }

    setIsLoading((prev) => ({ ...prev, [action]: true }))
    showToast('pending', 'Transaction pending...')

    try {
      const tx = await callback()
      await tx.wait()
      showToast('success', 'Transaction confirmed!')
      await refreshBalances()
    } catch (error) {
      console.error(`${action} failed`, error)
      showToast('error', error?.shortMessage ?? error?.message ?? 'Transaction failed')
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }))
    }
  }

  const handleStake = async () => {
    const amountWei = parseEtherSafe(inputs.stake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to stake')
      return
    }

    await executeTransaction('stake', () =>
      stakingContract.stake(amountWei, { value: amountWei }),
    )
    setInputs((prev) => ({ ...prev, stake: '' }))
  }

  const handleUnstake = async () => {
    const amountWei = parseEtherSafe(inputs.unstake)
    if (!amountWei) {
      showToast('error', 'Enter a valid amount of ETH to unstake')
      return
    }

    await executeTransaction('unstake', () => stakingContract.unstake(amountWei))
    setInputs((prev) => ({ ...prev, unstake: '' }))
  }

  const handleClaim = async () => {
    await executeTransaction('claim', () => stakingContract.claimEmissions())
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
    !stakingContract ||
    isLoading.stake

  const unstakeDisabled =
    !account ||
    !isCorrectNetwork ||
    !unstakeAmountWei ||
    unstakeAmountWei > balances.staked ||
    !stakingContract ||
    isLoading.unstake

  const claimDisabled =
    !account ||
    !isCorrectNetwork ||
    balances.pending === 0n ||
    !stakingContract ||
    isLoading.claim

  return {
    inputs,
    setInputs,
    isLoading,
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

