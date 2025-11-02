import { useState, useMemo } from 'react'
import { useWallet } from './hooks/useWallet'
import { useBalances } from './hooks/useBalances'
import { useToast } from './hooks/useToast.jsx'
import { useStaking } from './hooks/useStaking'
import { formatBalances } from './utils/formatters'
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
    account,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isLoading: walletLoading,
  } = useWallet()

  const {
    balances,
    tokenMeta,
    refreshBalances,
  } = useBalances(account, isConnected)

  const { showToast, ToastComponent } = useToast()

  const formatted = useMemo(
    () => formatBalances(balances, tokenMeta),
    [balances, tokenMeta]
  )

  const {
    inputs,
    setInputs,
    isLoading,
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
  } = useStaking(account, isCorrectNetwork, balances, refreshBalances, showToast)

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      showToast('error', error.message ?? 'Wallet connection failed')
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
            isCorrectNetwork={isCorrectNetwork}
            isLoading={walletLoading}
            onConnect={handleConnectWallet}
            onDisconnect={disconnectWallet}
            onSwitchNetwork={handleSwitchNetwork}
          />

          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-soft backdrop-blur">
            {account ? (
              <AccountOverview formatted={formatted} tokenMeta={tokenMeta} balances={balances} />
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

            <NetworkWarning 
              account={account} 
              isCorrectNetwork={isCorrectNetwork}
              onSwitchNetwork={handleSwitchNetwork} 
            />
            <NoWalletWarning />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
