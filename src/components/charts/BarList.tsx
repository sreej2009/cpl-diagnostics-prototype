interface BarListItem {
  label: string
  value: number
  hint?: string
}

interface BarListProps {
  items: BarListItem[]
  format?: (n: number) => string
}

/** Ranked horizontal bars — for "top N" lists where the labels are long. */
export function BarList({ items, format = (n) => n.toLocaleString('en-IN') }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate font-medium text-slate-700">{item.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-bold text-slate-900">{format(item.value)}</span>
              {item.hint && <span className="ml-2 text-xs text-slate-400">{item.hint}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
