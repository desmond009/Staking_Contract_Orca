import { formatUnits } from 'viem'

export const ClaimTab = ({
  balances,
  tokenMeta,
  formatted,
  claimDisabled,
  isLoading,
  onClaim,
}) => {
  const pendingRewardsFormatted = formatUnits(balances.pending, tokenMeta.decimals)

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-center sm:rounded-2xl sm:p-6">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pending Rewards</p>
        <p className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">
          {Number(pendingRewardsFormatted).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}{' '}
          <span className="text-lg sm:text-xl md:text-2xl">{tokenMeta.symbol}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={claimDisabled}
        className="w-full rounded-xl bg-gradient-to-r from-accent to-teal-400 py-2.5 text-sm font-semibold text-black shadow-soft transition hover:from-accent hover:to-teal-300 disabled:cursor-not-allowed disabled:from-accent/40 disabled:to-teal-400/40 sm:rounded-2xl sm:py-3 sm:text-base"
      >
        {isLoading ? 'Claiming...' : 'Claim Rewards'}
      </button>
      <div className="rounded-lg border border-border/70 bg-background/60 p-3 text-[10px] text-gray-400 sm:rounded-xl sm:p-4 sm:text-xs">
        <p className="font-medium text-gray-300">Wallet balance after claim</p>
        <p className="mt-1 text-base font-semibold text-white sm:text-lg">
          {formatted.orcaBalance} {tokenMeta.symbol}
        </p>
      </div>
    </div>
  )
}

