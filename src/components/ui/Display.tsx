import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { Card } from './Card'

/* --------------------------------- Avatar --------------------------------- */

const avatarTints = [
  'bg-brand-100 text-brand-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
]

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const tint = avatarTints[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarTints.length]
  const sizes = { sm: 'size-8 text-[11px]', md: 'size-10 text-[13px]', lg: 'size-14 text-lg' }
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full font-bold', sizes[size], tint, className)}>
      {initials(name)}
    </span>
  )
}

/** Name + secondary line with an avatar — the standard "person" table cell. */
export function Person({ name, sub }: { name: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="sm" />
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{name}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

/* -------------------------------- StatCard -------------------------------- */

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** Percentage change vs the previous period. */
  delta?: number
  hint?: string
  tone?: 'brand' | 'teal' | 'amber' | 'slate'
}

const statTones = {
  brand: 'bg-brand-50 text-brand-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
}

export function StatCard({ label, value, icon: Icon, delta, hint, tone = 'brand' }: StatCardProps) {
  const up = (delta ?? 0) >= 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
        <span className={cn('grid size-9 place-items-center rounded-xl', statTones[tone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-[28px] leading-none font-extrabold tracking-tight text-slate-900">{value}</p>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-bold',
              up ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </Card>
  )
}

/* ------------------------------- PageHeader ------------------------------- */

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------- EmptyState ------------------------------- */

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-base font-bold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------ DetailRow list ----------------------------- */

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 text-sm">
      <dt className="max-w-[48%] shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{children}</dd>
    </div>
  )
}
