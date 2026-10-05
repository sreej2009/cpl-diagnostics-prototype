import { Navigate, Outlet, Route, Routes } from 'react-router'
import { BottomNav } from './components/BottomNav'
import { LanguageProvider } from './i18n'
import { PhoneFrame } from './components/PhoneFrame'
import { PatientProvider, usePatient } from './PatientContext'
import Booking from './screens/Booking'
import Cart from './screens/Cart'
import Confirmation from './screens/Confirmation'
import Family from './screens/Family'
import HealthHistory from './screens/HealthHistory'
import Home from './screens/Home'
import Login from './screens/Login'
import OrderTracking from './screens/OrderTracking'
import Orders from './screens/Orders'
import PackageDetail from './screens/PackageDetail'
import Packages from './screens/Packages'
import Profile from './screens/Profile'
import ReportDetail from './screens/ReportDetail'
import Reports from './screens/Reports'
import SearchTests from './screens/SearchTests'

function RequireAuth() {
  const { user } = usePatient()
  return user ? <Outlet /> : <Navigate to="/patient/login" replace />
}

/** Screens reachable from the bottom tab bar. */
function TabLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

export default function PatientApp() {
  return (
    <PatientProvider>
      <PhoneFrame>
        <LanguageProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<TabLayout />}>
              <Route index element={<Home />} />
              <Route path="tests" element={<SearchTests />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reports" element={<Reports />} />
              <Route path="health" element={<HealthHistory />} />
            </Route>
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="book" element={<Booking />} />
            <Route path="confirmation/:id" element={<Confirmation />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="family" element={<Family />} />
          </Route>
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
        </LanguageProvider>
      </PhoneFrame>
    </PatientProvider>
  )
}
