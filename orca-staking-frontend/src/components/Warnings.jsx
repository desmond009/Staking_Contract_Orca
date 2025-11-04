import { useState, useEffect } from 'react'
import { TARGET_NETWORK_NAME } from '../config'

export const NetworkWarning = ({ account, isCorrectNetwork, onSwitchNetwork }) => {
  if (!account || isCorrectNetwork) return null

  return (
    <div className="mt-4 rounded-lg border border-error/40 bg-error/10 p-3 text-xs text-error sm:mt-6 sm:rounded-xl sm:p-4 sm:text-sm">
      <p className="font-medium">Wrong network detected.</p>
      <p className="mt-1 text-[10px] leading-relaxed text-error/80 sm:text-xs">
        Please switch to {TARGET_NETWORK_NAME} to interact with the staking contract.
      </p>
      <button
        type="button"
        onClick={onSwitchNetwork}
        className="mt-2.5 w-full min-h-[44px] rounded-lg bg-error/20 px-3 py-2.5 text-xs font-medium text-error transition hover:bg-error/30 active:scale-95 sm:mt-3 sm:min-h-0 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
      >
        Switch to {TARGET_NETWORK_NAME}
      </button>
    </div>
  )
}

export const NoWalletWarning = () => {
  if (window.ethereum) return null

  return (
    <div className="mt-4 rounded-lg border border-error/40 bg-error/10 p-3 text-xs text-error sm:mt-6 sm:rounded-xl sm:p-4 sm:text-sm">
      <p className="font-medium">No wallet detected</p>
      <p className="mt-1 text-[10px] leading-relaxed text-error/80 sm:text-xs">
        Install MetaMask or another Ethereum-compatible wallet to start staking.
      </p>
    </div>
  )
}

export const NetworkConnectionWarning = ({ hasErrors = false }) => {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (hasErrors) {
      setShowWarning(true)
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setShowWarning(false)
      }, 15000)
      return () => clearTimeout(timer)
    } else {
      setShowWarning(false)
    }
  }, [hasErrors])

  if (!showWarning) return null

  return (
    <div className="mt-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200 sm:mt-6 sm:rounded-xl sm:p-4 sm:text-sm">
      <p className="font-medium">Network connection issues detected</p>
      <p className="mt-1 text-[10px] leading-relaxed text-yellow-200/80 sm:text-xs">
        The app is experiencing network connectivity issues. Data may be delayed or unavailable. Please check your internet connection or try again later.
      </p>
    </div>
  )
}

