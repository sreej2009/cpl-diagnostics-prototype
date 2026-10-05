import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { cn, inr } from '@/lib/utils'
import type { Order } from '@/types'

export type OrderFlag = 'Urgent' | 'Delayed'

/** Dense order row for lists where several orders share one card. */
export function OrderRow({ order, flag }: { order: Order; flag?: OrderFlag }) {
  return (
    <Link to={`/admin/orders/${order.id}`} className="relative block px-4 py-3 transition-colors hover:bg-slate-50">
      {/* priority is shown by an edge marker and a chip, not by colouring the whole row */}
      {flag && (
        <span
          className={cn('absolute inset-y-2 left-0 w-[3px] rounded-r-full', flag === 'Urgent' ? 'bg-red-500' : 'bg-amber-400')}
          aria-hidden="true"
        />
      )}
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-sm font-bold text-slate-900">{order.patient.name}</p>
        <p className="shrink-0 text-[13px] font-extrabold text-slate-900 tabular-nums">{inr(order.total)}</p>
      </div>
      <p className="truncate text-xs text-slate-500">
        {order.id} · {order.items.map((i) => i.name).join(', ')}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="flex shrink-0 items-center gap-1.5">
          <OrderStatusBadge status={order.status} />
          {flag && <Badge tone={flag === 'Urgent' ? 'red' : 'amber'}>{flag}</Badge>}
        </span>
        <span className="min-w-0 truncate text-[11px] text-slate-400">
          {order.area} · {order.slot.split(' – ')[0]}
        </span>
      </div>
    </Link>
  )
}
