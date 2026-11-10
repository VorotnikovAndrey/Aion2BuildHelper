// Заставка при запуске: значок прилетает, падает кристалл эфира, перо за пером раскрываются крылья,
// по кристаллу пробегает блик, по буквам появляется название — и всё растворяется, открывая приложение.
// ~2,7 с; клик или любая клавиша — пропустить. Вся анимация — в splash.css (на CSS, а не на motion:
// она идёт на компоновщике и не дёргается, пока React собирает первую страницу).

import { useEffect, useState, type CSSProperties } from 'react'
import { create } from 'zustand'
import { BrandMark } from '@/components/BrandMark'
import { cn } from '@/lib/format'
import { useApp } from '@/lib/store'
import { effectiveMotion } from '@/lib/theme'
import './splash.css'
import { t } from '@shared/i18n'

const SEEN_KEY = 'a2bh-splash-seen'
let launchDecision: boolean | undefined

/**
 * Показывать ли заставку при открытии окна. Решаем один раз (StrictMode вызывает инициализаторы дважды).
 * Флаг в sessionStorage живёт, пока открыто окно: перезагрузка страницы заставку не повторяет.
 * Анимации выключены (в настройках или режим ?static) — заставки нет.
 */
function showOnLaunch(): boolean {
  if (launchDecision !== undefined) return launchDecision
  const ui = useApp.getState().settings.ui
  let seen = false
  try {
    seen = Boolean(sessionStorage.getItem(SEEN_KEY))
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Хранилище недоступно — просто показываем.
  }
  launchDecision = !seen && ui.splash !== false && effectiveMotion(ui.motion) !== 'off'
  return launchDecision
}

/** Номер показа: «Показать сейчас» в настройках увеличивает его и проигрывает заставку заново. */
const useSplashRun = create<{ run: number }>(() => ({ run: 0 }))
export const replaySplash = () => useSplashRun.setState((s) => ({ run: s.run + 1 }))

export function Splash() {
  const run = useSplashRun((s) => s.run)
  const [visible, setVisible] = useState(showOnLaunch)
  const [skipping, setSkipping] = useState(false)

  useEffect(() => {
    if (run === 0) return
    setSkipping(false)
    setVisible(true)
  }, [run])

  useEffect(() => {
    if (!visible) return
    const skip = () => setSkipping(true)
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [visible])

  // Подстраховка: если событие конца анимации не пришло (окно в фоне), всё равно убираем заставку.
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), skipping ? 450 : 3200)
    return () => clearTimeout(t)
  }, [visible, skipping, run])

  if (!visible) return null
  return (
    <div
      key={run}
      aria-hidden
      className={cn('a2-splash', skipping && 'is-skipping')}
      onClick={() => setSkipping(true)}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && (e.animationName === 'a2-splash-out' || e.animationName === 'a2-splash-skip')) setVisible(false)
      }}
    >
      <div className="a2-splash__stage">
        <div className="a2-splash__emblem">
          <div className="a2-splash__aura" />
          <BrandMark size="100%" className="a2-splash__mark" />
        </div>
        <Wordmark />
        <div className="a2-splash__tagline">{t('помощник по билду')}</div>
      </div>
    </div>
  )
}

/** Название по буквам: «Aion2» — золотом значка, «Build Helper» — цветом текста. */
function Wordmark() {
  const text = 'Aion2 Build Helper'
  return (
    <div className="a2-splash__word">
      {[...text].map((ch, i) => (
        <span key={i} className={cn(i < 5 && 'a2-gold', ch === ' ' && 'a2-space')} style={{ '--d': `${1 + i * 0.03}s` } as CSSProperties}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </div>
  )
}
