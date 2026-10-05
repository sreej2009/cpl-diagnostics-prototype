import { Link, Navigate, useParams } from 'react-router'
import { Eye, FileClock, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { cardClass, GroupLabel, WorkflowSteps } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { Avatar, DetailRow } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { OrderStatusBadge } from '@/components/ui/StatusBadges'
import { commissionOn, commissionStatus, doctorPatients, doctorProfile, referrals } from '@/data/doctor'
import { cn, inr } from '@/lib/utils'
import { ConsentBadge } from '../components/Shared'
import { useDoctor } from '../DoctorContext'

export default function ReferralDetail() {
  const { id } = useParams()
  const toast = useToast()
  const { reports, requestConsent } = useDoctor()
  const referral = referrals.find((r) => r.id === id)
  if (!referral) return <Navigate to="/doctor/referrals" replace />

  const patient = doctorPatients.find((p) => p.mobile === referral.mobile)
  const report = reports.find((r) => r.patient === referral.patient)
  const released = referral.status === 'reported'

  return (
    <Screen
      header={<TopBar title="Referral" back="/doctor/referrals" />}
      footer={
        patient && (
          <Link to={`/doctor/patients/${patient.id}`}>
            <Button size="lg" variant="secondary" block icon={UserRound}>
              View patient
            </Button>
          </Link>
        )
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-4')}>
          <div className="flex items-center gap-3">
            <Avatar name={referral.patient} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-bold tracking-tight text-slate-900">{referral.patient}</p>
              <p className="text-[13px] text-slate-500">+91 {referral.mobile}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
            <p className="text-xs font-bold tracking-wide text-slate-500">{referral.orderId}</p>
            <OrderStatusBadge status={referral.status} />
          </div>
        </div>

        {/* Report access: always says whether the report exists and whether the patient has consented */}
        <section>
          <GroupLabel>Report access</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            {!released ? (
              <p className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-600">
                <FileClock className="mt-0.5 size-4 shrink-0 text-slate-400" />
                {referral.status === 'cancelled' ? 'This order was cancelled, so there is no report.' : 'The report has not been released by the lab yet.'}
              </p>
            ) : !report ? (
              <p className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-600">
                <Lock className="mt-0.5 size-4 shrink-0 text-slate-400" />
                The report is released. The patient has not shared it with you.
              </p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{report.title}</p>
                    <p className="text-xs text-slate-500">Released {report.reportedOn}</p>
                  </div>
                  <ConsentBadge consent={report.consent} />
                </div>
                <div className="mt-3 border-t border-dashed border-slate-200 pt-3">
                  {report.consent === 'granted' ? (
                    <Link to={`/doctor/reports/${report.id}`}>
                      <Button block variant="soft" icon={Eye}>
                        View report
                      </Button>
                    </Link>
                  ) : report.consent === 'pending' ? (
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-700">
                      <Lock className="size-4 shrink-0" />
                      Locked until the patient approves your request.
                    </p>
                  ) : (
                    <Button
                      block
                      variant="secondary"
                      icon={ShieldCheck}
                      onClick={() => {
                        requestConsent(report.id)
                        toast(`Consent request sent to ${report.patient}`)
                      }}
                    >
                      Request patient consent
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <GroupLabel>Order progress</GroupLabel>
          <div className={cn(cardClass, 'p-4')}>
            <WorkflowSteps status={referral.status} />
          </div>
        </section>

        <section>
          <GroupLabel>Referral details</GroupLabel>
          <dl className={cn(cardClass, 'divide-y divide-slate-100 px-4 py-1.5')}>
            <DetailRow label="Tests">{referral.tests}</DetailRow>
            <DetailRow label="Referred on">{referral.date}</DetailRow>
            <DetailRow label="Referred via">{referral.channel}</DetailRow>
            <DetailRow label="Order value">{inr(referral.orderValue)}</DetailRow>
            <DetailRow label={`Incentive (${doctorProfile.commissionRate}%)`}>
              {referral.status === 'cancelled' ? '—' : inr(commissionOn(referral.orderValue))}
            </DetailRow>
            <DetailRow label="Commission status">{commissionStatus(referral)}</DetailRow>
          </dl>
        </section>
      </div>
    </Screen>
  )
}
