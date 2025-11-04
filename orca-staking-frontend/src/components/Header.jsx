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
    <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex-1">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">ORCA Staking</h1>
        <p className="mt-1 text-[10px] text-gray-400 sm:text-xs md:text-sm">
          Stake ETH to earn ORCA emissions. Claim rewards anytime.
        </p>
      </div>
      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 sm:text-xs">
          <div className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-success' : 'bg-error'}`} />
          {isCorrectNetwork ? (
            <span className="hidden sm:inline">{TARGET_NETWORK_NAME}</span>
          ) : (
            <button
              type="button"
              onClick={onSwitchNetwork}
              className="rounded-full border border-error/40 px-2 py-1 text-[10px] text-error transition hover:border-error/80 hover:text-error/80 sm:px-2.5 sm:text-xs"
            >
              Wrong network
            </button>
          )}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {account ? (
            <div className="flex w-full items-center justify-between gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-2 text-xs sm:w-auto sm:justify-start sm:gap-2 sm:px-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-300 sm:text-xs">
                {shortenAddress(account)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="text-gray-400 transition hover:text-white active:scale-95"
                  onClick={() => navigator.clipboard?.writeText?.(account)}
                  aria-label="Copy address"
                >
                  <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-gray-400 transition hover:text-white active:scale-95"
                  onClick={onDisconnect}
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={isLoading}
              className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-accent/60 disabled:active:scale-100 sm:w-auto sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
            >
              <Wallet2 className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              <span className="sm:hidden">{isLoading ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

