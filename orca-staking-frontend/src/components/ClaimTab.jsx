import { formatUnits } from 'ethers'

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
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/70 bg-background/60 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-gray-400">Pending Rewards</p>
        <p className="mt-3 text-4xl font-semibold text-white">
          {Number(pendingRewardsFormatted).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}{' '}
          {tokenMeta.symbol}
        </p>
      </div>
      <button
        type="button"
        onClick={onClaim}
        disabled={claimDisabled}
        className="w-full rounded-2xl bg-gradient-to-r from-accent to-teal-400 py-3 text-base font-semibold text-black shadow-soft transition hover:from-accent hover:to-teal-300 disabled:cursor-not-allowed disabled:from-accent/40 disabled:to-teal-400/40"
      >
        {isLoading ? 'Claiming...' : 'Claim Rewards'}
      </button>
      <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-xs text-gray-400">
        <p className="font-medium text-gray-300">Wallet balance after claim</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {formatted.orcaBalance} {tokenMeta.symbol}
        </p>
      </div>
    </div>
  )
}

