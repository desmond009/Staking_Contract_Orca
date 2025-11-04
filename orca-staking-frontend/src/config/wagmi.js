import { createConfig, http, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { STAKING_CONTRACT_ADDRESS, ORCA_TOKEN_ADDRESS, TARGET_CHAIN_ID } from '../config'

// Determine the chain based on TARGET_CHAIN_ID
const chains = [sepolia]

// Use Infura RPC from environment variable as primary, with fallbacks
const RPC_URL = import.meta.env.VITE_RPC_URL;

// Create RPC transports with better error handling and timeouts
const createRPCTransport = (url, timeout = 30000, options = {}) => {
  return http(url, {
    batch: false, // Disable batching to reduce load
    timeout, // Increased timeout to 30 seconds
    // Set retryCount to 0 for providers - let fallback handle retries across providers
    // This prevents retrying on rate-limited providers
    retryCount: options.retryCount ?? 0, // Don't retry individual transports - use fallback instead
    retryDelay: (failureCount, error) => {
      // Check for resource exhaustion errors
      const isResourceError = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                             error?.message?.includes('Insufficient resources') ||
                             error?.message?.includes('net::ERR_INSUFFICIENT_RESOURCES')
      
      // Handle 429 rate limit errors with longer delays
      const is429 = error?.status === 429 || 
                   error?.message?.includes('429') ||
                   error?.message?.includes('Too Many Requests')
      
      if (isResourceError || is429) {
        // For 429/resource errors, return a long delay but transport will be skipped by fallback
        return 5000 // Short delay so fallback switches providers quickly
      }
      
      // Normal retry delay: 3s, 6s
      return Math.min(3000 * failureCount, 15000)
    },
    ...options
  })
}

// Prioritized RPC list - only use configured RPC URL
const rpcProviders = []

// Only use the configured RPC URL (QuickNode/Infura/Alchemy) - no free public RPCs
// Free public RPCs cause ERR_INSUFFICIENT_RESOURCES errors
if (RPC_URL) {
  rpcProviders.push(
    createRPCTransport(RPC_URL, 30000, { 
      retryCount: 0 // Don't retry - just fail gracefully if it doesn't work
    })
  )
} else {
  // Fallback warning if no RPC URL is configured
  console.warn('⚠️ No VITE_RPC_URL configured. Please set a reliable RPC endpoint in your .env file.')
}

// If we only have one provider, don't use fallback - just use it directly
const sepoliaTransport = rpcProviders.length === 1 
  ? rpcProviders[0] // Single provider - no fallback needed
  : fallback(rpcProviders, {
      rank: false, // Don't rank by speed, use order
      retryCount: 1, // Minimal retries to avoid rate limits
      retryDelay: (failureCount, error) => {
        // Check for resource exhaustion errors
        const isResourceError = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                               error?.message?.includes('Insufficient resources') ||
                               error?.message?.includes('net::ERR_INSUFFICIENT_RESOURCES')
        
        // Handle 429 rate limit errors - wait longer before retry
        const is429 = error?.status === 429 || 
                     error?.message?.includes('429') ||
                     error?.message?.includes('Too Many Requests')
        
        if (isResourceError || is429) {
          // Long delay on rate limit - don't retry immediately
          return 10000 // Wait 10 seconds before retry
        }
        
        // Normal delay between provider switches
        return 2000
      },
    })

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sepolia.id]: sepoliaTransport,
  },
})

export { chains }

