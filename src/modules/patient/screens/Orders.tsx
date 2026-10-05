import { useState } from 'react'
import { Link } from 'react-router'
import { Building2, ChevronRight, ClipboardList, House } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { Tabs } from '@/components/ui/Tabs'
import { isActive } from '@/lib/status'
import { inr } from '@/lib/utils'
import type { Order } from '@/types'
import { useLabels } from '../components/labels'
import { ProgressBar } from '../components/OrderProgress'
import { ProfileSwitcher } from '../components/ProfileSwitcher'
import { Screen, TabHeader } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

function OrderCard({ order }: { order: Order }) {
  const { t } = useI18n()
  const labels = useLabels()
  const CollectionIcon = order.collectionType === 'home' ? House : Building2
  return (
    <Link
      to={`/patient/orders/${order.id}`}
      className="block rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-wide text-slate-500">{order.id}</p>
        <OrderStatusBadge status={order.status} label={labels.status(order.status)} />
      </div>
      <p className="mt-2.5 text-[15px] leading-snug font-bold text-slate-900">
        {order.items.map((i) => i.name).join(', ')}
      </p>
      <p className="mt-1 text-[13px] text-slate-500">
        {order.patient.name} · {labels.date(order.date)}, {order.slot}
      </p>
      {isActive(order.status) && (
        <div className="mt-3">
          <ProgressBar order={order} />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3 text-[13px]">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-slate-500">
          <CollectionIcon className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">
            {order.collectionType === 'home' ? t('orders.homeCollection') : t('orders.labVisit')} · {inr(order.total)}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center font-bold text-brand-700">
          {isActive(order.status) ? t('common.track') : t('common.details')}
          <ChevronRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

export default function Orders() {
  const { t } = useI18n()
  const { orders, selectedMember } = usePatient()
  const [tab, setTab] = useState<'active' | 'past'>('active')
  const loading = useMockLoading()
  // Only the selected family member's bookings are listed.
  const mine = orders.filter((o) => o.patient.name === selectedMember.name)
  const active = mine.filter((o) => isActive(o.status))
  const past = mine.filter((o) => !isActive(o.status))
  const shown = tab === 'active' ? active : past

  return (
    <Screen
      header={
        <>
          <TabHeader title={t('nav.orders')} subtitle={t('orders.subtitle')} />
          <ProfileSwitcher />
        </>
      }
    >
      <div className="space-y-3 px-5 py-4">
        <Tabs
          block
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: t('orders.active'), count: active.length },
            { value: 'past', label: t('orders.completed'), count: past.length },
          ]}
        />
        {loading ? (
          <SkeletonList />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={tab === 'active' ? t('orders.emptyActive') : t('orders.emptyPast')}
            description={t('orders.emptyBody', { name: selectedMember.name })}
            action={
              <Link to="/patient/tests">
                <Button>{t('orders.bookTest')}</Button>
              </Link>
            }
          />
        ) : (
          shown.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </Screen>
  )
}
