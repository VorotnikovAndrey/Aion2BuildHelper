// Настройки → Оформление: готовые темы, свои цвета (основа + акцент), масштаб интерфейса и анимации.

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check, Minus, Plus, RotateCcw, Sparkles } from 'lucide-react'
import {
  ACCENT_SWATCHES,
  MOTION_LEVELS,
  stepZoom,
  THEME_BASES,
  THEME_PRESETS,
  themeBase,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEPS,
  type ThemeBase,
  type ThemePreset
} from '@shared/theme'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { isWebMode, useApp } from '@/lib/store'

export function AppearanceSection() {
  const ui = useApp((s) => s.settings.ui)
  const updateUi = useApp((s) => s.updateUi)

  return (
    <div className="space-y-5">
      <Card title="Тема" hint="Готовые сочетания фона и акцентного цвета. Меняется сразу, без перезапуска.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {THEME_PRESETS.map((p) => (
            <PresetCard key={p.id} preset={p} active={ui.themeId === p.id} onClick={() => void updateUi({ themeId: p.id, base: p.base, accent: p.accent })} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Свои цвета" hint="Соберите тему сами: основа задаёт фон и карточки, акцент — кнопки, активное меню и главное на экранах.">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-medium text-ink-2">Основа</div>
              <div className="grid grid-cols-3 gap-2">
                {THEME_BASES.map((b) => (
                  <BaseSwatch
                    key={b.id}
                    base={b}
                    accent={ui.accent}
                    active={ui.base === b.id}
                    onClick={() => void updateUi({ themeId: 'custom', base: b.id })}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-ink-2">Акцентный цвет</div>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_SWATCHES.map((c) => (
                  <button
                    key={c}
                    title={c}
                    onClick={() => void updateUi({ themeId: 'custom', accent: c })}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110',
                      ui.accent.toLowerCase() === c && 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
                    )}
                    style={{ background: c }}
                  >
                    {ui.accent.toLowerCase() === c && <Check size={14} className="text-on-accent" strokeWidth={3} />}
                  </button>
                ))}
                <label
                  title="Любой цвет"
                  className="relative flex h-8 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface-2 pr-3 pl-1 text-xs text-ink-2 hover:text-ink"
                >
                  <span className="h-6 w-6 rounded-full border border-line-strong" style={{ background: ui.accent }} />
                  Другой
                  <input
                    type="color"
                    value={ui.accent}
                    onChange={(e) => void updateUi({ themeId: 'custom', accent: e.target.value })}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-bg/60 px-4 py-3">
              <span className="text-xs text-ink-3">Так выглядит:</span>
              <Button variant="primary" size="sm">
                Главная кнопка
              </Button>
              <Pill tone="accent">метка</Pill>
              <span className="text-[13px] text-accent-2 underline underline-offset-2">ссылка</span>
              {ui.themeId === 'custom' && <span className="ml-auto text-xs text-ink-3">тема: своя</span>}
            </div>
          </div>
        </Card>

        <Card title="Масштаб интерфейса" hint="Увеличивает всё сразу: текст, кнопки, карточки, доски Даэваниона. Запоминается между запусками.">
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-line p-1 sm:grid-cols-8">
            {ZOOM_STEPS.map((z) => (
              <button
                key={z}
                onClick={() => void updateUi({ zoom: z })}
                className={cn(
                  'tnum rounded-md py-1.5 text-xs transition-colors',
                  Math.abs(ui.zoom - z) < 0.001 ? 'bg-accent font-semibold text-on-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                )}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              icon={<Minus size={14} />}
              disabled={ui.zoom <= ZOOM_MIN}
              onClick={() => void updateUi({ zoom: stepZoom(ui.zoom, -1) })}
              aria-label="Меньше"
            />
            <span className="tnum min-w-14 text-center text-[15px] font-semibold">{Math.round(ui.zoom * 100)}%</span>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              disabled={ui.zoom >= ZOOM_MAX}
              onClick={() => void updateUi({ zoom: stepZoom(ui.zoom, 1) })}
              aria-label="Больше"
            />
            <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} disabled={ui.zoom === 1} onClick={() => void updateUi({ zoom: 1 })}>
              Сбросить
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-3">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Kbd>Ctrl</Kbd>+<Kbd>колесо</Kbd> изменить
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Kbd>Ctrl</Kbd>+<Kbd>+</Kbd>/<Kbd>−</Kbd> по шагам
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Kbd>Ctrl</Kbd>+<Kbd>0</Kbd> сбросить
            </span>
          </div>
          {isWebMode && (
            <p className="mt-3 text-[11px] text-ink-3">В браузерном режиме сочетания клавиш перехватывает браузер — масштаб здесь задаётся кнопками.</p>
          )}
        </Card>
      </div>

      <Card
        title="Анимации"
        hint="Насколько оживлён интерфейс. Если в Windows включено «уменьшить анимацию», приложение не показывает блеск, эфир и искры, даже при «Полных»."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {MOTION_LEVELS.map((m) => {
            const active = ui.motion === m.id
            return (
              <button
                key={m.id}
                onClick={() => void updateUi({ motion: m.id })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                  active ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong hover:bg-surface-2'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                    active ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
                  )}
                >
                  {active && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                    {m.id === 'full' && <Sparkles size={13} className="text-accent" />}
                    {m.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{m.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line-strong bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] text-ink-2">{children}</kbd>
}

/** Карточка готовой темы с мини-превью интерфейса в её цветах. Цвета превью — данные темы, не токены. */
function PresetCard({ preset, active, onClick }: { preset: ThemePreset; active: boolean; onClick(): void }) {
  const base = themeBase(preset.base)
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-xl border text-left transition-colors',
        active ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-line-strong'
      )}
    >
      <div className="flex h-20" style={{ background: base.bg }}>
        <div className="w-8 space-y-1.5 p-1.5" style={{ background: base.sidebar }}>
          <div className="h-3.5 w-3.5 rounded" style={{ background: preset.accent }} />
          <div className="h-1 rounded-full" style={{ background: base.surface3 }} />
          <div className="h-1 rounded-full" style={{ background: base.surface3 }} />
        </div>
        <div className="flex-1 space-y-1.5 p-2">
          <div className="h-2 w-2/3 rounded-full" style={{ background: base.surface3 }} />
          <div className="flex gap-1.5">
            <div className="h-8 flex-1 rounded-md p-1.5" style={{ background: base.surface }}>
              <div className="h-1.5 w-3/4 rounded-full" style={{ background: preset.accent }} />
            </div>
            <div className="h-8 flex-1 rounded-md" style={{ background: base.surface }} />
          </div>
          <div className="h-2.5 w-10 rounded" style={{ background: preset.accent }} />
        </div>
      </div>
      <div className="flex items-center gap-2 bg-surface-2/60 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: preset.accent }} />
        <span className="truncate text-xs font-medium">{preset.label}</span>
        {active && <Check size={14} className="ml-auto shrink-0 text-accent" />}
      </div>
    </motion.button>
  )
}

function BaseSwatch({ base, accent, active, onClick }: { base: ThemeBase; accent: string; active: boolean; onClick(): void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-lg border text-left transition-colors',
        active ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-line-strong'
      )}
    >
      <div className="flex h-10 items-end gap-1 p-1.5" style={{ background: base.bg }}>
        <div className="h-6 flex-1 rounded" style={{ background: base.surface }} />
        <div className="h-4 w-3 rounded-sm" style={{ background: accent }} />
      </div>
      <div className="truncate bg-surface-2/60 px-2 py-1.5 text-[11px] text-ink-2">{base.label}</div>
    </button>
  )
}
