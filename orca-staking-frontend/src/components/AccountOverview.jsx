import { STAKING_CONTRACT_ADDRESS } from '../config'

export const AccountOverview = ({ formatted, tokenMeta, balances }) => {
  return (
    <section className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">Account Overview</h2>
          <p className="text-[10px] text-gray-400 sm:text-xs">Real-time staking stats</p>
        </div>
      </div>
      {/* Debug info */}
      <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-2 sm:p-3">
        <p className="text-[10px] font-mono text-yellow-200 sm:text-xs">
          🔍 Debug: Contract {STAKING_CONTRACT_ADDRESS} | Staked Wei: {balances?.staked?.toString() || '0'} | Staked ETH: {formatted?.staked || '0.00'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-xl border border-border/70 bg-background/40 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Staked ETH</p>
          <p className="mt-1.5 text-xl font-semibold text-white sm:mt-2 sm:text-2xl">{formatted.staked}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pending {tokenMeta.symbol}</p>
          <p className="mt-1.5 text-xl font-semibold text-accent sm:mt-2 sm:text-2xl">
            {formatted.pending}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Wallet Balance</p>
          <p className="mt-1.5 text-lg font-semibold text-white sm:mt-2 sm:text-xl">{formatted.ethBalance} ETH</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3 sm:rounded-2xl sm:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pool Total</p>
          <p className="mt-1.5 text-lg font-semibold text-white sm:mt-2 sm:text-xl">{formatted.totalStaked} ETH</p>
        </div>
      </div>
    </section>
  )
}

