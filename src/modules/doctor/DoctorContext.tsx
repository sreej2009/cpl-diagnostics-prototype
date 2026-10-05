import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { patientReports, prescriptions as seedPrescriptions, recommendations as seedRecommendations } from '@/data/doctor'
import type { PatientReportAccess, Prescription, Recommendation } from '@/data/doctor'
import { usePersistentState } from '@/lib/usePersistentState'
import { fmtDate } from '@/lib/utils'

interface DoctorContextValue {
  authed: boolean
  login: () => void
  logout: () => void

  prescriptions: Prescription[]
  addPrescription: (input: Pick<Prescription, 'patient' | 'mobile' | 'fileName' | 'notes'>) => void

  recommendations: Recommendation[]
  addRecommendation: (input: Pick<Recommendation, 'patient' | 'mobile' | 'items' | 'note'>) => void

  reports: PatientReportAccess[]
  requestConsent: (reportId: string) => void
}

const DoctorContext = createContext<DoctorContextValue | null>(null)

export function useDoctor() {
  const ctx = useContext(DoctorContext)
  if (!ctx) throw new Error('useDoctor must be used inside <DoctorProvider>')
  return ctx
}

/** Holds what the doctor creates during the demo so it survives moving between screens. */
export function DoctorProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = usePersistentState('cpl.doctor.authed', false)
  const [prescriptions, setPrescriptions] = useState(seedPrescriptions)
  const [recommendations, setRecommendations] = useState(seedRecommendations)
  const [reports, setReports] = useState(patientReports)

  const value: DoctorContextValue = {
    authed,
    login: () => setAuthed(true),
    logout: () => setAuthed(false),
    prescriptions,
    addPrescription: (input) =>
      setPrescriptions((prev) => [
        { ...input, id: `rx-${Date.now()}`, uploadedOn: fmtDate(new Date()), status: 'Received' },
        ...prev,
      ]),
    recommendations,
    addRecommendation: (input) =>
      setRecommendations((prev) => [
        { ...input, id: `rc-${Date.now()}`, sentOn: fmtDate(new Date()), status: 'Sent' },
        ...prev,
      ]),
    reports,
    requestConsent: (reportId) =>
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, consent: 'pending' } : r))),
  }

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
}
