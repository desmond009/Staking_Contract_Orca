import { STAKING_CONTRACT_ADDRESS } from '../config'

export const AccountOverview = ({ formatted, tokenMeta, balances }) => {
  return (
    <section className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Account Overview</h2>
          <p className="text-xs text-gray-400">Real-time staking stats</p>
        </div>
      </div>
      {/* Debug info */}
      <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
        <p className="text-xs font-mono text-yellow-200">
          🔍 Debug: Contract {STAKING_CONTRACT_ADDRESS} | Staked Wei: {balances?.staked?.toString() || '0'} | Staked ETH: {formatted?.staked || '0.00'}
        </p>
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
  )
}

