import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, FileText, Lock, ShieldCheck } from 'lucide-react'
import { cardClass, FilterChips } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Overlay'
import type { ConsentStatus, PatientReportAccess } from '@/data/doctor'
import { cn } from '@/lib/utils'
import { ConsentBadge } from '../components/Shared'
import { useDoctor } from '../DoctorContext'

type Filter = 'all' | ConsentStatus

function ReportCard({ report }: { report: PatientReportAccess }) {
  const toast = useToast()
  const { requestConsent } = useDoctor()
  return (
    <article className={cn(cardClass, 'p-4')}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug font-bold text-slate-900">{report.title}</p>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {report.patient} · {report.patientMeta}
          </p>
          <p className="text-xs text-slate-400">Released {report.reportedOn}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
        <ConsentBadge consent={report.consent} />
        {report.consent === 'granted' ? (
          <Link to={`/doctor/reports/${report.id}`}>
            <Button size="sm" variant="soft" icon={Eye}>
              View report
            </Button>
          </Link>
        ) : report.consent === 'pending' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Lock className="size-3.5" />
            Locked
          </span>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              requestConsent(report.id)
              toast(`Consent request sent to ${report.patient}`)
            }}
          >
            Request consent
          </Button>
        )}
      </div>
    </article>
  )
}

export default function Reports() {
  const { reports } = useDoctor()
  const [filter, setFilter] = useState<Filter>('all')
  const loading = useMockLoading()
  const rows = reports.filter((r) => filter === 'all' || r.consent === filter)
  const count = (c: ConsentStatus) => reports.filter((r) => r.consent === c).length

  return (
    <Screen
      header={
        <TabHeader title="Patient Reports" subtitle="Reports of the patients you referred">
          <FilterChips
            className="mt-4"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: reports.length },
              { value: 'granted', label: 'Consent given', count: count('granted') },
              { value: 'pending', label: 'Awaiting', count: count('pending') },
              { value: 'none', label: 'Not requested', count: count('none') },
            ]}
          />
        </TabHeader>
      }
    >
      <div className="space-y-3 px-5 py-4">
        <p className="flex items-start gap-2.5 rounded-2xl bg-teal-50 p-3.5 text-[13px] leading-snug text-teal-900 ring-1 ring-teal-100">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-600" />
          <span>
            <span className="font-bold">Reports open only with the patient's consent</span> — given by sharing the report
            from the CPL app or approving your request.
          </span>
        </p>
        {loading ? (
          <SkeletonList />
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No reports in this view" />
        ) : (
          rows.map((report) => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    </Screen>
  )
}
