import { Link, Navigate, useParams } from 'react-router'
import { Check, Clock, UserRound, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { packageById, testById } from '@/data/catalog'
import { AddButton, Price } from '../components/CatalogCards'
import { useLabels } from '../components/labels'
import { Screen, TopBar } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export default function PackageDetail() {
  const { id = '' } = useParams()
  const { t } = useI18n()
  const { inCart } = usePatient()
  const labels = useLabels()
  const pkg = packageById(id)
  if (!pkg) return <Navigate to="/patient/packages" replace />

  const included = pkg.testIds.map(testById).filter((test) => test !== undefined)
  const facts = [
    { icon: Clock, label: t('package.reportIn'), value: labels.dur(pkg.reportTime) },
    { icon: Utensils, label: t('package.fasting'), value: pkg.fasting ? labels.dur(pkg.fasting) : t('package.notNeeded') },
    { icon: UserRound, label: t('package.idealFor'), value: labels.idealFor(pkg) },
  ]

  return (
    <Screen
      header={<TopBar title={t('package.title')} back="/patient/packages" />}
      footer={
        <div className="flex items-center justify-between gap-4">
          <Price price={pkg.price} mrp={pkg.mrp} large />
          {inCart(pkg.id) ? (
            <Link to="/patient/cart">
              <Button size="lg">{t('package.goToCart')}</Button>
            </Link>
          ) : (
            <AddButton id={pkg.id} size="lg" />
          )}
        </div>
      }
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-6 pb-8 text-white">
        <span className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -bottom-16 left-1/3 size-40 rounded-full bg-teal-300/20" />
        <span className="relative inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
          {t('test.tests', { n: pkg.testIds.length })} · {t('test.parameters', { n: pkg.parameters })}
        </span>
        <h1 className="relative mt-3 text-2xl leading-tight font-extrabold tracking-tight">{pkg.name}</h1>
        <p className="relative mt-1 text-sm text-brand-100">{labels.tagline(pkg)}</p>
      </div>

      <div className="-mt-4 space-y-5 px-5 pb-6">
        <div className="relative grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white py-4 shadow-card ring-1 ring-slate-200/70">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="min-w-0 px-3 text-center">
              <Icon className="mx-auto size-[18px] text-brand-600" />
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-xs leading-tight font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('package.included')}</h2>
          <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
            {included.map((test) => (
              <li key={test.id} className="flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-600">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{test.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t('test.parameters', { n: test.parameters })} · {labels.testDesc(test)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Screen>
  )
}
