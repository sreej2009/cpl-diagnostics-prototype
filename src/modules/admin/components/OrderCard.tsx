import { Link } from 'react-router'
import { Building2, House } from 'lucide-react'
import { cardClass } from '@/components/mobile/Kit'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { paymentMethodLabel, paymentStatusLabel, sourceLabel } from '@/lib/status'
import { cn, inr } from '@/lib/utils'
import type { Order } from '@/types'

/** One order as a tappable card that opens the order detail screen. */
export function OrderCard({ order }: { order: Order }) {
  const Icon = order.collectionType === 'home' ? House : Building2
  return (
    <Link to={`/admin/orders/${order.id}`} className={cn(cardClass, 'block p-4')}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-wide text-slate-500">{order.id}</p>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-2 truncate text-[15px] font-bold text-slate-900">{order.patient.name}</p>
      <p className="mt-0.5 truncate text-[13px] text-slate-500">{order.items.map((i) => i.name).join(', ')}</p>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3 text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-slate-500">
          <Icon className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {order.area} · {sourceLabel[order.source]}
          </span>
        </span>
        <span className="shrink-0 text-slate-500">
          {paymentMethodLabel[order.payment.method]} {paymentStatusLabel[order.payment.status].toLowerCase()}
          <span className="ml-2 text-sm font-extrabold text-slate-900">{inr(order.total)}</span>
        </span>
      </div>
    </Link>
  )
}
