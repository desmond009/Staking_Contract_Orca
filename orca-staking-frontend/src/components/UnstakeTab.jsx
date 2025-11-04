import { AlertTriangle } from 'lucide-react'

export const UnstakeTab = ({
  inputs,
  setInputs,
  formatted,
  balances,
  unstakeAmountWei,
  unstakeDisabled,
  isLoading,
  onMaxClick,
  onUnstake,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="text-[10px] uppercase text-gray-400 sm:text-xs">Amount</label>
        <div className="mt-2 flex rounded-xl border border-border/70 bg-background/60 p-3 focus-within:border-accent/70 sm:rounded-2xl sm:p-4">
          <input
            type="number"
            placeholder="0.00"
            min="0"
            value={inputs.unstake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, unstake: event.target.value }))
            }
            className="w-full bg-transparent text-lg font-semibold text-white focus:outline-none sm:text-xl md:text-2xl"
          />
          <button
            type="button"
            onClick={onMaxClick}
            className="ml-2 rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-gray-300 transition hover:border-accent/50 hover:text-white sm:ml-4 sm:px-3 sm:text-xs"
          >
            Max
          </button>
        </div>
        <div className="mt-2 flex flex-col items-start justify-between gap-1 text-[10px] text-gray-500 sm:flex-row sm:text-xs">
          <span>Staked: {formatted.staked} ETH</span>
          {unstakeAmountWei && unstakeAmountWei > balances.staked ? (
            <span className="text-error">Exceeds staked amount</span>
          ) : null}
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-background/60 p-2.5 text-[10px] text-gray-400 sm:rounded-xl sm:p-3 sm:text-xs">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent sm:h-4 sm:w-4" />
        <p>Unstaking updates your rewards and stops emissions on the unstaked amount.</p>
      </div>
      <button
        type="button"
        onClick={onUnstake}
        disabled={unstakeDisabled}
        className="w-full rounded-xl border border-accent/50 bg-transparent py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-accent/20 disabled:text-accent/40 sm:rounded-2xl sm:py-3 sm:text-base"
      >
        {isLoading ? 'Unstaking...' : 'Unstake ETH'}
      </button>
    </div>
  )
}

