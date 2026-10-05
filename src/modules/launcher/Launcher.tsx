import { Link } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, LayoutDashboard, Smartphone, Stethoscope } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface ModuleCard {
  to: string
  icon: LucideIcon
  name: string
  format: string
  summary: string
  features: string[]
}

/** Feature lists are taken verbatim from the CPL Apps layout plan (pages 1 and 3). */
const modules: ModuleCard[] = [
  {
    to: '/patient',
    icon: Smartphone,
    name: 'Patient Mobile App',
    format: 'Mobile',
    summary: 'Main app used by patients to book tests and receive reports.',
    features: [
      'Login / Register (OTP)',
      'Search Tests',
      'Health Packages',
      'Add Tests to Cart',
      'Home Sample Collection',
      'Visit Lab Option',
      'Select Date & Time',
      'Add Patient Details',
      'Online Payment (UPI / Card / COD)',
      'Order Tracking',
      'Digital Report Download',
      'WhatsApp Report Delivery',
      'Health History Tracking',
      'Share Report with Doctor',
    ],
  },
  {
    to: '/doctor',
    icon: Stethoscope,
    name: 'Doctor App / Doctor Panel',
    format: 'Mobile',
    summary: 'Doctors refer patients and earn incentives.',
    features: [
      'Doctor Registration / Login',
      'Unique Referral Code',
      'Upload Prescription',
      'Patient Report Access (with consent)',
      'Referral Tracking',
      'Earnings Dashboard',
      'Monthly Referral Report',
      'Patient Test Recommendation',
    ],
  },
  {
    to: '/admin',
    icon: LayoutDashboard,
    name: 'Admin Panel',
    format: 'Mobile',
    summary: 'Admin manages the entire system.',
    features: [
      'Admin Login',
      'Dashboard Analytics',
      'Order Management',
      'Test & Package Management',
      'Doctor Referral Tracking',
      'Franchise Management',
      'Phlebotomist Assignment',
      'Report Management',
      'Commission Calculation',
      'Revenue Analytics',
      'Customer Management',
      'Notification System',
      'Payment Monitoring',
      'WhatsApp Report Sending',
    ],
  },
]

export default function Launcher() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-dots [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 right-0 size-[34rem] rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-40 size-[26rem] rounded-full bg-teal-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 pt-8 pb-16 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-card ring-1 ring-slate-200">
            Phase 1 · UI/UX prototype
          </span>
        </header>

        <div className="mt-14 max-w-2xl animate-rise sm:mt-20">
          <p className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">CPL Diagnostics platform</p>
          <h1 className="mt-3 text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Three connected mobile apps, one diagnostics workflow.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            From a patient booking a test to the report arriving on their phone. Choose a module to explore.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {modules.map((module, i) => (
            <Link
              key={module.to}
              to={module.to}
              className="group flex animate-rise flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200/80 transition duration-200 hover:-translate-y-1 hover:shadow-float hover:ring-brand-200"
              style={{ animationDelay: `${(i + 1) * 90}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <module.icon className="size-6" />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  {module.format} · {module.features.length} features
                </span>
              </div>
              <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">{module.name}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{module.summary}</p>

              <ul className="mt-5 flex-1 space-y-2 border-t border-slate-100 pt-5">
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-teal-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <span className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors group-hover:bg-brand-600">
                Open module
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-slate-500">
          This is a front-end prototype with mock data. There is no backend, OTP service, payment gateway, WhatsApp API,
          live GPS or LIS integration. The Franchise, Phlebotomist and Logistics apps are outside Phase 1.
        </p>
      </div>
    </div>
  )
}
