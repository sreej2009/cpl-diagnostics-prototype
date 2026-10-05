import { Utensils } from 'lucide-react'
import { timeSlots, unavailableSlots } from '@/data/patient'
import { addDays, cn, dayName, monthName } from '@/lib/utils'
import { useLabels } from '../../components/labels'
import { useI18n } from '../../i18n'
import type { TranslationKey } from '../../i18n'
import { usePatient } from '../../PatientContext'
import type { StepProps } from './types'

const DAYS_AHEAD = 7

const periodKey: Record<string, TranslationKey> = {
  Morning: 'book.morning',
  Afternoon: 'book.afternoon',
  Evening: 'book.evening',
}

export function ScheduleStep({ draft, update }: StepProps) {
  const { t } = useI18n()
  const { cartLines } = usePatient()
  const labels = useLabels()
  const fasting = cartLines.find((l) => l.fasting)?.fasting
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(i))

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.selectDate')}</h2>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {days.map((day, i) => {
            const selected = draft.dayOffset === i
            return (
              <button
                key={i}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ dayOffset: i, slot: null })}
                className={cn(
                  'flex w-[62px] shrink-0 flex-col items-center rounded-2xl py-3 transition-colors',
                  selected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 ring-inset',
                )}
              >
                <span className={cn('max-w-full truncate px-1 text-[11px] font-semibold', selected ? 'text-brand-100' : 'text-slate-500')}>
                  {i === 0 ? t('common.today') : labels.date(dayName(day))}
                </span>
                <span className="mt-1 text-xl leading-none font-extrabold">{day.getDate()}</span>
                <span className={cn('mt-1 text-[11px] font-medium', selected ? 'text-brand-100' : 'text-slate-400')}>
                  {labels.date(monthName(day))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {fasting && (
        <p className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-[13px] leading-snug text-amber-900 ring-1 ring-amber-100">
          <Utensils className="mt-0.5 size-4 shrink-0 text-amber-600" />
          {t('book.fastingNote', { hrs: labels.dur(fasting) })}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-slate-900">{t('book.selectTime')}</h2>
        <div className="space-y-4">
          {timeSlots.map(({ period, slots }) => (
            <div key={period}>
              <p className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">{t(periodKey[period])}</p>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => {
                  const full = unavailableSlots.includes(slot)
                  const selected = draft.slot === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={full}
                      aria-pressed={selected}
                      onClick={() => update({ slot })}
                      className={cn(
                        'h-11 rounded-xl text-[13px] font-semibold transition-colors',
                        full && 'bg-slate-100 text-slate-400 line-through',
                        selected && 'bg-brand-600 text-white shadow-sm shadow-brand-600/30',
                        !full && !selected && 'bg-white text-slate-700 ring-1 ring-slate-200 ring-inset hover:ring-brand-300',
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
