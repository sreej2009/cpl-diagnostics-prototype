import { useState } from 'react'
import { CHART, niceTicks, useMeasure } from '@/lib/chart'
import { ChartTooltip } from './ChartParts'

interface BarChartProps {
  labels: string[]
  values: number[]
  /** Series name shown in the tooltip. */
  name: string
  color?: string
  height?: number
  format?: (n: number) => string
}

const PAD = { top: 12, right: 8, bottom: 26, left: 46 }

export function BarChart({
  labels,
  values,
  name,
  color = CHART.blue,
  height = 240,
  format = (n) => n.toLocaleString('en-IN'),
}: BarChartProps) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const ticks = niceTicks(0, Math.max(...values))
  const yMax = ticks[ticks.length - 1]
  const innerW = Math.max(width - PAD.left - PAD.right, 1)
  const innerH = height - PAD.top - PAD.bottom
  const band = innerW / labels.length
  const barW = Math.min(band - 6, 32)
  const baseline = PAD.top + innerH
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH

  return (
    <div ref={ref} className="relative" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${name} by period`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={CHART.grid} />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART.muted}>
                {format(t)}
              </text>
            </g>
          ))}
          {values.map((v, i) => {
            const cx = PAD.left + band * i + band / 2
            const top = y(v)
            const r = Math.min(4, barW / 2, Math.max(baseline - top, 0))
            const left = cx - barW / 2
            return (
              <g key={labels[i]} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* full-height hit target, wider than the bar */}
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} fill="transparent" />
                <path
                  d={`M${left},${baseline} V${top + r} Q${left},${top} ${left + r},${top} H${left + barW - r} Q${left + barW},${top} ${left + barW},${top + r} V${baseline} Z`}
                  fill={color}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                <text x={cx} y={height - 6} textAnchor="middle" fontSize={11} fill={CHART.muted}>
                  {labels[i]}
                </text>
              </g>
            )
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} stroke={CHART.axis} />
        </svg>
      )}
      {hover !== null && (
        <ChartTooltip
          x={PAD.left + band * hover + band / 2}
          containerWidth={width}
          title={labels[hover]}
          rows={[{ label: name, color, value: format(values[hover]) }]}
        />
      )}
    </div>
  )
}
