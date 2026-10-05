import { useState } from 'react'
import type { MouseEvent } from 'react'
import { CHART, niceTicks, useMeasure } from '@/lib/chart'
import { ChartLegend, ChartTooltip } from './ChartParts'

export interface TrendSeries {
  name: string
  color: string
  values: number[]
}

interface TrendChartProps {
  labels: string[]
  series: TrendSeries[]
  height?: number
  format?: (n: number) => string
  /** Fill under the line. Only sensible for a single series. */
  area?: boolean
  /** Start the y-axis at zero (amounts) or fit to the data (clinical values). */
  zeroBased?: boolean
  /** Shaded reference range, e.g. a normal clinical range. */
  band?: { low: number; high: number; label: string }
}

const PAD = { top: 12, right: 14, bottom: 26, left: 46 }

export function TrendChart({
  labels,
  series,
  height = 240,
  format = (n) => n.toLocaleString('en-IN'),
  area,
  zeroBased = true,
  band,
}: TrendChartProps) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const all = series.flatMap((s) => s.values).concat(band ? [band.low, band.high] : [])
  const ticks = niceTicks(zeroBased ? 0 : Math.min(...all), Math.max(...all))
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]

  const innerW = Math.max(width - PAD.left - PAD.right, 1)
  const innerH = height - PAD.top - PAD.bottom
  const n = labels.length
  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1))
  const y = (v: number) => PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH
  const labelEvery = Math.ceil(n / Math.max(Math.floor(innerW / 56), 1))

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left - PAD.left) / innerW
    setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))))
  }

  return (
    <div>
      {series.length > 1 && <ChartLegend items={series.map((s) => ({ label: s.name, color: s.color }))} />}
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${series.map((s) => s.name).join(', ')} trend`}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            {band && (
              <rect
                x={PAD.left}
                y={y(band.high)}
                width={innerW}
                height={Math.max(y(band.low) - y(band.high), 0)}
                fill={CHART.aqua}
                opacity={0.1}
                rx={4}
              />
            )}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={CHART.grid} />
                <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART.muted}>
                  {format(t)}
                </text>
              </g>
            ))}
            {labels.map(
              (label, i) =>
                (i % labelEvery === 0 || i === n - 1) &&
                (i === n - 1 || n - 1 - i >= labelEvery) && (
                  <text
                    key={`${label}-${i}`}
                    x={x(i)}
                    y={height - 6}
                    textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
                    fontSize={11}
                    fill={CHART.muted}
                  >
                    {label}
                  </text>
                ),
            )}
            {hover !== null && (
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke={CHART.axis} />
            )}
            {series.map((s) => {
              const line = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
              return (
                <g key={s.name}>
                  {area && (
                    <path
                      d={`${line} L${x(n - 1)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`}
                      fill={s.color}
                      opacity={0.1}
                    />
                  )}
                  <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {(n <= 8 || hover !== null) &&
                    s.values.map(
                      (v, i) =>
                        (n <= 8 || i === hover) && (
                          <circle
                            key={i}
                            cx={x(i)}
                            cy={y(v)}
                            r={i === hover ? 5 : 4}
                            fill={s.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ),
                    )}
                </g>
              )
            })}
          </svg>
        )}
        {hover !== null && (
          <ChartTooltip
            x={x(hover)}
            containerWidth={width}
            title={labels[hover]}
            rows={series.map((s) => ({ label: s.name, color: s.color, value: format(s.values[hover]) }))}
          />
        )}
      </div>
      {band && (
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2.5 w-4 rounded-sm" style={{ background: CHART.aqua, opacity: 0.25 }} />
          {band.label}
        </p>
      )}
    </div>
  )
}
