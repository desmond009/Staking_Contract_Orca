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
    <header className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">ORCA Staking</h1>
        <p className="mt-1 text-xs text-gray-400 sm:text-sm">
          Stake ETH to earn ORCA emissions. Claim rewards anytime.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-success' : 'bg-error'}`} />
          {isCorrectNetwork ? (
            <span className="hidden sm:inline">{TARGET_NETWORK_NAME}</span>
          ) : (
            <button
              type="button"
              onClick={onSwitchNetwork}
              className="rounded-full border border-error/40 px-2.5 py-1 text-xs text-error transition hover:border-error/80 hover:text-error/80 sm:text-xs"
            >
              Wrong network
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {account ? (
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs sm:gap-2 sm:px-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-300 sm:text-xs">
                {shortenAddress(account)}
              </span>
              <button
                type="button"
                className="text-gray-400 transition hover:text-white"
                onClick={() => navigator.clipboard?.writeText?.(account)}
              >
                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <button
                type="button"
                className="text-gray-400 transition hover:text-white"
                onClick={onDisconnect}
              >
                <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/60 sm:px-4 sm:py-2 sm:text-sm"
            >
              <Wallet2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              <span className="sm:hidden">{isLoading ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

