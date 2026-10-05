import { useState } from 'react'
import { ChartColumn, Clock, History, Info, Percent } from 'lucide-react'
import { BarChart } from '@/components/charts/BarChart'
import { cardClass, FilterChips, GroupLabel, ListGroup, MenuRow } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Display'
import { commissionOn, doctorProfile, earningsHistory, monthlyReports, payouts, referralPeriod, referrals } from '@/data/doctor'
import { cn, compactInr, inr } from '@/lib/utils'

const ALL = 'all'

export default function Earnings() {
  const [period, setPeriod] = useState<string>(ALL)

  // Same figures as the Monthly Referral Report and the payout history.
  const months = period === ALL ? monthlyReports : monthlyReports.filter((m) => m.period === period)
  const earned = months.reduce((sum, m) => sum + m.commission, 0)
  const shownPayouts = period === ALL ? payouts : payouts.filter((p) => p.period === period)
  const paid = shownPayouts.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
  const processing = shownPayouts.filter((p) => p.status === 'Processing').reduce((sum, p) => sum + p.amount, 0)
  const accruing = Math.max(earned - paid - processing, 0)
  const credited = referrals.filter((r) => r.status === 'reported' && (period === ALL || referralPeriod(r) === period))

  const split = [
    { label: 'Paid', value: paid, bar: 'bg-teal-400' },
    { label: 'Processing', value: processing, bar: 'bg-amber-300' },
    { label: 'Accruing', value: accruing, bar: 'bg-white/30' },
  ]

  return (
    <Screen
      header={
        <TabHeader title="Earnings" subtitle="Incentives are credited when a report is released">
          <FilterChips
            className="mt-3"
            value={period}
            onChange={setPeriod}
            options={[{ value: ALL, label: 'Last 6 months' }, ...monthlyReports.map((m) => ({ value: m.period, label: m.period }))]}
          />
        </TabHeader>
      }
    >
      <div className="space-y-6 px-5 py-4">
        {/* Earned, with how much of it is paid, in process or still accruing */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-5 text-white shadow-float">
          <span className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-brand-600/35 blur-3xl" />
          <p className="relative text-xs font-semibold text-brand-200">Earned · {period === ALL ? 'last 6 months' : period}</p>
          <p className="relative mt-1 text-[34px] leading-none font-extrabold tracking-tight tabular-nums">{inr(earned)}</p>
          <div className="relative mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            {split.map((s) => s.value > 0 && <span key={s.label} className={s.bar} style={{ width: `${(s.value / Math.max(earned, 1)) * 100}%` }} />)}
          </div>
          <dl className="relative mt-3.5 grid grid-cols-3 gap-2">
            {split.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-[11px] font-medium text-brand-200">
                  <span className={cn('size-2 shrink-0 rounded-full', s.bar)} />
                  <span className="truncate">{s.label}</span>
                </dt>
                <dd className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums">{inr(s.value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {period === ALL && (
          <section>
            <GroupLabel>Monthly earnings</GroupLabel>
            <div className={cn(cardClass, 'p-4')}>
              <BarChart labels={earningsHistory.months} values={earningsHistory.earnings} name="Earnings" format={compactInr} height={180} />
            </div>
          </section>
        )}

        <section>
          <GroupLabel>Payout history</GroupLabel>
          {shownPayouts.length === 0 ? (
            <div className={cardClass}>
              <EmptyState
                icon={Clock}
                title="No payout yet"
                description={`Incentives for ${period} are still accruing. The payout is created after the month ends.`}
              />
            </div>
          ) : (
            <ListGroup>
              {shownPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{payout.period}</p>
                    <p className="truncate text-xs text-slate-500">
                      {payout.status === 'Paid' ? `Paid ${payout.paidOn} · ${payout.reference}` : 'Being processed'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-extrabold text-slate-900 tabular-nums">{inr(payout.amount)}</p>
                    <Badge tone={payout.status === 'Paid' ? 'green' : 'amber'} dot className="mt-1">
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </ListGroup>
          )}
        </section>

        <section>
          <GroupLabel>Recently credited referrals</GroupLabel>
          {credited.length === 0 ? (
            <p className={cn(cardClass, 'px-4 py-5 text-center text-[13px] text-slate-500')}>
              No individually listed referrals were credited in this period.
            </p>
          ) : (
            <ListGroup>
              {credited.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{referral.patient}</p>
                    <p className="truncate text-xs text-slate-500">
                      {referral.date} · Order {inr(referral.orderValue)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[15px] font-extrabold text-teal-700 tabular-nums">+{inr(commissionOn(referral.orderValue))}</p>
                </div>
              ))}
            </ListGroup>
          )}
        </section>

        <ListGroup>
          <MenuRow icon={History} label="Referrals & Payout History" hint="Commission status and payouts, by month" to="/doctor/referral-payouts" />
          <MenuRow icon={ChartColumn} label="Monthly Referral Report" hint="Referrals and incentive, month by month" to="/doctor/monthly-report" />
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <Percent className="size-[18px]" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-bold text-slate-900">Incentive rate</p>
            <p className="shrink-0 text-sm font-extrabold text-slate-900">{doctorProfile.commissionRate}%</p>
          </div>
        </ListGroup>

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
          Sample data for the prototype. No real payments or payouts have been made.
        </p>
      </div>
    </Screen>
  )
}
