import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, ClipboardList, FileCheck2, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { AuthInput, AuthNote, AuthPreviewCard, AuthScreen } from '@/components/mobile/AuthScreen'
import { adminOrders, dailyOrders } from '@/data/admin'
import { Button } from '@/components/ui/Button'
import { useAdmin } from '../AdminContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAdmin()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login()
    navigate('/admin', { replace: true })
  }

  return (
    <AuthScreen
      tone="admin"
      badge="Admin portal"
      badgeIcon={ShieldCheck}
      title="Admin sign in"
      subtitle="Orders, reports, payments and operations."
      preview={
        <>
          <AuthPreviewCard icon={ClipboardList} label="Orders today" value={String(dailyOrders.values[dailyOrders.values.length - 1])} />
          <AuthPreviewCard icon={FileCheck2} label="Reports to release" value={String(adminOrders.filter((o) => o.status === 'testing').length)} />
        </>
      }
    >
      <form onSubmit={submit}>
        <div className="space-y-3.5">
          <AuthInput label="Email" icon={Mail} type="email" defaultValue="admin@cpldiagnostics.example" autoComplete="username" required className="max-[360px]:px-2.5 max-[360px]:text-[13px]" />
          <AuthInput label="Password" icon={KeyRound} type="password" defaultValue="demo-password" autoComplete="current-password" required />
        </div>

        <Button type="submit" size="lg" block className="mt-5" iconRight={ArrowRight}>
          Sign in
        </Button>
        <AuthNote>For authorised CPL staff only. Prototype — the demo credentials are pre-filled.</AuthNote>
      </form>
    </AuthScreen>
  )
}
