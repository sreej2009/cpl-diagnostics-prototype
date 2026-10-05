import { Check } from 'lucide-react'
import { Barcode } from '@/components/ui/Barcode'
import { sampleBarcode, sampleStagesFor, stageFromStatus } from '@/lib/sample'
import { stepsFor } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'
import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { useLabels } from './labels'

/** Compact segmented bar — one segment per workflow stage. */
export function ProgressBar({ order }: { order: Order }) {
  const steps = stepsFor(order.collectionType)
  const current = steps.findIndex((s) => s.key === order.status)
  return (
    <div className="flex gap-1" role="img" aria-label={`Stage ${current + 1} of ${steps.length}`}>
      {steps.map((step, i) => (
        <span key={step.key} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', i <= current ? 'bg-brand-600' : 'bg-slate-200')} />
      ))}
    </div>
  )
}

/** Full vertical timeline for the order tracking screen. */
export function Timeline({ order }: { order: Order }) {
  const { t } = useI18n()
  const labels = useLabels()
  const steps = stepsFor(order.collectionType)
  const current = steps.findIndex((s) => s.key === order.status)

  return (
    <ol>
      {steps.map((step, i) => {
        // Every status is a completed milestone except Lab Testing, which is ongoing.
        const done = i < current || (i === current && order.status !== 'testing')
        const active = i === current && !done
        const upNext = i === current + 1 && order.status !== 'testing'
        const last = i === steps.length - 1
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn('absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full', i < current ? 'bg-brand-600' : 'bg-slate-200')}
              />
            )}
            <span
              className={cn(
                'relative grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                done && 'bg-brand-600 text-white',
                active && 'bg-white text-brand-700 ring-2 ring-brand-600',
                !done && !active && 'bg-slate-100 text-slate-400',
                upNext && 'ring-2 ring-slate-300',
              )}
            >
              {active && <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/30" />}
              {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <div className="pt-1">
              <p className={cn('text-[15px] leading-tight font-bold', done || active ? 'text-slate-900' : upNext ? 'text-slate-600' : 'text-slate-400')}>
                {labels.step(step.key)}
              </p>
              {(done || active) && <p className="mt-1 text-[13px] text-slate-500">{labels.hint(step.key)}</p>}
              {upNext && <p className="mt-1 text-[13px] text-slate-400">{t('track.upNext')}</p>}
              {active && (
                <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                  {t('track.inProgress')}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Simplified sample tracking for the patient's own order: the sample ID and where
 * the sample is in the lab's six-stage lifecycle. No other patient's data is involved.
 */
export function SampleCard({ order }: { order: Order }) {
  const { t } = useI18n()
  const stage = stageFromStatus(order.status)
  const stages = sampleStagesFor(order.collectionType)
  const current = stages.findIndex((s) => s.key === stage)

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-slate-900">{t('sample.title')}</h2>
        {stage && (
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {t('sample.stepOf', { a: current + 1, b: stages.length })}
          </span>
        )}
      </div>

      {stage ? (
        <>
          <p className="mt-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('sample.current')}</p>
          <p className="mt-0.5 text-[17px] leading-snug font-extrabold tracking-tight text-brand-700">
            {t(`sample.${stage}` as TranslationKey)}
          </p>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {stages.map((s, i) => (
              <span key={s.key} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', i <= current ? 'bg-teal-500' : 'bg-slate-200')} />
            ))}
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-3 text-[13px] font-semibold text-red-700">{t('sample.cancelled')}</p>
      )}

      <div className="mt-4 rounded-xl bg-slate-50 px-4 pt-3 pb-2.5">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{t('sample.id')}</p>
        <Barcode value={sampleBarcode(order.id)} height={40} />
      </div>
    </section>
  )
}
