import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardClass } from './Kit'

export interface Metric {
  label: string
  value: string
  hint?: string
  to?: string
}

const cell = 'border-slate-100 px-4 py-3.5 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r'

/** Compact 2-column metric block — one card instead of a stack of stat tiles. */
export function MetricGrid({ items }: { items: Metric[] }) {
  return (
    <div className={cn(cardClass, 'grid grid-cols-2 overflow-hidden')}>
      {items.map((item) => {
        const body = (
          <>
            <p className="text-[20px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">{item.value}</p>
            <p className="mt-1.5 text-xs leading-tight font-semibold text-slate-600">{item.label}</p>
            {item.hint && <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{item.hint}</p>}
          </>
        )
        return item.to ? (
          <Link key={item.label} to={item.to} className={cn(cell, 'transition-colors hover:bg-slate-50')}>
            {body}
          </Link>
        ) : (
          <div key={item.label} className={cell}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

interface ActionRowProps {
  icon: LucideIcon
  label: string
  hint: string
  count: number
  to: string
  /** Urgent rows get a red edge and count; the row itself stays neutral. */
  urgent?: boolean
}

/** "Needs attention" row: what is waiting, how many, and where to act on it. */
export function ActionRow({ icon: Icon, label, hint, count, to, urgent }: ActionRowProps) {
  const clear = count === 0
  return (
    <Link to={to} className="relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
      {urgent && !clear && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-red-500" aria-hidden="true" />}
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', clear ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600')}>
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900">{label}</span>
        <span className="block truncate text-xs text-slate-500">{clear ? 'All clear' : hint}</span>
      </span>
      <span
        className={cn(
          'min-w-7 rounded-full px-2 py-1 text-center text-xs leading-none font-extrabold tabular-nums',
          clear ? 'bg-slate-100 text-slate-400' : urgent ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700',
        )}
      >
        {count}
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-300" />
    </Link>
  )
}
