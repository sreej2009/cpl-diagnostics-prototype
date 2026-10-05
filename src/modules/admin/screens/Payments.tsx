import { useState } from 'react'
import { Link } from 'react-router'
import { Info, SearchX } from 'lucide-react'
import { FilterChips, ListGroup } from '@/components/mobile/Kit'
import { MetricGrid } from '@/components/mobile/Metrics'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { paymentMethodLabel, paymentStatusLabel, paymentStatusTone } from '@/lib/status'
import { daysAgo, inr } from '@/lib/utils'
import type { PaymentMethod, PaymentStatus } from '@/types'
import { useAdmin } from '../AdminContext'

type StatusFilter = 'all' | PaymentStatus
type MethodFilter = 'all' | PaymentMethod
type DateFilter = 'all' | 'recent' | 'earlier'

const RECENT = [daysAgo(0), daysAgo(1), daysAgo(2)]

export default function Payments() {
  const toast = useToast()
  const { orders, setPaymentStatus } = useAdmin()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [method, setMethod] = useState<MethodFilter>('all')
  const [when, setWhen] = useState<DateFilter>('all')

  const sum = (s: PaymentStatus) => orders.filter((o) => o.payment.status === s).reduce((t, o) => t + o.total, 0)
  const count = (s: PaymentStatus) => orders.filter((o) => o.payment.status === s).length
  const rows = orders.filter(
    (o) =>
      (status === 'all' || o.payment.status === status) &&
      (method === 'all' || o.payment.method === method) &&
      (when === 'all' || (when === 'recent') === RECENT.includes(o.placedAt)),
  )
  const shownTotal = rows.reduce((t, o) => t + o.total, 0)

  return (
    <Screen
      header={
        <>
          <TopBar title="Payment Monitoring" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All', count: orders.length },
                { value: 'paid', label: 'Paid', count: count('paid') },
                { value: 'pending', label: 'Pending', count: count('pending') },
                { value: 'failed', label: 'Failed', count: count('failed') },
                { value: 'refunded', label: 'Refunded', count: count('refunded') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-4 px-5 py-4">
        <MetricGrid
          items={[
            { label: 'Collected', value: inr(sum('paid')), hint: `${count('paid')} payments` },
            { label: 'COD pending', value: inr(sum('pending')), hint: `${count('pending')} to collect` },
            { label: 'Failed', value: inr(sum('failed')), hint: `${count('failed')} to follow up` },
            { label: 'Refunded', value: inr(sum('refunded')), hint: `${count('refunded')} cancelled` },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select value={method} onChange={(e) => setMethod(e.target.value as MethodFilter)} aria-label="Payment method">
            <option value="all">All methods</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cod">Cash on Delivery</option>
          </Select>
          <Select value={when} onChange={(e) => setWhen(e.target.value as DateFilter)} aria-label="Date">
            <option value="all">All dates</option>
            <option value="recent">Last 3 days</option>
            <option value="earlier">Earlier</option>
          </Select>
        </div>

        <p className="flex items-baseline justify-between gap-3 text-xs font-semibold text-slate-500">
          <span>
            {rows.length} {rows.length === 1 ? 'transaction' : 'transactions'}
          </span>
          <span className="text-slate-900 tabular-nums">{inr(shownTotal)}</span>
        </p>

        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="No transactions match" description="Change the status, method or date filter." />
        ) : (
          <ListGroup>
            {rows.map((o) => (
              <div key={o.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-bold text-slate-900">{o.patient.name}</p>
                  <p className="shrink-0 text-[13px] font-extrabold text-slate-900 tabular-nums">{inr(o.total)}</p>
                </div>
                <p className="truncate text-xs text-slate-500">
                  TXN{o.id.slice(4)} ·{' '}
                  <Link to={`/admin/orders/${o.id}`} className="font-semibold text-brand-700">
                    {o.id}
                  </Link>{' '}
                  · {o.placedAt}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={paymentStatusTone[o.payment.status]} dot>
                      {paymentStatusLabel[o.payment.status]}
                    </Badge>
                    <Badge>{paymentMethodLabel[o.payment.method]}</Badge>
                  </span>
                  {o.payment.status === 'pending' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPaymentStatus(o.id, 'paid')
                        toast(`Cash marked as received for ${o.id}`)
                      }}
                    >
                      Mark received
                    </Button>
                  ) : o.payment.status === 'failed' ? (
                    <Button size="sm" variant="secondary" onClick={() => toast(`Payment link sent to +91 ${o.patient.mobile} (demo)`)}>
                      Send link
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </ListGroup>
        )}

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
          Sample transactions. No real payment is collected, refunded or sent from this prototype.
        </p>
      </div>
    </Screen>
  )
}
