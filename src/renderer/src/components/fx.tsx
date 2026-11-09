// Декоративные эффекты: эфир на фоне, искры, счётчик, который «набегает» до значения.
// Все уважают уровень анимаций (Оформление → Анимации) — см. lib/motion.ts и styles.css.

import { useEffect, useRef, useState } from 'react'
import { useAnimate, useFancy } from '@/lib/motion'

/** Детерминированный «случайный» разброс 0…1 по строке — чтобы эффекты не шли в такт и не прыгали при перерисовке. */
export function hash01(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

const MOTES = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => hash01(`mote-${i}-${n}`)
  return {
    left: `${Math.round(r(1) * 100)}%`,
    size: 2 + Math.round(r(2) * 2),
    dur: 20 + Math.round(r(3) * 16),
    delay: -Math.round(r(4) * 30),
    sway: Math.round((r(5) - 0.5) * 120)
  }
})

/** Эфир за содержимым страницы: три медленных пятна света и редкие искры. Только при «Полных» анимациях. */
export function AetherBackdrop() {
  const fancy = useFancy()
  if (!fancy) return null
  return (
    <div aria-hidden className="fx-ambient pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className="fx-aether-blob bg-accent"
        style={{ width: 520, height: 520, left: '8%', top: '-12%', ['--dx' as string]: '120px', ['--dy' as string]: '90px' }}
      />
      <span
        className="fx-aether-blob bg-aether"
        style={{ width: 460, height: 460, right: '-6%', top: '30%', animationDuration: '46s', ['--dx' as string]: '-140px', ['--dy' as string]: '-70px' }}
      />
      <span
        className="fx-aether-blob bg-info"
        style={{ width: 380, height: 380, left: '35%', bottom: '-14%', animationDuration: '52s', ['--dx' as string]: '90px', ['--dy' as string]: '-110px' }}
      />
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="fx-mote"
          style={{
            left: m.left,
            width: m.size,
            height: m.size,
            ['--dur' as string]: `${m.dur}s`,
            ['--delay' as string]: `${m.delay}s`,
            ['--sway' as string]: `${m.sway}px`
          }}
        />
      ))}
    </div>
  )
}

/** Искры из точки: при каждом новом значении `fire` (больше нуля) — короткий разлёт частиц. */
export function Sparks({ fire, colors = ['var(--color-accent)', 'var(--color-good)', 'var(--color-aether)'] }: { fire: number; colors?: string[] }) {
  const fancy = useFancy()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!fire || !fancy) return
    setShown(fire)
    const t = setTimeout(() => setShown(0), 800)
    return () => clearTimeout(t)
  }, [fire, fancy])
  if (!shown) return null
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + hash01(`${shown}-${i}`) * 0.5
        const dist = 18 + hash01(`${shown}-d${i}`) * 16
        return (
          <span
            key={`${shown}-${i}`}
            className="fx-spark"
            style={{
              ['--sx' as string]: `${Math.cos(angle) * dist}px`,
              ['--sy' as string]: `${Math.sin(angle) * dist}px`,
              ['--spark' as string]: colors[i % colors.length]
            }}
          />
        )
      })}
    </span>
  )
}

/** Число, которое «набегает» от прежнего значения к новому (при первом показе — от нуля). */
export function CountUp({
  value,
  duration = 900,
  format = (v: number) => String(Math.round(v))
}: {
  value: number
  duration?: number
  format?: (v: number) => string
}) {
  const animate = useAnimate()
  const [shown, setShown] = useState(animate ? 0 : value)
  const from = useRef(animate ? 0 : value)
  useEffect(() => {
    if (!animate) {
      setShown(value)
      from.current = value
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = a + (value - a) * eased
      setShown(v)
      from.current = v
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, animate])
  return <>{format(shown)}</>
}
