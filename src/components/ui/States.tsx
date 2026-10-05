import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CircleAlert } from 'lucide-react'

/**
 * Short placeholder delay so list screens can show their loading state.
 * The prototype has no backend, so nothing is actually being fetched.
 */
export function useMockLoading(ms = 280) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(timer)
  }, [ms])
  return loading
}

/** Loading placeholder shaped like the list cards it stands in for. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
          <div className="flex items-center gap-3">
            <span className="size-10 shrink-0 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <span className="block h-3 w-2/3 rounded-full bg-slate-100" />
              <span className="block h-2.5 w-2/5 rounded-full bg-slate-100" />
            </div>
          </div>
          <span className="mt-4 block h-2.5 w-full rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  description?: string
  /** Recovery action, e.g. a retry or "go back" button. */
  action?: ReactNode
  icon?: LucideIcon
}

/** Recoverable problem: says what went wrong and offers a way forward. */
export function ErrorState({ title, description, action, icon: Icon = CircleAlert }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-8 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-red-50 text-red-600">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-base font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
