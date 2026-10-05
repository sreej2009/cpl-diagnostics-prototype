import { useNavigate } from 'react-router'
import { LayoutGrid, LogOut } from 'lucide-react'
import { cardClass, GroupLabel, ListGroup, MenuRow } from '@/components/mobile/Kit'
import { Screen, TopBar } from '@/components/mobile/Screen'
import { Avatar, DetailRow } from '@/components/ui/Display'
import { doctorProfile } from '@/data/doctor'
import { cn } from '@/lib/utils'
import { useDoctor } from '../DoctorContext'

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useDoctor()

  return (
    <Screen header={<TopBar title="Profile" back="/doctor" />}>
      <div className="space-y-6 px-5 py-5">
        <div className={cn(cardClass, 'flex items-center gap-4 rounded-3xl p-5')}>
          <Avatar name={doctorProfile.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">{doctorProfile.name}</p>
            <p className="text-sm text-slate-500">{doctorProfile.speciality}</p>
          </div>
        </div>

        <section>
          <GroupLabel>Registration</GroupLabel>
          <dl className={cn(cardClass, 'divide-y divide-slate-100 px-4 py-1.5')}>
            <DetailRow label="Qualification">{doctorProfile.qualification}</DetailRow>
            <DetailRow label="Registration no.">{doctorProfile.registrationNo}</DetailRow>
            <DetailRow label="Clinic">{doctorProfile.clinic}</DetailRow>
            <DetailRow label="Mobile">+91 {doctorProfile.mobile}</DetailRow>
            <DetailRow label="Referral code">{doctorProfile.referralCode}</DetailRow>
            <DetailRow label="Incentive rate">{doctorProfile.commissionRate}% of order value</DetailRow>
          </dl>
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
                navigate('/doctor/login', { replace: true })
              }}
            />
          </ListGroup>
        </section>
      </div>
    </Screen>
  )
}
