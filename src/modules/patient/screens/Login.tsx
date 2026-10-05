import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, FileText, Globe, HeartPulse, House, UserRound } from 'lucide-react'
import { AuthInput, AuthNote, AuthPreviewCard, AuthScreen } from '@/components/mobile/AuthScreen'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { defaultUser } from '@/data/patient'
import { cn } from '@/lib/utils'
import { languages, useI18n } from '../i18n'
import type { Language } from '../i18n'
import { usePatient } from '../PatientContext'

type Mode = 'login' | 'register'
const OTP_LENGTH = 6

function OtpInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => refs.current[0]?.focus(), [])

  const setDigit = (index: number, digit: string) => {
    const next = [...value]
    next[index] = digit
    onChange(next)
    if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) refs.current[index - 1]?.focus()
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
    if (digits.length === 0) return
    e.preventDefault()
    onChange(Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? ''))
    refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
  }

  return (
    <div className="flex justify-between gap-2">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={digit}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`OTP ${i + 1}`}
          className={cn(
            'h-13 w-full min-w-0 rounded-xl text-center text-xl font-bold text-slate-900 ring-1 transition ring-inset focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none',
            digit ? 'bg-white ring-brand-300' : 'bg-slate-50 ring-slate-200',
          )}
        />
      ))}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()
  const { login } = usePatient()
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [seconds, setSeconds] = useState(30)

  useEffect(() => {
    if (step !== 'otp' || seconds === 0) return
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [step, seconds])

  const mobileValid = mobile.length === 10 && (mode === 'login' || name.trim().length > 1)
  const otpValid = otp.every(Boolean)
  const prettyMobile = `${mobile.slice(0, 5)} ${mobile.slice(5)}`

  const sendOtp = (e: FormEvent) => {
    e.preventDefault()
    if (!mobileValid) return
    setOtp(Array(OTP_LENGTH).fill(''))
    setSeconds(30)
    setStep('otp')
  }

  const verify = (e: FormEvent) => {
    e.preventDefault()
    if (!otpValid) return
    // Returning users get the demo profile; new registrations keep the name they entered.
    login({ name: mode === 'register' ? name.trim() : defaultUser.name, mobile: prettyMobile })
    navigate('/patient', { replace: true })
  }

  return (
    <AuthScreen
      tone="patient"
      badge={t('login.badge')}
      badgeIcon={HeartPulse}
      title={t('login.headline1')}
      subtitle={t('login.headline2')}
      backLabel={t('login.allModules')}
      // the sample cards make way for the longer Register form
      preview={
        mode === 'login' && (
        <>
          <AuthPreviewCard icon={FileText} label="Lipid Profile" value={t('reports.allInRange')} good />
          <AuthPreviewCard icon={House} label={t('home.homeCollection')} value={`${t('common.today')} · 7:30 AM`} />
        </>
        )
      }
      languageSelector={
        <label className="auth-language">
          <Globe size={16} aria-hidden="true" />
          <select aria-label={t('profile.language')} value={lang} onChange={(e) => setLang(e.target.value as Language)}>
            {languages.map((language) => <option key={language.code} value={language.code} aria-label={language.english}>{language.code === lang ? language.tag : language.name}</option>)}
          </select>
        </label>
      }
    >
      {step === 'mobile' ? (
        <form onSubmit={sendOtp}>
          <Tabs
            block
            value={mode}
            onChange={setMode}
            options={[
              { value: 'login', label: t('login.login') },
              { value: 'register', label: t('login.register') },
            ]}
          />
          <h2 className="mt-4 text-[17px] leading-tight font-extrabold tracking-tight text-slate-900">
            {mode === 'login' ? t('login.welcome') : t('login.create')}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-slate-500">{t('login.otpIntro')}</p>

          <div className="mt-4 space-y-3.5">
            {mode === 'register' && (
              <AuthInput
                label={t('login.fullName')}
                icon={UserRound}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('login.asPerId')}
                autoComplete="name"
              />
            )}
            <AuthInput
              label={t('login.mobile')}
              prefix="+91"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={t('login.mobilePh')}
              className="font-semibold tracking-wide placeholder:tracking-normal"
            />
          </div>

          <Button type="submit" size="lg" block className="mt-5" iconRight={ArrowRight} disabled={!mobileValid}>
            {t('login.sendOtp')}
          </Button>
          <AuthNote>{t('login.protoMobile')}</AuthNote>
        </form>
      ) : (
        <form onSubmit={verify}>
          <button
            type="button"
            onClick={() => setStep('mobile')}
            className="-ml-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="size-4" />
            {t('login.changeNumber')}
          </button>
          <h2 className="mt-3 text-[17px] leading-tight font-extrabold tracking-tight text-slate-900">{t('login.enterOtp')}</h2>
          <p className="mt-1 text-[13px] leading-snug text-slate-500">
            {t('login.sentTo')} <span className="font-bold whitespace-nowrap text-slate-900">+91 {prettyMobile}</span>
          </p>

          <div className="mt-4">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <Button type="submit" size="lg" block className="mt-5" disabled={!otpValid}>
            <span>{t('login.verify')}</span>
          </Button>
          <p className="mt-3 text-center text-[13px] text-slate-500">
            {seconds > 0 ? (
              t('login.resendIn', { s: String(seconds).padStart(2, '0') })
            ) : (
              <button type="button" onClick={() => setSeconds(30)} className="font-bold text-brand-700">
                {t('login.resend')}
              </button>
            )}
          </p>
          <AuthNote>{t('login.protoOtp')}</AuthNote>
        </form>
      )}
    </AuthScreen>
  )
}
