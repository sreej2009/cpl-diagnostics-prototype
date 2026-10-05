import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenProps {
  header?: ReactNode
  /** Pinned to the bottom of the screen, above the tab bar. */
  footer?: ReactNode
  className?: string
  children: ReactNode
}

/** One mobile screen: fixed header, scrolling body, optional pinned footer. */
export function Screen({ header, footer, className, children }: ScreenProps) {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      {header}
      <div className={cn('no-scrollbar min-h-0 flex-1 animate-screen overflow-y-auto', className)}>{children}</div>
      {footer && <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-3 pb-4 shadow-nav">{footer}</div>}
    </div>
  )
}

interface TopBarProps {
  title: string
  /** Route to go back to, or a handler (e.g. previous booking step). */
  back?: string | (() => void)
  right?: ReactNode
  /** Always go to the named route (for flows that add their own history entries, like booking). */
  fixed?: boolean
}

export function TopBar({ title, back, right, fixed }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  // Go back to the screen the user actually came from; the named route is the fallback for a direct link.
  const goBack = () => {
    if (typeof back === 'function') back()
    else if (back !== undefined) {
      if (!fixed && location.key !== 'default') navigate(-1)
      else navigate(back)
    }
  }
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-100 bg-white px-2">
      {back !== undefined && (
        <button
          type="button"
          aria-label="Back"
          onClick={goBack}
          className="grid size-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}
      <h1 className={cn('min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight text-slate-900', back === undefined && 'pl-3')}>
        {title}
      </h1>
      {right}
    </header>
  )
}

/** Large in-page title used on the tab screens. */
export function TabHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="shrink-0 bg-white px-5 pt-5 pb-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] leading-tight font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-bold tracking-tight text-slate-900">{title}</h2>
      {action}
    </div>
  )
}
