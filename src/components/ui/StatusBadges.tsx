import { paymentMethodLabel, paymentStatusLabel, paymentStatusTone, statusLabel, statusTone } from '@/lib/status'
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types'
import { Badge } from './Badge'

/** `label` overrides the default English text (the Patient App passes a translated one). */
export function OrderStatusBadge({ status, label }: { status: OrderStatus; label?: string }) {
  return (
    <Badge tone={statusTone[status]} dot>
      {label ?? statusLabel[status]}
    </Badge>
  )
}

export function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  return (
    <Badge tone={paymentStatusTone[status]}>
      {paymentMethodLabel[method]} · {paymentStatusLabel[status]}
    </Badge>
  )
}
