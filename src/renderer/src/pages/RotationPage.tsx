import { Fragment, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, ChevronRight, Info, Lightbulb, MousePointerClick, Repeat } from 'lucide-react'
import { analyzeInputMacro } from '@shared/analysis/inputMacro'
import type { AdviceTone, MacroReport, ManualReport, RotationAdvice, RotationSkill, SkillUse } from '@shared/analysis/rotation'
import type { Guide, GuideOneButton } from '@shared/guide/types'
import type { Namer } from '@shared/names'
import { formatStatValue } from '@shared/gamedata/stats'
import { StatusBadge } from '@/components/art'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { SkillIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { EmptyState, PageHeader } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import type { Tone } from '@/lib/status'

export function RotationPage() {
  const ctx = useCharacterContext()!
  const { char, guide, namer, report } = ctx
  const navigate = useNavigate()
  const rot = report.rotation
  const combat = guide?.combat
  const principles = guide?.rotation ?? []

  const header = (
    <PageHeader
      icon={<Repeat size={22} />}
      title="Ротация"
      subtitle="Как играть по гайду: связка (макрос игры) и ячейки панели, что жать вручную, с чего начинать бой и как зажимать всё одной кнопкой. Справа — советы под вашего персонажа."
      actions={<GuideSwitcher char={char} />}
    />
  )

  if (!guide || (!rot && !principles.length)) {
    return (
      <>
        {header}
        <EmptyState
          icon={<Repeat size={28} />}
          title="В выбранном гайде нет ротации"
          action={
            <Button icon={<BookOpen size={14} />} onClick={() => navigate('/guides')}>
              Выбрать гайд
            </Button>
          }
        >
          Ротацию и связку задаёт гайд. Выберите гайд, где они расписаны, — например, встроенный сводный.
        </EmptyState>
      </>
    )
  }

  const steps = rot ? rot.macros.filter((m) => m.active) : []
  const later = rot ? rot.macros.filter((m) => !m.active) : []

  return (
    <>
      {header}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          {steps.length > 0 && combat && (
            <Card
              title="Связка"
              hint="В игре: окно «Умения» → «Связки». Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. Каждый шаг — ячейка панели: до 4 умений столбиком, игра применяет первое готовое, нижний ряд 0 — главный. Красный значок — умение не изучено, жёлтый — стигма не надета."
              actions={
                <>
                  {combat.macroKey && (
                    <span className="flex items-center gap-1.5 text-xs text-ink-3">
                      клавиша <Key>{combat.macroKey}</Key>
                    </span>
                  )}
                  {combat.delayMs !== undefined && <Pill tip="Пауза между шагами связки.">задержка {combat.delayMs} мс</Pill>}
                </>
              }
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {steps.map((m, i) => (
                  <CellCard key={m.macro.id} m={m} step={i + 1} namer={namer} />
                ))}
                {later.map((m) => (
                  <CellCard key={m.macro.id} m={m} namer={namer} />
                ))}
              </div>
              {combat.delayNote && <p className="mt-3 text-xs leading-relaxed text-ink-3">{combat.delayNote}</p>}
            </Card>
          )}

          {combat?.oneButton && <OneButtonCard ob={combat.oneButton} macroKey={combat.macroKey} manual={rot?.manual ?? []} namer={namer} />}

          {rot && rot.manual.length > 0 && (
            <Card
              title="Вручную"
              hint="Умения на отдельных клавишах — их не кладут в связку: важен момент. Если подсказка зависит от ваших статов, она выделена и уже выбрана под ваши цифры."
              delay={0.05}
            >
              <ul className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
                {rot.manual.map((m) => (
                  <ManualRow key={m.entry.skill} m={m} namer={namer} />
                ))}
              </ul>
            </Card>
          )}

          {rot && rot.opener.length > 0 && (
            <Card title="Начало боя" hint="Порядок умений в первые секунды боя. Дальше — макрос и ручные умения по откату." delay={0.1}>
              <div className="flex flex-wrap items-start gap-y-4">
                {rot.opener.map((o, i) => (
                  <Fragment key={i}>
                    {i > 0 && <ChevronRight size={16} className="mt-3.5 shrink-0 text-ink-3" />}
                    <OpenerStep n={i + 1} skill={o.skill} note={o.note} use={o.use} namer={namer} />
                  </Fragment>
                ))}
              </div>
              {combat?.openerNote && <p className="mt-4 text-xs leading-relaxed text-ink-3">{combat.openerNote}</p>}
            </Card>
          )}

          {principles.length > 0 && (
            <Card title="Как играть" hint="Принципы ротации из гайда — то, что не уложить в макрос." delay={0.15}>
              <ol className="space-y-2.5">
                {principles.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink-2">
                    <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-3">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{r}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-5">
          {rot && <AdviceCard advice={rot.advice} onOpen={(to) => navigate(to)} />}
          {rot && combat && <KeyMapCard guide={guide} macros={rot.macros} manual={rot.manual} namer={namer} />}
          {guide.tips && guide.tips.length > 0 && (
            <Card title="Советы гайда" hint="Заметки гайда о ротации, макросе и том, где источники расходятся." delay={0.1}>
              <div className="space-y-3.5">
                {guide.tips.map((t, i) => (
                  <div key={i} className="flex gap-2.5">
                    <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium">{t.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {combat?.notes && <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{combat.notes}</p>}
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

/** Клавиша как на клавиатуре. */
function Key({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-[3px] border-line-strong bg-surface-2 px-1.5 font-sans text-[11px] leading-none font-semibold text-ink',
        className
      )}
    >
      {children}
    </kbd>
  )
}

const USE_TONE: Record<SkillUse, Tone | undefined> = { ready: undefined, missing: 'bad', unequipped: 'warn' }
const USE_TEXT: Record<SkillUse, string> = {
  ready: '',
  missing: 'Не изучено — связка его пропустит.',
  unequipped: 'Стигма не надета.'
}

function skillTip(s: RotationSkill, namer: Namer, extra?: ReactNode) {
  const label = namer.skill(s.skill)
  return (
    <>
      <b className="text-ink">{label.main}</b>
      {label.alt && <span className="text-ink-3"> ({label.alt})</span>}
      <span className="mt-1 block">{s.use === 'missing' ? USE_TEXT.missing : `Ур. ${s.level}. ${USE_TEXT[s.use]}`}</span>
      {s.specsOff && <span className="mt-1 block text-warning">Специализации не по гайду — см. «Умения».</span>}
      {extra}
    </>
  )
}

/** Шаг связки — ячейка панели столбиком, как в игре: ряд 0 снизу, он главный. */
function CellCard({ m, step, namer }: { m: MacroReport; step?: number; namer: Namer }) {
  const w = m.macro.when
  const whenSkill = w ? namer.skill(w.skill).main : ''
  const whenText = w ? (w.minLevel !== undefined ? `${whenSkill} — с ур. ${w.minLevel}` : `${whenSkill} — до ур. ${w.maxLevel}`) : ''
  return (
    <div className={cn('flex flex-col rounded-xl border p-3.5', m.active ? 'border-line-strong bg-surface-2/50' : 'border-dashed border-line')}>
      <div className="flex flex-wrap items-center gap-2">
        {step !== undefined && <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-2">Шаг {step}</span>}
        <span className={cn('text-[13px] font-semibold', !m.active && 'text-ink-3')}>{m.macro.name}</span>
        {w &&
          (m.active ? (
            <Pill tone="good" icon={<Check size={11} />} tip={`${whenText}. Сейчас — ур. ${m.whenLevel ?? 0}.`}>
              подходит сейчас
            </Pill>
          ) : (
            <Pill tip={`Эта ячейка — для другого уровня умения: ${whenText}. Сейчас — ур. ${m.whenLevel ?? 0}.`}>{whenText}</Pill>
          ))}
        {m.macro.key && <Key className="ml-auto">{m.macro.key}</Key>}
      </div>
      <div className={cn('mt-3 flex flex-col-reverse gap-1', !m.active && 'opacity-55')}>
        {m.skills.map((s, i) => (
          <CellRow key={s.skill} s={s} row={i} namer={namer} />
        ))}
      </div>
      {m.macro.note && <p className="mt-2.5 text-xs leading-relaxed text-ink-3">{m.macro.note}</p>}
    </div>
  )
}

/** Ряд ячейки: номер ряда, иконка, название. */
function CellRow({ s, row, namer }: { s: RotationSkill; row: number; namer: Namer }) {
  const tone = USE_TONE[s.use] ?? (s.specsOff ? 'warn' : undefined)
  return (
    <Tooltip
      block
      content={skillTip(
        s,
        namer,
        <span className="mt-1 block text-ink-3">
          {row === 0 ? 'Ряд 0 — главный: применится первым, если готов.' : `Ряд ${row}: применится, если всё ниже в ячейке на откате.`}
        </span>
      )}
    >
      <div className="flex w-full items-center gap-2.5 rounded-lg px-1 py-0.5 hover:bg-surface-2">
        <span className={cn('tnum w-11 shrink-0 text-[10.5px]', row === 0 ? 'font-semibold text-accent' : 'text-ink-3')}>ряд {row}</span>
        <span className="relative shrink-0">
          <SkillIcon id={s.skill} size={34} tone={tone} dim={s.use === 'missing'} />
          {tone && <StatusBadge tone={tone} size={13} className="absolute -right-1 -bottom-1" />}
        </span>
        <span className={cn('min-w-0 text-[12.5px] leading-tight', s.use === 'missing' ? 'text-ink-3' : 'text-ink-2')}>{namer.skill(s.skill).main}</span>
      </div>
    </Tooltip>
  )
}

/** «Одна кнопка»: макрос ПО мыши по событиям и расчёт — длительность нажатий, частота, риски. */
function OneButtonCard({ ob, macroKey, manual, namer }: { ob: GuideOneButton; macroKey?: string; manual: ManualReport[]; namer: Namer }) {
  const r = useMemo(() => analyzeInputMacro(ob.events, ob.repeatMs, macroKey), [ob, macroKey])
  const purpose = (key: string) => {
    if (key === macroKey) return 'связка'
    const m = manual.find((x) => x.entry.key === key)
    return m ? namer.skill(m.entry.skill).main : ''
  }
  const fmt = (v: number) => `${Math.round(v * 10) / 10} мс`
  return (
    <Card
      title="Одна кнопка"
      hint="Для тех, кто зажимает одну боковую кнопку мыши на всю ротацию: ПО мыши (SteelSeries GG, Razer Synapse, G Hub) повторяет этот макрос, пока кнопка зажата. Ниже — расчёт: сколько длится каждое нажатие и как часто отпускается клавиша связки. Игра читает ввод раз в кадр (при 60 FPS — каждые 16,7 мс)."
      delay={0.03}
    >
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        <MousePointerClick size={16} className="mr-1 shrink-0 text-accent" />
        {ob.events.map((e, i) => (
          <Fragment key={i}>
            <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 py-0.5 pr-1.5 pl-0.5">
              <Key>{e.key}</Key>
              {e.down ? <ArrowDown size={13} className="text-ink-2" /> : <ArrowUp size={13} className="text-ink-2" />}
            </span>
            {e.waitMs > 0 && <span className="tnum text-[11px] text-ink-3">{e.waitMs} мс</span>}
          </Fragment>
        ))}
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-3">
          <Repeat size={12} /> автоповтор {ob.repeatMs} мс
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
          <div className="text-[11px] text-ink-3">Один прогон</div>
          <div className="tnum mt-0.5 text-[15px] font-semibold">{fmt(r.cycleMs)}</div>
          <div className="text-[11px] text-ink-3">{Math.round(1000 / Math.max(1, r.cycleMs))} прогонов в секунду</div>
        </div>
        {r.keys.map((k) => (
          <div key={k.key} className="rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <Key className="h-5 min-w-5 text-[10px]">{k.key}</Key>
              <span className="truncate">{purpose(k.key)}</span>
            </div>
            <div className="tnum mt-1 text-[13px] font-semibold">{k.key === macroKey ? `зажата ${fmt(k.holdMs)}` : `нажатие ${fmt(k.holdMs)}`}</div>
            <div className="tnum text-[11px] text-ink-3">
              {k.key === macroKey ? `отпускается на ${fmt(k.gapMs)}` : `пауза ${fmt(k.gapMs)}, ${Math.round(k.pressesPerSec)} раз в секунду`}
            </div>
          </div>
        ))}
      </div>

      {r.warnings.length > 0 && (
        <ul className="mt-3 space-y-2">
          {r.warnings.map((w) => (
            <li key={w.key + w.kind} className="flex gap-2 text-xs leading-relaxed text-ink-2">
              <span className="mt-0.5">
                <AdviceIcon tone={w.kind === 'macro-release' ? 'info' : 'warn'} />
              </span>
              <span>{w.text}</span>
            </li>
          ))}
        </ul>
      )}
      {ob.note && <p className="mt-3 text-xs leading-relaxed text-ink-3">{ob.note}</p>}
    </Card>
  )
}

function ManualRow({ m, namer }: { m: ManualReport; namer: Namer }) {
  const s = m.skill
  const optional = m.entry.optional && s.use !== 'ready'
  const tone = optional ? undefined : USE_TONE[s.use]
  const stat = m.entry.byStat?.stat
  return (
    <li className="flex items-start gap-3 border-b border-line py-3 last:border-b-0 lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
      <Tooltip content={skillTip(s, namer)}>
        <span className="relative mt-0.5 block">
          <SkillIcon id={s.skill} size={36} tone={tone} dim={s.use !== 'ready'} />
          {tone && <StatusBadge tone={tone} size={14} className="absolute -right-1 -bottom-1" />}
        </span>
      </Tooltip>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-[13px] font-medium', s.use !== 'ready' && 'text-ink-3')}>{namer.skill(s.skill).main}</span>
          {m.entry.key && <Key>{m.entry.key}</Key>}
          {optional ? (
            <Pill tip="Запасной вариант: гайд не требует это умение. Не надето — просто пропустите.">запасная</Pill>
          ) : s.use === 'missing' ? (
            <Pill tone="critical">не изучено</Pill>
          ) : s.use === 'unequipped' ? (
            <Pill tone="warning">не надета</Pill>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{m.entry.when}</p>
        {m.statHint && stat !== undefined && (
          <div className="mt-2 flex gap-2 rounded-lg border border-accent/30 bg-accent-soft px-2.5 py-1.5 text-xs leading-relaxed text-ink-2">
            <Info size={13} className="mt-0.5 shrink-0 text-accent" />
            <span>
              <b className="font-semibold text-ink">
                У вас {namer.stat(stat).main} {formatStatValue(stat, m.statHint.value)}.
              </b>{' '}
              {m.statHint.text}
            </span>
          </div>
        )}
      </div>
    </li>
  )
}

function OpenerStep({ n, skill, note, use, namer }: { n: number; skill: number; note?: string; use: SkillUse; namer: Namer }) {
  const tone = USE_TONE[use]
  return (
    <Tooltip
      content={
        <>
          <b className="text-ink">
            {n}. {namer.skill(skill).main}
          </b>
          {note && <span className="mt-1 block">{note}</span>}
          {use !== 'ready' && <span className="mt-1 block text-warning">{USE_TEXT[use]}</span>}
        </>
      }
    >
      <div className="flex w-[80px] flex-col items-center gap-1 text-center">
        <span className="relative">
          <SkillIcon id={skill} size={38} tone={tone} dim={use === 'missing'} />
          <span className="tnum absolute -top-1.5 -left-1.5 flex size-[18px] items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-ink-2 shadow-[0_0_0_2px_var(--color-surface)]">
            {n}
          </span>
          {tone && <StatusBadge tone={tone} size={14} className="absolute -right-1 -bottom-1" />}
        </span>
        <span className="line-clamp-2 text-[11px] leading-tight text-ink-2">{namer.skill(skill).main}</span>
        {note && <span className="line-clamp-2 text-[10px] leading-tight text-ink-3">{note}</span>}
      </div>
    </Tooltip>
  )
}

const ADVICE_ORDER: Record<AdviceTone, number> = { bad: 0, warn: 1, ok: 2, info: 3 }

function AdviceIcon({ tone }: { tone: AdviceTone }) {
  return <StatusBadge tone={tone} size={18} />
}

function AdviceCard({ advice, onOpen }: { advice: RotationAdvice[]; onOpen: (to: string) => void }) {
  const sorted = [...advice].sort((a, b) => ADVICE_ORDER[a.tone] - ADVICE_ORDER[b.tone])
  return (
    <Card
      title="Для вас"
      hint="Советы по вашему персонажу: какая ячейка подходит по уровню умений, чего не хватает для ротации, как жать умения при ваших статах. Красное — мешает ротации, жёлтое — стоит поправить, синее — к сведению. Нажмите, чтобы открыть раздел."
    >
      <ul className="-mx-2 space-y-0.5">
        {sorted.map((a) => {
          const body = (
            <>
              <span className="mt-0.5">
                <AdviceIcon tone={a.tone} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-snug font-medium">{a.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{a.text}</span>
                {a.skills && a.skills.length > 1 && (
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {a.skills.map((id) => (
                      <SkillIcon key={id} id={id} size={22} />
                    ))}
                  </span>
                )}
              </span>
              {a.link && <ArrowRight size={14} className="mt-1 shrink-0 text-ink-3 group-hover:text-accent" />}
            </>
          )
          return (
            <li key={a.id}>
              {a.link ? (
                <button
                  onClick={() => onOpen(a.link!)}
                  className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-2.5 px-2 py-2">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

const MOUSE = ['ЛКМ', 'ПКМ', 'СКМ']
const keyOrder = (k: string) => {
  const i = MOUSE.indexOf(k)
  return i >= 0 ? `0${i}` : /^\d$/.test(k) ? `1${k}` : `2${k}`
}

/** Раскладка: что на какой клавише — из клавиш макроса и ручных умений гайда. */
function KeyMapCard({ guide, macros, manual, namer }: { guide: Guide; macros: MacroReport[]; manual: ManualReport[]; namer: Namer }) {
  const combat = guide.combat!
  const rows: { key: string; skill?: number; text: string }[] = []
  const inMacro = macros.filter((m) => m.active && !m.macro.key)
  if (combat.macroKey && inMacro.length) rows.push({ key: combat.macroKey, text: `Связка: ${inMacro.map((m) => m.macro.name).join(' → ')}` })
  for (const m of macros) if (m.active && m.macro.key) rows.push({ key: m.macro.key, skill: m.macro.skills[0], text: m.macro.name })
  for (const m of manual) if (m.entry.key) rows.push({ key: m.entry.key, skill: m.entry.skill, text: namer.skill(m.entry.skill).main })
  if (!rows.length) return null
  rows.sort((a, b) => keyOrder(a.key).localeCompare(keyOrder(b.key)))
  return (
    <Card title="Раскладка клавиш" hint="Пример раскладки из гайда — подсказка, а не правило. Остальные умения — на любых свободных клавишах." delay={0.05}>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.key + r.text} className="flex items-start gap-3">
            <Key className="w-12 shrink-0">{r.key}</Key>
            {r.skill ? <SkillIcon id={r.skill} size={24} /> : <Repeat size={16} className="mx-1 mt-1 shrink-0 text-accent" />}
            <span className="min-w-0 pt-0.5 text-[13px] leading-snug text-ink-2">{r.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
