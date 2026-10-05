import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: LucideIcon
  /** Small label next to the title, e.g. "Main lab". */
  tag?: string
  /** Extra content revealed below the option while it is selected. */
  children?: ReactNode
}

/** A large radio option used throughout the booking flow. */
export function OptionCard({ selected, onSelect, title, description, icon: Icon, tag, children }: OptionCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white transition ring-inset',
        selected ? 'shadow-card ring-2 ring-brand-600' : 'ring-1 ring-slate-200',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {Icon && (
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl transition-colors',
              selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500',
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] leading-snug font-bold text-slate-900">{title}</span>
            {tag && (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">{tag}</span>
            )}
          </span>
          {description && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{description}</span>}
        </span>
        <span
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ring-2 ring-inset',
            selected ? 'ring-brand-600' : 'ring-slate-300',
          )}
        >
          {selected && <span className="size-2.5 rounded-full bg-brand-600" />}
        </span>
      </button>
      {selected && children && <div className="border-t border-slate-100 p-4">{children}</div>}
    </div>
  )
}
