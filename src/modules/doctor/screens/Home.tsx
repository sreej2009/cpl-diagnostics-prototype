import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ChartColumn, ClipboardCheck, FileText, FileUp, ShieldCheck } from 'lucide-react'
import { ListGroup, TextLink } from '@/components/mobile/Kit'
import { MetricGrid } from '@/components/mobile/Metrics'
import { Screen, SectionTitle } from '@/components/mobile/Screen'
import { Avatar } from '@/components/ui/Display'
import { doctorProfile, earningsHistory, payouts, referrals } from '@/data/doctor'
import { isActive } from '@/lib/status'
import { inr } from '@/lib/utils'
import { ReferralCodeCard, ReferralRow } from '../components/Shared'
import { useDoctor } from '../DoctorContext'

const quickActions: { label: string; icon: LucideIcon; to: string }[] = [
  { label: 'Upload Prescription', icon: FileUp, to: '/doctor/prescriptions' },
  { label: 'Recommend Tests', icon: ClipboardCheck, to: '/doctor/recommend' },
  { label: 'Patient Reports', icon: FileText, to: '/doctor/reports' },
  { label: 'Monthly Report', icon: ChartColumn, to: '/doctor/monthly-report' },
]

export default function Home() {
  const { reports } = useDoctor()
  const { earnings, referrals: counts } = earningsHistory
  const last = earnings.length - 1
  const inProgress = referrals.filter((r) => isActive(r.status)).length
  const pending = payouts.filter((p) => p.status === 'Processing').reduce((sum, p) => sum + p.amount, 0)
  const readable = reports.filter((r) => r.consent === 'granted').length

  return (
    <Screen>
      {/* Clinical header: who is signed in, and the code they refer with */}
      <div className="relative overflow-hidden rounded-b-[1.75rem] bg-brand-950 px-5 pt-5 pb-5 text-white">
        <span className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-brand-600/35 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-28 -left-16 size-56 rounded-full bg-teal-500/15 blur-3xl" />
        <Link to="/doctor/profile" className="relative flex items-center gap-3">
          <Avatar name={doctorProfile.name} className="size-11 ring-2 ring-white/20" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[17px] font-extrabold tracking-tight">{doctorProfile.name}</p>
            <p className="truncate text-xs text-brand-200">
              {doctorProfile.speciality} · {doctorProfile.registrationNo}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-400/15 px-2.5 py-1 max-[360px]:hidden text-[11px] font-bold text-teal-200 ring-1 ring-teal-300/20">
            <ShieldCheck className="size-3.5" />
            Verified
          </span>
        </Link>
        <div className="relative mt-4">
          <ReferralCodeCard />
        </div>
      </div>

      <div className="space-y-6 px-5 pt-5 pb-8">
        <section className="animate-rise">
          <SectionTitle title="This month" />
          <MetricGrid
            items={[
              { label: 'Referrals', value: String(counts[last]), hint: 'month to date', to: '/doctor/referrals' },
              { label: 'In progress', value: String(inProgress), hint: 'awaiting reports', to: '/doctor/referrals' },
              { label: 'Earned', value: inr(earnings[last]), hint: 'month to date', to: '/doctor/earnings' },
              { label: 'Pending payout', value: inr(pending), hint: 'processing', to: '/doctor/referral-payouts' },
            ]}
          />
        </section>

        <section className="grid grid-cols-4 gap-1 rounded-2xl bg-white px-2 py-3.5 shadow-card ring-1 ring-slate-200/70">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <action.icon className="size-5" />
              </span>
              <span className="text-[11px] leading-tight font-semibold text-slate-700">{action.label}</span>
            </Link>
          ))}
        </section>

        <section>
          <SectionTitle title="Recent referrals" action={<TextLink to="/doctor/referrals">See all</TextLink>} />
          <ListGroup>
            {referrals.slice(0, 4).map((referral) => (
              <ReferralRow key={referral.id} referral={referral} />
            ))}
          </ListGroup>
        </section>

        <div className="flex items-center gap-3 rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
          <ShieldCheck className="size-5 shrink-0 text-teal-600" />
          <p className="min-w-0 flex-1 text-[13px] leading-snug text-teal-900">
            <span className="font-bold">{readable} patient reports</span> are open to you with consent.
          </p>
          <TextLink to="/doctor/reports">View</TextLink>
        </div>
      </div>
    </Screen>
  )
}
