import { createConfig, http, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { STAKING_CONTRACT_ADDRESS, ORCA_TOKEN_ADDRESS, TARGET_CHAIN_ID } from '../config'

// Determine the chain based on TARGET_CHAIN_ID
const chains = [sepolia]

// Use Infura RPC from environment variable as primary, with fallbacks
const RPC_URL = import.meta.env.VITE_RPC_URL;
const sepoliaTransport = fallback([
  http(RPC_URL, {
    batch: false, // Disable batching to reduce load
    fetchOptions: {
      timeout: 10000, // 10 second timeout
    },
  }),
  // Fallback RPCs if Infura fails
  http('https://ethereum-sepolia-rpc.publicnode.com', {
    batch: false,
    fetchOptions: {
      timeout: 10000,
    },
  }),
  http('https://rpc.sepolia.org', {
    batch: false,
    fetchOptions: {
      timeout: 10000,
    },
  }),
  http('https://1rpc.io/sepolia', {
    batch: false,
    fetchOptions: {
      timeout: 10000,
    },
  }),
])

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

