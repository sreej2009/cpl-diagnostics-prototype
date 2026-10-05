import { Navigate, Outlet, Route, Routes } from 'react-router'
import { ClipboardList, FileCheck2, LayoutDashboard, Menu, Syringe } from 'lucide-react'
import { MobileFrame } from '@/components/mobile/MobileFrame'
import type { GuideFeature } from '@/components/mobile/MobileFrame'
import { TabLayout } from '@/components/mobile/Screen'
import type { TabItem } from '@/components/mobile/Screen'
import { AdminProvider, useAdmin } from './AdminContext'
import Alerts from './screens/Alerts'
import Assign from './screens/Assign'
import Catalog from './screens/Catalog'
import Commissions from './screens/Commissions'
import CustomerDetail from './screens/CustomerDetail'
import Customers from './screens/Customers'
import Dashboard from './screens/Dashboard'
import DoctorReferrals from './screens/DoctorReferrals'
import FranchiseDetail from './screens/FranchiseDetail'
import Franchises from './screens/Franchises'
import Login from './screens/Login'
import More from './screens/More'
import Notifications from './screens/Notifications'
import OrderDetail from './screens/OrderDetail'
import Orders from './screens/Orders'
import Payments from './screens/Payments'
import Reports from './screens/Reports'
import Revenue from './screens/Revenue'
import SampleDetail from './screens/SampleDetail'
import Samples from './screens/Samples'
import WhatsAppReports from './screens/WhatsAppReports'

const LOGIN = '/admin/login'

/** The 14 Admin Panel features from the layout plan, mapped to the screen that shows each. */
const features: GuideFeature[] = [
  { label: 'Admin Login', to: LOGIN },
  { label: 'Dashboard Analytics', to: '/admin' },
  { label: 'Order Management', to: '/admin/orders' },
  { label: 'Test & Package Management', to: '/admin/catalog' },
  { label: 'Doctor Referral Tracking', to: '/admin/doctor-referrals' },
  { label: 'Franchise Management', to: '/admin/franchises' },
  { label: 'Phlebotomist Assignment', to: '/admin/assign' },
  { label: 'Report Management', to: '/admin/reports' },
  { label: 'Commission Calculation', to: '/admin/commissions' },
  { label: 'Revenue Analytics', to: '/admin/revenue' },
  { label: 'Customer Management', to: '/admin/customers' },
  { label: 'Notification System', to: '/admin/notifications' },
  { label: 'Payment Monitoring', to: '/admin/payments' },
  { label: 'WhatsApp Report Sending', to: '/admin/whatsapp' },
]

function AdminShell() {
  const { authed, login, orders, unreadAlerts } = useAdmin()
  const unassigned = orders.filter((o) => o.status === 'placed' && o.collectionType === 'home').length
  const awaitingReport = orders.filter((o) => o.status === 'testing').length

  const tabs: TabItem[] = [
    { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { to: '/admin/assign', label: 'Assign', icon: Syringe, badge: unassigned },
    { to: '/admin/reports', label: 'Reports', icon: FileCheck2, badge: awaitingReport },
    { to: '/admin/more', label: 'More', icon: Menu, badge: unreadAlerts },
  ]

  return (
    <MobileFrame
      caption="Admin Mobile App"
      theme="admin"
      headline="Manage the entire system."
      intro="The control app for CPL's operations team. Use the phone as you would the real app, or jump to any feature below."
      features={features}
      // Jumping straight to a screen signs in the demo admin.
      onJump={(feature) => feature.to !== LOGIN && login()}
    >
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={authed ? <Outlet /> : <Navigate to={LOGIN} replace />}>
          <Route element={<TabLayout tabs={tabs} />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="assign" element={<Assign />} />
            <Route path="reports" element={<Reports />} />
            <Route path="more" element={<More />} />
          </Route>
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="samples" element={<Samples />} />
          <Route path="samples/:id" element={<SampleDetail />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="whatsapp" element={<WhatsAppReports />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="doctor-referrals" element={<DoctorReferrals />} />
          <Route path="franchises" element={<Franchises />} />
          <Route path="franchises/:id" element={<FranchiseDetail />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="payments" element={<Payments />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </MobileFrame>
  )
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  )
}
