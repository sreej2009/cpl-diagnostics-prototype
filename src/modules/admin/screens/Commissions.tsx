import { useState } from 'react'
import { Info } from 'lucide-react'
import { cardClass, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Overlay'
import { Tabs } from '@/components/ui/Tabs'
import { referringDoctors } from '@/data/admin'
import { doctorProfile } from '@/data/doctor'
import { cn, inr, monthYear } from '@/lib/utils'
import { useAdmin, useAdminState } from '../AdminContext'
import { shortName } from './Franchises'

type View = 'doctor' | 'franchise' | 'history'

interface CommissionRow {
  id: string
  type: 'doctor' | 'franchise'
  name: string
  detail: string
  orders: number
  revenue: number
  rate: number
  commission: number
}

/** Earlier statements. Sample totals — the prototype only calculates the current month. */
const statements = [
  { period: monthYear(1), doctors: 51840, franchises: 191360, paidOn: '05' },
  { period: monthYear(2), doctors: 47210, franchises: 178940, paidOn: '05' },
  { period: monthYear(3), doctors: 49380, franchises: 169220, paidOn: '06' },
]

export default function Commissions() {
  const toast = useToast()
  const { franchises } = useAdmin()
  const [view, setView] = useState<View>('doctor')
  const [doctorRate, setDoctorRate] = useAdminState('commissions.doctorRate', String(doctorProfile.commissionRate))
  const [paid, setPaid] = useAdminState<string[]>('commissions.paid', [])
  const rate = Math.min(Number(doctorRate) || 0, 100)

  const rows: CommissionRow[] = [
    ...referringDoctors
      .filter((d) => d.completed > 0)
      .map((d) => ({
        id: d.id,
        type: 'doctor' as const,
        name: d.name,
        detail: d.referralCode,
        orders: d.completed,
        revenue: d.revenue,
        rate,
        commission: Math.round((d.revenue * rate) / 100),
      })),
    ...franchises
      .filter((f) => f.revenue > 0)
      .map((f) => ({
        id: f.id,
        type: 'franchise' as const,
        name: shortName(f.name),
        detail: f.territory,
        orders: f.orders,
        revenue: f.revenue,
        rate: f.commissionRate,
        commission: Math.round((f.revenue * f.commissionRate) / 100),
      })),
  ]

  const total = (type?: 'doctor' | 'franchise') => rows.filter((r) => !type || r.type === type).reduce((sum, r) => sum + r.commission, 0)
  const paidTotal = rows.filter((r) => paid.includes(r.id)).reduce((sum, r) => sum + r.commission, 0)
  const shown = view === 'history' ? [] : rows.filter((r) => r.type === view)
  const unpaidShown = shown.filter((r) => !paid.includes(r.id))
  const progress = total() === 0 ? 0 : Math.round((paidTotal / total()) * 100)

  const markPaid = (ids: string[]) => {
    setPaid((prev) => [...new Set([...prev, ...ids])])
    toast(ids.length === 1 ? 'Commission marked as paid' : `${ids.length} commissions marked as paid`)
  }

  return (
    <Screen
      header={
        <>
          <TopBar title="Commission Calculation" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
            <Tabs
              block
              value={view}
              onChange={setView}
              options={[
                { value: 'doctor', label: 'Doctors', count: rows.filter((r) => r.type === 'doctor').length },
                { value: 'franchise', label: 'Franchises', count: rows.filter((r) => r.type === 'franchise').length },
                { value: 'history', label: 'History' },
              ]}
            />
          </div>
        </>
      }
      footer={
        view !== 'history' && (
          <div className="flex items-center gap-4">
            <div className="shrink-0 leading-tight">
              <p className="text-[11px] font-medium text-slate-500">{view === 'doctor' ? 'Doctors' : 'Franchises'} total</p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">{inr(total(view))}</p>
            </div>
            <Button size="lg" block disabled={unpaidShown.length === 0} onClick={() => markPaid(unpaidShown.map((r) => r.id))}>
              {unpaidShown.length === 0 ? 'All paid' : 'Mark all paid'}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4 px-5 py-4">
        {/* Month total with how much has been settled */}
        <div className={cn(cardClass, 'p-4')}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-semibold text-slate-600">Commission · {monthYear()}</p>
            <p className="text-xs font-bold text-slate-500">{progress}% settled</p>
          </div>
          <p className="mt-1 text-[26px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">{inr(total())}</p>
          <div className="mt-3 h-2 rounded-full bg-slate-100" role="img" aria-label={`${progress}% of commission marked as paid`}>
            <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <dt className="text-xs text-slate-500">Marked paid</dt>
              <dd className="font-extrabold text-slate-900 tabular-nums">{inr(paidTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Still due</dt>
              <dd className="font-extrabold text-slate-900 tabular-nums">{inr(total() - paidTotal)}</dd>
            </div>
          </dl>
        </div>

        {view === 'doctor' && (
          <label className={cn(cardClass, 'flex items-center justify-between gap-4 px-4 py-3')}>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900">Doctor commission rate</span>
              <span className="block text-xs text-slate-500">% of completed order value</span>
            </span>
            <span className="flex h-10 w-20 shrink-0 items-center rounded-xl bg-white ring-1 ring-slate-200 ring-inset focus-within:ring-2 focus-within:ring-brand-500">
              <input
                value={doctorRate}
                onChange={(e) => setDoctorRate(e.target.value.replace(/\D/g, '').slice(0, 2))}
                inputMode="numeric"
                aria-label="Doctor commission rate"
                className="h-full w-full min-w-0 bg-transparent pl-3 text-[15px] font-bold text-slate-900 focus:outline-none"
              />
              <span className="pr-3 text-sm font-bold text-slate-400">%</span>
            </span>
          </label>
        )}
        {view === 'franchise' && <p className="px-1 text-xs text-slate-500">Each franchise has its own rate, set in Franchise Management.</p>}

        {view === 'history' ? (
          <>
            <ListGroup>
              {statements.map((s) => (
                <div key={s.period} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{s.period}</p>
                    <p className="text-[13px] font-extrabold text-slate-900 tabular-nums">{inr(s.doctors + s.franchises)}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-slate-500">
                      Doctors {inr(s.doctors)} · Franchises {inr(s.franchises)}
                    </p>
                    <Badge tone="green" dot>
                      Settled
                    </Badge>
                  </div>
                </div>
              ))}
            </ListGroup>
            <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
              <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
              Earlier statements are sample totals. No real payouts have been made.
            </p>
          </>
        ) : (
          <ListGroup>
            {shown.map((r) => {
              const isPaid = paid.includes(r.id)
              return (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-bold text-slate-900">{r.name}</p>
                    <p className="shrink-0 text-[13px] font-extrabold text-slate-900 tabular-nums">{inr(r.commission)}</p>
                  </div>
                  <p className="truncate text-xs text-slate-500">{r.detail}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-[11px] text-slate-400">
                      {r.orders} orders · {inr(r.revenue)} × {r.rate}%
                    </p>
                    {isPaid ? (
                      <Badge tone="green" dot>
                        Paid
                      </Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => markPaid([r.id])}>
                        Mark paid
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </ListGroup>
        )}
      </div>
    </Screen>
  )
}
