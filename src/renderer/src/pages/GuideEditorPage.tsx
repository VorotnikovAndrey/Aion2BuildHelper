// Редактор гайда. Правит копию в памяти и сохраняет по кнопке.
// Всё задаётся через игровые ID, но в интерфейсе — названиями.

import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowDown, ArrowUp, BookOpen, Plus, Save, Trash2, X } from 'lucide-react'
import { arcanaPool } from '@shared/gamedata/arcana'
import { CLASSES } from '@shared/gamedata/classes'
import { classBoards } from '@shared/gamedata/daevanion'
import { classSkills, skillSpecs } from '@shared/gamedata/skills'
import { statByKey, STAT_GROUPS } from '@shared/gamedata/stats'
import { MODE_LABEL, ROLE_LABEL, type DaevanionGoal, type Guide, type GuideMode, type SkillRole, type SkillTarget, type StatWeight } from '@shared/guide/types'
import { Name } from '@/components/game'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, PageHeader, Segmented, Tabs } from '@/components/ui/misc'
import { cn } from '@/lib/format'
import { useNamer } from '@/lib/report'
import { useApp, useGuides } from '@/lib/store'
import { CombatSection } from './guide-editor/CombatSection'
import { t } from '@shared/i18n'
import { term } from '@shared/names'

type Section = 'main' | 'skills' | 'stats' | 'gear' | 'arcana' | 'daevanion' | 'combat' | 'texts'

export function GuideEditorPage() {
  const { id } = useParams()
  const original = useGuides().find((g) => g.id === id)
  const saveGuide = useApp((s) => s.saveGuide)
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Guide | null>(original ? structuredClone(original) : null)
  const [section, setSection] = useState<Section>('main')
  const [saved, setSaved] = useState(false)

  if (!draft || !original) return <EmptyState title={t('Гайд не найден')}>{t('Возможно, он был удалён.')}</EmptyState>
  if (original.builtin)
    return <EmptyState title={t('Встроенный гайд нельзя менять')}>{t('Скопируйте его на странице «Гайды» — копию можно править как угодно.')}</EmptyState>

  const set = (patch: Partial<Guide>) => {
    setDraft({ ...draft, ...patch })
    setSaved(false)
  }
  const save = async () => {
    await saveGuide(draft)
    setSaved(true)
  }

  return (
    <>
      <PageHeader
        icon={<BookOpen size={22} />}
        title={draft.name || t('Без названия')}
        subtitle={t('Изменения сохраняются по кнопке «Сохранить». Веса статов: 5 — главное, 0 — бесполезно (такие строки на шмоте будут помечены «менять»).')}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/guides')}>
              {t('К списку')}
            </Button>
            <Button variant="primary" icon={<Save size={14} />} onClick={() => void save()}>
              {saved ? t('Сохранено') : t('Сохранить')}
            </Button>
          </>
        }
      />
      <div className="mb-5">
        <Tabs
          value={section}
          onChange={setSection}
          items={[
            { id: 'main', label: t('Основное') },
            { id: 'skills', label: t('Умения') },
            { id: 'stats', label: t('Статы') },
            { id: 'gear', label: t('Умения на шмоте') },
            { id: 'arcana', label: t('Арканы') },
            { id: 'daevanion', label: t('Даэванион') },
            { id: 'combat', label: t('Связка') },
            { id: 'texts', label: t('Ротация и советы') }
          ]}
        />
      </div>
      {section === 'main' && <MainSection g={draft} set={set} />}
      {section === 'skills' && <SkillsSection g={draft} set={set} />}
      {section === 'stats' && <StatsSection g={draft} set={set} />}
      {section === 'gear' && <GearSkillsSection g={draft} set={set} />}
      {section === 'arcana' && <ArcanaSection g={draft} set={set} />}
      {section === 'daevanion' && <DaevanionSection g={draft} set={set} />}
      {section === 'combat' && <CombatSection g={draft} set={set} />}
      {section === 'texts' && <TextsSection g={draft} set={set} />}
    </>
  )
}

type SectionProps = { g: Guide; set: (patch: Partial<Guide>) => void }

const input = 'w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent'

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-3">{hint}</span>}
    </label>
  )
}

function MainSection({ g, set }: SectionProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label={t('Название')}>
          <input className={input} value={g.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label={t('Класс')} hint={t('Смена класса не переносит умения — их ID у каждого класса свои.')}>
          <select className={input} value={g.cls} onChange={(e) => set({ cls: e.target.value as Guide['cls'] })}>
            {CLASSES.map((c) => (
              <option key={c.key} value={c.key}>
                {term(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('Для чего')}>
          <Segmented<GuideMode>
            value={g.mode}
            onChange={(mode) => set({ mode })}
            items={(Object.keys(MODE_LABEL) as GuideMode[]).map((m) => ({ id: m, label: MODE_LABEL[m] }))}
          />
        </Field>
        <div />
        <div className="lg:col-span-2">
          <Field label={t('Описание')}>
            <textarea className={cn(input, 'min-h-24')} value={g.description ?? ''} onChange={(e) => set({ description: e.target.value || undefined })} />
          </Field>
        </div>
        <Field label={t('Источник: название')}>
          <input className={input} value={g.source?.title ?? ''} onChange={(e) => set({ source: { ...g.source, title: e.target.value || undefined } })} />
        </Field>
        <Field label={t('Источник: ссылка')}>
          <input
            className={input}
            value={g.source?.url ?? ''}
            placeholder="https://…"
            onChange={(e) => set({ source: { ...g.source, url: e.target.value || undefined } })}
          />
        </Field>
        <Field label={t('Автор')}>
          <input className={input} value={g.source?.author ?? ''} onChange={(e) => set({ source: { ...g.source, author: e.target.value || undefined } })} />
        </Field>
        <Field label={t('Дата гайда')}>
          <input
            className={input}
            value={g.source?.date ?? ''}
            placeholder="2026-11-01"
            onChange={(e) => set({ source: { ...g.source, date: e.target.value || undefined } })}
          />
        </Field>
      </div>
    </Card>
  )
}

function SkillsSection({ g, set }: SectionProps) {
  const namer = useNamer()
  const all = classSkills(g.cls)
  const target = (id: number) => g.skills.find((s) => s.skill === id)
  const update = (id: number, patch: Partial<SkillTarget> | null) => {
    const exists = target(id)
    if (patch === null) return set({ skills: g.skills.filter((s) => s.skill !== id) })
    if (exists) set({ skills: g.skills.map((s) => (s.skill === id ? { ...s, ...patch } : s)) })
    else {
      const type = all.find((s) => s.id === id)?.type
      set({ skills: [...g.skills, { skill: id, role: type === 'passive' ? 'passive' : type === 'stigma' ? 'stigma' : 'support', ...patch }] })
    }
  }
  const toggleSpec = (id: number, n: number, field: 'specs' | 'earlySpecs') => {
    const list = target(id)?.[field] ?? []
    const next = list.includes(n) ? list.filter((x) => x !== n) : [...list, n]
    update(id, { [field]: next.length ? next : undefined })
  }

  return (
    <Card hint={t('Отметьте умения, которые есть в гайде. Порядок нажатия на специализации = их важность (первые надеваются первыми).')}>
      <div className="-mx-2">
        {all.map((s) => {
          const tg = target(s.id)
          const specs = skillSpecs(s.id)
          return (
            <div key={s.id} className={cn('rounded-xl px-2 py-2.5', tg ? 'bg-surface-2' : 'opacity-70 hover:opacity-100')}>
              <div className="flex flex-wrap items-center gap-3">
                <input type="checkbox" checked={!!tg} onChange={(e) => update(s.id, e.target.checked ? {} : null)} className="accent-[var(--color-accent)]" />
                <Name label={namer.skill(s.id)} className="w-52 text-[13px]" />
                <span className="w-20 text-[11px] text-ink-3">{s.type === 'active' ? t('активное') : s.type === 'passive' ? t('пассивное') : t('стигма')}</span>
                {tg && (
                  <>
                    <select
                      className="rounded-md border border-line-strong bg-surface-3 px-2 py-1 text-xs"
                      value={tg.role}
                      onChange={(e) => update(s.id, { role: e.target.value as SkillRole })}
                    >
                      {(Object.keys(ROLE_LABEL) as SkillRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-ink-3">
                      {t('цель ур.')}
                      <input
                        type="number"
                        min={1}
                        max={40}
                        className="w-14 rounded-md border border-line-strong bg-surface-3 px-2 py-1 text-xs text-ink"
                        value={tg.level ?? ''}
                        onChange={(e) => update(s.id, { level: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </label>
                    {s.type === 'stigma' && (
                      <label className="flex items-center gap-1.5 text-xs text-ink-3">
                        <input
                          type="checkbox"
                          checked={tg.equip ?? false}
                          onChange={(e) => update(s.id, { equip: e.target.checked })}
                          className="accent-[var(--color-accent)]"
                        />
                        {t('держать надетой')}
                      </label>
                    )}
                  </>
                )}
              </div>
              {tg && specs.length > 0 && (
                <div className="mt-2 ml-7 space-y-1.5">
                  {(['specs', 'earlySpecs'] as const).map((field) => (
                    <div key={field} className="flex flex-wrap items-center gap-1.5">
                      <span className="w-24 text-[11px] text-ink-3">{field === 'specs' ? t('специализации') : t('пока нет главных')}</span>
                      {specs.map((sp) => {
                        const pos = (tg[field] ?? []).indexOf(sp.n)
                        return (
                          <button
                            key={sp.n}
                            onClick={() => toggleSpec(s.id, sp.n, field)}
                            title={`${namer.spec(s.id, sp.n).main}${sp.level ? t(' (с ур. {level})', { level: sp.level }) : ''}${sp.ruByAssistant ? t(' · перевод помощника') : ''}`}
                            className={cn(
                              'flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]',
                              pos >= 0 ? 'border-accent/60 bg-accent-soft text-accent-2' : 'border-line bg-surface-3 text-ink-3 hover:text-ink-2'
                            )}
                          >
                            <b>{sp.n}</b>
                            <span className="max-w-40 truncate">{namer.spec(s.id, sp.n).main}</span>
                            {pos >= 0 && <span className="text-[10px] opacity-70">#{pos + 1}</span>}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              {tg && (
                <input
                  className="mt-2 ml-7 w-[calc(100%-1.75rem)] rounded-md border border-line bg-surface-3 px-2 py-1 text-xs outline-none placeholder:text-ink-3 focus:border-accent"
                  placeholder={t('Заметка: зачем это умение, как применять')}
                  value={tg.note ?? ''}
                  onChange={(e) => update(s.id, { note: e.target.value || undefined })}
                />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function WeightPicker({ value, onChange }: { value: number; onChange: (w: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4, 5].map((w) => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={cn(
            'tnum h-6 w-6 rounded text-[11px] transition-colors',
            w === value ? (w === 0 ? 'bg-critical-soft text-critical' : 'bg-accent text-on-accent') : 'bg-surface-3 text-ink-3 hover:text-ink'
          )}
        >
          {w}
        </button>
      ))}
    </div>
  )
}

function StatsSection({ g, set }: SectionProps) {
  const namer = useNamer()
  const [list, setList] = useState<'stats' | 'manastones' | 'genus'>('stats')
  const current: StatWeight[] = list === 'stats' ? g.stats : list === 'manastones' ? (g.manastones ?? []) : (g.genus.stats ?? [])
  const write = (next: StatWeight[]) => {
    if (list === 'stats') set({ stats: next })
    else if (list === 'manastones') set({ manastones: next.length ? next : undefined })
    else set({ genus: { ...g.genus, stats: next.length ? next : undefined } })
  }
  const weight = (id: number) => current.find((w) => w.stat === id)?.weight ?? 0
  const setWeight = (id: number, w: number) => {
    const rest = current.filter((x) => x.stat !== id)
    write(w > 0 ? [...rest, { stat: id, weight: w }].sort((a, b) => b.weight - a.weight) : rest)
  }
  const groups = useMemo(() => STAT_GROUPS.map((gr) => ({ ...gr, stats: gr.keys.map((k) => statByKey(k)).filter((d): d is NonNullable<typeof d> => !!d) })), [])

  return (
    <Card
      actions={
        <Segmented
          value={list}
          onChange={setList}
          items={[
            { id: 'stats', label: t('Общие (шмот)') },
            { id: 'manastones', label: t('Манакамни') },
            { id: 'genus', label: t('Знание о видах') }
          ]}
        />
      }
      hint={t('Общие веса используются для строк на шмоте; для манакамней и рода — если там пусто.')}
    >
      {list !== 'stats' && current.length === 0 && (
        <p className="mb-4 rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-3">
          {t('Сейчас здесь пусто — используются общие веса. Поставьте хотя бы один вес, чтобы задать свой список.')}
        </p>
      )}
      <div className="columns-1 gap-6 xl:columns-2">
        {groups.map((gr) => (
          <div key={gr.id} className="mb-5 break-inside-avoid">
            <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{gr.ru}</div>
            {gr.stats.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-surface-2">
                <Name label={namer.stat(d.id)} className="min-w-0 text-[13px]" />
                <WeightPicker value={weight(d.id)} onChange={(w) => setWeight(d.id, w)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GearSkillsSection({ g, set }: SectionProps) {
  const namer = useNamer()
  const all = classSkills(g.cls).filter((s) => s.type !== 'stigma')
  const weight = (id: number) => g.gear.skills.find((s) => s.skill === id)?.weight ?? 0
  const setWeight = (id: number, w: number) => {
    const rest = g.gear.skills.filter((s) => s.skill !== id)
    set({ gear: { ...g.gear, skills: w > 0 ? [...rest, { skill: id, weight: w }].sort((a, b) => b.weight - a.weight) : rest } })
  }
  return (
    <Card hint={t('Какие умения хорошо ловить строкой на шмоте. Активные выпадают на оружии, гарде и кольцах, пассивные — на броне и украшениях.')}>
      <div className="grid grid-cols-1 gap-x-8 xl:grid-cols-2">
        {all.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
            <Name label={namer.skill(s.id)} className="min-w-0 text-[13px]" />
            <WeightPicker value={weight(s.id)} onChange={(w) => setWeight(s.id, w)} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Field label={t('Заметка о шмоте')}>
          <textarea
            className={cn(input, 'min-h-20')}
            value={g.gear.notes ?? ''}
            onChange={(e) => set({ gear: { ...g.gear, notes: e.target.value || undefined } })}
          />
        </Field>
      </div>
    </Card>
  )
}

function OrderedList({ title, ids, pool, onChange }: { title: string; ids: number[]; pool: number[]; onChange: (ids: number[]) => void }) {
  const namer = useNamer()
  const move = (i: number, d: number) => {
    const next = [...ids]
    const [x] = next.splice(i, 1)
    next.splice(i + d, 0, x)
    onChange(next)
  }
  const free = pool.filter((id) => !ids.includes(id))
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{title}</div>
      <ol className="space-y-1">
        {ids.map((id, i) => (
          <li key={id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2 py-1.5 text-[13px]">
            <span className="tnum w-5 text-[11px] text-ink-3">{i + 1}.</span>
            <span className="flex-1 truncate">{namer.skill(id).main}</span>
            <button disabled={i === 0} onClick={() => move(i, -1)} className="text-ink-3 hover:text-ink disabled:opacity-30">
              <ArrowUp size={13} />
            </button>
            <button disabled={i === ids.length - 1} onClick={() => move(i, 1)} className="text-ink-3 hover:text-ink disabled:opacity-30">
              <ArrowDown size={13} />
            </button>
            <button onClick={() => onChange(ids.filter((x) => x !== id))} className="text-ink-3 hover:text-critical">
              <X size={13} />
            </button>
          </li>
        ))}
      </ol>
      {free.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {free.map((id) => (
            <button
              key={id}
              onClick={() => onChange([...ids, id])}
              className="flex items-center gap-1 rounded-md border border-line bg-surface-3 px-2 py-0.5 text-[11px] text-ink-3 hover:text-ink"
            >
              <Plus size={10} /> {namer.skill(id).main}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ArcanaSection({ g, set }: SectionProps) {
  const attackPool = [...new Set([...arcanaPool(g.cls, 'parchment'), ...arcanaPool(g.cls, 'compass')])]
  const passivePool = [...new Set([...arcanaPool(g.cls, 'bell'), ...arcanaPool(g.cls, 'mirror')])]
  const a = g.arcana
  return (
    <Card
      hint={t(
        'Порядок = важность. Для Пергамента и Компаса берутся атакующие, для Колокола и Зеркала — пассивные, для Грааля — первые 4 атакующих и 3 пассивных.'
      )}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OrderedList title={t('Атакующие')} ids={a.attack} pool={attackPool} onChange={(attack) => set({ arcana: { ...a, attack } })} />
        <OrderedList title={t('Пассивные')} ids={a.passive} pool={passivePool} onChange={(passive) => set({ arcana: { ...a, passive } })} />
        <div className="space-y-5">
          <OrderedList
            title={t('Бесполезные')}
            ids={a.useless}
            pool={[...attackPool, ...passivePool]}
            onChange={(useless) => set({ arcana: { ...a, useless } })}
          />
          <Field label={t('Какой сет собирать')}>
            <Segmented
              value={a.preferredSet ?? 'any'}
              onChange={(v) => set({ arcana: { ...a, preferredSet: v === 'any' ? undefined : (v as 'magic' | 'vigor') } })}
              items={[
                { id: 'any', label: t('Не важно') },
                { id: 'vigor', label: t('Жизни') },
                { id: 'magic', label: t('Магии') }
              ]}
            />
          </Field>
        </div>
      </div>
      <div className="mt-5">
        <Field label={t('Заметка об арканах')}>
          <textarea className={cn(input, 'min-h-20')} value={a.notes ?? ''} onChange={(e) => set({ arcana: { ...a, notes: e.target.value || undefined } })} />
        </Field>
      </div>
    </Card>
  )
}

function DaevanionSection({ g, set }: SectionProps) {
  const namer = useNamer()
  const boards = classBoards(g.cls)
  const skills = classSkills(g.cls).filter((s) => s.type !== 'stigma')
  const goals = g.daevanion.goals
  const write = (next: DaevanionGoal[]) => set({ daevanion: { ...g.daevanion, goals: next } })
  const patch = (i: number, p: Partial<DaevanionGoal>) => write(goals.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const toggle = (list: number[] | undefined, id: number) => {
    const cur = list ?? []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    return next.length ? next : undefined
  }
  return (
    <div className="space-y-4">
      {goals.map((goal, i) => (
        <Card
          key={goal.id}
          actions={
            <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => write(goals.filter((_, j) => j !== i))}>
              {t('Удалить цель')}
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={t('Название')}>
              <input className={input} value={goal.name} onChange={(e) => patch(i, { name: e.target.value })} />
            </Field>
            <Field label={t('Описание')}>
              <input className={input} value={goal.description ?? ''} onChange={(e) => patch(i, { description: e.target.value || undefined })} />
            </Field>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 text-xs text-ink-2">{t('Узлы «+1 к умению» для:')}</div>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => patch(i, { skills: toggle(goal.skills, s.id) })}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px]',
                    goal.skills?.includes(s.id) ? 'border-accent/60 bg-accent-soft text-accent-2' : 'border-line bg-surface-3 text-ink-3 hover:text-ink-2'
                  )}
                >
                  {namer.skill(s.id).main}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 text-xs text-ink-2">{t('На досках (ничего не выбрано — на всех):')}</div>
            <div className="flex flex-wrap gap-1">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => patch(i, { boards: toggle(goal.boards, b.id) })}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px]',
                    goal.boards?.includes(b.id) ? 'border-accent/60 bg-accent-soft text-accent-2' : 'border-line bg-surface-3 text-ink-3 hover:text-ink-2'
                  )}
                >
                  {term(b)}
                </button>
              ))}
            </div>
          </div>
          {goal.nodes && goal.nodes.length > 0 && (
            <p className="mt-3 text-[11px] text-ink-3">
              {t('Плюс отдельные узлы: {nodesCount} шт. (заданы в файле гайда).', { nodesCount: goal.nodes.length })}
            </p>
          )}
        </Card>
      ))}
      <Button icon={<Plus size={14} />} onClick={() => write([...goals, { id: `goal-${Date.now()}`, name: t('Новая цель') }])}>
        {t('Добавить цель')}
      </Button>
    </div>
  )
}

function TextsSection({ g, set }: SectionProps) {
  const tips = g.tips ?? []
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card title={t('Ротация')} hint={t('По шагу на строку.')}>
        <textarea
          className={cn(input, 'min-h-64')}
          value={(g.rotation ?? []).join('\n')}
          onChange={(e) => set({ rotation: e.target.value.split('\n').filter((l, i, arr) => l.trim() || i < arr.length - 1) })}
        />
      </Card>
      <Card title={t('Чек-лист')} hint={t('Разовые дела по гайду (макросы, бинды). По пункту на строку — отмечаются на странице «Чек-лист».')}>
        <textarea
          className={cn(input, 'min-h-64')}
          value={(g.checklist ?? []).map((c) => c.text).join('\n')}
          onChange={(e) =>
            set({
              checklist: e.target.value
                .split('\n')
                .map((text, i) => ({ id: g.checklist?.[i]?.id ?? `item-${Date.now()}-${i}`, text }))
                .filter((c, i, arr) => c.text.trim() || i < arr.length - 1)
            })
          }
        />
      </Card>
      <Card title={t('Советы')} className="xl:col-span-2">
        <div className="space-y-3">
          {tips.map((tg, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <input
                  className={input}
                  value={tg.title}
                  placeholder={t('Заголовок')}
                  onChange={(e) => set({ tips: tips.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
                />
                <textarea
                  className={cn(input, 'min-h-16')}
                  value={tg.text}
                  onChange={(e) => set({ tips: tips.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
                />
              </div>
              <button onClick={() => set({ tips: tips.filter((_, j) => j !== i) })} className="self-start p-1 text-ink-3 hover:text-critical">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button icon={<Plus size={14} />} onClick={() => set({ tips: [...tips, { title: '', text: '' }] })}>
            {t('Добавить совет')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
