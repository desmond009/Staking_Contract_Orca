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
      <div className="rounded-lg border border-border/70 bg-background/60 p-4 text-center sm:rounded-xl sm:p-5 md:rounded-2xl md:p-6">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 sm:text-xs">Pending Rewards</p>
        <p className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl md:text-3xl lg:text-4xl">
          {Number(pendingRewardsFormatted).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}{' '}
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl">{tokenMeta.symbol}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={claimDisabled}
        className="w-full min-h-[48px] rounded-lg bg-gradient-to-r from-accent to-teal-400 py-3 text-sm font-semibold text-black shadow-soft transition hover:from-accent hover:to-teal-300 active:scale-95 disabled:cursor-not-allowed disabled:from-accent/40 disabled:to-teal-400/40 disabled:active:scale-100 sm:min-h-[44px] sm:rounded-xl sm:py-2.5 sm:text-base md:rounded-2xl md:py-3"
      >
        {isLoading ? 'Claiming...' : 'Claim Rewards'}
      </button>
      <div className="rounded-lg border border-border/70 bg-background/60 p-3 text-[10px] text-gray-400 sm:rounded-xl sm:p-4 sm:text-xs">
        <p className="font-medium text-gray-300">Wallet balance after claim</p>
        <p className="mt-1 text-sm font-semibold text-white sm:text-base md:text-lg">
          {formatted.orcaBalance} {tokenMeta.symbol}
        </p>
      </div>
    </div>
  )
}

