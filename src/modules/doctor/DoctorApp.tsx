import { Navigate, Outlet, Route, Routes } from 'react-router'
import { FileText, House, UsersRound, Wallet, Waypoints } from 'lucide-react'
import { MobileFrame } from '@/components/mobile/MobileFrame'
import type { GuideFeature } from '@/components/mobile/MobileFrame'
import { TabLayout } from '@/components/mobile/Screen'
import type { TabItem } from '@/components/mobile/Screen'
import { DoctorProvider, useDoctor } from './DoctorContext'
import Earnings from './screens/Earnings'
import Home from './screens/Home'
import Login from './screens/Login'
import MonthlyReport from './screens/MonthlyReport'
import PatientDetail from './screens/PatientDetail'
import Patients from './screens/Patients'
import Prescriptions from './screens/Prescriptions'
import Profile from './screens/Profile'
import Recommend from './screens/Recommend'
import ReferralDetail from './screens/ReferralDetail'
import ReferralPayouts from './screens/ReferralPayouts'
import Referrals from './screens/Referrals'
import Reports from './screens/Reports'
import ReportView from './screens/ReportView'

const LOGIN = '/doctor/login'

/** The 8 Doctor App features from the layout plan, mapped to the screen that shows each. */
const features: GuideFeature[] = [
  { label: 'Doctor Registration / Login', to: LOGIN },
  { label: 'Unique Referral Code', to: '/doctor' },
  { label: 'Upload Prescription', to: '/doctor/prescriptions' },
  { label: 'Patient Report Access (with consent)', to: '/doctor/reports' },
  { label: 'Referral Tracking', to: '/doctor/referrals' },
  { label: 'Earnings Dashboard', to: '/doctor/earnings' },
  { label: 'Monthly Referral Report', to: '/doctor/monthly-report' },
  { label: 'Patient Test Recommendation', to: '/doctor/recommend' },
]

const tabs: TabItem[] = [
  { to: '/doctor', label: 'Home', icon: House, end: true },
  { to: '/doctor/referrals', label: 'Referrals', icon: Waypoints },
  { to: '/doctor/patients', label: 'Patients', icon: UsersRound },
  { to: '/doctor/reports', label: 'Reports', icon: FileText },
  { to: '/doctor/earnings', label: 'Earnings', icon: Wallet },
]

function DoctorShell() {
  const { authed, login } = useDoctor()
  return (
    <MobileFrame
      caption="Doctor Mobile App"
      theme="doctor"
      headline="Refer patients and earn incentives."
      intro="The app doctors use to refer patients to CPL. Use the phone as you would the real app, or jump to any feature below."
      features={features}
      // Jumping straight to a screen signs in the demo doctor.
      onJump={(feature) => feature.to !== LOGIN && login()}
    >
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={authed ? <Outlet /> : <Navigate to={LOGIN} replace />}>
          <Route element={<TabLayout tabs={tabs} />}>
            <Route index element={<Home />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="patients" element={<Patients />} />
            <Route path="reports" element={<Reports />} />
            <Route path="earnings" element={<Earnings />} />
          </Route>
          <Route path="referrals/:id" element={<ReferralDetail />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="reports/:id" element={<ReportView />} />
          <Route path="monthly-report" element={<MonthlyReport />} />
          <Route path="referral-payouts" element={<ReferralPayouts />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="recommend" element={<Recommend />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </MobileFrame>
  )
}

export default function DoctorApp() {
  return (
    <DoctorProvider>
      <DoctorShell />
    </DoctorProvider>
  )
}
