import { useState } from 'react'
import { ListChecks, Plus, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Sparks } from '@/components/fx'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/misc'
import { Pill, toneOfShare } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { Tooltip } from '@/components/ui/InfoTip'
import { useCharacterContext } from '@/lib/report'
import { useApp, useCharacterPrefs } from '@/lib/store'

export function ChecklistPage() {
  const ctx = useCharacterContext()!
  const { char, guide, report, namer } = ctx
  const prefs = useCharacterPrefs(char.key)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const [text, setText] = useState('')

  // Вехи считаются сами из разбора — отмечать их не нужно.
  const milestones: { id: string; text: string; done: boolean; unsure?: boolean }[] = [
    ...report.skills
      .filter((s) => s.role === 'core' && s.targetLevel)
      .map((s) => ({ id: `lvl-${s.skill}`, text: `${namer.skill(s.skill).main}: ур. ${s.targetLevel}`, done: s.levelGap === 0 })),
    ...report.skills
      .filter((s) => s.role === 'core' && s.specs && s.specs.wanted.length)
      .map((s) => ({
        id: `spec-${s.skill}`,
        text: `${namer.skill(s.skill).main}: специализации ${s.specs!.wanted.join(', ')}`,
        done: s.specs!.ok,
        unsure: report.specsUncertain && s.specsSource === 'overlay'
      })),
    { id: 'stigmas', text: 'Стигмы гайда надеты', done: report.stigmas.missing.length === 0 },
    ...report.daevanion.goals.map((g) => ({
      id: `goal-${g.goal.id}`,
      text: `Даэванион: ${g.goal.name}`,
      done: g.required.length > 0 && g.done === g.required.length
    })),
    ...report.arcana.cards.map((c) => ({ id: `arc-${c.slot}`, text: `${c.info?.ru ?? 'Аркана'}: нужный набор и +${c.maxEnchant}`, done: c.done })),
    { id: 'gear', text: 'На шмоте нет бесполезных строк', done: report.gear.every((g) => g.replace.length === 0) }
  ]
  const doneCount = milestones.filter((m) => m.done).length

  const tasks = prefs.tasks ?? []
  const checks = prefs.checklist ?? {}
  const guideItems = guide?.checklist ?? []

  return (
    <>
      <PageHeader
        icon={<ListChecks size={22} />}
        title="Чек-лист"
        subtitle="Вехи гайда отмечаются сами по данным персонажа. Разовые дела гайда (макросы, бинды) и свои задачи отмечайте вручную."
        actions={<GuideSwitcher char={char} />}
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Вехи гайда" actions={<Pill tone={toneOfShare(doneCount, milestones.length)}>{`${doneCount} из ${milestones.length}`}</Pill>}>
          {!guide ? (
            <p className="text-[13px] text-ink-3">Выберите гайд — и здесь появятся его вехи.</p>
          ) : (
            <ul className="space-y-1.5">
              {milestones.map((m) => (
                <li key={m.id}>
                  <Tooltip
                    block
                    content={
                      m.done
                        ? 'Сделано — проверено по данным персонажа.'
                        : m.unsure
                          ? 'Оверлей не знает выбранных специализаций — отметьте их на странице «Умения», и пункт проверится сам.'
                          : 'Ещё не сделано. Отмечается само, когда данные персонажа совпадут с гайдом.'
                    }
                  >
                    <div className="flex w-full items-center gap-2.5 text-[13px]">
                      <StatusBadge tone={m.done ? 'ok' : m.unsure ? 'warn' : 'bad'} size={16} />
                      <span className={cn(m.done ? 'text-good' : m.unsure ? 'text-warning' : 'text-critical')}>{m.text}</span>
                      {m.unsure && !m.done && <Pill tone="warning">проверьте в игре</Pill>}
                    </div>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          {guideItems.length > 0 && (
            <Card title="Разовые дела гайда">
              <ul className="space-y-1">
                {guideItems.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-[13px] hover:bg-surface-2">
                      <SparkCheckbox checked={!!checks[c.id]} onChange={(v) => void setPrefs(char.key, { checklist: { ...checks, [c.id]: v } })} />
                      <span className={checks[c.id] ? 'text-ink-3 line-through' : 'text-ink-2'}>{c.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Мои задачи">
            <form
              className="mb-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!text.trim()) return
                void setPrefs(char.key, { tasks: [...tasks, { id: `t-${Date.now()}`, text: text.trim() }] })
                setText('')
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Например: выбить Компас с Градом ударов"
                className="h-9 flex-1 rounded-lg border border-line-strong bg-surface-2 px-3 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent"
              />
              <Button type="submit" icon={<Plus size={14} />}>
                Добавить
              </Button>
            </form>
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li key={t.id} className="group flex items-center gap-2.5 rounded-lg px-1 py-1 text-[13px] hover:bg-surface-2">
                  <SparkCheckbox
                    checked={!!t.done}
                    onChange={(v) => void setPrefs(char.key, { tasks: tasks.map((x) => (x.id === t.id ? { ...x, done: v } : x)) })}
                  />
                  <span className={cn('flex-1', t.done ? 'text-ink-3 line-through' : 'text-ink-2')}>{t.text}</span>
                  <button
                    onClick={() => void setPrefs(char.key, { tasks: tasks.filter((x) => x.id !== t.id) })}
                    className="text-ink-3 opacity-0 group-hover:opacity-100 hover:text-critical"
                    aria-label="Удалить задачу"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
              {tasks.length === 0 && <li className="text-xs text-ink-3">Задач пока нет.</li>}
            </ul>
          </Card>

          <Card title="Заметки">
            <textarea
              defaultValue={prefs.notes ?? ''}
              onBlur={(e) => void setPrefs(char.key, { notes: e.target.value })}
              placeholder="Что пробовал, что сработало, куда копить кристаллы…"
              className="min-h-32 w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent"
            />
          </Card>
        </div>
      </div>
    </>
  )
}

/** Галочка, из которой при отметке разлетаются искры (только при «Полных» анимациях). */
function SparkCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const [fire, setFire] = useState(0)
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          if (e.target.checked) setFire((n) => n + 1)
          onChange(e.target.checked)
        }}
        className="accent-[var(--color-accent)]"
      />
      <Sparks fire={fire} />
    </span>
  )
}
