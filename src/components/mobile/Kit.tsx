import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight } from 'lucide-react'
import { stepsFor } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { CollectionType, OrderStatus } from '@/types'

/** Standard white card surface used across the mobile apps. */
export const cardClass = 'rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70'

/* ------------------------------ Filter chips ------------------------------ */

interface ChipOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterChipsProps<T extends string> {
  options: ChipOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Horizontally scrolling single-select filter. Bleeds to the screen edge; pass padding via className. */
export function FilterChips<T extends string>({ options, value, onChange, className }: FilterChipsProps<T>) {
  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto px-5', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors',
              active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('text-[11px] font-bold', active ? 'text-slate-300' : 'text-slate-400')}>{opt.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------- Stat tile ------------------------------- */

const tileTones = {
  brand: 'bg-brand-50 text-brand-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
}

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: keyof typeof tileTones
  hint?: string
  /** Percentage change vs the previous period. */
  delta?: number
  to?: string
}

/** Compact KPI card sized for a two-column phone grid. */
export function StatTile({ label, value, icon: Icon, tone = 'brand', hint, delta, to }: StatTileProps) {
  const up = (delta ?? 0) >= 0
  const body = (
    <>
      <span className={cn('grid size-9 place-items-center rounded-xl', tileTones[tone])}>
        <Icon className="size-[18px]" />
      </span>
      <p className="mt-3 text-[22px] leading-none font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1.5 text-[13px] leading-tight font-semibold [overflow-wrap:anywhere] text-slate-600 max-[360px]:text-[11px]">{label}</p>
      {(hint || delta !== undefined) && (
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] leading-tight text-slate-500">
          {delta !== undefined && (
            <span className={cn('inline-flex items-center font-bold', up ? 'text-emerald-600' : 'text-red-600')}>
              {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint}
        </p>
      )}
    </>
  )
  return to ? (
    <Link to={to} className={cn(cardClass, 'block p-4 max-[360px]:p-3')}>
      {body}
    </Link>
  ) : (
    <div className={cn(cardClass, 'p-4 max-[360px]:p-3')}>{body}</div>
  )
}

/* ------------------------------ Grouped lists ----------------------------- */

export function GroupLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 px-1">
      <h2 className="text-xs font-bold tracking-wide text-slate-500 uppercase">{children}</h2>
      {action}
    </div>
  )
}

export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(cardClass, 'divide-y divide-slate-100 overflow-hidden', className)}>{children}</div>
}

interface MenuRowProps {
  icon: LucideIcon
  label: string
  hint?: string
  to?: string
  onClick?: () => void
  badge?: number
  danger?: boolean
}

/** Settings-style row: icon, label, optional hint/badge and a chevron. */
export function MenuRow({ icon: Icon, label, hint, to, onClick, badge, danger }: MenuRowProps) {
  const body = (
    <>
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl',
          danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600',
        )}
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm font-bold', danger ? 'text-red-600' : 'text-slate-900')}>{label}</span>
        {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>
      )}
      {!danger && <ChevronRight className="size-4 shrink-0 text-slate-300" />}
    </>
  )
  const className = 'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50'
  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  )
}

/** "See all" style text link used in section headers. */
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center text-[13px] font-bold text-brand-700">
      {children}
      <ChevronRight className="size-4" />
    </Link>
  )
}

/* ----------------------------- Workflow steps ----------------------------- */

/** Vertical stepper for the five-stage order workflow. */
export function WorkflowSteps({ status, collectionType = 'home' }: { status: OrderStatus; collectionType?: CollectionType }) {
  if (status === 'cancelled') {
    return <p className="rounded-xl bg-red-50 px-3.5 py-3 text-[13px] font-semibold text-red-700">This order was cancelled.</p>
  }
  const steps = stepsFor(collectionType)
  const current = steps.findIndex((s) => s.key === status)

  return (
    <ol>
      {steps.map((step, i) => {
        // Every status is a completed milestone except Lab Testing, which is ongoing.
        const done = i < current || (i === current && status !== 'testing')
        const active = i === current && !done
        return (
          <li key={step.key} className="relative flex items-center gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span className={cn('absolute top-6 bottom-0 left-[11px] w-0.5', i < current ? 'bg-brand-600' : 'bg-slate-200')} />
            )}
            <span
              className={cn(
                'relative grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                done && 'bg-brand-600 text-white',
                active && 'bg-white text-brand-700 ring-2 ring-brand-600',
                !done && !active && 'bg-slate-100 text-slate-400',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('text-sm font-bold', done || active ? 'text-slate-900' : 'text-slate-400')}>{step.label}</span>
            {active && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">In progress</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
