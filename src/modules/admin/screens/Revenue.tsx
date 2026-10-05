import { useState } from 'react'
import { Calculator, CreditCard, Info } from 'lucide-react'
import { BarList } from '@/components/charts/BarList'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { cardClass, FilterChips, GroupLabel, ListGroup, MenuRow } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { revenue } from '@/data/admin'
import { CHART, CHART_SERIES } from '@/lib/chart'
import { cn, compactInr, inr, monthYear } from '@/lib/utils'

type Range = 'mtd' | 'last' | 'six'

export default function Revenue() {
  const { months, monthly, channels, categories, collection, ordersMtd } = revenue
  const [range, setRange] = useState<Range>('mtd')
  const last = monthly.length - 1
  const mtd = monthly[last]
  const averageOrder = mtd / ordersMtd

  const totals: Record<Range, { value: number; label: string }> = {
    mtd: { value: mtd, label: `${monthYear()} to date` },
    last: { value: monthly[last - 1], label: monthYear(1) },
    six: { value: monthly.slice(last - 6, last).reduce((sum, v) => sum + v, 0), label: 'Last 6 full months' },
  }
  const total = totals[range].value
  // The breakdowns exist for the current month only, so other ranges reuse the same split (sample data).
  const scale = total / mtd
  const scaled = <T extends { value: number }>(items: T[]) => items.map((item) => ({ ...item, value: Math.round(item.value * scale) }))
  const orders = range === 'mtd' ? ordersMtd : Math.round(total / averageOrder)
  const growth = Math.round(((monthly[last - 1] - monthly[last - 2]) / monthly[last - 2]) * 100)

  const facts = [
    { label: 'Orders', value: orders.toLocaleString('en-IN') },
    { label: 'Avg. order', value: inr(total / orders) },
    { label: 'Monthly growth', value: `${growth >= 0 ? '+' : ''}${growth}%` },
  ]

  return (
    <Screen
      header={
        <>
          <TopBar title="Revenue Analytics" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={range}
              onChange={setRange}
              options={[
                { value: 'mtd', label: 'This month' },
                { value: 'last', label: 'Last month' },
                { value: 'six', label: 'Last 6 months' },
              ]}
            />
          </div>
        </>
      }
    >
      <div key={range} className="animate-rise space-y-6 px-5 py-4">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 text-white shadow-float">
          <span className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-brand-600/30 blur-3xl" />
          <p className="relative text-xs font-semibold text-slate-400">Revenue · {totals[range].label}</p>
          <p className="relative mt-1 text-[34px] leading-none font-extrabold tracking-tight tabular-nums">{compactInr(total)}</p>
          <dl className="relative mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.06] py-3 ring-1 ring-white/10">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0 px-3">
                <dd className="truncate text-[15px] leading-none font-extrabold tabular-nums">{fact.value}</dd>
                <dt className="mt-1.5 truncate text-[11px] font-medium text-slate-400">{fact.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <section>
          <GroupLabel>Monthly revenue · last 11 full months</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            {/* The current month is incomplete, so the trend shows full months only. */}
            <TrendChart
              labels={months.slice(0, last)}
              series={[{ name: 'Revenue', color: CHART.blue, values: monthly.slice(0, last) }]}
              format={compactInr}
              area
              height={180}
            />
          </div>
        </section>

        <section>
          <GroupLabel>By channel</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <DonutChart centerLabel="Total revenue" format={compactInr} segments={scaled(channels).map((c, i) => ({ ...c, color: CHART_SERIES[i] }))} />
          </div>
        </section>

        <section>
          <GroupLabel>By test category</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <BarList items={scaled(categories).map((c) => ({ ...c, hint: `${Math.round((c.value / total) * 100)}%` }))} format={compactInr} />
          </div>
        </section>

        <section>
          <GroupLabel>By collection type</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <BarList items={scaled(collection).map((c) => ({ ...c, hint: `${Math.round((c.value / total) * 100)}%` }))} format={compactInr} />
          </div>
        </section>

        <ListGroup>
          <MenuRow icon={CreditCard} label="Payment Monitoring" hint="Transactions and payment status" to="/admin/payments" />
          <MenuRow icon={Calculator} label="Commission Calculation" hint="Doctor and franchise payouts" to="/admin/commissions" />
        </ListGroup>

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
          Sample figures. Breakdowns for periods other than this month reuse this month's split.
        </p>
      </div>
    </Screen>
  )
}
