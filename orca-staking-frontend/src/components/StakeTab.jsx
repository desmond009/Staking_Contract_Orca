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
        <div className="mt-2 flex rounded-lg border border-border/70 bg-background/60 p-3 focus-within:border-accent/70 sm:rounded-xl sm:p-3.5 md:rounded-2xl md:p-4">
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="any"
            value={inputs.stake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, stake: event.target.value }))
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
        className="w-full min-h-[48px] rounded-lg bg-accent py-3 text-sm font-semibold text-black transition hover:bg-accent/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-accent/50 disabled:active:scale-100 sm:min-h-[44px] sm:rounded-xl sm:py-2.5 sm:text-base md:rounded-2xl md:py-3"
      >
        {isLoading ? 'Staking...' : 'Stake ETH'}
      </button>
      <p className="text-[10px] leading-relaxed text-gray-500 sm:text-xs">
        Staking will lock your ETH in the contract and start accruing ORCA emissions in
        real time.
      </p>
    </div>
  )
}

