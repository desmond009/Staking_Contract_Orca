import { useState, useEffect, useMemo } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { stakingWithEmissionsAbi } from '../abi/stakingWithEmissions'
import { erc20Abi } from '../abi/erc20'
import {
  STAKING_CONTRACT_ADDRESS,
  ORCA_TOKEN_ADDRESS,
} from '../config'
import { ZERO_ADDRESS } from '../constants'

export const useWallet = () => {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [network, setNetwork] = useState(null)

  const refreshNetwork = async (providerInstance) => {
    try {
      const nextNetwork = await providerInstance.getNetwork()
      setNetwork(nextNetwork)
    } catch (error) {
      console.error('Failed to fetch network', error)
    }
  }

  const stakingContract = useMemo(() => {
    if (!provider) return null
    if (!STAKING_CONTRACT_ADDRESS || STAKING_CONTRACT_ADDRESS === ZERO_ADDRESS) return null
    const signerOrProvider = signer ?? provider
    return new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerOrProvider)
  }, [provider, signer])

  const stakingReadContract = useMemo(() => {
    if (!provider) return null
    if (!STAKING_CONTRACT_ADDRESS || STAKING_CONTRACT_ADDRESS === ZERO_ADDRESS) return null
    return new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, provider)
  }, [provider])

  const tokenContract = useMemo(() => {
    if (!provider) return null
    if (!ORCA_TOKEN_ADDRESS || ORCA_TOKEN_ADDRESS === ZERO_ADDRESS) return null
    const signerOrProvider = signer ?? provider
    return new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerOrProvider)
  }, [provider, signer])

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install a wallet.')
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const signerInstance = await browserProvider.getSigner()
      const address = accounts[0] ?? (await signerInstance.getAddress())

      setProvider(browserProvider)
      setSigner(signerInstance)
      setAccount(address)
      await refreshNetwork(browserProvider)
    } catch (error) {
      console.error('Wallet connection failed', error)
      throw error
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setSigner(null)
    setProvider(null)
    setNetwork(null)
  }

  const switchNetwork = async () => {
    if (!window.ethereum) return
    const { TARGET_CHAIN_ID } = await import('../config')
    const chainIdHex = `0x${Number(TARGET_CHAIN_ID).toString(16)}`
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error) {
      console.error('Failed to switch network', error)
      throw error
    }
  }

  // Initialize if already connected
  useEffect(() => {
    const initialiseIfAuthorized = async () => {
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts.length) return

      try {
        const browserProvider = new BrowserProvider(window.ethereum)
        const signerInstance = await browserProvider.getSigner()
        const address = accounts[0]

        setProvider(browserProvider)
        setSigner(signerInstance)
        setAccount(address)
        await refreshNetwork(browserProvider)
      } catch (error) {
        console.error('Failed to initialise provider', error)
      }
    }

    initialiseIfAuthorized()
  }, [])

  // Handle account and chain changes
  useEffect(() => {
    if (!window.ethereum) return undefined

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        disconnectWallet()
        return
      }

      const browserProvider = new BrowserProvider(window.ethereum)
      const signerInstance = await browserProvider.getSigner()
      const address = accounts[0]

      setProvider(browserProvider)
      setSigner(signerInstance)
      setAccount(address)
      await refreshNetwork(browserProvider)
    }

    const handleChainChanged = async () => {
      if (!window.ethereum) return
      const browserProvider = new BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      await refreshNetwork(browserProvider)
      if (account) {
        const signerInstance = await browserProvider.getSigner()
        setSigner(signerInstance)
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [account])

  return {
    provider,
    signer,
    account,
    network,
    stakingContract,
    stakingReadContract,
    tokenContract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshNetwork,
  }
}

