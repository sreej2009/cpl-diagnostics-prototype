import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
 * Screen shell for the Doctor and Admin mobile apps. It mirrors the Patient
 * App's shell (modules/patient/components/Screen.tsx), which is kept separate
 * so that app stays untouched.
 */

/** Each staff app carries its own header colour: clinical navy for doctors, slate for operations. */
export type AppTheme = 'doctor' | 'admin'

const ThemeContext = createContext<AppTheme>('doctor')
export const AppThemeProvider = ThemeContext.Provider

const headerTone: Record<AppTheme, string> = {
  doctor: 'bg-brand-950',
  admin: 'bg-slate-900',
}

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
  /** Route to go back to, or a handler. */
  back?: string | (() => void)
  /** Controls on the right. They sit on the dark header, so use light text. */
  right?: ReactNode
}

export function TopBar({ title, back, right }: TopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  // Go back to the screen the user actually came from; the named route is the fallback for a direct link.
  const goBack = () => {
    if (typeof back === 'function') back()
    else if (back !== undefined) {
      if (location.key !== 'default') navigate(-1)
      else navigate(back)
    }
  }
  const theme = useContext(ThemeContext)
  return (
    <header className={cn('flex h-14 shrink-0 items-center gap-1 px-2 text-white', headerTone[theme])}>
      {back !== undefined && (
        <button
          type="button"
          aria-label="Back"
          onClick={goBack}
          className="grid size-10 place-items-center rounded-full text-white hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}
      <h1 className={cn('min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight max-[360px]:text-[15px]', back === undefined && 'pl-3')}>{title}</h1>
      {right && <div className="flex shrink-0 items-center pr-2">{right}</div>}
    </header>
  )
}

/** Title band for the tab screens. `children` (search, filters) sit in a white band underneath. */
export function TabHeader({
  title,
  subtitle,
  right,
  children,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  children?: ReactNode
}) {
  const theme = useContext(ThemeContext)
  return (
    <header className="shrink-0">
      <div className={cn('flex items-start justify-between gap-3 px-5 pt-4 pb-3.5 text-white', headerTone[theme])}>
        <div className="min-w-0">
          <h1 className="text-[20px] leading-tight font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-white/60">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children && <div className="flow-root border-b border-slate-100 bg-white pb-3">{children}</div>}
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

/* --------------------------------- Tab bar -------------------------------- */

export interface TabItem {
  to: string
  label: string
  icon: LucideIcon
  /** Match the route exactly (for the module's home tab). */
  end?: boolean
  badge?: number
}

export function TabBar({ tabs }: { tabs: TabItem[] }) {
  return (
    <nav
      className="relative z-10 grid shrink-0 border-t border-slate-100 bg-white px-2 pt-1.5 pb-2 shadow-nav"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className={cn('relative grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-brand-50')}>
                <tab.icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] leading-none font-bold text-white ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </span>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/** Route layout for the screens reachable from the bottom tab bar. */
export function TabLayout({ tabs }: { tabs: TabItem[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <TabBar tabs={tabs} />
    </div>
  )
}
