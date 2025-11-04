export const AccountOverview = ({ formatted, tokenMeta, balances }) => {
  return (
    <section className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white sm:text-base md:text-lg">Account Overview</h2>
          <p className="text-[10px] text-gray-400 sm:text-xs">Real-time staking stats</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-4">
        <div className="rounded-lg border border-border/70 bg-background/40 p-3 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Staked ETH</p>
          <p className="mt-1.5 text-lg font-semibold text-white sm:mt-2 sm:text-xl md:text-2xl">{formatted.staked}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pending {tokenMeta.symbol}</p>
          <p className="mt-1.5 text-lg font-semibold text-accent sm:mt-2 sm:text-xl md:text-2xl">
            {formatted.pending}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Wallet Balance</p>
          <p className="mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-lg md:text-xl">{formatted.ethBalance} ETH</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/40 p-3 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pool Total</p>
          <p className="mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-lg md:text-xl">{formatted.totalStaked} ETH</p>
        </div>
      </div>
    </section>
  )
}

