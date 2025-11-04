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

// Prioritized RPC list - more reliable providers first
const rpcProviders = []

// Add reliable public RPCs first (no rate limits or higher limits)
// Set retryCount to 0 for all - let fallback handle provider switching
rpcProviders.push(
  // Public node (reliable, no rate limits)
  createRPCTransport('https://ethereum-sepolia-rpc.publicnode.com', 30000, { retryCount: 0 }),
  // Sepolia Foundation RPC (official, more reliable)
  createRPCTransport('https://rpc.sepolia.org', 30000, { retryCount: 0 }),
  // Additional fallback (reliable)
  createRPCTransport('https://1rpc.io/sepolia', 30000, { retryCount: 0 }),
)

// Add primary RPC (Infura) last if provided - it's rate limited
// This way fallbacks are tried first if primary fails
if (RPC_URL) {
  rpcProviders.push(
    createRPCTransport(RPC_URL, 30000, { 
      retryCount: 0 // Don't retry - use fallbacks instead
    })
  )
}

const sepoliaTransport = fallback(rpcProviders, {
  rank: false, // Don't rank by speed, use order
  retryCount: 2, // Reduced retries across all providers to avoid rate limits
  retryDelay: (failureCount, error) => {
    // Check for resource exhaustion errors
    const isResourceError = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                           error?.message?.includes('Insufficient resources') ||
                           error?.message?.includes('net::ERR_INSUFFICIENT_RESOURCES')
    
    // Handle 429 rate limit errors - skip provider immediately
    const is429 = error?.status === 429 || 
                 error?.message?.includes('429') ||
                 error?.message?.includes('Too Many Requests')
    
    if (isResourceError || is429) {
      // Immediate switch to next provider on rate limit or resource error
      return 100
    }
    
    // Normal delay between provider switches
    return 1000
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

