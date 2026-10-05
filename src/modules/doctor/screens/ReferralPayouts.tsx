import { useState } from 'react'
import { Link } from 'react-router'
import { Banknote, CircleCheck, Clock, Copy, Hourglass, Info, ReceiptText, Users, Wallet } from 'lucide-react'
import { cardClass, FilterChips, GroupLabel, StatTile } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { Tabs } from '@/components/ui/Tabs'
import { commissionOn, commissionStatus, doctorProfile, monthlyReports, payouts, referralPeriod, referrals } from '@/data/doctor'
import type { CommissionStatus } from '@/data/doctor'
import { cn, inr } from '@/lib/utils'

const ALL = 'all'

const commissionTone: Record<CommissionStatus, BadgeTone> = {
  Paid: 'green',
  Processing: 'brand',
  'Pending payout': 'amber',
  'Awaiting completion': 'neutral',
  'Not applicable': 'neutral',
}

export default function ReferralPayouts() {
  const toast = useToast()
  const [period, setPeriod] = useState<string>(ALL)
  const [tab, setTab] = useState<'referrals' | 'payouts'>('referrals')

  // Monthly totals come from the same figures as the Earnings and Monthly Report screens.
  const months = period === ALL ? monthlyReports : monthlyReports.filter((m) => m.period === period)
  const totalReferrals = months.reduce((sum, m) => sum + m.referrals, 0)
  const completed = months.reduce((sum, m) => sum + m.completed, 0)
  const earned = months.reduce((sum, m) => sum + m.commission, 0)

  const shownPayouts = period === ALL ? payouts : payouts.filter((p) => p.period === period)
  const paid = shownPayouts.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)

  const shownReferrals = period === ALL ? referrals : referrals.filter((r) => referralPeriod(r) === period)

  const copy = () => {
    // Clipboard access can be blocked (insecure origin, permissions) — the toast still confirms the code.
    navigator.clipboard?.writeText(doctorProfile.referralCode).catch(() => {})
    toast(`Referral code ${doctorProfile.referralCode} copied`)
  }

  return (
    <Screen
      header={
        <>
          <TopBar title="Referrals & Payout History" back="/doctor/earnings" />
          <div className="shrink-0 border-b border-slate-100 bg-white py-3">
            <FilterChips
              value={period}
              onChange={setPeriod}
              options={[{ value: ALL, label: 'Last 6 months' }, ...monthlyReports.map((m) => ({ value: m.period, label: m.period }))]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-5 px-5 py-4">
        <div className={cn(cardClass, 'flex items-center gap-3 p-4')}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold tracking-[0.14em] text-brand-600 uppercase max-[360px]:tracking-wide">Your referral code</p>
            <p className="mt-0.5 truncate text-lg font-extrabold tracking-wider text-slate-900 max-[360px]:text-[15px] max-[360px]:tracking-normal">{doctorProfile.referralCode}</p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand-50 px-3.5 text-[13px] font-bold text-brand-700 hover:bg-brand-100"
          >
            <Copy className="size-4" />
            Copy
          </button>
        </div>

        <section>
          <GroupLabel>Referral statistics</GroupLabel>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Total referrals" value={String(totalReferrals)} icon={Users} />
            <StatTile label="Completed" value={String(completed)} icon={CircleCheck} tone="teal" />
            <StatTile label="Pending" value={String(totalReferrals - completed)} icon={Hourglass} tone="amber" />
          </div>
        </section>

        <section>
          <GroupLabel>Earnings summary</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <ReceiptText className="size-5" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-slate-600">Total earned</p>
                <p className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900">{inr(earned)}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-slate-200 pt-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Wallet className="size-3.5 text-amber-600" />
                  Pending payout
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">{inr(earned - paid)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Banknote className="size-3.5 text-teal-600" />
                  Paid amount
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">{inr(paid)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
          Sample data for the prototype. No real payments or payouts have been made.
        </p>

        <Tabs
          block
          value={tab}
          onChange={setTab}
          options={[
            { value: 'referrals', label: 'Referral history', count: shownReferrals.length },
            { value: 'payouts', label: 'Payout history', count: shownPayouts.length },
          ]}
        />

        {tab === 'referrals' ? (
          shownReferrals.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No individual records"
              description={`The sample data lists individual referrals for recent weeks only. Totals for ${period} are shown above.`}
            />
          ) : (
            <div className="space-y-3">
              <p className="px-1 text-xs text-slate-500">Showing the most recent referrals in this period.</p>
              {shownReferrals.map((r) => {
                const status = commissionStatus(r)
                return (
                  <Link key={r.id} to={`/doctor/referrals/${r.id}`} className={cn(cardClass, 'block p-4')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold text-slate-900">{r.patient}</p>
                        <p className="truncate text-xs text-slate-500">
                          {r.orderId} · {r.date}
                        </p>
                      </div>
                      <p className="shrink-0 text-[15px] font-extrabold text-slate-900 tabular-nums">
                        {r.status === 'cancelled' ? '—' : inr(commissionOn(r.orderValue))}
                      </p>
                    </div>
                    <p className="mt-1.5 truncate text-[13px] text-slate-600">{r.tests}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-200 pt-3">
                      <OrderStatusBadge status={r.status} />
                      <Badge tone={commissionTone[status]}>Commission: {status}</Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        ) : shownPayouts.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No payout yet"
            description={`Incentives for ${period} are still accruing. The payout is created after the month ends.`}
          />
        ) : (
          <div className={cn(cardClass, 'divide-y divide-slate-100')}>
            {shownPayouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{p.period}</p>
                  <p className="truncate text-xs text-slate-500">
                    {p.status === 'Paid' ? `Paid ${p.paidOn} · ${p.reference}` : 'Being processed'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-extrabold text-slate-900 tabular-nums">{inr(p.amount)}</p>
                  <Badge tone={p.status === 'Paid' ? 'green' : 'amber'} className="mt-1">
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
