import { Link, Navigate, useParams } from 'react-router'
import { ChevronRight, ClipboardCheck, FileText, FileUp } from 'lucide-react'
import { cardClass, GroupLabel, ListGroup } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Display'
import { doctorPatients } from '@/data/doctor'
import { cn, inr } from '@/lib/utils'
import { ConsentBadge, ReferralItem } from '../components/Shared'
import { useDoctor } from '../DoctorContext'

export default function PatientDetail() {
  const { id } = useParams()
  const { reports } = useDoctor()
  const patient = doctorPatients.find((p) => p.id === id)
  if (!patient) return <Navigate to="/doctor/patients" replace />

  const patientReports = reports.filter((r) => r.patient === patient.name)
  const totalValue = patient.referrals.reduce((sum, r) => sum + r.orderValue, 0)
  // Pre-fill the next screen with this patient's details.
  const prefill = `?patient=${encodeURIComponent(patient.name)}&mobile=${patient.id}`

  return (
    <Screen header={<TopBar title="Patient" back="/doctor/patients" />}>
      <div className="space-y-5 px-5 py-5">
        <div className={cn(cardClass, 'p-5')}>
          <div className="flex items-center gap-4">
            <Avatar name={patient.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">{patient.name}</p>
              <p className="text-sm text-slate-500">+91 {patient.mobile}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-center">
            <div>
              <dd className="text-xl font-extrabold tracking-tight text-slate-900">{patient.referrals.length}</dd>
              <dt className="text-xs text-slate-500">{patient.referrals.length === 1 ? 'Referral' : 'Referrals'}</dt>
            </div>
            <div>
              <dd className="text-xl font-extrabold tracking-tight text-slate-900">{inr(totalValue)}</dd>
              <dt className="text-xs text-slate-500">Order value</dt>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to={`/doctor/recommend${prefill}`}>
            <Button variant="soft" block icon={ClipboardCheck}>
              Recommend
            </Button>
          </Link>
          <Link to={`/doctor/prescriptions${prefill}`}>
            <Button variant="soft" block icon={FileUp}>
              Prescription
            </Button>
          </Link>
        </div>

        <section>
          <GroupLabel>Reports</GroupLabel>
          {patientReports.length === 0 ? (
            <p className={cn(cardClass, 'px-4 py-5 text-center text-sm text-slate-500')}>No reports released yet.</p>
          ) : (
            <ListGroup>
              {patientReports.map((report) => (
                <Link key={report.id} to={`/doctor/reports/${report.id}`} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{report.title}</p>
                    <p className="mt-1">
                      <ConsentBadge consent={report.consent} />
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
                </Link>
              ))}
            </ListGroup>
          )}
        </section>

        <section>
          <GroupLabel>Referrals</GroupLabel>
          <div className="space-y-3">
            {patient.referrals.map((referral) => (
              <ReferralItem key={referral.id} referral={referral} showPatient={false} />
            ))}
          </div>
        </section>
      </div>
    </Screen>
  )
}
