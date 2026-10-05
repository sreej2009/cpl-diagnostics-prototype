import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  centerLabel: string
  format?: (n: number) => string
}

const SIZE = 168
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS
const GAP = 3

/** Part-to-whole with the legend doubling as the value table. */
export function DonutChart({ segments, centerLabel, format = (n) => n.toLocaleString('en-IN') }: DonutChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  let offset = 0
  const arcs = segments.map((s) => {
    const length = (s.value / total) * CIRC
    const arc = { length, offset }
    offset += length
    return arc
  })

  const shown = hover === null ? null : segments[hover]

  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-6 @md:flex-row">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" role="img" aria-label={`${centerLabel} breakdown`}>
            {segments.map((s, i) => (
              <circle
                key={s.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(arcs[i].length - GAP, 0)} ${CIRC}`}
                strokeDashoffset={-arcs[i].offset}
                opacity={hover === null || hover === i ? 1 : 0.35}
                className="transition-opacity"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-2xl leading-none font-extrabold tracking-tight text-slate-900">
                {format(shown ? shown.value : total)}
              </p>
              <p className="mt-1.5 max-w-24 text-[11px] leading-tight font-medium text-slate-500">
                {shown ? shown.label : centerLabel}
              </p>
            </div>
          </div>
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-1">
          {segments.map((s, i) => (
            <li
              key={s.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[13px] transition-colors',
                hover === i && 'bg-slate-50',
              )}
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-600">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                <span className="font-bold text-slate-900">{format(s.value)}</span>
                <span className="ml-2 inline-block w-9 text-right text-xs text-slate-400">
                  {Math.round((s.value / total) * 100)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
