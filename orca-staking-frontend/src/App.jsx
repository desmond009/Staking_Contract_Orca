import { useState, useMemo, useEffect } from 'react'
import { useWallet } from './hooks/useWallet'
import { useBalances } from './hooks/useBalances'
import { useToast } from './hooks/useToast.jsx'
import { useStaking } from './hooks/useStaking'
import { formatBalances } from './utils/formatters'
import { isCorrectNetwork } from './utils/network'
import {
  Header,
  AccountOverview,
  TabNavigation,
  StakeTab,
  UnstakeTab,
  ClaimTab,
  NetworkWarning,
  NoWalletWarning,
} from './components'

function App() {
  const [activeTab, setActiveTab] = useState('stake')

  const {
    provider,
    signer,
    account,
    network,
    stakingContract,
    stakingReadContract,
    tokenContract,
    connectWallet: connectWalletHook,
    disconnectWallet,
    switchNetwork,
  } = useWallet()

  const {
    balances,
    tokenMeta,
    refreshBalances,
    loadTokenMetadata,
  } = useBalances(provider, signer, account, stakingContract, stakingReadContract, tokenContract)

  const { showToast, ToastComponent } = useToast()

  const networkCorrect = useMemo(() => isCorrectNetwork(network), [network])

  const formatted = useMemo(
    () => formatBalances(balances, tokenMeta),
    [balances, tokenMeta]
  )

  const {
    inputs,
    setInputs,
    isLoading,
    setIsLoading,
    handleStake,
    handleUnstake,
    handleClaim,
    maxStake,
    maxUnstake,
    stakeDisabled,
    unstakeDisabled,
    claimDisabled,
    stakeAmountWei,
    unstakeAmountWei,
  } = useStaking(stakingContract, signer, account, networkCorrect, balances, refreshBalances, showToast)

  const connectWallet = async () => {
    setIsLoading((prev) => ({ ...prev, connect: true }))
    try {
      await connectWalletHook()
      // After connecting, refresh balances and load metadata
      await refreshBalances()
      if (tokenContract) {
        await loadTokenMetadata()
      }
    } catch (error) {
      showToast('error', error.message ?? 'Wallet connection failed')
    } finally {
      setIsLoading((prev) => ({ ...prev, connect: false }))
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork()
    } catch (error) {
      showToast('error', error?.message ?? 'Unable to switch network')
    }
  }

  return (
    <div className="min-h-screen bg-background/95 bg-[radial-gradient(circle_at_top_left,_rgba(50,184,198,0.15),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_55%)] text-white">
      <ToastComponent />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <Header
            account={account}
            isCorrectNetwork={networkCorrect}
            isLoading={isLoading.connect}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            onSwitchNetwork={handleSwitchNetwork}
          />

          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-soft backdrop-blur">
            {account ? (
              <AccountOverview formatted={formatted} tokenMeta={tokenMeta} />
            ) : (
              <div className="mb-6 rounded-2xl border border-border/80 bg-background/40 p-6 text-center">
                <p className="text-sm text-gray-400">
                  Connect your wallet to stake ETH and start earning ORCA emissions.
                </p>
              </div>
            )}

            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'stake' && (
              <StakeTab
                inputs={inputs}
                setInputs={setInputs}
                formatted={formatted}
                balances={balances}
                stakeAmountWei={stakeAmountWei}
                stakeDisabled={stakeDisabled}
                isLoading={isLoading.stake}
                onMaxClick={maxStake}
                onStake={handleStake}
              />
            )}

            {activeTab === 'unstake' && (
              <UnstakeTab
                inputs={inputs}
                setInputs={setInputs}
                formatted={formatted}
                balances={balances}
                unstakeAmountWei={unstakeAmountWei}
                unstakeDisabled={unstakeDisabled}
                isLoading={isLoading.unstake}
                onMaxClick={maxUnstake}
                onUnstake={handleUnstake}
              />
            )}

            {activeTab === 'claim' && (
              <ClaimTab
                balances={balances}
                tokenMeta={tokenMeta}
                formatted={formatted}
                claimDisabled={claimDisabled}
                isLoading={isLoading.claim}
                onClaim={handleClaim}
              />
            )}

            <NetworkWarning account={account} onSwitchNetwork={handleSwitchNetwork} />
            <NoWalletWarning />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
