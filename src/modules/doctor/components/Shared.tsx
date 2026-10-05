import { Link } from 'react-router'
import { ChevronRight, Copy, Share2 } from 'lucide-react'
import { cardClass } from '@/components/mobile/Kit'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { commissionOn, doctorProfile } from '@/data/doctor'
import type { ConsentStatus, Referral } from '@/data/doctor'
import { cn, inr } from '@/lib/utils'

export const consentMeta: Record<ConsentStatus, { label: string; tone: BadgeTone }> = {
  granted: { label: 'Consent given', tone: 'green' },
  pending: { label: 'Awaiting patient', tone: 'amber' },
  none: { label: 'Not requested', tone: 'neutral' },
}

export function ConsentBadge({ consent }: { consent: ConsentStatus }) {
  return (
    <Badge tone={consentMeta[consent].tone} dot>
      {consentMeta[consent].label}
    </Badge>
  )
}

/** The doctor's Unique Referral Code as a compact panel for the dark home header. */
export function ReferralCodeCard() {
  const toast = useToast()
  const copy = () => {
    // Clipboard access can be blocked (insecure origin, permissions) — the toast still confirms the code.
    navigator.clipboard?.writeText(doctorProfile.referralCode).catch(() => {})
    toast(`Referral code ${doctorProfile.referralCode} copied`)
  }

  return (
    <div className="rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10">
      <p className="text-[10px] font-bold tracking-[0.14em] text-brand-200 uppercase">Your unique referral code</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="min-w-0 flex-1 text-[18px] font-extrabold tracking-[0.03em] whitespace-nowrap text-white max-[360px]:text-[15px]">{doctorProfile.referralCode}</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] font-bold text-brand-900 transition duration-150 active:scale-95"
        >
          <Copy className="size-4" />
          <span className="max-[360px]:hidden">Copy</span>
        </button>
        <button
          type="button"
          aria-label="Share referral code"
          onClick={() => toast('Share link copied (demo)')}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 transition duration-150 active:scale-95"
        >
          <Share2 className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-xs leading-snug text-brand-200">
        Patients enter this code while booking. You earn {doctorProfile.commissionRate}% of every completed order.
      </p>
    </div>
  )
}

/** One referral as a tappable card — used on Referral Tracking and the patient screen. */
export function ReferralItem({ referral, showPatient = true }: { referral: Referral; showPatient?: boolean }) {
  const earned = referral.status === 'reported'
  return (
    <Link to={`/doctor/referrals/${referral.id}`} className={cn(cardClass, 'block p-4')}>
      <div className="flex items-start gap-3">
        {showPatient && <Avatar name={referral.patient} />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-slate-900">{showPatient ? referral.patient : referral.tests}</p>
          <p className="mt-0.5 truncate text-[13px] text-slate-500">{showPatient ? referral.tests : referral.orderId}</p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-slate-300" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
        <OrderStatusBadge status={referral.status} />
        <p className="text-right text-xs text-slate-500">
          {referral.date}
          <span className="mx-1.5 text-slate-300">·</span>
          <span className={cn('font-bold', earned ? 'text-teal-700' : 'text-slate-900')}>
            {earned ? `+${inr(commissionOn(referral.orderValue))}` : inr(referral.orderValue)}
          </span>
        </p>
      </div>
    </Link>
  )
}

/** Dense referral row for lists where several referrals share one card. */
export function ReferralRow({ referral }: { referral: Referral }) {
  const earned = referral.status === 'reported'
  return (
    <Link to={`/doctor/referrals/${referral.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
      <Avatar name={referral.patient} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-bold text-slate-900">{referral.patient}</p>
          <p className={cn('shrink-0 text-[13px] font-extrabold tabular-nums', earned ? 'text-teal-700' : 'text-slate-900')}>
            {earned ? `+${inr(commissionOn(referral.orderValue))}` : inr(referral.orderValue)}
          </p>
        </div>
        <p className="truncate text-xs text-slate-500">{referral.tests}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <OrderStatusBadge status={referral.status} />
          <span className="shrink-0 text-[11px] text-slate-400">{referral.date}</span>
        </div>
      </div>
    </Link>
  )
}
