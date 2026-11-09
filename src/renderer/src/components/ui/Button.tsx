import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-2 font-semibold',
  secondary: 'bg-surface-2 text-ink border border-line-strong hover:bg-surface-3',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2',
  danger: 'bg-critical-soft text-critical border border-critical/30 hover:bg-critical/25'
}

export function Button({ variant = 'secondary', size = 'md', icon, className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg transition-[color,background-color,border-color,transform] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-9 px-3.5 text-[13px]',
        VARIANTS[variant],
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}
