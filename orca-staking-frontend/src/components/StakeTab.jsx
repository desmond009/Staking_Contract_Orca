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
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase text-gray-400">Amount</label>
        <div className="mt-2 flex rounded-2xl border border-border/70 bg-background/60 p-4 focus-within:border-accent/70">
          <input
            type="number"
            placeholder="0.00"
            min="0"
            value={inputs.stake}
            onChange={(event) =>
              setInputs((prev) => ({ ...prev, stake: event.target.value }))
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
        className="w-full rounded-2xl bg-accent py-3 text-base font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/50"
      >
        {isLoading ? 'Staking...' : 'Stake ETH'}
      </button>
      <p className="text-xs text-gray-500">
        Staking will lock your ETH in the contract and start accruing ORCA emissions in
        real time.
      </p>
    </div>
  )
}

