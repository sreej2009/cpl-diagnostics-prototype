import { useState } from 'react'
import { Link } from 'react-router'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, CalendarClock, ChevronRight, FileText, Info, Minus, Stethoscope } from 'lucide-react'
import { TrendChart } from '@/components/charts/TrendChart'
import { flagMeta, rangeText } from '@/components/reports/ResultRow'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Display'
import { healthMetricsByMember, testReminders } from '@/data/patient'
import { CHART } from '@/lib/chart'
import { cn } from '@/lib/utils'
import type { HealthMetric, ResultFlag } from '@/types'
import { useLabels } from '../components/labels'
import { ProfileSwitcher } from '../components/ProfileSwitcher'
import { Screen, SectionTitle, TabHeader } from '../components/Screen'
import { useI18n } from '../i18n'
import { usePatient } from '../PatientContext'

function flagFor(metric: HealthMetric, value: number): ResultFlag {
  // an upper-bound-only range ("below 5.7") excludes the bound itself
  if (metric.high !== null && (metric.low === null ? value >= metric.high : value > metric.high)) return 'high'
  if (metric.low !== null && value < metric.low) return 'low'
  return 'normal'
}

/** "05 Oct 2026" → "Oct 26" */
const shortDate = (date: string) => {
  const [, month, year] = date.split(' ')
  return `${month} ${year.slice(2)}`
}

const cardClass = 'rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70'

/* ----------------------------- Upcoming tests ----------------------------- */

function UpcomingTests() {
  const { t } = useI18n()
  const { orders, selectedMember } = usePatient()
  const labels = useLabels()
  // Booked orders whose sample has not been collected yet, plus sample reminders for this member.
  const booked = orders.filter((o) => o.patient.name === selectedMember.name && (o.status === 'placed' || o.status === 'assigned'))
  const reminders = testReminders.filter((r) => r.memberId === selectedMember.id)

  return (
    <section>
      <SectionTitle title={t('health.upcoming')} />
      {booked.length === 0 && reminders.length === 0 ? (
        <div className={cn(cardClass, 'flex items-center justify-between gap-3 p-4')}>
          <p className="text-[13px] text-slate-500">{t('health.noUpcoming')}</p>
          <Link to="/patient/tests" className="shrink-0">
            <Button size="sm" variant="soft">
              {t('orders.bookTest')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className={cn(cardClass, 'divide-y divide-slate-100')}>
          {booked.map((order) => (
            <Link key={order.id} to={`/patient/orders/${order.id}`} className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarClock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{order.items.map((i) => i.name).join(', ')}</p>
                <p className="truncate text-xs text-slate-500">
                  {labels.date(order.date)} · {order.slot}
                </p>
              </div>
              <Badge tone="brand">{t('health.booked')}</Badge>
            </Link>
          ))}
          {reminders.map((reminder) => (
            <Link key={reminder.id} to="/patient/tests" className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <BellRing className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{reminder.title}</p>
                <p className="truncate text-xs text-slate-500">{labels.date(reminder.date)}</p>
              </div>
              <Badge tone="amber">{t('health.reminder')}</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

/* --------------------------- Latest vs previous --------------------------- */

function Comparison({ metrics, selectedId, onSelect }: { metrics: HealthMetric[]; selectedId: string; onSelect: (id: string) => void }) {
  const { t } = useI18n()
  const { resultLabels } = useLabels()
  const comparable = metrics.filter((m) => m.readings.length >= 2)
  if (comparable.length === 0) return null
  const anyOutside = comparable.some((m) => flagFor(m, m.readings[m.readings.length - 1].value) !== 'normal')

  return (
    <section>
      <SectionTitle title={t('health.compare')} />
      <div className={cn(cardClass, 'divide-y divide-slate-100 overflow-hidden')}>
        {comparable.map((metric) => {
          const latest = metric.readings[metric.readings.length - 1]
          const previous = metric.readings[metric.readings.length - 2]
          const inRange = flagFor(metric, latest.value) === 'normal'
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => onSelect(metric.id)}
              aria-pressed={metric.id === selectedId}
              className={cn('block w-full px-4 py-3 text-left transition-colors', metric.id === selectedId && 'bg-brand-50/50')}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm leading-snug font-bold text-slate-900">{metric.name}</p>
                <Badge tone={inRange ? 'green' : 'amber'} dot>
                  {inRange ? t('health.inRange') : t('health.outside')}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-end gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="shrink-0">
                  <span className="block whitespace-nowrap">{t('health.previous')}</span>
                  <span className="text-sm font-semibold text-slate-600 tabular-nums">{previous.value}</span>
                </span>
                <ArrowRight className="mb-1 size-3.5 shrink-0 text-slate-300" />
                <span className="shrink-0">
                  <span className="block whitespace-nowrap">{t('health.latest')}</span>
                  <span className={cn('text-base font-extrabold tabular-nums', inRange ? 'text-slate-900' : 'text-amber-600')}>
                    {latest.value}
                  </span>
                  <span className="ml-1">{metric.unit}</span>
                </span>
                <span className="ml-auto shrink-0 pb-0.5 text-[11px] text-slate-400">{rangeText(metric.low, metric.high, metric.unit, resultLabels)}</span>
              </div>
            </button>
          )
        })}
      </div>
      {anyOutside && (
        <p className="mt-3 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-[13px] leading-snug text-amber-900 ring-1 ring-amber-100">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-amber-600" />
          {t('health.consult')}
        </p>
      )}
    </section>
  )
}

/* ---------------------------------- Trends -------------------------------- */

interface TrendsProps {
  metrics: HealthMetric[]
  metric: HealthMetric
  onSelect: (id: string) => void
  flagLabel: (flag: ResultFlag) => string
}

function Trends({ metrics, metric, onSelect, flagLabel }: TrendsProps) {
  const { t } = useI18n()
  const { resultLabels, date } = useLabels()
  const values = metric.readings.map((r) => r.value)
  const latest = metric.readings[metric.readings.length - 1]
  const previous = metric.readings[metric.readings.length - 2]
  const change = previous ? Number((latest.value - previous.value).toFixed(2)) : 0
  const flag = flagFor(metric, latest.value)
  const TrendIcon = change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight

  // An open-ended range ("below 5.7") is drawn from just under the lowest reading.
  const bandHigh = metric.high ?? Math.max(...values)
  const bandLow = metric.low ?? Math.min(...values, bandHigh) * 0.94

  return (
    <section>
      <SectionTitle title={t('health.trends')} />
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {metrics.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={m.id === metric.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors',
              m.id === metric.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 ring-inset',
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div key={metric.id} className="mt-4 animate-rise rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-500">{t('health.latestOf', { metric: metric.name })}</p>
            <p className="mt-1 text-4xl leading-none font-extrabold tracking-tight text-slate-900">
              {latest.value}
              <span className="ml-1.5 text-sm font-semibold text-slate-500">{metric.unit}</span>
            </p>
          </div>
          <Badge tone={flagMeta[flag].tone} dot>
            {flag === 'normal' ? t('health.inRange') : flagLabel(flag)}
          </Badge>
        </div>
        {previous && (
          <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[13px] text-slate-500">
            <TrendIcon className="size-4 text-slate-700" />
            <span className="font-bold text-slate-900">
              {change === 0 ? t('health.noChange') : `${change > 0 ? '+' : '−'}${Math.abs(change)} ${metric.unit}`}
            </span>
            {t('health.since', { date: date(previous.date) })}
          </p>
        )}

        <div className="mt-5">
          <TrendChart
            labels={metric.readings.map((r) => date(shortDate(r.date)))}
            series={[{ name: metric.name, color: CHART.blue, values }]}
            height={200}
            zeroBased={false}
            format={(n) => String(Number(n.toFixed(1)))}
            band={{ low: bandLow, high: bandHigh, label: `${t('range.label')}: ${rangeText(metric.low, metric.high, metric.unit, resultLabels)}` }}
          />
        </div>
      </div>

      <h3 className="mt-5 mb-2 px-1 text-xs font-bold tracking-wide text-slate-500 uppercase">{t('health.allReadings')}</h3>
      <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
        {[...metric.readings].reverse().map((reading) => {
          const f = flagFor(metric, reading.value)
          return (
            <li key={reading.date} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-500">{date(reading.date)}</span>
              <span className="flex items-center gap-3">
                <span className={cn('text-[15px] font-extrabold tabular-nums', flagMeta[f].text)}>
                  {reading.value}
                  <span className="ml-1 text-xs font-medium text-slate-500">{metric.unit}</span>
                </span>
                <Badge tone={flagMeta[f].tone}>{flagLabel(f)}</Badge>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ----------------------------- Report timeline ---------------------------- */

function ReportTimeline() {
  const { t } = useI18n()
  const { date } = useLabels()
  const { reports, selectedMember } = usePatient()
  const mine = reports.filter((r) => r.patientName === selectedMember.name)

  return (
    <section>
      <SectionTitle title={t('health.timeline')} />
      {mine.length === 0 ? (
        <p className={cn(cardClass, 'px-4 py-5 text-center text-[13px] text-slate-500')}>{t('health.noTimeline')}</p>
      ) : (
        <ol className={cn(cardClass, 'p-4')}>
          {mine.map((report, i) => {
            const flagged = report.results.filter((r) => r.flag !== 'normal').length
            return (
              <li key={report.id} className="relative flex gap-3 pb-5 last:pb-0">
                {i < mine.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full bg-slate-200" />}
                <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <FileText className="size-4" />
                </span>
                <Link to={`/patient/reports/${report.id}`} className="flex min-w-0 flex-1 items-start gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-500">{date(report.reportedOn)}</span>
                    <span className="block text-sm leading-snug font-bold text-slate-900">{report.title}</span>
                    <span className={cn('mt-0.5 block text-xs font-semibold', flagged > 0 ? 'text-amber-600' : 'text-emerald-600')}>
                      {flagged > 0 ? t('reports.outOfRange', { n: flagged }) : t('reports.allInRange')}
                    </span>
                  </span>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

/* --------------------------------- Screen --------------------------------- */

export default function HealthHistory() {
  const { t } = useI18n()
  const labels = useLabels()
  const { selectedMember } = usePatient()
  const metrics = healthMetricsByMember[selectedMember.id] ?? []
  const [metricId, setMetricId] = useState('')
  // falls back to the first metric when the selected family member changes
  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0]

  return (
    <Screen
      header={
        <>
          <TabHeader title={t('health.title')} subtitle={t('health.subtitle', { name: selectedMember.name })} />
          <ProfileSwitcher />
        </>
      }
    >
      <div className="space-y-7 px-5 py-4">
        <p className="flex items-start gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs leading-snug text-slate-600">
          <Info className="mt-px size-3.5 shrink-0 text-slate-400" />
          {t('common.sampleData')}
        </p>

        <UpcomingTests />

        {!metric ? (
          <EmptyState icon={Activity} title={t('health.noDataTitle', { name: selectedMember.name })} description={t('health.noDataBody')} />
        ) : (
          <>
            <Comparison metrics={metrics} selectedId={metric.id} onSelect={setMetricId} />
            <Trends metrics={metrics} metric={metric} onSelect={setMetricId} flagLabel={(flag) => labels.resultLabels[flag]} />
          </>
        )}

        <ReportTimeline />
      </div>
    </Screen>
  )
}
