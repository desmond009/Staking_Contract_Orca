import { formatEther, formatUnits } from 'ethers'

/**
 * Shortens an Ethereum address to a readable format
 * @param {string} address - The full Ethereum address
 * @returns {string} Shortened address (0x1234...5678)
 */
export const shortenAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

/**
 * Formats a BigInt ETH value to a readable string
 * @param {bigint} value - Value in wei
 * @returns {string} Formatted ETH value
 */
export const formatEth = (value) => {
  try {
    return Number(parseFloat(formatEther(value))).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  } catch (error) {
    return '0.00'
  }
}

/**
 * Formats a BigInt token value to a readable string
 * @param {bigint} value - Value in token units
 * @param {number} decimals - Token decimals
 * @returns {string} Formatted token value
 */
export const formatToken = (value, decimals = 18) => {
  try {
    return Number(parseFloat(formatUnits(value, decimals))).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  } catch (error) {
    return '0.00'
  }
}

/**
 * Formats balances for display
 * @param {object} balances - Balance object
 * @param {object} tokenMeta - Token metadata
 * @returns {object} Formatted balance object
 */
export const formatBalances = (balances, tokenMeta) => {
  return {
    ethBalance: formatEth(balances.eth),
    staked: formatEth(balances.staked),
    pending: formatToken(balances.pending, tokenMeta.decimals),
    totalStaked: formatEth(balances.totalStaked),
    orcaBalance: formatToken(balances.orca, tokenMeta.decimals),
  }
}

