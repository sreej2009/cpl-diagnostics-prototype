import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  FileText,
  House,
  MapPin,
  MessageCircle,
  PackageSearch,
  Search,
  Share2,
  ShoppingBag,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Display'
import { categories, packages, tests } from '@/data/catalog'
import { isActive } from '@/lib/status'
import { cn, inr } from '@/lib/utils'
import type { CollectionType, LabTest } from '@/types'
import { AddButton, PackageCard } from '../components/CatalogCards'
import { categoryMeta } from '../components/categoryMeta'
import { useLabels } from '../components/labels'
import { ProgressBar } from '../components/OrderProgress'
import { Screen, SectionTitle } from '../components/Screen'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { usePatient } from '../PatientContext'

function greetingKey(): TranslationKey {
  const hour = new Date().getHours()
  return hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening'
}

const stagger = (i: number): CSSProperties => ({ animationDelay: `${i * 60}ms` })

const quickActions: { label: TranslationKey; icon: LucideIcon; to: string }[] = [
  { label: 'home.myReports', icon: FileText, to: '/patient/reports' },
  { label: 'home.trackOrder', icon: PackageSearch, to: '/patient/orders' },
  { label: 'home.healthHistory', icon: Activity, to: '/patient/health' },
  { label: 'home.shareReport', icon: Share2, to: '/patient/reports' },
]

const card = 'rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70'

function SeeAll({ to }: { to: string }) {
  const { t } = useI18n()
  return (
    <Link to={to} className="inline-flex shrink-0 items-center text-[13px] font-bold text-brand-700">
      {t('common.seeAll')}
      <ChevronRight className="size-4" />
    </Link>
  )
}

/** Compact test row for the home list — the full card is used on the search screen. */
function TestRow({ test }: { test: LabTest }) {
  const { t } = useI18n()
  const labels = useLabels()
  const { icon: Icon, tint } = categoryMeta[test.category]
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tint)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{test.name}</p>
        <p className="truncate text-xs text-slate-500">
          <span className="font-bold text-slate-900">{inr(test.price)}</span>
          <span className="mx-1.5 text-slate-300">·</span>
          {t('test.reportIn', { time: labels.dur(test.reportTime) })}
        </p>
      </div>
      <AddButton id={test.id} />
    </li>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const labels = useLabels()
  const { user, cartLines, orders, reports, selectedMember, addresses, whatsappOptIn, setWhatsappOptIn, setPreferredCollection } =
    usePatient()
  const activeOrder = orders.find((o) => isActive(o.status))
  const firstName = user?.name.split(' ')[0] ?? ''
  const myReports = reports.filter((r) => r.patientName === selectedMember.name)
  const latestReport = myReports[0]
  const inRange = latestReport?.results.filter((r) => r.flag === 'normal').length ?? 0

  const startBooking = (type: CollectionType) => {
    setPreferredCollection(type)
    navigate('/patient/tests')
  }

  return (
    <Screen>
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-[1.75rem] bg-white px-5 pt-5 pb-5 shadow-card">
        <span className="pointer-events-none absolute -top-28 -right-24 size-64 rounded-full bg-brand-100/70 blur-3xl" />
        <span className="pointer-events-none absolute top-8 -left-28 size-48 rounded-full bg-teal-100/50 blur-3xl" />

        <div className="relative flex items-center justify-between gap-3">
          <Link to="/patient/profile" className="flex min-w-0 items-center gap-3">
            <Avatar name={user?.name ?? 'Guest'} className="size-11 ring-2 ring-white" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-medium text-slate-500">{t(greetingKey())}</span>
              <span className="block truncate text-[19px] font-extrabold tracking-tight text-slate-900">{firstName}</span>
            </span>
          </Link>
          <Link
            to="/patient/cart"
            aria-label={`${t('cart.title')}: ${cartLines.length}`}
            className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-card ring-1 ring-slate-200/80"
          >
            <ShoppingBag className="size-[18px]" />
            {cartLines.length > 0 && (
              <span className="absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white">
                {cartLines.length}
              </span>
            )}
          </Link>
        </div>

        <Link
          to="/patient/tests"
          className="relative mt-4 flex h-12 animate-rise items-center gap-3 rounded-2xl bg-slate-50 px-4 text-sm text-slate-400 ring-1 ring-slate-200 transition-colors ring-inset hover:bg-white"
        >
          <Search className="size-[18px] shrink-0 text-brand-600" />
          <span className="truncate">{t('home.search')}</span>
        </Link>

        <Link to="/patient/profile" className="relative mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="size-3.5 shrink-0 text-brand-600" />
          <span className="truncate">
            {t('home.collectingAt')}: <span className="font-bold text-slate-800">{addresses[0]?.area.split(',')[0] ?? '—'}, Chennai</span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-slate-400" />
        </Link>
      </div>

      <div className="space-y-6 px-5 pt-5 pb-8">
        {/* Primary actions */}
        <section className="grid animate-rise grid-cols-2 gap-3" style={stagger(1)}>
          <button
            type="button"
            onClick={() => startBooking('home')}
            className="relative flex flex-col items-start overflow-hidden rounded-3xl bg-brand-950 p-4 text-left text-white shadow-float transition duration-150 active:scale-[0.98]"
          >
            <span className="pointer-events-none absolute -right-8 -bottom-10 size-32 rounded-full bg-brand-600/40 blur-xl" />
            <span className="relative grid size-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <House className="size-5 text-teal-300" />
            </span>
            <span className="relative mt-5 block text-[15px] leading-tight font-bold">{t('home.homeCollection')}</span>
            <span className="relative mt-1.5 flex items-center gap-1 text-xs text-brand-200">
              {t('home.weComeToYou')}
              <ArrowRight className="size-3.5 shrink-0" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => startBooking('lab')}
            className="relative flex flex-col items-start overflow-hidden rounded-3xl bg-white p-4 text-left shadow-card ring-1 ring-slate-200/70 transition duration-150 active:scale-[0.98]"
          >
            <span className="relative grid size-10 place-items-center rounded-2xl bg-teal-50 text-teal-600">
              <Building2 className="size-5" />
            </span>
            <span className="relative mt-5 block text-[15px] leading-tight font-bold text-slate-900">{t('home.visitLab')}</span>
            <span className="relative mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              {t('home.walkIn')}
              <ArrowRight className="size-3.5 shrink-0" />
            </span>
          </button>
        </section>

        {/* Upcoming collection / sample status */}
        {activeOrder && (
          <Link
            to={`/patient/orders/${activeOrder.id}`}
            className={cn(card, 'block animate-rise p-4')}
            style={stagger(2)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-wide text-teal-700 uppercase">
                  {t('home.upcoming')}
                </p>
                <p className="mt-1 text-[15px] leading-snug font-bold text-slate-900">{labels.status(activeOrder.status)}</p>
              </div>
              <span className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-brand-50 pr-2 pl-3 text-xs font-bold text-brand-700">
                {t('common.track')}
                <ChevronRight className="size-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar order={activeOrder} />
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarClock className="size-3.5 shrink-0 text-slate-400" />
              <span className="truncate">
                {activeOrder.id} · {labels.date(activeOrder.date)} · {activeOrder.slot}
              </span>
            </p>
          </Link>
        )}

        {/* Quick actions */}
        <section className={cn(card, 'grid animate-rise grid-cols-4 gap-1 px-2 py-3.5')} style={stagger(3)}>
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <action.icon className="size-5" />
              </span>
              <span className="text-[11px] leading-tight font-semibold break-words text-slate-700">{t(action.label)}</span>
            </Link>
          ))}
        </section>

        {/* Health summary */}
        {latestReport && (
          <section>
            <SectionTitle title={t('home.healthSummary')} action={<SeeAll to="/patient/health" />} />
            <Link to={`/patient/reports/${latestReport.id}`} className={cn(card, 'flex items-center gap-3.5 p-4')}>
              <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-teal-50 text-[15px] font-extrabold text-teal-700 ring-4 ring-teal-100/60 tabular-nums">
                {inRange}/{latestReport.results.length}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  {t('home.latestReport')} · {labels.date(latestReport.reportedOn)}
                </p>
                <p className="mt-0.5 truncate text-[15px] font-bold text-slate-900">{latestReport.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {t('home.reportsReady', { n: myReports.length })}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-slate-300" />
            </Link>
          </section>
        )}

        {/* Health packages */}
        <section>
          <SectionTitle title={t('home.packages')} action={<SeeAll to="/patient/packages" />} />
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
            {packages.slice(0, 4).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} className="w-[264px] shrink-0 snap-center" />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <SectionTitle title={t('home.browse')} />
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {categories.map((category) => {
              const { icon: Icon, tint } = categoryMeta[category]
              return (
                <Link
                  key={category}
                  to={`/patient/tests?category=${category}`}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold text-slate-700 shadow-card ring-1 ring-slate-200/70"
                >
                  <span className={cn('grid size-8 place-items-center rounded-full', tint)}>
                    <Icon className="size-4" />
                  </span>
                  {labels.category(category)}
                </Link>
              )
            })}
          </div>
        </section>

        {/* Popular tests */}
        <section>
          <SectionTitle title={t('home.popular')} action={<SeeAll to="/patient/tests" />} />
          <ul className={cn(card, 'divide-y divide-slate-100')}>
            {tests
              .filter((test) => test.popular && test.active)
              .slice(0, 4)
              .map((test) => (
                <TestRow key={test.id} test={test} />
              ))}
          </ul>
        </section>

        {/* WhatsApp delivery */}
        <section className="flex items-center gap-3 rounded-2xl bg-teal-50 px-4 py-3 ring-1 ring-teal-100">
          <MessageCircle className="size-5 shrink-0 text-teal-600" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-teal-950">{t('home.whatsappTitle')}</p>
            <p className="text-xs leading-snug text-teal-800/80">
              {whatsappOptIn ? t('home.whatsappOn', { mobile: user?.mobile ?? '' }) : t('home.whatsappOff')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappOptIn(!whatsappOptIn)}
            className={cn(
              'h-8 shrink-0 rounded-full px-3.5 text-xs font-bold transition-colors',
              whatsappOptIn ? 'bg-teal-600 text-white' : 'bg-white text-teal-700 ring-1 ring-teal-200',
            )}
          >
            {whatsappOptIn ? t('home.on') : t('home.turnOn')}
          </button>
        </section>
      </div>
    </Screen>
  )
}
