import { Navigate, useParams } from 'react-router'
import { ScanBarcode } from 'lucide-react'
import { cardClass, GroupLabel, ListGroup, MenuRow, WorkflowSteps } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { Avatar, DetailRow } from '@/components/ui/Display'
import { Field, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { OrderStatusBadge, PaymentBadge } from '@/components/ui/StatusBadges'
import { sampleBarcode } from '@/lib/sample'
import { collectionLabel, sourceLabel, statusLabel, stepsFor } from '@/lib/status'
import { cn, inr } from '@/lib/utils'
import type { OrderStatus } from '@/types'
import { useAdmin } from '../AdminContext'

export default function OrderDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { orders, phlebotomists, setOrderStatus, assignPhlebotomist } = useAdmin()
  const order = orders.find((o) => o.id === id)
  if (!order) return <Navigate to="/admin/orders" replace />

  const steps = stepsFor(order.collectionType)
  const nextStep = order.status === 'cancelled' ? undefined : steps[steps.findIndex((s) => s.key === order.status) + 1]

  return (
    <Screen header={<TopBar title={`Order ${order.id}`} back="/admin/orders" />}
      footer={
        // assigning is done with the phlebotomist picker below, so it has no one-tap button
        nextStep && nextStep.key !== 'assigned' ? (
          <Button
            size="lg"
            block
            onClick={() => {
              setOrderStatus(order.id, nextStep.key)
              toast(`${order.id} moved to “${nextStep.label}”`)
            }}
          >
            <span className="truncate">Mark “{nextStep.label}”</span>
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-4')}>
          <div className="flex items-center gap-3">
            <Avatar name={order.patient.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-bold tracking-tight text-slate-900">{order.patient.name}</p>
              <p className="text-[13px] text-slate-500">
                {order.patient.age} yrs · {order.patient.gender} · +91 {order.patient.mobile}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-slate-200 pt-3">
            <OrderStatusBadge status={order.status} />
            <PaymentBadge method={order.payment.method} status={order.payment.status} />
          </div>
        </div>

        <section>
          <GroupLabel>Manage order</GroupLabel>
          <div className={cn(cardClass, 'space-y-4 p-4')}>
            <Field label="Order status">
              <Select
                value={order.status}
                onChange={(e) => {
                  const status = e.target.value as OrderStatus
                  setOrderStatus(order.id, status)
                  toast(`${order.id} moved to “${statusLabel[status]}”`)
                }}
              >
                {stepsFor(order.collectionType).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
            <Field label="Phlebotomist">
              <Select
                value={order.phlebotomistId ?? ''}
                disabled={order.collectionType === 'lab'}
                onChange={(e) => {
                  assignPhlebotomist(order.id, e.target.value)
                  toast(`Phlebotomist assigned to ${order.id}`)
                }}
              >
                <option value="" disabled>
                  {order.collectionType === 'lab' ? 'Not needed (lab visit)' : 'Select phlebotomist'}
                </option>
                {phlebotomists
                  .filter((p) => p.status !== 'off-duty')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.zone.split(' · ')[0]}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
        </section>

        <section>
          <GroupLabel>Progress</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <WorkflowSteps status={order.status} collectionType={order.collectionType} />
          </div>
        </section>

        <ListGroup>
          <MenuRow icon={ScanBarcode} label="Sample tracking" hint={`Barcode ${sampleBarcode(order.id)}`} to={`/admin/samples/${order.id}`} />
        </ListGroup>

        <section>
          <GroupLabel>Collection</GroupLabel>
          <dl className={cn(cardClass, 'divide-y divide-slate-100 px-4 py-1.5')}>
            <DetailRow label={collectionLabel[order.collectionType]}>
              {order.location}
              <br />
              <span className="font-medium text-slate-500">{order.area}</span>
            </DetailRow>
            <DetailRow label="Slot">
              {order.date}
              <br />
              {order.slot}
            </DetailRow>
            <DetailRow label="Source">{sourceLabel[order.source]}</DetailRow>
            {order.sourceName && <DetailRow label="Referred by">{order.sourceName}</DetailRow>}
            <DetailRow label="Placed on">{order.placedAt}</DetailRow>
          </dl>
        </section>

        <section>
          <GroupLabel>Tests</GroupLabel>
          <ListGroup>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="font-semibold text-slate-700 tabular-nums">{inr(item.price)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-sm">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-extrabold text-slate-900 tabular-nums">{inr(order.total)}</span>
            </div>
          </ListGroup>
        </section>
      </div>
    </Screen>
  )
}
