import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react'

const getToastIcon = (type) => {
  switch (type) {
    case 'pending':
      return <RefreshCw className="h-5 w-5 animate-spin" />
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    case 'error':
      return <AlertTriangle className="h-5 w-5 text-error" />
    default:
      return <RefreshCw className="h-5 w-5 animate-spin" />
  }
}

const TOAST_VARIANTS = {
  pending: {
    tone: 'border-accent/60 bg-accent/20 text-accent',
    title: 'Transaction pending...',
  },
  success: {
    tone: 'border-success/40 bg-success/15 text-success',
    title: 'Transaction confirmed!',
  },
  error: {
    tone: 'border-error/40 bg-error/15 text-error',
    title: 'Transaction failed',
  },
}

export const useToast = () => {
  const [toast, setToast] = useState(null)

  // Memoize showToast to prevent unnecessary re-renders and infinite loops
  const showToast = useCallback((type, message) => {
    setToast({ type, message, timestamp: Date.now() })
  }, [])

  // Memoize hideToast as well
  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    if (toast.type === 'pending') return undefined

    const timeout = setTimeout(() => {
      setToast(null)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [toast])

  const ToastComponent = () => {
    if (!toast) return null
    const variant = TOAST_VARIANTS[toast.type] ?? TOAST_VARIANTS.pending
    const icon = getToastIcon(toast.type)

    return (
      <div className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:top-6">
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur sm:rounded-xl sm:px-5 sm:py-4 ${variant.tone}`}
        >
          <div className="mt-0.5 flex-shrink-0">{icon}</div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-medium">{variant.title}</p>
            {toast.message ? <p className="mt-1 text-[10px] opacity-80 sm:text-xs">{toast.message}</p> : null}
          </div>
          {toast.type !== 'pending' ? (
            <button
              type="button"
              onClick={hideToast}
              className="mt-0.5 flex-shrink-0 text-xs text-gray-400 transition hover:text-gray-200 active:scale-95 sm:text-sm"
              aria-label="Close toast"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent,
  }
}

