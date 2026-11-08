import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Check, ChevronDown } from 'lucide-react'
import { MODE_LABEL } from '@shared/guide/types'
import type { Character } from '@shared/types'
import { cn } from '@/lib/format'
import { useActiveGuide, useApp, useGuides } from '@/lib/store'

/** Какой гайд ведёт персонажа — с быстрым переключением. Стоит в шапке страниц билда. */
export function GuideSwitcher({ char }: { char: Character }) {
  const guides = useGuides().filter((g) => g.cls === char.cls)
  const active = useActiveGuide(char)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-left transition-colors hover:bg-surface-2"
      >
        <BookOpen size={14} className="text-accent" />
        <span className="max-w-72 truncate text-[13px]">{active ? active.name : 'Без гайда'}</span>
        <ChevronDown size={14} className="text-ink-3" />
      </button>
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
