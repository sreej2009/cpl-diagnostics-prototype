import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronRight, Layers, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { SearchInput } from '@/components/ui/Field'
import { categories, tests } from '@/data/catalog'
import { cn } from '@/lib/utils'
import type { TestCategory } from '@/types'
import { CartBar, TestCard } from '../components/CatalogCards'
import { useLabels } from '../components/labels'
import { Screen } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

export default function SearchTests() {
  const { t } = useI18n()
  const labels = useLabels()
  const { cartLines, preferredCollection } = usePatient()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const category = params.get('category') ?? 'All'

  const q = query.trim().toLowerCase()
  const results = tests.filter(
    (test) =>
      test.active &&
      (category === 'All' || test.category === category) &&
      (q === '' || test.name.toLowerCase().includes(q) || test.category.toLowerCase().includes(q)),
  )

  return (
    <Screen
      header={
        <header className="shrink-0 border-b border-slate-100 bg-white pt-5 pb-3">
          <div className="px-5">
            <h1 className="text-[22px] leading-tight font-extrabold tracking-tight text-slate-900">{t('tests.title')}</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              {t('tests.bookingFor', { type: preferredCollection === 'home' ? t('home.homeCollection') : t('home.visitLab') })}
            </p>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t('tests.placeholder')}
              className="mt-4 [&>input]:h-12 [&>input]:rounded-2xl [&>input]:bg-slate-50"
            />
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
            {['All', ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setParams(c === 'All' ? {} : { category: c }, { replace: true })}
                className={cn(
                  'h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors',
                  c === category ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {c === 'All' ? t('tests.all') : labels.category(c as TestCategory)}
              </button>
            ))}
          </div>
        </header>
      }
      footer={cartLines.length > 0 ? <CartBar /> : undefined}
    >
      <div className="space-y-3 px-5 py-4">
        <Link
          to="/patient/packages"
          className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-brand-800 ring-1 ring-brand-100"
        >
          <Layers className="size-5 shrink-0 text-brand-600" />
          <span className="flex-1 text-[13px] font-semibold">{t('tests.savePackages')}</span>
          <ChevronRight className="size-4 shrink-0" />
        </Link>

        <p className="pt-1 text-xs font-semibold text-slate-500">{t('tests.count', { n: results.length })}</p>

        {results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t('tests.emptyTitle')}
            description={t('tests.emptyBody')}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setParams({}, { replace: true })
                }}
              >
                {t('tests.clear')}
              </Button>
            }
          />
        ) : (
          results.map((test) => <TestCard key={test.id} test={test} />)
        )}
      </div>
    </Screen>
  )
}
