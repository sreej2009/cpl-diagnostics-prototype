import { Navigate, useParams } from 'react-router'
import { MapPin, Store } from 'lucide-react'
import { cardClass, GroupLabel, ListGroup } from '@/components/mobile/Kit'
import { MetricGrid } from '@/components/mobile/Metrics'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DetailRow } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { cn, inr } from '@/lib/utils'
import { useAdmin } from '../AdminContext'
import { OrderRow } from '../components/OrderRow'
import { franchiseTone, shortName } from './Franchises'

export default function FranchiseDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { franchises, orders, setFranchiseStatus } = useAdmin()
  const franchise = franchises.find((f) => f.id === id)
  if (!franchise) return <Navigate to="/admin/franchises" replace />

  const assigned = orders.filter((o) => o.source === 'franchise' && o.sourceName === franchise.name)
  const commission = Math.round((franchise.revenue * franchise.commissionRate) / 100)
  const active = franchise.status === 'Active'

  const change = (status: 'Active' | 'Suspended') => {
    setFranchiseStatus(franchise.id, status)
    toast(`${shortName(franchise.name)} is now ${status.toLowerCase()}`)
  }

  return (
    <Screen
      header={<TopBar title="Franchise" back="/admin/franchises" />}
      footer={
        active ? (
          <Button size="lg" variant="danger" block onClick={() => change('Suspended')}>
            Suspend franchise
          </Button>
        ) : (
          <Button size="lg" block onClick={() => change('Active')}>
            {franchise.status === 'Onboarding' ? 'Complete onboarding & activate' : 'Reactivate franchise'}
          </Button>
        )
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-4')}>
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <Store className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] leading-snug font-extrabold tracking-tight text-slate-900">{shortName(franchise.name)}</p>
              <p className="text-xs text-slate-500">CPL Collection Centre</p>
            </div>
            <Badge tone={franchiseTone[franchise.status]} dot>
              {franchise.status}
            </Badge>
          </div>
          <p className="mt-3 flex items-start gap-1.5 border-t border-dashed border-slate-200 pt-3 text-[13px] leading-snug text-slate-600">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
            {franchise.territory}
          </p>
        </div>

        <section>
          <GroupLabel>This month</GroupLabel>
          <MetricGrid
            items={[
              { label: 'Orders', value: String(franchise.orders) },
              { label: 'Revenue', value: inr(franchise.revenue) },
              { label: 'Commission rate', value: `${franchise.commissionRate}%`, hint: 'of franchise revenue' },
              { label: 'Commission due', value: inr(commission), hint: 'see Commission Calculation' },
            ]}
          />
        </section>

        <section>
          <GroupLabel>Owner</GroupLabel>
          <dl className={cn(cardClass, 'divide-y divide-slate-100 px-4 py-1.5')}>
            <DetailRow label="Name">{franchise.owner}</DetailRow>
            <DetailRow label="Mobile">+91 {franchise.mobile}</DetailRow>
          </dl>
        </section>

        <section>
          <GroupLabel>Recent orders from this franchise</GroupLabel>
          {assigned.length === 0 ? (
            <p className={cn(cardClass, 'px-4 py-5 text-center text-sm text-slate-500')}>
              {franchise.orders === 0 ? 'No orders yet.' : 'None of the most recent orders came from this franchise.'}
            </p>
          ) : (
            <ListGroup>
              {assigned.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ListGroup>
          )}
        </section>
      </div>
    </Screen>
  )
}
