import { cn } from '@/lib/utils'

interface LegendItem {
  label: string
  color: string
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('mb-3 flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

interface ChartTooltipProps {
  /** Anchor x position in px, relative to the chart container. */
  x: number
  containerWidth: number
  title: string
  rows: { label: string; color: string; value: string }[]
}

export function ChartTooltip({ x, containerWidth, title, rows }: ChartTooltipProps) {
  const flip = x > containerWidth / 2
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 min-w-28 rounded-xl bg-white px-3 py-2 text-xs shadow-float ring-1 ring-slate-200"
      style={flip ? { right: containerWidth - x + 12 } : { left: x + 12 }}
    >
      <p className="mb-1 font-semibold text-slate-500">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="size-2 rounded-[2px]" style={{ background: row.color }} />
            {row.label}
          </span>
          <span className="font-bold text-slate-900 tabular-nums">{row.value}</span>
        </p>
      ))}
    </div>
  )
}
