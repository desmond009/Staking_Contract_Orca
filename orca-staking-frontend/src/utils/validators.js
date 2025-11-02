import { parseEther } from 'ethers'

/**
 * Safely parses an ether string to BigInt, returns null if invalid
 * @param {string} value - String value to parse
 * @returns {bigint|null} Parsed value in wei or null if invalid
 */
export const parseEtherSafe = (value) => {
  try {
    if (!value || Number(value) <= 0) return null
    return parseEther(value)
  } catch (error) {
    return null
  }
}

