import { useState } from 'react'
import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { BellOff, CheckCheck, CircleAlert, Clock, FileClock, Info, Siren, Truck } from 'lucide-react'
import { cardClass, FilterChips } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import type { AdminAlert, AlertKind, AlertSeverity } from '@/data/admin'
import { cn } from '@/lib/utils'
import { useAdmin } from '../AdminContext'

type Filter = 'all' | 'unread' | 'urgent' | 'delayed'

const severityTone: Record<AlertSeverity, BadgeTone> = { Urgent: 'red', Warning: 'amber', Info: 'neutral' }

const kindMeta: Record<AlertKind, { icon: LucideIcon; tint: string }> = {
  'urgent-order': { icon: Siren, tint: 'bg-red-50 text-red-600' },
  'collection-delay': { icon: Clock, tint: 'bg-amber-50 text-amber-600' },
  'transit-delay': { icon: Truck, tint: 'bg-amber-50 text-amber-600' },
  'report-delay': { icon: FileClock, tint: 'bg-amber-50 text-amber-600' },
  info: { icon: Info, tint: 'bg-slate-100 text-slate-500' },
}

const edgeTone: Record<AlertSeverity, string> = { Urgent: 'bg-red-500', Warning: 'bg-amber-400', Info: 'bg-slate-200' }

const isDelay = (alert: AdminAlert) => alert.kind.endsWith('-delay')

const matches: Record<Filter, (alert: AdminAlert) => boolean> = {
  all: () => true,
  unread: (a) => !a.read && !a.resolved,
  urgent: (a) => a.severity === 'Urgent' && !a.resolved,
  delayed: (a) => isDelay(a) && !a.resolved,
}

export default function Alerts() {
  const { alerts, unreadAlerts, orders, setAlertRead, markAllAlertsRead } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const rows = alerts.filter(matches[filter])
  const count = (f: Filter) => alerts.filter(matches[f]).length

  return (
    <Screen
      header={
        <>
          <TopBar
            title="Alerts & Delays"
            back="/admin/more"
            right={
              <button
                type="button"
                onClick={markAllAlertsRead}
                disabled={unreadAlerts === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-white hover:bg-white/10 disabled:text-white/35 disabled:hover:bg-transparent"
              >
                <CheckCheck className="size-4" />
                Read all
              </button>
            }
          />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: count('all') },
                { value: 'unread', label: 'Unread', count: count('unread') },
                { value: 'urgent', label: 'Urgent', count: count('urgent') },
                { value: 'delayed', label: 'Delayed', count: count('delayed') },
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-3 px-5 py-4">
        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <CircleAlert className="mt-px size-3.5 shrink-0 text-slate-400" />
          <span>
            <span className="font-bold">{unreadAlerts} unread.</span> Prototype alerts from sample data — these are not
            real-time notifications.
          </span>
        </p>

        {rows.length === 0 ? (
          <EmptyState icon={BellOff} title="No alerts in this view" description="Nothing needs attention here right now." />
        ) : (
          rows.map((alert) => {
            const { icon: Icon, tint } = kindMeta[alert.kind]
            const order = orders.find((o) => o.id === alert.orderId)
            return (
              <article
                key={alert.id}
                className={cn(cardClass, 'relative overflow-hidden p-4', (alert.read || alert.resolved) && 'bg-slate-50/60')}
                aria-label={`${alert.severity}: ${alert.title}${alert.read ? '' : ' (unread)'}`}
              >
                {/* severity is carried by a thin edge, the icon tint and the chip — not a coloured card */}
                <span className={cn('absolute inset-y-0 left-0 w-1', alert.resolved ? 'bg-slate-200' : edgeTone[alert.severity])} aria-hidden="true" />
                {!alert.read && !alert.resolved && <span className="absolute top-4 right-4 size-2.5 rounded-full bg-brand-600" aria-hidden="true" />}
                <div className="flex items-start gap-3 pr-5">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tint)}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {alert.resolved ? <Badge tone="green">Resolved</Badge> : <Badge tone={severityTone[alert.severity]}>{alert.severity}</Badge>}
                      <span className="text-xs text-slate-500">{alert.time}</span>
                    </div>
                    <p className={cn('mt-1.5 text-[15px] leading-snug text-slate-900', alert.read ? 'font-semibold' : 'font-bold')}>
                      {alert.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-slate-600">{alert.summary}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-3">
                  <span className="text-xs font-bold tracking-wide text-slate-500">{alert.orderId}</span>
                  {order && <OrderStatusBadge status={order.status} />}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" block onClick={() => setAlertRead(alert.id, !alert.read)}>
                    {alert.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                  {order ? (
                    <Link to={`/admin/orders/${order.id}`} onClick={() => setAlertRead(alert.id, true)}>
                      <Button size="sm" variant="soft" block>
                        Open order
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="soft" block disabled>
                      Order unavailable
                    </Button>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </Screen>
  )
}
