import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { ReportResult, ResultFlag } from '@/types'

export const flagMeta: Record<ResultFlag, { label: string; tone: BadgeTone; text: string; marker: string }> = {
  normal: { label: 'Normal', tone: 'green', text: 'text-slate-900', marker: 'bg-emerald-500' },
  high: { label: 'High', tone: 'red', text: 'text-red-600', marker: 'bg-red-500' },
  low: { label: 'Low', tone: 'amber', text: 'text-amber-600', marker: 'bg-amber-500' },
}

/** Text shown by a result row. Defaults to English; the Patient App passes translations. */
export interface ResultLabels {
  normal: string
  high: string
  low: string
  range: string
  below: string
  above: string
}

const defaultLabels: ResultLabels = {
  normal: flagMeta.normal.label,
  high: flagMeta.high.label,
  low: flagMeta.low.label,
  range: 'Range',
  below: 'Below',
  above: 'Above',
}

export function rangeText(low: number | null, high: number | null, unit: string, labels: ResultLabels = defaultLabels) {
  if (low !== null && high !== null) return `${low} – ${high} ${unit}`
  if (high !== null) return `${labels.below} ${high} ${unit}`
  if (low !== null) return `${labels.above} ${low} ${unit}`
  return '—'
}

/** Where the value sits relative to its reference range. */
function RangeBar({ value, low, high, flag }: Pick<ReportResult, 'value' | 'low' | 'high' | 'flag'>) {
  const lo = low ?? 0
  const hi = high ?? lo * 2
  const pad = (hi - lo) * 0.6 || 1
  const min = low === null ? 0 : lo - pad
  const max = hi + pad
  const pct = (v: number) => Math.min(97, Math.max(3, ((v - min) / (max - min)) * 100))

  return (
    <div className="relative mt-3 h-1.5 rounded-full bg-slate-100" aria-hidden="true">
      <span
        className="absolute inset-y-0 rounded-full bg-emerald-200"
        style={{ left: `${low === null ? 0 : pct(lo)}%`, right: `${100 - pct(hi)}%` }}
      />
      <span
        className={cn('absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white', flagMeta[flag].marker)}
        style={{ left: `${pct(value)}%` }}
      />
    </div>
  )
}

export function ResultRow({ result, labels = defaultLabels }: { result: ReportResult; labels?: ResultLabels }) {
  const meta = flagMeta[result.flag]
  return (
    <li className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{result.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {labels.range}: {rangeText(result.low, result.high, result.unit, labels)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('text-[17px] leading-tight font-extrabold tabular-nums', meta.text)}>
            {result.value.toLocaleString('en-IN')}
            <span className="ml-1 text-xs font-medium text-slate-500">{result.unit}</span>
          </p>
          <Badge tone={meta.tone} className="mt-1">
            {labels[result.flag]}
          </Badge>
        </div>
      </div>
      <RangeBar {...result} />
    </li>
  )
}
