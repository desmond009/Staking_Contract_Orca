import { TARGET_CHAIN_ID } from '../config'

/**
 * Checks if the current network matches the target network
 * @param {object} network - Network object from provider
 * @returns {boolean} True if network matches target
 */
export const isCorrectNetwork = (network) => {
  if (!network) return true
  try {
    return Number(network.chainId) === Number(TARGET_CHAIN_ID)
  } catch (error) {
    return false
  }
}

/**
 * Gets the hex chain ID for wallet switching
 * @param {number} chainId - Decimal chain ID
 * @returns {string} Hex chain ID (0x...)
 */
export const getChainIdHex = (chainId) => {
  return `0x${Number(chainId).toString(16)}`
}

