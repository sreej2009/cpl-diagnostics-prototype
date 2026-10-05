import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { FilterChips, ListGroup } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import { SearchInput } from '@/components/ui/Field'
import { isActive } from '@/lib/status'
import type { Order, OrderSource } from '@/types'
import { useAdmin } from '../AdminContext'
import { OrderRow } from '../components/OrderRow'
import type { OrderFlag } from '../components/OrderRow'

type Filter = 'all' | 'open' | 'reported' | 'cancelled'

const matches: Record<Filter, (o: Order) => boolean> = {
  all: () => true,
  open: (o) => isActive(o.status),
  reported: (o) => o.status === 'reported',
  cancelled: (o) => o.status === 'cancelled',
}

export default function Orders() {
  const { orders, alerts } = useAdmin()
  const loading = useMockLoading()
  const [filter, setFilter] = useState<Filter>('all')
  const [source, setSource] = useState<OrderSource | 'all'>('all')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = orders.filter(
    (o) =>
      matches[filter](o) &&
      (source === 'all' || o.source === source) &&
      (q === '' || o.id.toLowerCase().includes(q) || o.patient.name.toLowerCase().includes(q) || o.patient.mobile.includes(q)),
  )
  const count = (f: Filter) => orders.filter(matches[f]).length
  // an unread urgent or delay alert marks the order in the list
  const flagFor = (id: string): OrderFlag | undefined => {
    const alert = alerts.find((a) => a.orderId === id && !a.read && !a.resolved && a.kind !== 'info')
    return alert ? (alert.severity === 'Urgent' ? 'Urgent' : 'Delayed') : undefined
  }

  return (
    <Screen
      header={
        <TabHeader title="Order Management" subtitle="Bookings from the app, doctors and franchises">
          <div className="mt-4 px-5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search order, patient or mobile"
              className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50"
            />
          </div>
          <FilterChips
            className="mt-3"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: count('all') },
              { value: 'open', label: 'In progress', count: count('open') },
              { value: 'reported', label: 'Report sent', count: count('reported') },
              { value: 'cancelled', label: 'Cancelled', count: count('cancelled') },
            ]}
          />
        </TabHeader>
      }
    >
      <div className="space-y-3 py-4">
        <FilterChips
          value={source}
          onChange={setSource}
          options={[
            { value: 'all', label: 'All sources' },
            { value: 'app', label: 'Patient App' },
            { value: 'doctor', label: 'Doctor Referral' },
            { value: 'franchise', label: 'Franchise' },
          ]}
        />
        <div className="space-y-3 px-5">
          <p className="text-xs font-semibold text-slate-500">
            {rows.length} {rows.length === 1 ? 'order' : 'orders'}
          </p>
          {loading ? (
          <SkeletonList />
        ) : rows.length === 0 ? (
            <EmptyState icon={SearchX} title="No orders found" description="Try a different search or filter." />
          ) : (
            <ListGroup>
              {rows.map((order) => (
                <OrderRow key={order.id} order={order} flag={flagFor(order.id)} />
              ))}
            </ListGroup>
          )}
        </div>
      </div>
    </Screen>
  )
}
