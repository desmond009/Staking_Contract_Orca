import { useEffect, useMemo, useState } from 'react'
import {
  Wallet2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  RefreshCw,
} from 'lucide-react'
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
  parseEther,
} from 'ethers'
import { stakingWithEmissionsAbi } from './abi/stakingWithEmissions'
import { erc20Abi } from './abi/erc20'
import {
  STAKING_CONTRACT_ADDRESS,
  ORCA_TOKEN_ADDRESS,
  TARGET_CHAIN_ID,
  TARGET_NETWORK_NAME,
} from './config'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const defaultBalances = {
  eth: 0n,
  staked: 0n,
  pending: 0n,
  orca: 0n,
  totalStaked: 0n,
}

const toastVariants = {
  pending: {
    icon: <RefreshCw className="h-5 w-5 animate-spin" />,
    tone: 'border-accent/60 bg-accent/20 text-accent',
    title: 'Transaction pending...',
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    tone: 'border-success/40 bg-success/15 text-success',
    title: 'Transaction confirmed!',
  },
  error: {
    icon: <AlertTriangle className="h-5 w-5 text-error" />,
    tone: 'border-error/40 bg-error/15 text-error',
    title: 'Transaction failed',
  },
}

const shortenAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

const parseEtherSafe = (value) => {
  try {
    if (!value || Number(value) <= 0) return null
    return parseEther(value)
  } catch (error) {
    return null
  }
}

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balances, setBalances] = useState(defaultBalances)
  const [tokenMeta, setTokenMeta] = useState({ symbol: 'ORCA', decimals: 18 })
  const [activeTab, setActiveTab] = useState('stake')
  const [inputs, setInputs] = useState({ stake: '', unstake: '' })
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState({
    stake: false,
    unstake: false,
    claim: false,
    connect: false,
  })

  const isCorrectNetwork = useMemo(() => {
    if (!network) return true
    try {
      return Number(network.chainId) === Number(TARGET_CHAIN_ID)
    } catch (error) {
      return false
    }
  }, [network])

  const stakingContract = useMemo(() => {
    if (!provider) return null
    if (!STAKING_CONTRACT_ADDRESS || STAKING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000')
      return null
    const signerOrProvider = signer ?? provider
    return new Contract(
      STAKING_CONTRACT_ADDRESS,
      stakingWithEmissionsAbi,
      signerOrProvider,
    )
  }, [provider, signer])

  const stakingReadContract = useMemo(() => {
    if (!provider) return null
    if (!STAKING_CONTRACT_ADDRESS || STAKING_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000')
      return null
    return new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, provider)
  }, [provider])

  const tokenContract = useMemo(() => {
    if (!provider) return null
    if (!ORCA_TOKEN_ADDRESS || ORCA_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000')
      return null
    const signerOrProvider = signer ?? provider
    return new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerOrProvider)
  }, [provider, signer])

  const formatted = useMemo(() => {
    const formatSafe = (value) => {
      try {
        return Number(parseFloat(formatEther(value))).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      } catch (error) {
        return '0.00'
      }
    }

    const formatToken = (value) => {
      try {
        return Number(
          parseFloat(formatUnits(value, tokenMeta.decimals)),
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      } catch (error) {
        return '0.00'
      }
    }

    return {
      ethBalance: formatSafe(balances.eth),
      staked: formatSafe(balances.staked),
      pending: formatToken(balances.pending),
      totalStaked: formatSafe(balances.totalStaked),
      orcaBalance: formatToken(balances.orca),
    }
  }, [balances, tokenMeta])

  const setTransactionToast = (type, message) => {
    setToast({ type, message, timestamp: Date.now() })
  }

  useEffect(() => {
    if (!toast) return undefined
    if (toast.type === 'pending') return undefined

    const timeout = setTimeout(() => {
      setToast(null)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [toast])

  const refreshNetwork = async (providerInstance) => {
    try {
      const nextNetwork = await providerInstance.getNetwork()
      setNetwork(nextNetwork)
    } catch (error) {
      console.error('Failed to fetch network', error)
    }
  }

  const loadTokenMetadata = async (contractOverride) => {
    const contractToUse = contractOverride ?? tokenContract
    if (!contractToUse) return
    try {
      const [decimals, symbol] = await Promise.all([
        contractToUse.decimals(),
        contractToUse.symbol(),
      ])
      setTokenMeta({
        decimals: Number(decimals),
        symbol: symbol || 'ORCA',
      })
    } catch (error) {
      console.warn('Unable to load token metadata', error)
    }
  }

  const refreshBalances = async ({
    providerOverride,
    signerOverride,
    accountOverride,
    stakingOverride,
    stakingReadOverride,
    tokenOverride,
  } = {}) => {
    const providerToUse = providerOverride ?? provider
    const signerToUse = signerOverride ?? signer
    const accountToUse = accountOverride ?? account

    if (
      !providerToUse ||
      !signerToUse ||
      !accountToUse ||
      !STAKING_CONTRACT_ADDRESS ||
      STAKING_CONTRACT_ADDRESS === ZERO_ADDRESS
    ) {
      return
    }

    const stakingForAccount =
      stakingOverride ??
      stakingContract ??
      new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerToUse)

    const stakingForReads =
      stakingReadOverride ??
      stakingReadContract ??
      new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, providerToUse)

    const tokenForReads =
      tokenOverride ??
      tokenContract ??
      (ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS
        ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerToUse)
        : null)

    try {
      const [ethBalance, userData, pendingRewards, totalStakeValue, orcaBalance] =
        await Promise.all([
          providerToUse.getBalance(accountToUse),
          stakingForAccount.userInfo(accountToUse),
          stakingForAccount.getRewards(),
          stakingForReads?.totalStake?.() ?? Promise.resolve(0n),
          tokenForReads ? tokenForReads.balanceOf(accountToUse) : Promise.resolve(0n),
        ])

      const userStake =
        userData?.stakedAmount ?? userData?.amountStaked ?? userData?.[0] ?? 0n

      setBalances({
        eth: ethBalance,
        staked: userStake,
        pending: pendingRewards,
        orca: orcaBalance,
        totalStaked: totalStakeValue,
      })
    } catch (error) {
      console.error('Failed to refresh balances', error)
    }
  }

  const refreshPendingRewards = async () => {
    if (!stakingContract || !account) return
    try {
      const pendingRewards = await stakingContract.getRewards()
      setBalances((prev) => ({ ...prev, pending: pendingRewards }))
    } catch (error) {
      console.error('Failed to fetch pending rewards', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      setTransactionToast('error', 'MetaMask not detected. Please install a wallet.')
      return
    }

    setIsLoading((prev) => ({ ...prev, connect: true }))
    try {
      const browserProvider = new BrowserProvider(window.ethereum)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const signerInstance = await browserProvider.getSigner()
      const address = accounts[0] ?? (await signerInstance.getAddress())

      const stakingForSigner =
        STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
          ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerInstance)
          : null

      const stakingForRead =
        STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
          ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, browserProvider)
          : null

      const tokenForSigner =
        ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS
          ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerInstance)
          : null

      setProvider(browserProvider)
      setSigner(signerInstance)
      setAccount(address)
      await refreshNetwork(browserProvider)
      await loadTokenMetadata(tokenForSigner)
      await refreshBalances({
        providerOverride: browserProvider,
        signerOverride: signerInstance,
        accountOverride: address,
        stakingOverride: stakingForSigner ?? undefined,
        stakingReadOverride: stakingForRead ?? undefined,
        tokenOverride: tokenForSigner ?? undefined,
      })
    } catch (error) {
      console.error('Wallet connection failed', error)
      setTransactionToast('error', error.message ?? 'Wallet connection failed')
    } finally {
      setIsLoading((prev) => ({ ...prev, connect: false }))
    }
  }

  useEffect(() => {
    const initialiseIfAuthorized = async () => {
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts.length) return

      try {
        const browserProvider = new BrowserProvider(window.ethereum)
        const signerInstance = await browserProvider.getSigner()
        const address = accounts[0]

        const stakingForSigner =
          STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
            ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerInstance)
            : null

        const stakingForRead =
          STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
            ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, browserProvider)
            : null

        const tokenForSigner =
          ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS
            ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerInstance)
            : null

        setProvider(browserProvider)
        setSigner(signerInstance)
        setAccount(address)
        await refreshNetwork(browserProvider)
        await loadTokenMetadata(tokenForSigner)
        await refreshBalances({
          providerOverride: browserProvider,
          signerOverride: signerInstance,
          accountOverride: address,
          stakingOverride: stakingForSigner ?? undefined,
          stakingReadOverride: stakingForRead ?? undefined,
          tokenOverride: tokenForSigner ?? undefined,
        })
      } catch (error) {
        console.error('Failed to initialise provider', error)
      }
    }

    initialiseIfAuthorized()
  }, [])

  useEffect(() => {
    if (!window.ethereum) return undefined

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setAccount(null)
        setSigner(null)
        setBalances(defaultBalances)
        return
      }

      const browserProvider = new BrowserProvider(window.ethereum)
      const signerInstance = await browserProvider.getSigner()
      const address = accounts[0]

      const stakingForSigner =
        STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
          ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerInstance)
          : null

      const stakingForRead =
        STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
          ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, browserProvider)
          : null

      const tokenForSigner =
        ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS
          ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerInstance)
          : null

      setProvider(browserProvider)
      setSigner(signerInstance)
      setAccount(address)
      await refreshNetwork(browserProvider)
      await loadTokenMetadata(tokenForSigner)
      await refreshBalances({
        providerOverride: browserProvider,
        signerOverride: signerInstance,
        accountOverride: address,
        stakingOverride: stakingForSigner ?? undefined,
        stakingReadOverride: stakingForRead ?? undefined,
        tokenOverride: tokenForSigner ?? undefined,
      })
    }

    const handleChainChanged = async () => {
      if (!window.ethereum) return
      const browserProvider = new BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      await refreshNetwork(browserProvider)
      if (account) {
        const signerInstance = await browserProvider.getSigner()

        const stakingForSigner =
          STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
            ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, signerInstance)
            : null

        const stakingForRead =
          STAKING_CONTRACT_ADDRESS && STAKING_CONTRACT_ADDRESS !== ZERO_ADDRESS
            ? new Contract(STAKING_CONTRACT_ADDRESS, stakingWithEmissionsAbi, browserProvider)
            : null

        const tokenForSigner =
          ORCA_TOKEN_ADDRESS && ORCA_TOKEN_ADDRESS !== ZERO_ADDRESS
            ? new Contract(ORCA_TOKEN_ADDRESS, erc20Abi, signerInstance)
            : null

        setSigner(signerInstance)
        await loadTokenMetadata(tokenForSigner)
        await refreshBalances({
          providerOverride: browserProvider,
          signerOverride: signerInstance,
          accountOverride: account,
          stakingOverride: stakingForSigner ?? undefined,
          stakingReadOverride: stakingForRead ?? undefined,
          tokenOverride: tokenForSigner ?? undefined,
        })
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [account])

  useEffect(() => {
    if (!account || !stakingContract) return undefined

    refreshBalances()
    loadTokenMetadata()

    const interval = setInterval(() => {
      refreshPendingRewards()
    }, 10000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, stakingContract])

  const disconnectWallet = () => {
    setAccount(null)
    setSigner(null)
    setBalances(defaultBalances)
    setInputs({ stake: '', unstake: '' })
  }

  const executeTransaction = async (action, callback) => {
    if (!signer || !stakingContract) {
      setTransactionToast('error', 'Connect your wallet to continue')
      return
    }

    setIsLoading((prev) => ({ ...prev, [action]: true }))
    setTransactionToast('pending', 'Transaction pending...')

    try {
      const tx = await callback()
      await tx.wait()
      setTransactionToast('success', 'Transaction confirmed!')
      await refreshBalances()
    } catch (error) {
      console.error(`${action} failed`, error)
      setTransactionToast('error', error?.shortMessage ?? error?.message ?? 'Transaction failed')
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }))
    }
  }

  const handleStake = async () => {
    const amountWei = parseEtherSafe(inputs.stake)
    if (!amountWei) {
      setTransactionToast('error', 'Enter a valid amount of ETH to stake')
      return
    }

    await executeTransaction('stake', () =>
      stakingContract.stake(amountWei, { value: amountWei }),
    )
    setInputs((prev) => ({ ...prev, stake: '' }))
  }

  const handleUnstake = async () => {
    const amountWei = parseEtherSafe(inputs.unstake)
    if (!amountWei) {
      setTransactionToast('error', 'Enter a valid amount of ETH to unstake')
      return
    }

    await executeTransaction('unstake', () => stakingContract.unstake(amountWei))
    setInputs((prev) => ({ ...prev, unstake: '' }))
  }

  const handleClaim = async () => {
    await executeTransaction('claim', () => stakingContract.claimEmissions())
  }

  const maxStake = () => {
    setInputs((prev) => ({ ...prev, stake: formatEther(balances.eth) }))
  }

  const maxUnstake = () => {
    setInputs((prev) => ({ ...prev, unstake: formatEther(balances.staked) }))
  }

  const stakeAmountWei = parseEtherSafe(inputs.stake)
  const unstakeAmountWei = parseEtherSafe(inputs.unstake)
  const pendingRewardsFormatted = formatUnits(balances.pending, tokenMeta.decimals)

  const stakeDisabled =
    !account ||
    !isCorrectNetwork ||
    !stakeAmountWei ||
    stakeAmountWei > balances.eth ||
    !stakingContract ||
    isLoading.stake

  const unstakeDisabled =
    !account ||
    !isCorrectNetwork ||
    !unstakeAmountWei ||
    unstakeAmountWei > balances.staked ||
    !stakingContract ||
    isLoading.unstake

  const claimDisabled =
    !account ||
    !isCorrectNetwork ||
    balances.pending === 0n ||
    !stakingContract ||
    isLoading.claim

  const switchNetwork = async () => {
    if (!window.ethereum) return
    const chainIdHex = `0x${Number(TARGET_CHAIN_ID).toString(16)}`
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error) {
      console.error('Failed to switch network', error)
      setTransactionToast('error', error?.message ?? 'Unable to switch network')
    }
  }

  const renderToast = () => {
    if (!toast) return null
    const variant = toastVariants[toast.type] ?? toastVariants.pending

    return (
      <div className="fixed top-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2">
        <div
          className={`flex items-start gap-3 rounded-xl border px-5 py-4 shadow-lg backdrop-blur ${variant.tone}`}
        >
          <div className="mt-1">{variant.icon}</div>
          <div className="flex-1 text-sm">
            <p className="font-medium">{variant.title}</p>
            {toast.message ? <p className="mt-1 text-xs opacity-80">{toast.message}</p> : null}
          </div>
          {toast.type !== 'pending' ? (
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-xs text-gray-400 transition hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/95 bg-[radial-gradient(circle_at_top_left,_rgba(50,184,198,0.15),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_55%)] text-white">
      {renderToast()}
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">ORCA Staking</h1>
              <p className="mt-1 text-sm text-gray-400">
                Stake ETH to earn ORCA emissions. Claim rewards anytime.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-success' : 'bg-error'}`} />
                {isCorrectNetwork ? (
                  <span>{TARGET_NETWORK_NAME}</span>
                ) : (
                  <button
                    type="button"
                    onClick={switchNetwork}
                    className="rounded-full border border-error/40 px-2.5 py-1 text-error transition hover:border-error/80 hover:text-error/80"
                  >
                    Wrong network
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {account ? (
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs">
                    <span className="font-mono uppercase tracking-wider text-gray-300">
                      {shortenAddress(account)}
                    </span>
                    <button
                      type="button"
                      className="text-gray-400 transition hover:text-white"
                      onClick={() => navigator.clipboard?.writeText?.(account)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 transition hover:text-white"
                      onClick={disconnectWallet}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={connectWallet}
                    disabled={isLoading.connect}
                    className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/60"
                  >
                    <Wallet2 className="h-4 w-4" />
                    {isLoading.connect ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-soft backdrop-blur">
            {account ? (
              <section className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Account Overview</h2>
                    <p className="text-xs text-gray-400">Real-time staking stats</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Staked ETH</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatted.staked}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Pending {tokenMeta.symbol}</p>
                    <p className="mt-2 text-2xl font-semibold text-accent">
                      {formatted.pending}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Wallet Balance</p>
                    <p className="mt-2 text-xl font-semibold text-white">{formatted.ethBalance} ETH</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Pool Total</p>
                    <p className="mt-2 text-xl font-semibold text-white">{formatted.totalStaked} ETH</p>
                  </div>
                </div>
              </section>
            ) : (
              <div className="mb-6 rounded-2xl border border-border/80 bg-background/40 p-6 text-center">
                <p className="text-sm text-gray-400">
                  Connect your wallet to stake ETH and start earning ORCA emissions.
                </p>
              </div>
            )}

            <nav className="mb-6 flex items-center gap-6 border-b border-border/60">
              {[
                { id: 'stake', label: 'Stake ETH' },
                { id: 'unstake', label: 'Unstake ETH' },
                { id: 'claim', label: 'Claim Rewards' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id ? (
                    <span className="mt-3 block h-0.5 w-full rounded-full bg-accent" />
                  ) : (
                    <span className="mt-3 block h-0.5 w-full rounded-full bg-transparent" />
                  )}
                </button>
              ))}
            </nav>

            {activeTab === 'stake' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-gray-400">Amount</label>
                  <div className="mt-2 flex rounded-2xl border border-border/70 bg-background/60 p-4 focus-within:border-accent/70">
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      value={inputs.stake}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, stake: event.target.value }))
                      }
                      className="w-full bg-transparent text-2xl font-semibold text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={maxStake}
                      className="ml-4 rounded-full border border-border/60 px-3 py-1 text-xs text-gray-300 transition hover:border-accent/50 hover:text-white"
                    >
                      Max
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Balance: {formatted.ethBalance} ETH</span>
                    {stakeAmountWei && stakeAmountWei > balances.eth ? (
                      <span className="text-error">Insufficient balance</span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStake}
                  disabled={stakeDisabled}
                  className="w-full rounded-2xl bg-accent py-3 text-base font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/50"
                >
                  {isLoading.stake ? 'Staking...' : 'Stake ETH'}
                </button>
                <p className="text-xs text-gray-500">
                  Staking will lock your ETH in the contract and start accruing ORCA emissions in
                  real time.
                </p>
              </div>
            ) : null}

            {activeTab === 'unstake' ? (
              <div className="space-y-4">
      <div>
                  <label className="text-xs uppercase text-gray-400">Amount</label>
                  <div className="mt-2 flex rounded-2xl border border-border/70 bg-background/60 p-4 focus-within:border-accent/70">
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      value={inputs.unstake}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, unstake: event.target.value }))
                      }
                      className="w-full bg-transparent text-2xl font-semibold text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={maxUnstake}
                      className="ml-4 rounded-full border border-border/60 px-3 py-1 text-xs text-gray-300 transition hover:border-accent/50 hover:text-white"
                    >
                      Max
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Staked: {formatted.staked} ETH</span>
                    {unstakeAmountWei && unstakeAmountWei > balances.staked ? (
                      <span className="text-error">Exceeds staked amount</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/60 p-3 text-xs text-gray-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-accent" />
                  <p>Unstaking updates your rewards and stops emissions on the unstaked amount.</p>
                </div>
                <button
                  type="button"
                  onClick={handleUnstake}
                  disabled={unstakeDisabled}
                  className="w-full rounded-2xl border border-accent/50 bg-transparent py-3 text-base font-semibold text-accent transition hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-accent/20 disabled:text-accent/40"
                >
                  {isLoading.unstake ? 'Unstaking...' : 'Unstake ETH'}
                </button>
              </div>
            ) : null}

            {activeTab === 'claim' ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border/70 bg-background/60 p-6 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Pending Rewards</p>
                  <p className="mt-3 text-4xl font-semibold text-white">
                    {Number(pendingRewardsFormatted).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{' '}
                    {tokenMeta.symbol}
                  </p>
      </div>
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claimDisabled}
                  className="w-full rounded-2xl bg-gradient-to-r from-accent to-teal-400 py-3 text-base font-semibold text-black shadow-soft transition hover:from-accent hover:to-teal-300 disabled:cursor-not-allowed disabled:from-accent/40 disabled:to-teal-400/40"
                >
                  {isLoading.claim ? 'Claiming...' : 'Claim Rewards'}
        </button>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-xs text-gray-400">
                  <p className="font-medium text-gray-300">Wallet balance after claim</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatted.orcaBalance} {tokenMeta.symbol}
                  </p>
                </div>
              </div>
            ) : null}

            {!isCorrectNetwork && account ? (
              <div className="mt-6 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">
                <p className="font-medium">Wrong network detected.</p>
                <p className="mt-1 text-xs text-error/80">
                  Please switch to {TARGET_NETWORK_NAME} to interact with the staking contract.
                </p>
              </div>
            ) : null}

            {!window.ethereum ? (
              <div className="mt-6 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">
                <p className="font-medium">No wallet detected</p>
                <p className="mt-1 text-xs text-error/80">
                  Install MetaMask or another Ethereum-compatible wallet to start staking.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
