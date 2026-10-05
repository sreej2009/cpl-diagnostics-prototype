import { Navigate, useParams } from 'react-router'
import { MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { cardClass, GroupLabel, ListGroup } from '@/components/mobile/Kit'
import { MetricGrid } from '@/components/mobile/Metrics'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { Avatar, DetailRow } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { customers } from '@/data/admin'
import { isActive } from '@/lib/status'
import { cn, inr } from '@/lib/utils'
import { useAdmin } from '../AdminContext'
import { OrderRow } from '../components/OrderRow'

export default function CustomerDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { orders } = useAdmin()
  const customer = customers.find((c) => c.id === id)
  if (!customer) return <Navigate to="/admin/customers" replace />

  const history = orders.filter((o) => o.patient.mobile === customer.mobile)
  const reportsReady = history.filter((o) => o.status === 'reported').length
  const inProgress = history.filter((o) => isActive(o.status)).length

  return (
    <Screen header={<TopBar title="Customer" back="/admin/customers" />}>
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-4')}>
          <div className="flex items-center gap-3">
            <Avatar name={customer.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">{customer.name}</p>
              <p className="text-sm text-slate-500">
                +91 {customer.mobile} · {customer.area}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button variant="secondary" block icon={Phone} onClick={() => toast('Calling is disabled in the prototype', 'info')}>
              Call
            </Button>
            <Button
              variant="secondary"
              block
              icon={MessageCircle}
              disabled={!customer.whatsapp}
              onClick={() => toast('WhatsApp is not connected in the prototype', 'info')}
            >
              WhatsApp
            </Button>
          </div>
        </div>

        <MetricGrid
          items={[
            { label: 'Orders', value: String(customer.orders), hint: 'all time' },
            { label: 'Total spent', value: inr(customer.spent), hint: 'all time' },
            { label: 'Reports ready', value: String(reportsReady), hint: 'in recent orders' },
            { label: 'In progress', value: String(inProgress), hint: 'in recent orders' },
          ]}
        />

        <section>
          <GroupLabel>Details</GroupLabel>
          <dl className={cn(cardClass, 'divide-y divide-slate-100 px-4 py-1.5')}>
            <DetailRow label="Customer since">{customer.joined}</DetailRow>
            <DetailRow label="Last order">{customer.lastOrder}</DetailRow>
            <DetailRow label="WhatsApp reports">{customer.whatsapp ? 'Opted in' : 'Off'}</DetailRow>
          </dl>
        </section>

        <section>
          <GroupLabel>Booking history</GroupLabel>
          {history.length === 0 ? (
            <p className={cn(cardClass, 'px-4 py-5 text-center text-sm text-slate-500')}>No orders in the last few days.</p>
          ) : (
            <ListGroup>
              {history.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ListGroup>
          )}
        </section>

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-slate-400" />
          Only booking and report status is shown here. Test results stay in the report itself.
        </p>
      </div>
    </Screen>
  )
}
