import { cn } from '@/lib/utils'

interface TabOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: TabOption<T>[]
  /** Stretch tabs to fill the row (used in the mobile app). */
  block?: boolean
  className?: string
}

export function Tabs<T extends string>({ value, onChange, options, block, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'no-scrollbar max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1',
        block ? 'flex' : 'inline-flex',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex h-8 items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold whitespace-nowrap transition',
              block && 'flex-1',
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] leading-none',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-500',
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
