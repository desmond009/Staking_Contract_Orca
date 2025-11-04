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
        <div className="mt-2 flex rounded-lg border border-border/70 bg-background/60 p-3 focus-within:border-accent/70 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="any"
            value={inputs.unstake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, unstake: event.target.value }))
            }
            className="w-full bg-transparent text-base font-semibold text-white placeholder:text-gray-600 focus:outline-none sm:text-lg md:text-xl lg:text-2xl"
          />
          <button
            type="button"
            onClick={onMaxClick}
            className="ml-2 min-h-[32px] rounded-full border border-border/60 px-3 py-1.5 text-[10px] text-gray-300 transition hover:border-accent/50 hover:text-white active:scale-95 sm:ml-4 sm:min-h-0 sm:px-3 sm:py-1 sm:text-xs"
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
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent sm:h-4 sm:w-4" />
        <p className="leading-relaxed">Unstaking updates your rewards and stops emissions on the unstaked amount.</p>
      </div>
      <button
        type="button"
        onClick={onUnstake}
        disabled={unstakeDisabled}
        className="w-full min-h-[48px] rounded-lg border border-accent/50 bg-transparent py-3 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10 active:scale-95 disabled:cursor-not-allowed disabled:border-accent/20 disabled:text-accent/40 disabled:active:scale-100 sm:min-h-[44px] sm:rounded-xl sm:py-2.5 sm:text-base md:rounded-2xl md:py-3"
      >
        {isLoading ? 'Unstaking...' : 'Unstake ETH'}
      </button>
    </div>
  )
}

