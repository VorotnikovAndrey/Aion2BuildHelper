import { useState, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/format'

/** Значок «?» с пояснением при наведении. */
export function InfoTip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Tooltip content={children} className={className}>
      <HelpCircle size={14} className="text-ink-3 transition-colors hover:text-ink-2" />
    </Tooltip>
  )
}

/** Всплывающая подсказка над элементом. Без порталов — достаточно для карточек и строк. */
export function Tooltip({
  content,
  children,
  className,
  side = 'top',
  wide
}: {
  content: ReactNode
  children: ReactNode
  className?: string
  side?: 'top' | 'bottom'
  wide?: boolean
}) {
  const [open, setOpen] = useState(false)
  if (!content) return <>{children}</>
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 animate-fade-in rounded-lg border border-line-strong bg-surface-3 px-3 py-2 text-left text-xs leading-relaxed font-normal tracking-normal text-ink-2 normal-case shadow-xl shadow-black/40',
            wide ? 'w-80' : 'w-64',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
