import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import Launcher from '@/modules/launcher/Launcher'

// Each module is its own chunk so the three demos stay independent.
const PatientApp = lazy(() => import('@/modules/patient/PatientApp'))
const DoctorApp = lazy(() => import('@/modules/doctor/DoctorApp'))
const AdminApp = lazy(() => import('@/modules/admin/AdminApp'))

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50">
      <div className="size-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Launcher />} />
          <Route path="/patient/*" element={<PatientApp />} />
          <Route path="/doctor/*" element={<DoctorApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
