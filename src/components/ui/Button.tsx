import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 disabled:opacity-50',
  ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50',
  danger: 'bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-2xl px-5 text-[15px]',
}

const iconSizes: Record<Size, string> = { sm: 'size-3.5', md: 'size-4', lg: 'size-[18px]' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  icon?: LucideIcon
  iconRight?: LucideIcon
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon: Icon,
  iconRight: IconRight,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition duration-150 active:scale-[0.98] disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block ? 'w-full min-w-0' : 'shrink-0',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        Icon && <Icon className={cn('shrink-0', iconSizes[size])} strokeWidth={2.2} />
      )}
      {children}
      {IconRight && !loading && <IconRight className={cn('shrink-0', iconSizes[size])} strokeWidth={2.2} />}
    </button>
  )
}
