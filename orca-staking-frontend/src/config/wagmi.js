import { createConfig, http, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { STAKING_CONTRACT_ADDRESS, ORCA_TOKEN_ADDRESS, TARGET_CHAIN_ID } from '../config'

// Determine the chain based on TARGET_CHAIN_ID
const chains = [sepolia]

// Configure multiple RPC endpoints with fallback for reliability
const sepoliaTransport = fallback([
  http('https://rpc.sepolia.org'),
  http('https://ethereum-sepolia-rpc.publicnode.com'),
  http('https://1rpc.io/sepolia'),
  http('https://rpc2.sepolia.org'),
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

