import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { LoginAside } from '@/components/mobile/MobileFrame'
import { Logo } from '@/components/ui/Logo'
import { OverlayRootProvider, ToastProvider } from '@/components/ui/Overlay'
import { defaultUser } from '@/data/patient'
import { usePatient } from '../PatientContext'

/** The 14 Patient App features from the layout plan, mapped to the screen that shows each. */
const features: { label: string; to: string; needsCart?: boolean }[] = [
  { label: 'Login / Register (OTP)', to: '/patient/login' },
  { label: 'Search Tests', to: '/patient/tests' },
  { label: 'Health Packages', to: '/patient/packages' },
  { label: 'Add Tests to Cart', to: '/patient/cart', needsCart: true },
  { label: 'Home Sample Collection', to: '/patient/book?step=1&type=home', needsCart: true },
  { label: 'Visit Lab Option', to: '/patient/book?step=1&type=lab', needsCart: true },
  { label: 'Select Date & Time', to: '/patient/book?step=2', needsCart: true },
  { label: 'Add Patient Details', to: '/patient/book?step=3', needsCart: true },
  { label: 'Online Payment (UPI / Card / COD)', to: '/patient/book?step=4', needsCart: true },
  { label: 'Order Tracking', to: '/patient/orders/CPL-24817' },
  { label: 'Digital Report Download', to: '/patient/reports/r-1' },
  { label: 'WhatsApp Report Delivery', to: '/patient/reports/r-1?action=whatsapp' },
  { label: 'Health History Tracking', to: '/patient/health' },
  { label: 'Share Report with Doctor', to: '/patient/reports/r-1?action=share' },
]

function FeatureGuide() {
  const navigate = useNavigate()
  const { user, login, cartLines, toggleCart } = usePatient()
  const onLogin = useLocation().pathname.endsWith('/login')

  const open = (feature: (typeof features)[number]) => {
    // Jumping straight to a screen: sign in as the demo patient and make sure there is something to book.
    if (!user && feature.to !== '/patient/login') login(defaultUser)
    if (feature.needsCart && cartLines.length === 0) toggleCart('p-full')
    navigate(feature.to)
  }

  if (onLogin) {
    return (
      <LoginAside
        caption="Patient Mobile App"
        headline="Book tests and receive reports."
        hint="Sign in on the phone to open the app. Any 10-digit number and any 6-digit OTP work in this prototype."
      />
    )
  }

  return (
    <aside className="hidden w-80 shrink-0 xl:block">
      <Logo caption="Patient Mobile App" />
      <h1 className="mt-6 text-[28px] leading-tight font-extrabold tracking-tight text-slate-900">
        Book tests and receive reports.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500 [@media(max-height:820px)]:hidden">
        The main app used by patients. Use the phone as you would the real app, or jump to any feature below.
      </p>
      <ol className="mt-5 space-y-0.5">
        {features.map((feature, i) => (
          <li key={feature.label}>
            <button
              type="button"
              onClick={() => open(feature)}
              className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left [@media(max-height:820px)]:py-1 text-[13.5px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-brand-700 hover:shadow-card"
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
  )
}

/** Full-bleed on phones; a device frame with a feature guide beside it on larger screens. */
export function PhoneFrame({ children }: { children: ReactNode }) {
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

      <FeatureGuide />

      <div className="relative h-dvh w-full overflow-hidden bg-white sm:h-[min(860px,calc(100dvh-3rem))] sm:w-[400px] sm:shrink-0 sm:rounded-[2.75rem] sm:shadow-float sm:ring-[10px] sm:ring-slate-900">
        <OverlayRootProvider value={overlayRoot}>
          <ToastProvider offsetClass="bottom-24">{children}</ToastProvider>
        </OverlayRootProvider>
        <div ref={setOverlayRoot} className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  )
}
