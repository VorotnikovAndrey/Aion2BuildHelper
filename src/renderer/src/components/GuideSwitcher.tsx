import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Check, ChevronDown, Flag } from 'lucide-react'
import { sortedStages } from '@shared/guide/stages'
import { MODE_LABEL } from '@shared/guide/types'
import type { Character } from '@shared/types'
import { cn } from '@/lib/format'
import { Tooltip } from '@/components/ui/InfoTip'
import { useActiveGuide, useActiveStage, useApp, useCharacterPrefs, useGuides } from '@/lib/store'

/** Какой гайд ведёт персонажа (и целевая стадия, если у гайда есть стадии) — с быстрым переключением. Стоит в шапке страниц билда. */
export function GuideSwitcher({ char }: { char: Character }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <StageSwitcher char={char} />
      <GuidePicker char={char} />
    </div>
  )
}

const gsLabel = (gs?: number) => (gs ? `${gs.toLocaleString('ru-RU')} GS` : '')

/** Целевая стадия гайда: «авто» — ближайшая впереди по уровню снаряжения персонажа. */
function StageSwitcher({ char }: { char: Character }) {
  const guide = useActiveGuide(char)
  const { stage, auto } = useActiveStage(char, guide)
  const prefs = useCharacterPrefs(char.key)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const [open, setOpen] = useState(false)
  if (!guide?.stages?.length || !stage) return null
  const choose = (id: string | null) => {
    const stages = { ...(prefs.stages ?? {}) }
    if (id) stages[guide.id] = id
    else delete stages[guide.id]
    void setPrefs(char.key, { stages })
    setOpen(false)
  }
  return (
    <div className="relative">
      <Tooltip
        wide
        content={
          <>
            <b className="text-ink">Целевая стадия: {stage.name}</b>
            {stage.gearScore ? (
              <span className="block">
                Уровень снаряжения у автора — {gsLabel(stage.gearScore)}, у вас — {gsLabel(char.gearScore)}.
              </span>
            ) : null}
            <span className="mt-1 block">
              Уровни умений, специализации, связка, доски, титулы, арканы и ориентиры по статам берутся из этой стадии билда.{' '}
              {auto ? 'Выбрана сама — ближайшая впереди по уровню снаряжения.' : 'Выбрана вручную.'}
            </span>
          </>
        }
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-left transition-colors hover:bg-surface-2"
        >
          <Flag size={14} className="text-accent" />
          <span className="max-w-56 truncate text-[13px]">{stage.name}</span>
          {stage.gearScore ? <span className="tnum shrink-0 text-[11px] text-ink-3">{gsLabel(stage.gearScore)}</span> : null}
          {auto && <span className="shrink-0 rounded bg-surface-3 px-1 text-[10px] text-ink-3">авто</span>}
          <ChevronDown size={14} className="text-ink-3" />
        </button>
      </Tooltip>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-1 max-h-[70vh] w-96 animate-fade-in overflow-y-auto rounded-xl border border-line-strong bg-surface-2 p-1 shadow-xl shadow-black/50">
            <div className="px-2.5 pt-1.5 pb-1 text-[11px] text-ink-3">Целевая стадия · у вас {gsLabel(char.gearScore)}</div>
            <button onClick={() => choose(null)} className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface-3">
              <Check size={14} className={cn('mt-0.5 shrink-0 text-accent', !auto && 'invisible')} />
              <span className="min-w-0">
                <span className="block text-[13px]">Автоматически</span>
                <span className="block text-[11px] text-ink-3">Ближайшая стадия впереди по уровню снаряжения</span>
              </span>
            </button>
            {sortedStages(guide).map((st) => {
              const done = st.gearScore !== undefined && st.gearScore <= char.gearScore
              return (
                <button key={st.id} onClick={() => choose(st.id)} className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface-3">
                  <Check size={14} className={cn('mt-0.5 shrink-0 text-accent', (auto || stage.id !== st.id) && 'invisible')} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug">{st.name}</span>
                    <span className="block text-[11px] text-ink-3">
                      {[gsLabel(st.gearScore), ...(st.tags ?? [])].filter(Boolean).join(' · ')}
                      {done ? ' · уже пройдена по GS' : ''}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function GuidePicker({ char }: { char: Character }) {
  const guides = useGuides().filter((g) => g.cls === char.cls)
  const active = useActiveGuide(char)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative">
      <Tooltip content="Гайд, с которым приложение сравнивает этого персонажа. Нажмите, чтобы выбрать другой — у каждого персонажа свой.">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-left transition-colors hover:bg-surface-2"
        >
          <BookOpen size={14} className="text-accent" />
          <span className="max-w-72 truncate text-[13px]">{active ? active.name : 'Без гайда'}</span>
          <ChevronDown size={14} className="text-ink-3" />
        </button>
      </Tooltip>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-1 w-80 animate-fade-in rounded-xl border border-line-strong bg-surface-2 p-1 shadow-xl shadow-black/50">
            <div className="px-2.5 pt-1.5 pb-1 text-[11px] text-ink-3">С чем сравнивать персонажа</div>
            {guides.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  void setPrefs(char.key, { guideId: g.id })
                  setOpen(false)
                }}
                className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface-3"
              >
                <Check size={14} className={cn('mt-0.5 shrink-0 text-accent', active?.id !== g.id && 'invisible')} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px]">{g.name}</span>
                  <span className="block text-[11px] text-ink-3">
                    {MODE_LABEL[g.mode]} · {g.builtin ? 'встроенный' : 'свой'}
                    {g.source?.title ? ` · ${g.source.title}` : ''}
                  </span>
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                void setPrefs(char.key, { guideId: 'none' })
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-ink-3 hover:bg-surface-3"
            >
              <Check size={14} className={cn('shrink-0 text-accent', active && 'invisible')} />
              Без гайда — просто посмотреть персонажа
            </button>
            <div className="my-1 border-t border-line" />
            <button
              onClick={() => {
                setOpen(false)
                navigate('/guides')
              }}
              className="w-full rounded-lg px-2.5 py-2 text-left text-[13px] text-accent hover:bg-surface-3"
            >
              Все гайды и редактор…
            </button>
          </div>
        </>
      )}
    </div>
  )
}
