import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { STAKING_CONTRACT_ADDRESS, ORCA_TOKEN_ADDRESS, TARGET_CHAIN_ID } from '../config'

// Determine the chain based on TARGET_CHAIN_ID
const chains = [sepolia]

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})

export { chains }

