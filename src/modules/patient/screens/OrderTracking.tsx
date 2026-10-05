import { Link, Navigate, useParams } from 'react-router'
import { FastForward, FileText, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar, DetailRow } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { assignedPhlebotomist } from '@/data/patient'
import { stepsFor } from '@/lib/status'
import { inr } from '@/lib/utils'
import { useLabels } from '../components/labels'
import { SampleCard, Timeline } from '../components/OrderProgress'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export default function OrderTracking() {
  const { id } = useParams()
  const toast = useToast()
  const { t } = useI18n()
  const labels = useLabels()
  const { orders, reports, advanceOrder } = usePatient()
  const order = orders.find((o) => o.id === id)
  if (!order) return <Navigate to="/patient/orders" replace />

  const steps = stepsFor(order.collectionType)
  const next = steps[steps.findIndex((s) => s.key === order.status) + 1]
  const report = reports.find((r) => r.orderId === order.id)
  const showPhlebotomist = order.collectionType === 'home' && order.status !== 'placed'

  return (
    <Screen
      header={<TopBar fixed title={t('track.title')} back="/patient/orders" />}
      footer={
        report ? (
          <Link to={`/patient/reports/${report.id}`}>
            <Button size="lg" block icon={FileText}>
              {t('track.viewReport')}
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-wide text-slate-500">{order.id}</p>
            <OrderStatusBadge status={order.status} label={labels.status(order.status)} />
          </div>
          <p className="mt-2 text-[17px] leading-snug font-bold tracking-tight text-slate-900">
            {order.items.map((i) => i.name).join(', ')}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            {labels.date(order.date)} · {order.slot}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
          <Timeline order={order} />
        </div>

        <SampleCard order={order} />

        {showPhlebotomist && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
            <Avatar name={assignedPhlebotomist.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('track.yourPhlebotomist')}</p>
              <p className="text-[15px] font-bold text-slate-900">{assignedPhlebotomist.name}</p>
            </div>
            <Button
              variant="soft"
              icon={Phone}
              onClick={() => toast(t('track.callDisabled', { mobile: assignedPhlebotomist.mobile }), 'info')}
            >
              {t('track.call')}
            </Button>
          </div>
        )}

        <dl className="divide-y divide-slate-100 rounded-2xl bg-white px-4 py-1.5 shadow-card ring-1 ring-slate-200/70">
          <DetailRow label={t('book.patient')}>
            {order.patient.name}, {order.patient.age} {t('common.yrs')}
          </DetailRow>
          <DetailRow label={order.collectionType === 'home' ? t('home.homeCollection') : t('home.visitLab')}>
            {order.location}
            <br />
            <span className="font-medium text-slate-500">{order.area}</span>
          </DetailRow>
          <DetailRow label={t('track.payment')}>
            {inr(order.total)} · {labels.payMethod(order.payment.method)} ({labels.payStatus(order.payment.status)})
          </DetailRow>
          {order.sourceName && <DetailRow label={t('track.referredBy')}>{order.sourceName}</DetailRow>}
        </dl>

        {next && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4">
            <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">{t('track.protoTitle')}</p>
            <p className="mt-1 text-[13px] text-slate-500">{t('track.protoBody')}</p>
            <Button variant="secondary" size="sm" icon={FastForward} className="mt-3 h-auto min-h-8 max-w-full py-1.5 text-left whitespace-normal" onClick={() => advanceOrder(order.id)}>
              <span>{t('track.moveTo', { stage: labels.step(next.key) })}</span>
            </Button>
          </div>
        )}
      </div>
    </Screen>
  )
}
