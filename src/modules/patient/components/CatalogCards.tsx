import { Link } from 'react-router'
import { Check, ChevronRight, Clock, Plus, ShoppingBag, Utensils } from 'lucide-react'
import { testById } from '@/data/catalog'
import { cn, inr, pctOff } from '@/lib/utils'
import type { HealthPackage, LabTest } from '@/types'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'
import { categoryMeta } from './categoryMeta'
import { useLabels } from './labels'

/* ------------------------------ Add-to-cart ------------------------------ */

export function AddButton({ id, size = 'md' }: { id: string; size?: 'md' | 'lg' }) {
  const { t } = useI18n()
  const { inCart, toggleCart } = usePatient()
  const added = inCart(id)
  return (
    <button
      type="button"
      onClick={() => toggleCart(id)}
      aria-pressed={added}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1 rounded-xl font-bold transition duration-150 active:scale-95',
        size === 'lg' ? 'h-12 px-6 text-[15px]' : 'h-9 px-3.5 text-[13px]',
        added
          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
          : size === 'lg'
            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700'
            : 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 ring-inset hover:bg-brand-100',
      )}
    >
      {added ? <Check className="size-4" strokeWidth={2.6} /> : <Plus className="size-4" strokeWidth={2.6} />}
      {added ? t('common.added') : t('common.add')}
    </button>
  )
}

export function Price({ price, mrp, large }: { price: number; mrp: number; large?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={cn('font-extrabold tracking-tight text-slate-900', large ? 'text-2xl' : 'text-lg')}>
        {inr(price)}
      </span>
      <span className="text-xs text-slate-400 line-through">{inr(mrp)}</span>
      <span className="text-xs font-bold text-teal-600">{t('common.pctOff', { n: pctOff(price, mrp) })}</span>
    </div>
  )
}

/* -------------------------------- TestCard -------------------------------- */

export function TestCard({ test }: { test: LabTest }) {
  const { t } = useI18n()
  const labels = useLabels()
  const { icon: Icon, tint } = categoryMeta[test.category]
  return (
    <article className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      <div className="flex gap-3">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tint)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] leading-snug font-bold text-slate-900">{test.name}</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{labels.testDesc(test)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 text-slate-400" />
          {t('test.reportIn', { time: labels.dur(test.reportTime) })}
        </span>
        <span className="inline-flex items-center gap-1">
          <Utensils className="size-3.5 text-slate-400" />
          {test.fasting ? t('test.fasting', { hrs: labels.dur(test.fasting) }) : t('test.noFasting')}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
        <Price price={test.price} mrp={test.mrp} />
        <AddButton id={test.id} />
      </div>
    </article>
  )
}

/* ------------------------------- PackageCard ------------------------------ */

export function PackageCard({ pkg, className }: { pkg: HealthPackage; className?: string }) {
  const { t } = useI18n()
  const labels = useLabels()
  const included = pkg.testIds.map((id) => testById(id)?.name).filter(Boolean)
  return (
    <article className={cn('flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-200/70', className)}>
      <Link
        to={`/patient/packages/${pkg.id}`}
        className="relative block overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white"
      >
        <span className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -right-2 -bottom-12 size-28 rounded-full bg-teal-300/20" />
        <div className="relative flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
            {t('test.parameters', { n: pkg.parameters })}
          </span>
          {pkg.popular && (
            <span className="rounded-full bg-teal-300 px-2.5 py-1 text-[11px] font-bold text-teal-950">{t('test.popular')}</span>
          )}
        </div>
        <h3 className="relative mt-3 text-[17px] leading-snug font-bold tracking-tight">{pkg.name}</h3>
        <p className="relative mt-0.5 text-[13px] text-brand-100">{labels.tagline(pkg)}</p>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">{t('test.includes')} </span>
          {included.slice(0, 3).join(', ')}
          {included.length > 3 && ` ${t('test.more', { n: included.length - 3 })}`}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <Price price={pkg.price} mrp={pkg.mrp} />
          <AddButton id={pkg.id} />
        </div>
      </div>
    </article>
  )
}

/* --------------------------------- CartBar -------------------------------- */

/** Sticky summary shown while browsing once the cart has something in it. */
export function CartBar() {
  const { t } = useI18n()
  const { cartLines, cartTotal } = usePatient()
  if (cartLines.length === 0) return null
  return (
    <Link
      to="/patient/cart"
      className="flex items-center gap-3 rounded-2xl bg-brand-600 py-2.5 pr-3 pl-4 text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700"
    >
      <ShoppingBag className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[11px] font-medium text-brand-100">{t('cart.inCart', { n: cartLines.length })}</span>
        <span className="block text-[15px] font-extrabold">{inr(cartTotal.price)}</span>
      </span>
      <span className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-xl bg-white pr-2 pl-3.5 text-[13px] font-bold text-brand-700">
        {t('cart.viewCart')}
        <ChevronRight className="size-4" />
      </span>
    </Link>
  )
}
