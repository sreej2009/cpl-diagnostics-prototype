import { NavLink } from 'react-router'
import { Activity, ClipboardList, FileText, House, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'

const tabs: { to: string; label: TranslationKey; icon: typeof House; end?: boolean }[] = [
  { to: '/patient', label: 'nav.home', icon: House, end: true },
  { to: '/patient/tests', label: 'nav.tests', icon: Search },
  { to: '/patient/orders', label: 'nav.orders', icon: ClipboardList },
  { to: '/patient/reports', label: 'nav.reports', icon: FileText },
  { to: '/patient/health', label: 'nav.health', icon: Activity },
]

export function BottomNav() {
  const { t } = useI18n()
  return (
    <nav className="relative z-10 grid shrink-0 grid-cols-5 border-t border-slate-100 bg-white px-2 pt-1.5 pb-2 shadow-nav max-[360px]:px-0.5">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'flex min-w-0 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-700' : 'text-slate-400 hover:text-slate-600',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'grid h-7 w-12 place-items-center rounded-full transition-colors',
                  isActive && 'bg-brand-50',
                )}
              >
                <tab.icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="max-w-full truncate px-0.5 max-[360px]:text-[10px]">{t(tab.label)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
