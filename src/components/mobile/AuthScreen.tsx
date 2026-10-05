import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import './auth.css'

/** One login layout for all three apps; the tone gives each its own identity. */
export type AuthTone = 'patient' | 'doctor' | 'admin'

interface AuthScreenProps {
  tone: AuthTone
  /** Short app label under the wordmark, e.g. "Doctor app". */
  badge: string
  /** Kept for callers; the label is shown as text only. */
  badgeIcon?: LucideIcon
  title: string
  subtitle?: string
  /** Two `AuthPreviewCard`s that hint at what is inside the app. Shown on tall screens only. */
  preview?: ReactNode
  languageSelector?: ReactNode
  backLabel?: string
  children: ReactNode
}

/**
 * Login-only layout: an immersive brand hero that takes whatever height is left over, and the
 * form in a bottom sheet. Nothing floats in empty space — spare room always goes to the hero.
 */
export function AuthScreen({ tone, badge, title, subtitle, preview, languageSelector, backLabel = 'All modules', children }: AuthScreenProps) {
  return (
    <div className={`auth-screen auth-screen--${tone}`}>
      <div className="auth-top">
        <header className="auth-header">
          <div className="auth-brand">
            <LogoMark className="size-10" />
            <div>
              <span className="auth-wordmark">
                CPL <span>Diagnostics</span>
              </span>
              <span className="auth-caption">{badge}</span>
            </div>
          </div>
          {languageSelector}
        </header>

        {preview && (
          <div className="auth-preview" aria-hidden="true">
            {preview}
          </div>
        )}

        <section className="auth-intro" aria-labelledby="auth-title">
          <h1 id="auth-title">{title}</h1>
          {subtitle && <p className="auth-description">{subtitle}</p>}
        </section>
      </div>

      <main className="auth-form">
        <div>{children}</div>
        <footer className="auth-footer">
          <Link to="/">
            <ArrowLeft size={14} aria-hidden="true" />
            {backLabel}
          </Link>
          <span>CPL Diagnostics</span>
        </footer>
      </main>
    </div>
  )
}

/** Small glass card in the hero showing a sample of what the app holds. Decorative — values are sample data. */
export function AuthPreviewCard({ icon: Icon, label, value, good }: { icon: LucideIcon; label: string; value: string; good?: boolean }) {
  return (
    <div className="auth-card">
      <span className="auth-card-icon">
        <Icon size={19} strokeWidth={2} />
      </span>
      <div>
        <small>{label}</small>
        <strong>
          {good && <i />}
          {value}
        </strong>
      </div>
    </div>
  )
}

/* ------------------------------- Form parts ------------------------------- */

export function AuthLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{children}</span>
}

export const authFieldClass = 'auth-field flex items-center ring-1 ring-slate-200 ring-inset focus-within:ring-2 focus-within:ring-brand-500'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  /** Fixed text before the value, e.g. "+91". */
  prefix?: string
  error?: string
}

/** Login text field: label, optional icon or prefix, and a show/hide control for passwords. */
export function AuthInput({ label, icon: Icon, prefix, error, type = 'text', className, ...rest }: AuthInputProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  return (
    <label className="block">
      <AuthLabel>{label}</AuthLabel>
      <span className={cn(authFieldClass, error && 'ring-red-400')}>
        {Icon && <Icon className="ml-4 size-[18px] shrink-0" aria-hidden="true" />}
        {prefix && <span className="ml-4 shrink-0 border-r border-slate-200 pr-3 text-[15px] font-bold text-slate-800">{prefix}</span>}
        <input
          type={isPassword && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none',
            className,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="mr-1 grid size-11 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-slate-600"
          >
            {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </span>
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

/** Quiet note under a form, e.g. the prototype notice. */
export function AuthNote({ children }: { children: ReactNode }) {
  return (
    <p className="auth-note">
      <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
