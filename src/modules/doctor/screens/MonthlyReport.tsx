import { useState } from 'react'
import { Download, Users } from 'lucide-react'
import { BarList } from '@/components/charts/BarList'
import { DonutChart } from '@/components/charts/DonutChart'
import { cardClass, FilterChips, GroupLabel, ListGroup } from '@/components/mobile/Kit'
import { MetricGrid } from '@/components/mobile/Metrics'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { monthlyReports, referralPeriod, referrals } from '@/data/doctor'
import { CHART_SERIES } from '@/lib/chart'
import { cn, inr } from '@/lib/utils'
import { ReferralRow } from '../components/Shared'

export default function MonthlyReport() {
  const toast = useToast()
  const [period, setPeriod] = useState(monthlyReports[1].period) // default to the last full month
  const index = monthlyReports.findIndex((r) => r.period === period)
  const report = monthlyReports[index]
  const previous = monthlyReports[index + 1]
  const pending = report.referrals - report.completed
  const completion = Math.round((report.completed / report.referrals) * 100)
  const change = previous ? Math.round(((report.referrals - previous.referrals) / previous.referrals) * 100) : null
  const listed = referrals.filter((r) => referralPeriod(r) === period)

  return (
    <Screen
      header={
        <>
          <TopBar title="Monthly Referral Report" back="/doctor/earnings" />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={period}
              onChange={setPeriod}
              options={monthlyReports.map((r, i) => ({ value: r.period, label: i === 0 ? `${r.period} (to date)` : r.period }))}
            />
          </div>
        </>
      }
      footer={
        <Button size="lg" block icon={Download} onClick={() => toast(`Referral report for ${report.period} downloaded (demo)`)}>
          Download PDF
        </Button>
      }
    >
      <div key={period} className="animate-rise space-y-6 px-5 py-4">
        <section>
          <GroupLabel
            action={
              change !== null && (
                <span className={cn('text-xs font-bold', change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  {change >= 0 ? '+' : ''}
                  {change}% referrals vs {previous.period}
                </span>
              )
            }
          >
            {report.period}
          </GroupLabel>
          <MetricGrid
            items={[
              { label: 'Patients referred', value: String(report.referrals) },
              { label: 'Completed', value: String(report.completed), hint: 'report released' },
              { label: 'Pending', value: String(pending), hint: 'in progress or cancelled' },
              { label: 'Commission', value: inr(report.commission), hint: `on ${inr(report.orderValue)} order value` },
            ]}
          />
          <div className={cn(cardClass, 'mt-3 p-4')}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="font-semibold text-slate-600">Completion rate</span>
              <span className="font-extrabold text-slate-900 tabular-nums">{completion}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100" role="img" aria-label={`${completion}% of referrals completed`}>
              <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </section>

        <section>
          <GroupLabel>Referrals by test type</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <BarList items={report.categories} />
          </div>
        </section>

        <section>
          <GroupLabel>How patients were referred</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <DonutChart centerLabel="Referrals" segments={report.channels.map((c, i) => ({ ...c, color: CHART_SERIES[i] }))} />
          </div>
        </section>

        <section>
          <GroupLabel>Referral history · {report.period}</GroupLabel>
          {listed.length === 0 ? (
            <div className={cardClass}>
              <EmptyState
                icon={Users}
                title="No individual records"
                description="The sample data lists individual referrals for recent weeks only. Totals for this month are shown above."
              />
            </div>
          ) : (
            <>
              <ListGroup>
                {listed.map((referral) => (
                  <ReferralRow key={referral.id} referral={referral} />
                ))}
              </ListGroup>
              <p className="mt-2 px-1 text-[11px] text-slate-400">
                Showing {listed.length} sample records of the {report.referrals} referrals this month.
              </p>
            </>
          )}
        </section>

        <section>
          <GroupLabel>Month by month</GroupLabel>
          <ListGroup>
            {monthlyReports.map((r) => (
              <button
                key={r.period}
                type="button"
                onClick={() => setPeriod(r.period)}
                aria-pressed={r.period === period}
                className={cn('flex w-full items-center justify-between gap-3 px-4 py-3 text-left', r.period === period && 'bg-brand-50/60')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{r.period}</p>
                  <p className="truncate text-xs text-slate-500">
                    {r.referrals} referred · {r.completed} completed
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-extrabold text-slate-900 tabular-nums">{inr(r.commission)}</p>
              </button>
            ))}
          </ListGroup>
        </section>
      </div>
    </Screen>
  )
}
