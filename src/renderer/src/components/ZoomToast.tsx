import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ZoomIn } from 'lucide-react'
import { api, useApp } from '@/lib/store'

/** Короткая плашка «Масштаб 125%» при Ctrl+колесо / Ctrl+= / − / 0. */
export function ZoomToast() {
  const onZoomChanged = useApp((s) => s.onZoomChanged)
  const [zoom, setZoom] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(
    () =>
      api.app.onZoomChanged((z) => {
        onZoomChanged(z)
        setZoom(z)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setZoom(null), 1400)
      }),
    [onZoomChanged]
  )

  return (
    <AnimatePresence>
      {zoom !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-surface-3 px-4 py-2 text-[13px] shadow-2xl shadow-black/50"
        >
          <ZoomIn size={15} className="text-accent" />
          Масштаб <b className="tnum">{Math.round(zoom * 100)}%</b>
          <span className="text-ink-3">· Ctrl+0 — сбросить</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
