export const StakeTab = ({
  inputs,
  setInputs,
  formatted,
  balances,
  stakeAmountWei,
  stakeDisabled,
  isLoading,
  onMaxClick,
  onStake,
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
            value={inputs.stake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, stake: event.target.value }))
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
          <span>Balance: {formatted.ethBalance} ETH</span>
          {stakeAmountWei && stakeAmountWei > balances.eth ? (
            <span className="text-error">Insufficient balance</span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onStake}
        disabled={stakeDisabled}
        className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/50 sm:rounded-2xl sm:py-3 sm:text-base"
      >
        {isLoading ? 'Staking...' : 'Stake ETH'}
      </button>
      <p className="text-[10px] text-gray-500 sm:text-xs">
        Staking will lock your ETH in the contract and start accruing ORCA emissions in
        real time.
      </p>
    </div>
  )
}

