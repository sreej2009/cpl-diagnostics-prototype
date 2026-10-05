import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { OverlayRootProvider, ToastProvider } from '@/components/ui/Overlay'
import { AppThemeProvider } from './Screen'
import type { AppTheme } from './Screen'

export interface GuideFeature {
  label: string
  to: string
}

interface MobileFrameProps {
  /** Module name shown under the logo, e.g. "Doctor Mobile App". */
  caption: string
  /** Header colour family for the app's inner screens. */
  theme: AppTheme
  headline: string
  intro: string
  /** The module's features from the layout plan, each mapped to the screen that shows it. */
  features: GuideFeature[]
  /** Runs before a guide jump, e.g. to sign in the demo user. */
  onJump?: (feature: GuideFeature) => void
  children: ReactNode
}

/** Short brand panel shown beside the phone on login routes, so the sign-in form is the focus. */
export function LoginAside({ caption, headline, hint }: { caption: string; headline: string; hint: string }) {
  return (
    <aside className="hidden w-64 shrink-0 xl:block">
      {/* the phone already carries the logo, so the panel uses a plain label instead of repeating it */}
      <p className="text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase">{caption}</p>
      <h1 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-slate-900">{headline}</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{hint}</p>
      <Link to="/" className="mt-5 inline-flex items-center gap-2 border-t border-slate-200 pt-4 text-[13px] font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" />
        All modules
      </Link>
    </aside>
  )
}

/**
 * Device shell for the mobile modules: full-bleed on phones, and a phone frame
 * with a clickable feature guide beside it on larger screens.
 */
export function MobileFrame({ caption, theme, headline, intro, features, onJump, children }: MobileFrameProps) {
  const navigate = useNavigate()
  const onLogin = useLocation().pathname.endsWith('/login')
  const [overlayRoot, setOverlayRoot] = useState<HTMLDivElement | null>(null)

  return (
    <div className="relative flex min-h-dvh items-center justify-center gap-16 bg-white sm:bg-slate-100 sm:bg-dots sm:p-6">
      <Link
        to="/"
        className="absolute top-5 left-6 hidden items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 sm:inline-flex xl:hidden"
      >
        <ArrowLeft className="size-4" />
        All modules
      </Link>

      {onLogin && <LoginAside caption={caption} headline={headline} hint="Sign in on the phone to open the app. The demo details are already filled in." />}
      <aside className={onLogin ? 'hidden' : 'hidden w-80 shrink-0 xl:block'}>
        <Logo caption={caption} />
        <h1 className="mt-6 text-[28px] leading-tight font-extrabold tracking-tight text-slate-900">{headline}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 [@media(max-height:820px)]:hidden">{intro}</p>
        <ol className="mt-5 space-y-0.5">
          {features.map((feature, i) => (
            <li key={feature.label}>
              <button
                type="button"
                onClick={() => {
                  onJump?.(feature)
                  navigate(feature.to)
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[13.5px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-brand-700 hover:shadow-card [@media(max-height:820px)]:py-1"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-400 ring-1 ring-slate-200 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
                  {i + 1}
                </span>
                {feature.label}
              </button>
            </li>
          ))}
        </ol>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 px-2.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          All modules
        </Link>
      </aside>

      <div className="relative h-dvh w-full overflow-hidden bg-white sm:h-[min(860px,calc(100dvh-3rem))] sm:w-[400px] sm:shrink-0 sm:rounded-[2.75rem] sm:shadow-float sm:ring-[10px] sm:ring-slate-900">
        <OverlayRootProvider value={overlayRoot}>
          <ToastProvider offsetClass="bottom-24">
            <AppThemeProvider value={theme}>{children}</AppThemeProvider>
          </ToastProvider>
        </OverlayRootProvider>
        <div ref={setOverlayRoot} className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  )
}
