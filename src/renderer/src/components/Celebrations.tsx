// Празднования: когда оверлей присылает свежие данные, сравниваем разбор «до» и «после» (shared/analysis/progress.ts)
// и показываем всплывашки с искрами в углу, а если включено — уведомление Windows.
// Пример можно вызвать из настроек: событие окна `a2bh:celebrate`.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { BuildReport } from '@shared/analysis/build'
import { MAX_EVENTS, notificationText, progressEvents, type ProgressEvent, type ProgressKind } from '@shared/analysis/progress'
import { Sparks } from '@/components/fx'
import { SkillIcon } from '@/components/icons'
import { StatusBadge } from '@/components/StatusBadge'
import { useAnimate } from '@/lib/motion'
import { useCharacterContext } from '@/lib/report'
import { isWebMode, useApp } from '@/lib/store'
import { t } from '@shared/i18n'

export const CELEBRATE_EVENT = 'a2bh:celebrate'

const ROUTE: Record<ProgressKind, string> = { threshold: '/stats', skill: '/skills', item: '/gear', score: '/', step: '/' }
const LIFETIME_MS = 9000

export function showNotification(events: ProgressEvent[]): void {
  const n = notificationText(events)
  if (!n || isWebMode || typeof Notification === 'undefined') return
  try {
    new Notification(n.title, { body: n.body })
  } catch {
    // Уведомления запрещены в системе — всплывашек в приложении достаточно.
  }
}

export function Celebrations() {
  const ctx = useCharacterContext()
  const modifiedAt = useApp((s) => s.source?.modifiedAt)
  const notify = useApp((s) => s.settings.notifications !== false)
  const [toasts, setToasts] = useState<ProgressEvent[]>([])
  const prev = useRef<{ key: string; modifiedAt?: number; guide?: string; report: BuildReport } | null>(null)

  const push = (events: ProgressEvent[]) => setToasts((t) => [...events, ...t.filter((x) => !events.some((e) => e.id === x.id))].slice(0, MAX_EVENTS))

  // Свежие данные того же персонажа с тем же гайдом → события прогресса.
  useEffect(() => {
    if (!ctx) return
    const cur = { key: ctx.char.key, modifiedAt, guide: ctx.guide?.id, report: ctx.report }
    const p = prev.current
    prev.current = cur
    if (!p || !ctx.guide || p.key !== cur.key || p.guide !== cur.guide || p.modifiedAt === cur.modifiedAt) return
    const events = progressEvents(p.report, cur.report, ctx.namer)
    if (!events.length) return
    push(events)
    if (notify) showNotification(events)
  }, [ctx?.report])

  // Пример из настроек.
  useEffect(() => {
    const onCelebrate = (e: Event) => push((e as CustomEvent<ProgressEvent[]>).detail)
    window.addEventListener(CELEBRATE_EVENT, onCelebrate)
    return () => window.removeEventListener(CELEBRATE_EVENT, onCelebrate)
  }, [])

  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[65] flex w-[340px] flex-col-reverse gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((e, i) => (
          <Toast key={e.id} event={e} index={i} onClose={() => dismiss(e.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ event, index, onClose }: { event: ProgressEvent; index: number; onClose: () => void }) {
  const navigate = useNavigate()
  const animate = useAnimate()
  const [fire, setFire] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setFire(1), 120 + index * 140)
    const life = setTimeout(onClose, LIFETIME_MS + index * 600)
    return () => {
      clearTimeout(t)
      clearTimeout(life)
    }
  }, [])
  return (
    <motion.div
      layout={animate}
      initial={animate ? { opacity: 0, x: 60, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={animate ? { opacity: 0, x: 40, transition: { duration: 0.2 } } : { opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30, delay: animate ? index * 0.08 : 0 }}
      className="pointer-events-auto relative flex items-start gap-3 rounded-xl border border-good/40 bg-surface-3 p-3 pr-8 shadow-2xl shadow-black/50"
    >
      <button
        onClick={() => {
          navigate(ROUTE[event.kind])
          onClose()
        }}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className="relative mt-0.5 shrink-0">
          {event.skill ? <SkillIcon id={event.skill} size={30} /> : <StatusBadge tone="ok" size={22} />}
          <Sparks fire={fire} colors={['var(--color-good)', 'var(--color-accent)', 'var(--color-aether)']} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] leading-snug font-semibold text-ink">{event.title}</span>
          {event.text && <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{event.text}</span>}
        </span>
      </button>
      <button onClick={onClose} className="absolute top-2 right-2 p-1 text-ink-3 hover:text-ink" aria-label={t('Закрыть')}>
        <X size={13} />
      </button>
    </motion.div>
  )
}
