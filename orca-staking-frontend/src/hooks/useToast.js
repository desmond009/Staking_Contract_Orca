import { useState, useEffect } from 'react'
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

  const showToast = (type, message) => {
    setToast({ type, message, timestamp: Date.now() })
  }

  const hideToast = () => {
    setToast(null)
  }

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
      <div className="fixed top-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2">
        <div
          className={`flex items-start gap-3 rounded-xl border px-5 py-4 shadow-lg backdrop-blur ${variant.tone}`}
        >
          <div className="mt-1">{icon}</div>
          <div className="flex-1 text-sm">
            <p className="font-medium">{variant.title}</p>
            {toast.message ? <p className="mt-1 text-xs opacity-80">{toast.message}</p> : null}
          </div>
          {toast.type !== 'pending' ? (
            <button
              type="button"
              onClick={hideToast}
              className="text-xs text-gray-400 transition hover:text-gray-200"
            >
              <X className="h-4 w-4" />
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

