import { Link, Navigate, useParams } from 'react-router'
import { Check, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DetailRow } from '@/components/ui/Display'
import { inr } from '@/lib/utils'
import { useLabels } from '../components/labels'
import { Screen } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export default function Confirmation() {
  const { id } = useParams()
  const { t } = useI18n()
  const labels = useLabels()
  const { orders, whatsappOptIn } = usePatient()
  const order = orders.find((o) => o.id === id)
  if (!order) return <Navigate to="/patient/orders" replace />

  return (
    <Screen
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Link to="/patient" className="min-w-0">
            <Button variant="secondary" size="lg" block>
              <span className="truncate">{t('confirm.backHome')}</span>
            </Button>
          </Link>
          <Link to={`/patient/orders/${order.id}`} className="min-w-0">
            <Button size="lg" block>
              <span className="truncate">{t('confirm.trackOrder')}</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="px-5 pt-12 pb-6">
        <div className="flex flex-col items-center text-center">
          <span className="relative grid size-20 animate-pop place-items-center rounded-full bg-teal-500 text-white shadow-float">
            <span className="absolute -inset-3 rounded-full bg-teal-500/15" />
            <Check className="relative size-9" strokeWidth={3} />
          </span>
          <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-slate-900">{t('confirm.title')}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{t('confirm.placed', { id: order.id })}</p>
        </div>

        <dl className="mt-8 animate-rise divide-y divide-slate-100 rounded-2xl bg-white px-4 py-1.5 shadow-card ring-1 ring-slate-200/70">
          <DetailRow label={t('confirm.tests')}>{order.items.map((i) => i.name).join(', ')}</DetailRow>
          <DetailRow label={t('book.patient')}>{order.patient.name}</DetailRow>
          <DetailRow label={order.collectionType === 'home' ? t('home.homeCollection') : t('home.visitLab')}>{order.location}</DetailRow>
          <DetailRow label={t('book.dateTime')}>
            {labels.date(order.date)}
            <br />
            {order.slot}
          </DetailRow>
          <DetailRow label={t('track.payment')}>
            {inr(order.total)} · {labels.payMethod(order.payment.method)} ({labels.payStatus(order.payment.status)})
          </DetailRow>
          {order.sourceName && <DetailRow label={t('track.referredBy')}>{order.sourceName}</DetailRow>}
        </dl>

        <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-teal-50 p-3.5 text-[13px] leading-snug text-teal-900 ring-1 ring-teal-100">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-teal-600" />
          {whatsappOptIn ? t('confirm.whatsappOn', { mobile: order.patient.mobile }) : t('confirm.whatsappOff')}
        </p>
      </div>
    </Screen>
  )
}
