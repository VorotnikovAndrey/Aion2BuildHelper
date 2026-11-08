import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { STATIC_MODE } from '@/lib/env'
import { cn } from '@/lib/format'
import { InfoTip } from './InfoTip'

interface CardProps {
  title?: ReactNode
  /** Подсказка «?» у заголовка: зачем этот блок и как его читать. */
  hint?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
  delay?: number
}

export function Card({ title, hint, actions, className, bodyClassName, children, delay = 0 }: CardProps) {
  return (
    <motion.section
      initial={STATIC_MODE ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={cn('rounded-2xl border border-line bg-surface', className)}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold tracking-wide text-ink-2 uppercase">
            {title}
            {hint && <InfoTip>{hint}</InfoTip>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5', title ? 'pt-3' : null, bodyClassName)}>{children}</div>
    </motion.section>
  )
}
