import { useNavigate } from 'react-router'
import {
  Bell,
  Calculator,
  CreditCard,
  FlaskConical,
  LayoutGrid,
  LogOut,
  MessageCircle,
  ScanBarcode,
  Stethoscope,
  Store,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { cardClass, GroupLabel, ListGroup, MenuRow } from '@/components/mobile/Kit'
import { Screen, TabHeader } from '@/components/mobile/Screen'
import { Avatar } from '@/components/ui/Display'
import { adminUser } from '@/data/admin'
import { cn } from '@/lib/utils'
import { useAdmin } from '../AdminContext'

export default function More() {
  const navigate = useNavigate()
  const { orders, logout, unreadAlerts } = useAdmin()
  const codPending = orders.filter((o) => o.payment.status === 'pending').length

  return (
    <Screen header={<TabHeader title="More" subtitle="All management sections" />}>
      <div className="space-y-6 px-5 py-4">
        <div className={cn(cardClass, 'flex items-center gap-4 p-4')}>
          <Avatar name={adminUser.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">{adminUser.name}</p>
            <p className="text-sm text-slate-500">{adminUser.subtitle} · Main Lab, Anna Nagar</p>
          </div>
        </div>

        <section>
          <GroupLabel>Operations</GroupLabel>
          <ListGroup>
            <MenuRow icon={TriangleAlert} label="Alerts & Delays" hint="Urgent orders and delayed samples" to="/admin/alerts" badge={unreadAlerts} />
            <MenuRow icon={ScanBarcode} label="Sample Tracking" hint="Barcode and sample status" to="/admin/samples" />
            <MenuRow icon={MessageCircle} label="WhatsApp Report Sending" hint="Send released reports to patients" to="/admin/whatsapp" />
            <MenuRow icon={Bell} label="Notification System" hint="Announcements and automatic alerts" to="/admin/notifications" />
          </ListGroup>
        </section>

        <section>
          <GroupLabel>Catalogue &amp; people</GroupLabel>
          <ListGroup>
            <MenuRow icon={FlaskConical} label="Test & Package Management" hint="Prices and availability" to="/admin/catalog" />
            <MenuRow icon={Users} label="Customer Management" hint="Customers and their orders" to="/admin/customers" />
            <MenuRow icon={Stethoscope} label="Doctor Referral Tracking" hint="Referring doctors and their codes" to="/admin/doctor-referrals" />
            <MenuRow icon={Store} label="Franchise Management" hint="Centres, territories and status" to="/admin/franchises" />
          </ListGroup>
        </section>

        <section>
          <GroupLabel>Finance</GroupLabel>
          <ListGroup>
            <MenuRow icon={TrendingUp} label="Revenue Analytics" hint="Revenue by channel and category" to="/admin/revenue" />
            <MenuRow icon={CreditCard} label="Payment Monitoring" hint="UPI, card and COD payments" to="/admin/payments" badge={codPending} />
            <MenuRow icon={Calculator} label="Commission Calculation" hint="Doctor and franchise payouts" to="/admin/commissions" />
          </ListGroup>
        </section>

        <section>
          <GroupLabel>Prototype</GroupLabel>
          <ListGroup>
            <MenuRow icon={LayoutGrid} label="Switch module" to="/" />
            <MenuRow
              icon={LogOut}
              label="Log out"
              danger
              onClick={() => {
                logout()
                navigate('/admin/login', { replace: true })
              }}
            />
          </ListGroup>
        </section>
      </div>
    </Screen>
  )
}
