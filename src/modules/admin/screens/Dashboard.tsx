import { Link } from 'react-router'
import { Banknote, Bell, FileCheck2, ScanBarcode, Siren, Syringe } from 'lucide-react'
import { BarList } from '@/components/charts/BarList'
import { TrendChart } from '@/components/charts/TrendChart'
import { cardClass, ListGroup, TextLink } from '@/components/mobile/Kit'
import { ActionRow } from '@/components/mobile/Metrics'
import { Screen, SectionTitle } from '@/components/mobile/Screen'
import { Avatar } from '@/components/ui/Display'
import { adminUser, dailyOrders, topTests } from '@/data/admin'
import { CHART } from '@/lib/chart'
import { isActive, ORDER_STEPS } from '@/lib/status'
import { cn, compactInr, fmtDate } from '@/lib/utils'
import type { Order } from '@/types'
import { useAdmin } from '../AdminContext'
import { OrderRow } from '../components/OrderRow'

function Pipeline({ orders }: { orders: Order[] }) {
  const counts = ORDER_STEPS.map((step) => ({ ...step, count: orders.filter((o) => o.status === step.key).length }))
  const total = Math.max(counts.reduce((sum, c) => sum + c.count, 0), 1)
  const shades = ['bg-brand-200', 'bg-brand-300', 'bg-brand-500', 'bg-brand-700', 'bg-teal-500']
  return (
    <>
      {/* one stacked bar instead of five separate ones */}
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Orders by workflow stage">
        {counts.map((step, i) => step.count > 0 && <span key={step.key} className={shades[i]} style={{ width: `${(step.count / total) * 100}%` }} />)}
      </div>
      <ul className="mt-3.5 space-y-2">
        {counts.map((step, i) => (
          <li key={step.key} className="flex items-center gap-2.5 text-[13px]">
            <span className={cn('size-2.5 shrink-0 rounded-[3px]', shades[i])} />
            <span className="flex-1 truncate font-medium text-slate-600">{step.label}</span>
            <span className="font-bold text-slate-900 tabular-nums">{step.count}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function Dashboard() {
  const { orders, alerts, unreadAlerts, sampleStage } = useAdmin()
  const { labels, values } = dailyOrders
  const unassigned = orders.filter((o) => o.status === 'placed' && o.collectionType === 'home').length
  const toRelease = orders.filter((o) => o.status === 'testing').length
  const inTransit = orders.filter((o) => sampleStage(o) === 'collected').length
  const codPending = orders.filter((o) => o.payment.status === 'pending').length
  const urgent = alerts.filter((a) => !a.read && !a.resolved && a.severity === 'Urgent').length

  const headline = [
    { label: 'Orders', value: String(values[values.length - 1]) },
    { label: 'Revenue', value: compactInr(86450) },
    { label: 'In progress', value: String(orders.filter((o) => isActive(o.status)).length) },
  ]

  return (
    <Screen>
      {/* Operations header: today's numbers at a glance */}
      <div className="relative overflow-hidden rounded-b-[1.75rem] bg-slate-900 px-5 pt-5 pb-5 text-white">
        <span className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{fmtDate(new Date())} · Main Lab</p>
            <h1 className="text-[22px] leading-tight font-extrabold tracking-tight">Operations today</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/admin/alerts"
              aria-label={`Alerts, ${unreadAlerts} unread`}
              className="relative grid size-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15"
            >
              <Bell className="size-[18px]" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-900">
                  {unreadAlerts}
                </span>
              )}
            </Link>
            <Link to="/admin/more" aria-label="More">
              <Avatar name={adminUser.name} className="ring-2 ring-white/20" />
            </Link>
          </div>
        </div>
        <dl className="relative mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.06] py-3 ring-1 ring-white/10">
          {headline.map((item) => (
            <div key={item.label} className="min-w-0 px-3">
              <dd className="truncate text-[19px] leading-none font-extrabold tracking-tight tabular-nums">{item.value}</dd>
              <dt className="mt-1.5 truncate text-[11px] font-medium text-slate-400">{item.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-6 px-5 pt-5 pb-8">
        <section className="animate-rise">
          <SectionTitle title="Needs attention" action={<TextLink to="/admin/alerts">Alerts</TextLink>} />
          <ListGroup>
            <ActionRow icon={Siren} label="Urgent alerts" hint="Unread urgent orders and delays" count={urgent} to="/admin/alerts" urgent />
            <ActionRow icon={Syringe} label="Assign phlebotomist" hint="Home collections waiting" count={unassigned} to="/admin/assign" />
            <ActionRow icon={ScanBarcode} label="Samples in transit" hint="Collected, not yet at the lab" count={inTransit} to="/admin/samples" />
            <ActionRow icon={FileCheck2} label="Reports to release" hint="Testing in progress" count={toRelease} to="/admin/reports" />
            <ActionRow icon={Banknote} label="COD to collect" hint="Cash payments pending" count={codPending} to="/admin/payments" />
          </ListGroup>
        </section>

        <section>
          <SectionTitle title="Latest orders" action={<TextLink to="/admin/orders">See all</TextLink>} />
          <ListGroup>
            {orders.slice(0, 4).map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ListGroup>
        </section>

        <section>
          <SectionTitle title="Order pipeline" />
          <div className={cn(cardClass, 'p-4')}>
            <Pipeline orders={orders} />
          </div>
        </section>

        <section>
          <SectionTitle title="Orders per day" action={<span className="text-xs font-medium text-slate-500">Last 14 days</span>} />
          <div className={cn(cardClass, 'p-4')}>
            <TrendChart labels={labels} series={[{ name: 'Orders', color: CHART.blue, values }]} area height={170} />
          </div>
        </section>

        <section>
          <SectionTitle title="Most booked" action={<TextLink to="/admin/revenue">Revenue</TextLink>} />
          <div className={cn(cardClass, 'p-4')}>
            <BarList items={topTests.slice(0, 4)} />
          </div>
        </section>
      </div>
    </Screen>
  )
}
