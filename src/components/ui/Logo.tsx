import { cn } from '@/lib/utils'

interface LogoProps {
  /** Text shown under the wordmark, e.g. "Admin Panel". */
  caption?: string
  size?: 'sm' | 'md'
  className?: string
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm shadow-brand-600/30',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[58%]" fill="none" aria-hidden="true">
        <path d="M12 2.8c3.2 3.9 6 7 6 10.4a6 6 0 0 1-12 0c0-3.4 2.8-6.5 6-10.4Z" fill="#fff" />
        <path d="M12 10.4v5.2M9.4 13h5.2" stroke="#1f4fd1" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function Logo({ caption, size = 'md', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={size === 'sm' ? 'size-8' : undefined} />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight text-slate-900">
          CPL <span className="font-semibold text-slate-500">Diagnostics</span>
        </span>
        {caption && (
          <span className="mt-1 block text-[10px] font-bold tracking-[0.14em] text-brand-600 uppercase">{caption}</span>
        )}
      </span>
    </span>
  )
}
