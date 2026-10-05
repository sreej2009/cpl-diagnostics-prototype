import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Where modals and toasts are mounted. The patient app points this at the
 * phone frame so overlays stay inside the device; dashboards use the page body.
 */
const OverlayRootContext = createContext<HTMLElement | null>(null)

export const OverlayRootProvider = OverlayRootContext.Provider

function useOverlayRoot() {
  const root = useContext(OverlayRootContext)
  return { target: root ?? document.body, contained: root !== null }
}

/* ---------------------------------- Modal --------------------------------- */

type ModalVariant = 'dialog' | 'sheet' | 'drawer'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  variant?: ModalVariant
  footer?: ReactNode
  children: ReactNode
}

const wrapper: Record<ModalVariant, string> = {
  dialog: 'items-end justify-center sm:items-center sm:p-4',
  sheet: 'items-end justify-center',
  drawer: 'justify-end',
}

const panel: Record<ModalVariant, string> = {
  dialog: 'max-h-[92%] w-full animate-sheet rounded-t-3xl sm:max-w-lg sm:animate-rise sm:rounded-3xl',
  sheet: 'max-h-[88%] w-full animate-sheet rounded-t-3xl',
  drawer: 'h-full w-full max-w-md animate-drawer',
}

export function Modal({ open, onClose, title, description, variant = 'dialog', footer, children }: ModalProps) {
  const { target, contained } = useOverlayRoot()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className={cn('pointer-events-auto inset-0 z-50 flex', contained ? 'absolute' : 'fixed', wrapper[variant])}>
      <div className="absolute inset-0 animate-fade bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative flex flex-col bg-white shadow-float', panel[variant])}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="flex gap-3 border-t border-slate-100 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    target,
  )
}

/* ---------------------------------- Toast --------------------------------- */

type ToastTone = 'success' | 'info'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children, offsetClass = 'bottom-6' }: { children: ReactNode; offsetClass?: string }) {
  const { target, contained } = useOverlayRoot()
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++
    setItems((prev) => [...prev.slice(-2), { id, message, tone }])
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  const viewport = useMemo(
    () => (
      <div
        aria-live="polite"
        className={cn(
          'pointer-events-none inset-x-0 z-[60] flex flex-col items-center gap-2 px-4',
          contained ? 'absolute' : 'fixed',
          offsetClass,
        )}
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="flex max-w-sm animate-rise items-center gap-2.5 rounded-2xl bg-slate-900 py-3 pr-4 pl-3.5 text-[13px] font-medium text-white shadow-float"
          >
            {t.tone === 'success' ? (
              <CircleCheck className="size-[18px] shrink-0 text-emerald-400" />
            ) : (
              <CircleAlert className="size-[18px] shrink-0 text-brand-300" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    ),
    [items, contained, offsetClass],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(viewport, target)}
    </ToastContext.Provider>
  )
}
