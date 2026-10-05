import { Link } from 'react-router'
import { Layers, Plus, ShoppingBag, TestTube, Trash2, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { inr } from '@/lib/utils'
import { useLabels } from '../components/labels'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export function BillSummary() {
  const { t } = useI18n()
  const { cartLines, cartTotal } = usePatient()
  return (
    <dl className="space-y-2.5 rounded-2xl bg-white p-4 text-sm shadow-card ring-1 ring-slate-200/70">
      <div className="flex justify-between gap-3">
        <dt className="text-slate-500">{t('cart.itemTotal', { n: cartLines.length })}</dt>
        <dd className="font-semibold text-slate-900">{inr(cartTotal.mrp)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-slate-500">{t('cart.discount')}</dt>
        <dd className="font-semibold text-teal-600">− {inr(cartTotal.mrp - cartTotal.price)}</dd>
      </div>
      <div className="flex justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
        <dt className="font-bold text-slate-900">{t('cart.toPay')}</dt>
        <dd className="text-base font-extrabold text-slate-900">{inr(cartTotal.price)}</dd>
      </div>
    </dl>
  )
}

export default function Cart() {
  const { t } = useI18n()
  const { cartLines, cartTotal, toggleCart } = usePatient()
  const labels = useLabels()
  const fasting = cartLines.find((l) => l.fasting)?.fasting

  if (cartLines.length === 0) {
    return (
      <Screen header={<TopBar title={t('cart.title')} back="/patient" />}>
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.emptyTitle')}
          description={t('cart.emptyBody')}
          action={
            <Link to="/patient/tests">
              <Button>{t('cart.searchTests')}</Button>
            </Link>
          }
        />
      </Screen>
    )
  }

  return (
    <Screen
      header={<TopBar title={t('cart.title')} back="/patient/tests" />}
      footer={
        <div className="flex items-center gap-4">
          <div className="shrink-0 leading-tight">
            <p className="text-[11px] font-medium text-slate-500">{t('cart.toPay')}</p>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">{inr(cartTotal.price)}</p>
          </div>
          <Link to="/patient/book" className="min-w-0 flex-1">
            <Button size="lg" block className="max-[360px]:px-3 max-[360px]:text-[13px]">
              <span className="truncate">{t('cart.proceed')}</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5">
        <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
          {cartLines.map((line) => (
            <li key={line.id} className="flex items-start gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                {line.kind === 'package' ? <Layers className="size-5" /> : <TestTube className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-bold text-slate-900">{line.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{labels.lineMeta(line)}</p>
                <p className="mt-1.5 text-sm">
                  <span className="font-extrabold text-slate-900">{inr(line.price)}</span>
                  <span className="ml-2 text-xs text-slate-400 line-through">{inr(line.mrp)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleCart(line.id)}
                aria-label={t('cart.remove', { name: line.name })}
                className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-[18px]" />
              </button>
            </li>
          ))}
        </ul>

        <Link
          to="/patient/tests"
          className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand-300 text-[13px] font-bold text-brand-700"
        >
          <Plus className="size-4" />
          {t('cart.addMore')}
        </Link>

        {fasting && (
          <p className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-[13px] leading-snug text-amber-900 ring-1 ring-amber-100">
            <Utensils className="mt-0.5 size-4 shrink-0 text-amber-600" />
            {t('cart.fastingNote', { hrs: labels.dur(fasting) })}
          </p>
        )}

        <BillSummary />
      </div>
    </Screen>
  )
}
