import { Wallet2, LogOut, Copy } from 'lucide-react'
import { shortenAddress } from '../utils/formatters'
import { TARGET_NETWORK_NAME } from '../config'

export const Header = ({
  account,
  isCorrectNetwork,
  isLoading,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}) => {
  return (
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
              onClick={onSwitchNetwork}
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
                onClick={onDisconnect}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              <Wallet2 className="h-4 w-4" />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

