import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Check, Download, FileText, MessageCircle, Share2, ShieldCheck } from 'lucide-react'
import { ResultRow } from '@/components/reports/ResultRow'
import { Button } from '@/components/ui/Button'
import { Modal, useToast } from '@/components/ui/Overlay'
import { ErrorState } from '@/components/ui/States'
import { myDoctors } from '@/data/patient'
import { cn } from '@/lib/utils'
import type { LabReport } from '@/types'
import { useLabels } from '../components/labels'
import { OptionCard } from '../components/OptionCard'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

type Action = 'whatsapp' | 'share' | null

function WhatsAppSheet({ report, open, onClose }: { report: LabReport; open: boolean; onClose: () => void }) {
  const toast = useToast()
  const { t } = useI18n()
  const { user, markWhatsappSent } = usePatient()
  const mobile = user?.mobile ?? ''
  const send = () => {
    markWhatsappSent(report.id)
    toast(t('report.waSent', { mobile }))
    onClose()
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      title={t('report.waTitle')}
      description={t('report.waDesc', { mobile })}
      footer={
        <Button size="lg" block icon={MessageCircle} onClick={send}>
          {report.whatsappSent ? t('report.waSendAgain') : t('report.waSend')}
        </Button>
      }
    >
      {/* Message preview */}
      <div className="rounded-2xl bg-[#e9f5ee] p-4">
        <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-white p-3 shadow-card">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500">
              <FileText className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">CPL-Report-{report.orderId}.pdf</p>
              <p className="text-[11px] text-slate-500">PDF</p>
            </div>
          </div>
          <p className="mt-2.5 text-[13px] leading-snug text-slate-700">
            {t('report.waMessage', { name: report.patientName.split(' ')[0], title: report.title })}
          </p>
          <p className="mt-1 text-right text-[10px] text-slate-400">CPL Diagnostics</p>
        </div>
      </div>
      {report.whatsappSent && (
        <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-teal-700">
          <Check className="size-4 shrink-0" strokeWidth={3} />
          {t('report.waAlready')}
        </p>
      )}
    </Modal>
  )
}

function ShareSheet({ report, open, onClose }: { report: LabReport; open: boolean; onClose: () => void }) {
  const toast = useToast()
  const { t } = useI18n()
  const { shareReport } = usePatient()
  const [doctorId, setDoctorId] = useState(myDoctors[0].id)
  const [consent, setConsent] = useState(false)
  const doctor = myDoctors.find((d) => d.id === doctorId)!
  const alreadyShared = report.sharedWith.includes(doctor.name)

  const share = () => {
    shareReport(report.id, doctor.name)
    toast(t('report.shareDone', { name: doctor.name }))
    setConsent(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      title={t('report.shareTitle')}
      description={t('report.shareDesc')}
      footer={
        <Button size="lg" block icon={Share2} disabled={!consent || alreadyShared} onClick={share}>
          {alreadyShared ? t('report.shareAlready') : t('report.shareButton')}
        </Button>
      }
    >
      <div role="radiogroup" className="space-y-2.5">
        {myDoctors.map((d) => (
          <OptionCard
            key={d.id}
            selected={doctorId === d.id}
            onSelect={() => setDoctorId(d.id)}
            title={d.name}
            tag={report.sharedWith.includes(d.name) ? t('report.shared') : undefined}
            description={`${d.speciality} · ${d.clinic}`}
          />
        ))}
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 accent-brand-600"
        />
        <span className="text-[13px] leading-snug text-slate-600">{t('report.shareConsent', { name: doctor.name })}</span>
      </label>
    </Modal>
  )
}

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const toast = useToast()
  const { t } = useI18n()
  const { resultLabels, meta, date } = useLabels()
  const { reports } = usePatient()
  const requested = params.get('action')
  const [action, setAction] = useState<Action>(requested === 'whatsapp' || requested === 'share' ? requested : null)
  const [downloading, setDownloading] = useState(false)

  // The feature guide can deep-link to an action while this screen is already open.
  useEffect(() => {
    if (requested === 'whatsapp' || requested === 'share') setAction(requested)
  }, [requested])

  const report = reports.find((r) => r.id === id)
  if (!report) {
    return (
      <Screen header={<TopBar title={t('report.title')} back="/patient/reports" />}>
        <ErrorState
          title={t('error.reportTitle')}
          description={t('error.reportBody')}
          action={<Button onClick={() => navigate('/patient/reports')}>{t('error.back')}</Button>}
        />
      </Screen>
    )
  }

  const groups = [...new Set(report.results.map((r) => r.group))]
  const inRange = report.results.filter((r) => r.flag === 'normal').length
  const total = report.results.length

  const download = () => {
    setDownloading(true)
    window.setTimeout(() => {
      setDownloading(false)
      toast(t('report.downloaded', { file: `CPL-Report-${report.orderId}.pdf` }))
    }, 900)
  }

  return (
    <Screen
      header={<TopBar title={t('report.title')} back="/patient/reports" />}
      footer={
        <div className="space-y-2.5">
          <Button size="lg" block icon={Download} loading={downloading} onClick={download}>
            <span className="truncate">{t('report.download')}</span>
          </Button>
          <div className="grid grid-cols-2 gap-2.5 max-[360px]:grid-cols-1">
            <Button variant="secondary" block icon={MessageCircle} onClick={() => setAction('whatsapp')}>
              WhatsApp
            </Button>
            <Button variant="secondary" block icon={Share2} onClick={() => setAction('share')}>
              <span className="truncate">{t('report.shareDoctor')}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-float">
          <span className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-white/10" />
          <p className="relative text-[11px] font-bold tracking-wide text-brand-200 uppercase">{t('home.order', { id: report.orderId })}</p>
          <h1 className="relative mt-1 text-xl leading-snug font-extrabold tracking-tight">{report.title}</h1>
          <p className="relative mt-1 text-[13px] text-brand-100">
            {report.patientName} · {meta(report.patientMeta)}
          </p>
          <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-[13px]">
            <div>
              <p className="text-[11px] text-brand-200">{t('report.collected')}</p>
              <p className="font-bold">{date(report.collectedOn)}</p>
            </div>
            <div>
              <p className="text-[11px] text-brand-200">{t('report.released')}</p>
              <p className="font-bold">{date(report.reportedOn)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
          <span
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-xl',
              inRange === total ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
            )}
          >
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-slate-900">{t('report.inRange', { a: inRange, b: total })}</p>
            <p className="text-[13px] text-slate-500">{inRange === total ? t('report.allNormal') : t('report.discuss')}</p>
          </div>
        </div>

        {report.sharedWith.length > 0 && (
          <p className="flex items-start gap-2 px-1 text-[13px] text-slate-500">
            <Share2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <span>
              {t('report.sharedWith')} <span className="font-semibold text-slate-900">{report.sharedWith.join(', ')}</span>
            </span>
          </p>
        )}

        {groups.map((group) => (
          <section key={group}>
            <h2 className="mb-2 px-1 text-xs font-bold tracking-wide text-slate-500 uppercase">{group}</h2>
            <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
              {report.results
                .filter((r) => r.group === group)
                .map((result) => (
                  <ResultRow key={result.name} result={result} labels={resultLabels} />
                ))}
            </ul>
          </section>
        ))}
      </div>

      <WhatsAppSheet report={report} open={action === 'whatsapp'} onClose={() => setAction(null)} />
      <ShareSheet report={report} open={action === 'share'} onClose={() => setAction(null)} />
    </Screen>
  )
}
