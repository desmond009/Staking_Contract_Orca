import { TARGET_NETWORK_NAME } from '../config'

export const NetworkWarning = ({ account, onSwitchNetwork }) => {
  if (!account) return null

  return (
    <div className="mt-6 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">
      <p className="font-medium">Wrong network detected.</p>
      <p className="mt-1 text-xs text-error/80">
        Please switch to {TARGET_NETWORK_NAME} to interact with the staking contract.
      </p>
    </div>
  )
}

export const NoWalletWarning = () => {
  if (window.ethereum) return null

  return (
    <div className="mt-6 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error">
      <p className="font-medium">No wallet detected</p>
      <p className="mt-1 text-xs text-error/80">
        Install MetaMask or another Ethereum-compatible wallet to start staking.
      </p>
    </div>
  )
}

