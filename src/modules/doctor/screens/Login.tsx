import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, BadgeCheck, Building2, ChartNoAxesColumnIncreasing, CircleCheck, KeyRound, Phone, Stethoscope, UserRound, UsersRound } from 'lucide-react'
import { AuthInput, AuthLabel, AuthNote, AuthPreviewCard, AuthScreen } from '@/components/mobile/AuthScreen'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { doctorProfile, earningsHistory } from '@/data/doctor'
import { inr } from '@/lib/utils'
import { useDoctor } from '../DoctorContext'

type Mode = 'login' | 'register'

const specialities = ['General Physician', 'Diabetologist', 'Cardiologist', 'Gynaecologist', 'Paediatrician', 'Orthopaedician', 'Other']

export default function Login() {
  const navigate = useNavigate()
  const { login } = useDoctor()
  const [mode, setMode] = useState<Mode>('login')
  const [registered, setRegistered] = useState(false)

  const enter = () => {
    login()
    navigate('/doctor', { replace: true })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'login') enter()
    else setRegistered(true)
  }

  return (
    <AuthScreen
      tone="doctor"
      badge="Doctor app"
      badgeIcon={Stethoscope}
      title="Doctor sign in"
      subtitle="Referrals, patient reports and earnings."
      // the sample cards make way for the longer Register form
      preview={
        mode === 'login' && !registered && (
        <>
          <AuthPreviewCard icon={UsersRound} label="Referrals this month" value={String(earningsHistory.referrals[earningsHistory.referrals.length - 1])} />
          <AuthPreviewCard icon={ChartNoAxesColumnIncreasing} label="Earned this month" value={inr(earningsHistory.earnings[earningsHistory.earnings.length - 1])} />
        </>
        )
      }
    >
      {registered ? (
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-50 text-teal-600">
            <CircleCheck className="size-7" />
          </span>
          <h2 className="mt-4 text-[17px] font-extrabold tracking-tight text-slate-900">Registration submitted</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            CPL verifies each doctor's registration before activating the account. Your unique referral code is issued on
            approval.
          </p>
          <div className="mt-5 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <p className="text-[11px] font-bold tracking-[0.14em] text-brand-600 uppercase">Your referral code</p>
            <p className="mt-1 text-xl font-extrabold tracking-wider text-brand-900">{doctorProfile.referralCode}</p>
          </div>
          <Button size="lg" block className="mt-6" onClick={enter}>
            Continue to the app
          </Button>
          <AuthNote>Prototype — approval is simulated.</AuthNote>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Tabs
            block
            value={mode}
            onChange={setMode}
            options={[
              { value: 'login', label: 'Login' },
              { value: 'register', label: 'Register' },
            ]}
          />
          {mode === 'register' && (
            <>
              <h2 className="mt-4 text-[17px] leading-tight font-extrabold tracking-tight text-slate-900">Register as a referring doctor</h2>
              <p className="mt-1 text-[13px] leading-snug text-slate-500">It takes about a minute.</p>
            </>
          )}

          <div className="mt-4 space-y-3.5">
            {mode === 'login' ? (
              <>
                {/* keys stop the browser carrying the demo values into the Register fields */}
                <AuthInput key="login-user" label="Mobile number or email" icon={UserRound} defaultValue={doctorProfile.mobile} autoComplete="username" required />
                <AuthInput key="login-password" label="Password" icon={KeyRound} type="password" defaultValue="demo-password" autoComplete="current-password" required />
              </>
            ) : (
              <>
                <AuthInput key="register-name" label="Full name" icon={UserRound} placeholder="Dr." required />
                <AuthInput key="register-number" label="Medical registration no." icon={BadgeCheck} placeholder="e.g. TNMC 00000" required />
                <label className="block">
                  <AuthLabel>Speciality</AuthLabel>
                  <Select defaultValue={specialities[0]} className="[&>select]:h-12 [&>select]:bg-white [&>select]:text-[16px] [&>select]:font-medium">
                    {specialities.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </label>
                <AuthInput label="Clinic / hospital" icon={Building2} placeholder="Name and area" required />
                <AuthInput label="Mobile number" icon={Phone} inputMode="numeric" placeholder="10 digits" required />
                <AuthInput label="Create password" icon={KeyRound} type="password" autoComplete="new-password" required />
              </>
            )}
          </div>

          <Button type="submit" size="lg" block className="mt-5" iconRight={ArrowRight}>
            {mode === 'login' ? 'Sign in' : 'Submit registration'}
          </Button>
          <AuthNote>{mode === 'login' && 'For healthcare professionals only. '}Prototype — {mode === 'login' ? 'the demo credentials are pre-filled.' : 'no data is stored.'}</AuthNote>
        </form>
      )}
    </AuthScreen>
  )
}
