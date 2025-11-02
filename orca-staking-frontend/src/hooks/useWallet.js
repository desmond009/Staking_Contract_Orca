import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { TARGET_CHAIN_ID } from '../config'

export const useWallet = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  const isCorrectNetwork = chainId === TARGET_CHAIN_ID

  const connectWallet = async () => {
    // Try injected connector first (MetaMask), then others
    const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'metaMask')
    const connectorToUse = injectedConnector ?? connectors[0]
    
    if (!connectorToUse) {
      throw new Error('No wallet connector available')
    }

    connect({ connector: connectorToUse })
  }

  const handleSwitchNetwork = async () => {
    try {
      switchChain({ chainId: sepolia.id })
    } catch (error) {
      console.error('Failed to switch network', error)
      throw error
    }
  }

  return {
    account: address,
    isConnected,
    chainId,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet: disconnect,
    switchNetwork: handleSwitchNetwork,
    isLoading: isConnecting || isSwitchingChain,
  }
}
