// Редактор гайда → «Связка»: шаги связки (ячейки панели), ручные умения, начало боя и макрос «одна кнопка».
// Всё по ID умений; в интерфейсе — названия и иконки.

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { analyzeInputMacro } from '@shared/analysis/inputMacro'
import { classSkills } from '@shared/gamedata/skills'
import type { Guide, GuideCombat, GuideMacro, GuideManualSkill, InputEvent } from '@shared/guide/types'
import { SkillIcon } from '@/components/icons'
import { MacroTimeline } from '@/components/MacroTimeline'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/format'
import { useNamer } from '@/lib/report'

const input = 'w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent'
const small = 'rounded-lg border border-line-strong bg-surface-2 px-2 py-1.5 text-[13px] outline-none focus:border-accent'

function move<T>(list: T[], i: number, d: number): T[] {
  const next = [...list]
  const [x] = next.splice(i, 1)
  next.splice(i + d, 0, x)
  return next
}

const num = (v: string): number | undefined => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Math.max(0, Math.round(Number(v))))

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs text-ink-2">{children}</span>
}

/** Кнопки «вверх / вниз / удалить» у строки списка. */
function RowTools({ i, n, onMove, onDelete }: { i: number; n: number; onMove: (d: number) => void; onDelete: () => void }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button disabled={i === 0} onClick={() => onMove(-1)} className="p-0.5 text-ink-3 hover:text-ink disabled:opacity-30" aria-label="Выше">
        <ArrowUp size={13} />
      </button>
      <button disabled={i === n - 1} onClick={() => onMove(1)} className="p-0.5 text-ink-3 hover:text-ink disabled:opacity-30" aria-label="Ниже">
        <ArrowDown size={13} />
      </button>
      <button onClick={onDelete} className="p-0.5 text-ink-3 hover:text-critical" aria-label="Удалить">
        <X size={13} />
      </button>
    </span>
  )
}

/** Выпадающий список «Добавить умение…». */
function AddSkillChips({ pool, onAdd }: { pool: number[]; onAdd: (id: number) => void }) {
  const namer = useNamer()
  if (!pool.length) return null
  return (
    <select
      className="mt-2 w-full max-w-72 rounded-lg border border-dashed border-line-strong bg-surface px-2 py-1.5 text-xs text-ink-2 outline-none hover:border-accent focus:border-accent"
      value=""
      onChange={(e) => e.target.value && onAdd(Number(e.target.value))}
    >
      <option value="">+ Добавить умение…</option>
      {pool.map((id) => (
        <option key={id} value={id}>
          {namer.skill(id).main}
        </option>
      ))}
    </select>
  )
}

export function CombatSection({ g, set }: { g: Guide; set: (patch: Partial<Guide>) => void }) {
  const namer = useNamer()
  const c: GuideCombat = g.combat ?? {}
  const setCombat = (patch: Partial<GuideCombat>) => set({ combat: { ...c, ...patch } })
  // В ячейки и вручную — активные умения и стигмы (пассивки не нажимаются).
  const pressable = classSkills(g.cls)
    .filter((s) => s.type !== 'passive')
    .map((s) => s.id)

  const macros = c.macros ?? []
  const writeMacros = (next: GuideMacro[]) => setCombat({ macros: next.length ? next : undefined })
  const patchMacro = (i: number, p: Partial<GuideMacro>) => writeMacros(macros.map((m, j) => (j === i ? { ...m, ...p } : m)))

  const manual = c.manual ?? []
  const writeManual = (next: GuideManualSkill[]) => setCombat({ manual: next.length ? next : undefined })
  const patchManual = (i: number, p: Partial<GuideManualSkill>) => writeManual(manual.map((m, j) => (j === i ? { ...m, ...p } : m)))

  const opener = c.opener ?? []
  const writeOpener = (next: { skill: number; note?: string }[]) => setCombat({ opener: next.length ? next : undefined })

  const ob = c.oneButton
  const events = ob?.events ?? []
  const writeEvents = (next: InputEvent[]) => setCombat({ oneButton: next.length ? { events: next, repeatMs: ob?.repeatMs ?? 10, note: ob?.note } : undefined })
  const analysis = ob ? analyzeInputMacro(ob.events, ob.repeatMs, c.macroKey) : null

  return (
    <div className="space-y-5">
      <Card
        title="Связка"
        hint="Связка — макрос игры (окно «Умения» → «Связки»): пока клавиша зажата, идёт по шагам сверху вниз и по кругу. Каждый шаг — ячейка панели: до 4 умений, игра применяет первое готовое, ряд 0 — главный. Ячейку с всегда готовым умением ставьте последней."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_140px_minmax(0,1fr)]">
          <label className="block">
            <Label>Клавиша связки</Label>
            <input className={input} value={c.macroKey ?? ''} placeholder="ПКМ" onChange={(e) => setCombat({ macroKey: e.target.value || undefined })} />
          </label>
          <label className="block">
            <Label>Задержка, мс</Label>
            <input
              className={input}
              inputMode="numeric"
              value={c.delayMs ?? ''}
              placeholder="10"
              onChange={(e) => setCombat({ delayMs: num(e.target.value) })}
            />
          </label>
          <label className="block">
            <Label>Пояснение к связке</Label>
            <input className={input} value={c.delayNote ?? ''} onChange={(e) => setCombat({ delayNote: e.target.value || undefined })} />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {macros.map((m, i) => {
            const free = pressable.filter((id) => !m.skills.includes(id))
            return (
              <div key={m.id} className="rounded-xl border border-line-strong bg-surface-2/50 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-2">Шаг {i + 1}</span>
                  <input className={cn(small, 'min-w-0 flex-1')} value={m.name} onChange={(e) => patchMacro(i, { name: e.target.value })} />
                  <RowTools
                    i={i}
                    n={macros.length}
                    onMove={(d) => writeMacros(move(macros, i, d))}
                    onDelete={() => writeMacros(macros.filter((_, j) => j !== i))}
                  />
                </div>
                {/* Ряды снизу вверх — как в игре: ряд 0 внизу, он главный. */}
                <div className="mt-3 flex flex-col-reverse gap-1">
                  {m.skills.map((id, r) => (
                    <div key={id} className="flex items-center gap-2 rounded-lg bg-surface px-2 py-1">
                      <span className={cn('tnum w-11 shrink-0 text-[10.5px]', r === 0 ? 'font-semibold text-accent' : 'text-ink-3')}>ряд {r}</span>
                      <SkillIcon id={id} size={24} />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{namer.skill(id).main}</span>
                      {/* «Ниже» в игре — меньший ряд, то есть главнее. */}
                      <RowTools
                        i={m.skills.length - 1 - r}
                        n={m.skills.length}
                        onMove={(d) => patchMacro(i, { skills: move(m.skills, r, -d) })}
                        onDelete={() => patchMacro(i, { skills: m.skills.filter((x) => x !== id) })}
                      />
                    </div>
                  ))}
                </div>
                {m.skills.length < 4 ? (
                  <AddSkillChips pool={free} onAdd={(id) => patchMacro(i, { skills: [...m.skills, id] })} />
                ) : (
                  <p className="mt-2 text-[11px] text-ink-3">В ячейке не больше 4 умений.</p>
                )}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_88px_88px]">
                  <label className="block">
                    <Label>Подходит по уровню умения</Label>
                    <select
                      className={cn(small, 'w-full')}
                      value={m.when?.skill ?? ''}
                      onChange={(e) => patchMacro(i, { when: e.target.value ? { ...m.when, skill: Number(e.target.value) } : undefined })}
                    >
                      <option value="">всегда</option>
                      {pressable.map((id) => (
                        <option key={id} value={id}>
                          {namer.skill(id).main}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <Label>с ур.</Label>
                    <input
                      className={cn(small, 'w-full')}
                      disabled={!m.when}
                      inputMode="numeric"
                      value={m.when?.minLevel ?? ''}
                      onChange={(e) => m.when && patchMacro(i, { when: { ...m.when, minLevel: num(e.target.value) } })}
                    />
                  </label>
                  <label className="block">
                    <Label>до ур.</Label>
                    <input
                      className={cn(small, 'w-full')}
                      disabled={!m.when}
                      inputMode="numeric"
                      value={m.when?.maxLevel ?? ''}
                      onChange={(e) => m.when && patchMacro(i, { when: { ...m.when, maxLevel: num(e.target.value) } })}
                    />
                  </label>
                </div>
                <textarea
                  className={cn(input, 'mt-2 min-h-14')}
                  placeholder="Зачем такой порядок"
                  value={m.note ?? ''}
                  onChange={(e) => patchMacro(i, { note: e.target.value || undefined })}
                />
              </div>
            )
          })}
        </div>
        <Button
          className="mt-3"
          icon={<Plus size={14} />}
          onClick={() => writeMacros([...macros, { id: `cell-${Date.now()}`, name: `Ячейка ${macros.length + 1}`, skills: [] }])}
        >
          Добавить шаг
        </Button>
      </Card>

      <Card title="Вручную" hint="Умения на отдельных клавишах — когда их жать. «Запасная» — стигма на замену: если не надета, приложение не ругается.">
        <div className="space-y-2">
          {manual.map((m, i) => (
            <div key={`${m.skill}-${i}`} className="flex flex-wrap items-start gap-2 rounded-xl border border-line bg-surface-2/50 p-2.5">
              <SkillIcon id={m.skill} size={32} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium">{namer.skill(m.skill).main}</span>
                  <input
                    className={cn(small, 'w-20')}
                    placeholder="клавиша"
                    value={m.key ?? ''}
                    onChange={(e) => patchManual(i, { key: e.target.value || undefined })}
                  />
                  <label className="flex items-center gap-1.5 text-xs text-ink-2">
                    <input
                      type="checkbox"
                      checked={!!m.optional}
                      onChange={(e) => patchManual(i, { optional: e.target.checked || undefined })}
                      className="accent-[var(--color-accent)]"
                    />
                    запасная
                  </label>
                  {m.byStat && <span className="text-[11px] text-ink-3">+ подсказка по стату (из файла гайда)</span>}
                </div>
                <input className={input} placeholder="Когда жать" value={m.when} onChange={(e) => patchManual(i, { when: e.target.value })} />
              </div>
              <RowTools
                i={i}
                n={manual.length}
                onMove={(d) => writeManual(move(manual, i, d))}
                onDelete={() => writeManual(manual.filter((_, j) => j !== i))}
              />
            </div>
          ))}
        </div>
        <AddSkillChips pool={pressable.filter((id) => !manual.some((m) => m.skill === id))} onAdd={(id) => writeManual([...manual, { skill: id, when: '' }])} />
      </Card>

      <Card title="Начало боя" hint="Порядок первых умений боя. Одно умение может повторяться (например, Суд после каждого открытия окна).">
        <ol className="space-y-1.5">
          {opener.map((o, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2 py-1">
              <span className="tnum w-5 text-[11px] text-ink-3">{i + 1}.</span>
              <SkillIcon id={o.skill} size={22} />
              <span className="w-40 shrink-0 truncate text-[13px]">{namer.skill(o.skill).main}</span>
              <input
                className={cn(small, 'min-w-0 flex-1')}
                placeholder="пояснение (необязательно)"
                value={o.note ?? ''}
                onChange={(e) => writeOpener(opener.map((x, j) => (j === i ? { ...x, note: e.target.value || undefined } : x)))}
              />
              <RowTools
                i={i}
                n={opener.length}
                onMove={(d) => writeOpener(move(opener, i, d))}
                onDelete={() => writeOpener(opener.filter((_, j) => j !== i))}
              />
            </li>
          ))}
        </ol>
        <AddSkillChips pool={pressable} onAdd={(id) => writeOpener([...opener, { skill: id }])} />
      </Card>

      <Card
        title="Одна кнопка"
        hint="Макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub): события по порядку — клавиша нажата или отпущена, затем пауза; потом автоповтор. Ниже — схема и предупреждения, как на странице «Ротация»."
      >
        <div className="space-y-1.5">
          {events.map((e, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="tnum w-5 text-[11px] text-ink-3">{i + 1}.</span>
              <input
                className={cn(small, 'w-24')}
                value={e.key}
                placeholder="ПКМ"
                onChange={(ev) => writeEvents(events.map((x, j) => (j === i ? { ...x, key: ev.target.value } : x)))}
              />
              <select
                className={small}
                value={e.down ? 'down' : 'up'}
                onChange={(ev) => writeEvents(events.map((x, j) => (j === i ? { ...x, down: ev.target.value === 'down' } : x)))}
              >
                <option value="down">нажать ↓</option>
                <option value="up">отпустить ↑</option>
              </select>
              <span className="text-xs text-ink-3">затем</span>
              <input
                className={cn(small, 'w-20')}
                inputMode="numeric"
                value={e.waitMs}
                onChange={(ev) => writeEvents(events.map((x, j) => (j === i ? { ...x, waitMs: num(ev.target.value) ?? 0 } : x)))}
              />
              <span className="text-xs text-ink-3">мс</span>
              <RowTools
                i={i}
                n={events.length}
                onMove={(d) => writeEvents(move(events, i, d))}
                onDelete={() => writeEvents(events.filter((_, j) => j !== i))}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" icon={<Plus size={13} />} onClick={() => writeEvents([...events, { key: c.macroKey ?? 'ПКМ', down: true, waitMs: 10 }])}>
            Добавить событие
          </Button>
          {ob && (
            <>
              <span className="ml-3 text-xs text-ink-3">автоповтор</span>
              <input
                className={cn(small, 'w-20')}
                inputMode="numeric"
                value={ob.repeatMs}
                onChange={(e) => setCombat({ oneButton: { ...ob, repeatMs: num(e.target.value) ?? 0 } })}
              />
              <span className="text-xs text-ink-3">мс</span>
              <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => setCombat({ oneButton: undefined })}>
                Убрать макрос
              </Button>
            </>
          )}
        </div>
        {ob && ob.events.length > 0 && (
          <>
            <MacroTimeline events={ob.events} repeatMs={ob.repeatMs} macroKey={c.macroKey} purpose={(k) => (k === c.macroKey ? 'связка' : '')} />
            {analysis && analysis.warnings.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {analysis.warnings.map((w) => (
                  <li key={w.key + w.kind} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                    <StatusBadge tone={w.kind === 'macro-release' ? 'info' : 'warn'} size={15} className="mt-0.5" />
                    {w.text}
                  </li>
                ))}
              </ul>
            )}
            <textarea
              className={cn(input, 'mt-3 min-h-14')}
              placeholder="Пояснение к макросу"
              value={ob.note ?? ''}
              onChange={(e) => setCombat({ oneButton: { ...ob, note: e.target.value || undefined } })}
            />
          </>
        )}
      </Card>
    </div>
  )
}
