import { Link } from 'react-router'
import { Activity, ChevronRight, FileText, MessageCircle, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Display'
import { SkeletonList, useMockLoading } from '@/components/ui/States'
import type { LabReport } from '@/types'
import { useLabels } from '../components/labels'
import { ProfileSwitcher } from '../components/ProfileSwitcher'
import { Screen, TabHeader } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

function ReportCard({ report }: { report: LabReport }) {
  const { t } = useI18n()
  const { date } = useLabels()
  const flagged = report.results.filter((r) => r.flag !== 'normal').length
  return (
    <Link
      to={`/patient/reports/${report.id}`}
      className="block rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug font-bold text-slate-900">{report.title}</p>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {report.patientName} · {date(report.reportedOn)}
          </p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-slate-300" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-3">
        {flagged > 0 ? (
          <Badge tone="amber" dot>
            {t('reports.outOfRange', { n: flagged })}
          </Badge>
        ) : (
          <Badge tone="green" dot>
            {t('reports.allInRange')}
          </Badge>
        )}
        {report.whatsappSent && (
          <Badge tone="teal">
            <MessageCircle className="size-3" />
            {t('reports.sentWhatsapp')}
          </Badge>
        )}
        {report.sharedWith.length > 0 && (
          <Badge tone="brand">
            <Share2 className="size-3" />
            {t('reports.sharedDoctor')}
          </Badge>
        )}
      </div>
    </Link>
  )
}

export default function Reports() {
  const { t } = useI18n()
  const { reports, selectedMember } = usePatient()
  // Only the selected family member's reports are listed.
  const mine = reports.filter((r) => r.patientName === selectedMember.name)
  const loading = useMockLoading()

  return (
    <Screen
      header={
        <>
          <TabHeader title={t('nav.reports')} subtitle={t('reports.subtitle')} />
          <ProfileSwitcher />
        </>
      }
    >
      <div className="space-y-3 px-5 py-4">
        <Link
          to="/patient/health"
          className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-brand-800 ring-1 ring-brand-100"
        >
          <Activity className="size-5 shrink-0 text-brand-600" />
          <span className="flex-1 text-[13px] font-semibold">{t('reports.trendLink')}</span>
          <ChevronRight className="size-4 shrink-0" />
        </Link>
        {loading ? (
          <SkeletonList />
        ) : mine.length === 0 ? (
          <EmptyState icon={FileText} title={t('reports.emptyTitle')} description={t('reports.emptyBody', { name: selectedMember.name })} />
        ) : (
          mine.map((report) => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    </Screen>
  )
}
