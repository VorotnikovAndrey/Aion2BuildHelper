// Настройки → «Названия»: режим (русские / английские / оба), свои названия умений любого класса
// и список переименованных вещей. Свои названия хранятся по игровому ID — у каждого класса свои умения.

import { useMemo, useState } from 'react'
import { RotateCcw, Search, X } from 'lucide-react'
import { CLASSES } from '@shared/gamedata/classes'
import { itemArt } from '@shared/gamedata/art'
import { classSkills, type SkillDef, type SkillType } from '@shared/gamedata/skills'
import type { NameMode } from '@shared/names'
import type { ClassKey } from '@shared/types'
import { ItemIcon } from '@/components/art'
import { ClassIcon } from '@/components/game'
import { SkillIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/misc'
import { cn } from '@/lib/format'
import { useApp, useCharacter } from '@/lib/store'

const TYPE_RU: Record<SkillType, string> = { active: 'Активные', passive: 'Пассивные', stigma: 'Стигмы' }
const input = 'h-8 min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent'

export function NamesSection() {
  const settings = useApp((s) => s.settings)
  const update = useApp((s) => s.updateSettings)
  const char = useCharacter()
  const [cls, setCls] = useState<ClassKey>(char?.cls ?? 'templar')
  const [q, setQ] = useState('')

  const skillNames = settings.names.skills ?? {}
  const itemNames = settings.names.items ?? {}
  const countFor = (c: ClassKey) => classSkills(c).filter((s) => skillNames[s.id]).length

  const setSkill = (id: number, value: string) => {
    const next = { ...skillNames }
    if (value.trim()) next[id] = value.trim()
    else delete next[id]
    void update({ names: { ...settings.names, skills: next } })
  }
  const resetClass = () => {
    const ids = new Set(classSkills(cls).map((s) => String(s.id)))
    const next = Object.fromEntries(Object.entries(skillNames).filter(([id]) => !ids.has(id)))
    void update({ names: { ...settings.names, skills: next } })
  }
  const setItem = (id: string, value: string) => {
    const next = { ...itemNames }
    if (value.trim()) next[id] = value.trim()
    else delete next[id]
    void update({ names: { ...settings.names, items: next } })
  }

  const needle = q.trim().toLowerCase()
  const groups = useMemo(() => {
    const all = classSkills(cls).filter((s) => !needle || `${s.en} ${s.ru ?? ''} ${skillNames[s.id] ?? ''}`.toLowerCase().includes(needle))
    return (['active', 'passive', 'stigma'] as SkillType[]).map((t) => ({ type: t, skills: all.filter((s) => s.type === t) })).filter((g) => g.skills.length)
  }, [cls, needle, skillNames])
  const renamed = countFor(cls)

  return (
    <div className="space-y-5">
      <Card
        title="Как называть"
        hint="Английские названия — официальные из клиента игры, русские — из русского клиента (база Questlog). Любое можно заменить своим ниже."
      >
        <Segmented<NameMode>
          value={settings.nameMode}
          onChange={(nameMode) => void update({ nameMode })}
          items={[
            { id: 'both', label: 'Русские + английские' },
            { id: 'ru', label: 'Только русские' },
            { id: 'en', label: 'Только английские' }
          ]}
        />
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          Пример: {settings.nameMode === 'en' ? 'Judgment' : 'Суд'}
          {settings.nameMode === 'both' && <span className="ml-1 text-[11px]">(Judgment)</span>} — английский вариант удобен, когда сверяетесь с англоязычным
          гайдом.
        </p>
      </Card>

      <Card
        title="Свои названия умений"
        hint="Если в вашем клиенте умение называется иначе или вам привычнее своё — впишите его. Пустое поле — официальное название. Названия хранятся для каждого умения отдельно, поэтому можно настроить любой класс, не только свой."
        actions={
          renamed > 0 ? (
            <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={resetClass}>
              Сбросить у класса ({renamed})
            </Button>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {CLASSES.map((c) => {
            const n = countFor(c.key)
            const mine = char?.cls === c.key
            return (
              <button
                key={c.key}
                onClick={() => setCls(c.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors',
                  cls === c.key ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
                )}
              >
                <ClassIcon cls={c.key} size={18} />
                {c.ru}
                {mine && <span className="text-[10.5px] text-ink-3">ваш</span>}
                {n > 0 && <span className="tnum rounded-full bg-surface-3 px-1.5 text-[10.5px] text-ink-2">{n}</span>}
              </button>
            )
          })}
        </div>

        <div className="relative mt-4 max-w-sm">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Найти умение…"
            className="h-9 w-full rounded-lg border border-line-strong bg-surface pr-3 pl-9 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent"
          />
        </div>

        <div className="mt-4 space-y-5">
          {groups.map((g) => (
            <div key={g.type}>
              <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{TYPE_RU[g.type]}</div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 lg:grid-cols-2 2xl:grid-cols-3">
                {g.skills.map((s) => (
                  <SkillRow key={`${cls}-${s.id}`} s={s} custom={skillNames[s.id]} onSave={(v) => setSkill(s.id, v)} />
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <p className="text-[13px] text-ink-3">Ничего не нашлось.</p>}
        </div>
      </Card>

      <Card
        title="Свои названия вещей"
        hint="Переименовать вещь можно на странице «Шмот» — нажмите на её название. Здесь — список всех переименованных вещей: поправить или вернуть название из игры."
      >
        {Object.keys(itemNames).length === 0 ? (
          <p className="text-[13px] text-ink-3">Своих названий вещей пока нет. Нажмите на название вещи на странице «Шмот», чтобы дать своё.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 lg:grid-cols-2">
            {Object.entries(itemNames).map(([id, name]) => {
              const art = itemArt(Number(id))
              return (
                <div key={id} className="flex items-center gap-2.5">
                  <ItemIcon itemId={Number(id)} slot={0} size={30} />
                  <span className="w-44 shrink-0 truncate text-xs text-ink-3" title={art?.ru ?? `ID ${id}`}>
                    {art?.ru ?? `ID ${id}`}
                  </span>
                  <input key={name} defaultValue={name} placeholder={art?.ru ?? ''} onBlur={(e) => setItem(id, e.target.value)} className={input} />
                  <button onClick={() => setItem(id, '')} className="p-1 text-ink-3 hover:text-critical" aria-label="Вернуть название из игры">
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function SkillRow({ s, custom, onSave }: { s: SkillDef; custom?: string; onSave: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <SkillIcon id={s.id} size={26} />
      <span className="w-36 shrink-0 truncate text-xs text-ink-3" title={s.en}>
        {s.en}
      </span>
      <input
        key={custom ?? ''}
        defaultValue={custom ?? ''}
        placeholder={s.ru ?? s.en}
        onBlur={(e) => e.target.value.trim() !== (custom ?? '') && onSave(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className={cn(input, custom && 'border-accent/50')}
      />
      <button
        onClick={() => onSave('')}
        disabled={!custom}
        className="p-1 text-ink-3 hover:text-critical disabled:invisible"
        aria-label="Вернуть официальное название"
      >
        <X size={14} />
      </button>
    </div>
  )
}
