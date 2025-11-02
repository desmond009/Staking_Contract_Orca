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
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase text-gray-400">Amount</label>
        <div className="mt-2 flex rounded-2xl border border-border/70 bg-background/60 p-4 focus-within:border-accent/70">
          <input
            type="number"
            placeholder="0.00"
            min="0"
            value={inputs.unstake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, unstake: event.target.value }))
            }
            className="w-full bg-transparent text-2xl font-semibold text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onMaxClick}
            className="ml-4 rounded-full border border-border/60 px-3 py-1 text-xs text-gray-300 transition hover:border-accent/50 hover:text-white"
          >
            Max
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Staked: {formatted.staked} ETH</span>
          {unstakeAmountWei && unstakeAmountWei > balances.staked ? (
            <span className="text-error">Exceeds staked amount</span>
          ) : null}
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/60 p-3 text-xs text-gray-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-accent" />
        <p>Unstaking updates your rewards and stops emissions on the unstaked amount.</p>
      </div>
      <button
        type="button"
        onClick={onUnstake}
        disabled={unstakeDisabled}
        className="w-full rounded-2xl border border-accent/50 bg-transparent py-3 text-base font-semibold text-accent transition hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-accent/20 disabled:text-accent/40"
      >
        {isLoading ? 'Unstaking...' : 'Unstake ETH'}
      </button>
    </div>
  )
}

