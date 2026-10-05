import { Navigate, useParams } from 'react-router'
import { Lock, ShieldCheck } from 'lucide-react'
import { cardClass, GroupLabel } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { ResultRow } from '@/components/reports/ResultRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { useToast } from '@/components/ui/Overlay'
import { cn } from '@/lib/utils'
import { useDoctor } from '../DoctorContext'

export default function ReportView() {
  const { id } = useParams()
  const toast = useToast()
  const { reports, requestConsent } = useDoctor()
  const report = reports.find((r) => r.id === id)
  if (!report) return <Navigate to="/doctor/reports" replace />

  if (report.consent !== 'granted') {
    return (
      <Screen header={<TopBar title="Report" back="/doctor/reports" />}>
        <EmptyState
          icon={Lock}
          title="Patient consent needed"
          description={
            report.consent === 'pending'
              ? `Waiting for ${report.patient} to approve your request.`
              : `${report.patient} has not shared this report with you yet.`
          }
          action={
            report.consent === 'none' && (
              <Button
                onClick={() => {
                  requestConsent(report.id)
                  toast(`Consent request sent to ${report.patient}`)
                }}
              >
                Request consent
              </Button>
            )
          }
        />
      </Screen>
    )
  }

  const groups = [...new Set(report.results.map((r) => r.group))]
  const inRange = report.results.filter((r) => r.flag === 'normal').length
  const total = report.results.length

  return (
    <Screen header={<TopBar title="Report" back="/doctor/reports" />}>
      <div className="space-y-4 px-5 py-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-float">
          <span className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-white/10" />
          <p className="relative text-[11px] font-bold tracking-wide text-brand-200 uppercase">Released {report.reportedOn}</p>
          <h1 className="relative mt-1 text-xl leading-snug font-extrabold tracking-tight">{report.title}</h1>
          <p className="relative mt-1 text-[13px] text-brand-100">
            {report.patient} · {report.patientMeta}
          </p>
          <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
            <ShieldCheck className="size-3.5 text-teal-300" />
            Shared with patient consent
          </p>
        </div>

        <div className={cn(cardClass, 'p-4')}>
          <p className="text-[15px] font-bold text-slate-900">
            {inRange} of {total} values in range
          </p>
          <p className="text-[13px] text-slate-500">
            {inRange === total ? 'No values are flagged.' : `${total - inRange} flagged for your review.`}
          </p>
        </div>

        {groups.map((group) => (
          <section key={group}>
            <GroupLabel>{group}</GroupLabel>
            <ul className={cn(cardClass, 'divide-y divide-slate-100')}>
              {report.results
                .filter((r) => r.group === group)
                .map((result) => (
                  <ResultRow key={result.name} result={result} />
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Screen>
  )
}
