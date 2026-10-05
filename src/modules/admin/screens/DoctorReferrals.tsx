import { useState } from 'react'
import { IndianRupee, SearchX, Stethoscope, Users } from 'lucide-react'
import { BarList } from '@/components/charts/BarList'
import { cardClass, GroupLabel, StatTile } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar, EmptyState } from '@/components/ui/Display'
import { SearchInput } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Overlay'
import { referringDoctors } from '@/data/admin'
import type { ReferringDoctor } from '@/data/admin'
import { cn, compactInr, inr } from '@/lib/utils'
import { useAdminState } from '../AdminContext'

export default function DoctorReferrals() {
  const toast = useToast()
  const [doctors, setDoctors] = useAdminState('doctors.list', referringDoctors)
  const [query, setQuery] = useState('')

  const approve = (doctor: ReferringDoctor) => {
    const code = `CPL-DR${doctor.name.replace(/^Dr\.?\s+/i, '').slice(0, 3).toUpperCase()}-6924`
    setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? { ...d, status: 'Active', referralCode: code } : d)))
    toast(`${doctor.name} approved · code ${code}`)
  }

  const q = query.trim().toLowerCase()
  const rows = doctors.filter((d) => q === '' || d.name.toLowerCase().includes(q) || d.referralCode.toLowerCase().includes(q) || d.speciality.toLowerCase().includes(q))
  const active = doctors.filter((d) => d.status === 'Active')
  const totalReferrals = doctors.reduce((sum, d) => sum + d.referrals, 0)
  const totalRevenue = doctors.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <Screen
      header={
        <>
          <TopBar title="Doctor Referral Tracking" back="/admin/more" />
          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search doctor, speciality or code" className="[&>input]:h-11 [&>input]:rounded-2xl [&>input]:bg-slate-50" />
          </div>
        </>
      }
    >
      <div className="space-y-5 px-5 py-4">
        {q === '' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Active doctors" value={String(active.length)} icon={Stethoscope} />
              <StatTile label="Referrals" value={String(totalReferrals)} icon={Users} tone="teal" hint="this month" />
              <StatTile label="Revenue" value={compactInr(totalRevenue)} icon={IndianRupee} tone="amber" hint="this month" />
            </div>
            <section>
              <GroupLabel>Top doctors by revenue</GroupLabel>
              <div className={cn(cardClass, 'p-4')}>
                <BarList
                  format={compactInr}
                  items={[...active]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((d) => ({ label: d.name, value: d.revenue }))}
                />
              </div>
            </section>
          </>
        )}

        <section>
          <GroupLabel>Referring doctors</GroupLabel>
          {rows.length === 0 ? (
            <EmptyState icon={SearchX} title="No doctors found" />
          ) : (
            <div className="space-y-3">
              {rows.map((d) => (
                <article key={d.id} className={cn(cardClass, 'p-4')}>
                  <div className="flex items-start gap-3">
                    <Avatar name={d.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-slate-900">{d.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {d.speciality} · {d.clinic}
                      </p>
                    </div>
                    {d.status === 'Active' ? (
                      <Badge tone="green" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge tone="amber" dot>
                        Pending
                      </Badge>
                    )}
                  </div>
                  {d.status === 'Active' ? (
                    <>
                      <p className="mt-3 inline-block rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-extrabold tracking-wider text-brand-800">
                        {d.referralCode}
                      </p>
                      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-slate-200 pt-3 text-center">
                        <div>
                          <dd className="text-[15px] font-extrabold text-slate-900">{d.referrals}</dd>
                          <dt className="text-[11px] text-slate-500">Referrals</dt>
                        </div>
                        <div>
                          <dd className="text-[15px] font-extrabold text-slate-900">{d.completed}</dd>
                          <dt className="text-[11px] text-slate-500">Completed</dt>
                        </div>
                        <div>
                          <dd className="text-[15px] font-extrabold text-slate-900">{inr(d.revenue)}</dd>
                          <dt className="text-[11px] text-slate-500">Revenue</dt>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
                      <p className="text-xs text-slate-500">Registration awaiting approval</p>
                      <Button size="sm" onClick={() => approve(d)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Screen>
  )
}
