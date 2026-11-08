import { AlertTriangle, Check, Lock, RotateCcw, Swords } from 'lucide-react'
import type { SkillReport } from '@shared/analysis/skills'
import { skillSpecs } from '@shared/gamedata/skills'
import { ROLE_LABEL } from '@shared/guide/types'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { Name } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { PageHeader } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/Progress'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { useApp, useCharacterPrefs } from '@/lib/store'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const STATUS: Record<SkillReport['status'], { tone: 'good' | 'warning' | 'critical' | 'neutral'; text: string }> = {
  done: { tone: 'good', text: 'как в гайде' },
  progress: { tone: 'warning', text: 'в процессе' },
  missing: { tone: 'critical', text: 'не изучено' },
  info: { tone: 'neutral', text: 'по ситуации' }
}

export function SkillsPage() {
  const ctx = useCharacterContext()!
  const { char, report, namer } = ctx
  const by = (role: string) => report.skills.filter((s) => s.role === role)
  const core = by('core')
  const support = by('support')
  const passives = by('passive')
  const stigmas = report.skills.filter((s) => s.def?.type === 'stigma')
  const others = report.skills.filter((s) => (s.role === 'situational' || s.role === 'other') && s.def?.type !== 'stigma' && s.def?.type !== 'passive')

  return (
    <>
      <PageHeader
        icon={<Swords size={22} />}
        title="Умения"
        subtitle="Уровни против целей гайда, откуда берутся бонусные уровни (доски Даэваниона, арканы, шмот) и какие специализации нужны. Уровень — итоговый, как в игре."
        actions={<GuideSwitcher char={char} />}
      />

      {report.specsUncertain && (
        <div className="mb-5 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] leading-relaxed">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <div className="text-ink-2">
            <b className="text-ink">Выбранные специализации неизвестны.</b> Оверлей показывает у всех умений «1, 2» — это, похоже, число открытых слотов, а не
            выбранные варианты. Нажмите на варианты, которые реально стоят в игре: приложение запомнит отметку и будет сравнивать с гайдом по ней.
          </div>
        </div>
      )}

      {core.length > 0 && (
        <Section title="Главные умения" hint="Вокруг них построен гайд: их уровень и специализации важнее всего остального.">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {core.map((s) => (
              <SkillCard key={s.skill} s={s} ctx={ctx} />
            ))}
          </div>
        </Section>
      )}

      {support.length > 0 && (
        <Section title="Поддерживающие" hint="Открывают окна Правосудия, контроль и мобильность. Нужные специализации отмечены золотом.">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {support.map((s) => (
              <SkillCard key={s.skill} s={s} ctx={ctx} compact />
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Стигмы" hint="Зелёные — надеты и нужны гайду. Красные — гайд держит их надетыми, а у вас их нет. Серые — надеты, но гайд о них молчит.">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {report.stigmas.equipped.map((id) => (
              <Pill key={id} tone={report.stigmas.wanted.includes(id) ? 'good' : report.stigmas.optional.includes(id) ? 'accent' : 'neutral'}>
                {namer.skill(id).main}
              </Pill>
            ))}
            {report.stigmas.missing.map((id) => (
              <Pill key={id} tone="critical">
                надеть: {namer.skill(id).main}
              </Pill>
            ))}
          </div>
          <SkillTable rows={stigmas} ctx={ctx} showEquip />
        </Card>
        <Card
          title="Пассивные"
          hint="Работают всегда. Порядок — по важности в гайде. Уровни растут от досок, аркан (Колокол, Зеркало, Грааль) и строк на броне."
        >
          <SkillTable rows={passives} ctx={ctx} />
        </Card>
      </div>

      {others.length > 0 && (
        <Card title="Остальные умения класса" className="mt-5" hint="Гайд не делает на них ставку.">
          <SkillTable rows={others} ctx={ctx} />
        </Card>
      )}
    </>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 flex items-baseline gap-2 text-[13px] font-semibold tracking-wide text-ink-2 uppercase">
        {title}
        {hint && <span className="text-xs font-normal tracking-normal text-ink-3 normal-case">— {hint}</span>}
      </h2>
      {children}
    </section>
  )
}

function Breakdown({ s }: { s: SkillReport }) {
  const parts = [
    { label: 'база', value: s.base, tip: 'Вложено очками умений (итог минус бонусы).' },
    { label: 'доски', value: s.bonus.daevanion, tip: 'Узлы «+1» на досках Даэваниона.' },
    { label: 'арканы', value: s.bonus.arcana, tip: 'Строки умения на картах аркан.' },
    { label: 'шмот', value: s.bonus.gear, tip: 'Строки умения на оружии, броне и украшениях.' }
  ]
  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((p, i) => (
        <Tooltip key={p.label} content={p.tip}>
          <span className={cn('tnum rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px]', p.value ? 'text-ink-2' : 'text-ink-3')}>
            {p.label} {i === 0 ? p.value : `+${p.value}`}
          </span>
        </Tooltip>
      ))}
    </div>
  )
}

function SkillCard({ s, ctx, compact }: { s: SkillReport; ctx: Ctx; compact?: boolean }) {
  const { namer, char } = ctx
  const prefs = useCharacterPrefs(char.key)
  const setPrefs = useApp((st) => st.updateCharacterPrefs)
  const specs = skillSpecs(s.skill)
  const current = s.specs?.current ?? []
  const manual = prefs.manualSpecs?.[s.skill]
  const status = STATUS[s.status]

  const toggle = (n: number) => {
    const base = manual ?? current
    const next = base.includes(n) ? base.filter((x) => x !== n) : [...base, n].slice(-Math.max(1, s.specs?.slots ?? 3))
    void setPrefs(char.key, { manualSpecs: { ...prefs.manualSpecs, [s.skill]: next.sort() } })
  }
  const reset = () => {
    const rest = { ...prefs.manualSpecs }
    delete rest[s.skill]
    void setPrefs(char.key, { manualSpecs: rest })
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Name label={namer.skill(s.skill)} className="text-[15px] font-semibold" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {s.target && <Pill>{ROLE_LABEL[s.target.role]}</Pill>}
          <Pill tone={status.tone}>{status.text}</Pill>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="tnum shrink-0 text-[13px]">
          ур. <b className={s.levelGap ? 'text-warning' : 'text-ink'}>{s.level}</b>
          {s.targetLevel ? <span className="text-ink-3"> / {s.targetLevel}</span> : null}
        </span>
        <ProgressBar value={s.targetLevel ? (Math.min(s.level, s.targetLevel) / s.targetLevel) * 100 : s.level ? 100 : 0} height={5} className="flex-1" />
      </div>
      <div className="mt-2">
        <Breakdown s={s} />
      </div>

      {specs.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-3">
            <span>
              Специализации · слотов: {s.specs?.slots ?? 0}
              {s.specsSource === 'manual' && <span className="ml-1.5 text-accent">отмечено вручную</span>}
            </span>
            {manual && (
              <button onClick={reset} className="flex items-center gap-1 hover:text-ink-2">
                <RotateCcw size={11} /> как в оверлее
              </button>
            )}
          </div>
          <div className={cn('grid gap-1.5', compact ? 'grid-cols-5' : 'grid-cols-1')}>
            {specs.map((sp) => {
              const isOn = current.includes(sp.n)
              const wanted = s.specs?.wanted.includes(sp.n) ?? false
              const inGuide = s.target?.specs?.includes(sp.n) ?? false
              const locked = sp.level !== null && sp.level > s.level
              const label = namer.spec(s.skill, sp.n)
              const tip = (
                <>
                  <b className="text-ink">Вариант {sp.n}</b>
                  {sp.level ? ` · с ур. ${sp.level}` : ''}
                  <br />
                  {label.main}
                  {label.alt && <span className="block text-ink-3">{label.alt}</span>}
                  <span className="mt-1 block text-ink-3">
                    {wanted ? 'Гайд: поставить сейчас.' : inGuide ? 'Гайд: нужен позже.' : 'Гайд его не просит.'} Нажмите, чтобы отметить, стоит ли он у вас.
                  </span>
                </>
              )
              return (
                <Tooltip key={sp.n} content={tip} wide>
                  <button
                    onClick={() => toggle(sp.n)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors',
                      isOn && wanted && 'border-good/50 bg-good-soft text-good',
                      isOn && !wanted && 'border-line-strong bg-surface-3 text-ink-2',
                      !isOn && wanted && 'border-accent/60 bg-accent-soft text-accent-2',
                      !isOn && !wanted && 'border-line bg-surface-2 text-ink-3 hover:text-ink-2',
                      locked && 'opacity-60'
                    )}
                  >
                    <span className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/25 text-[11px] font-semibold">
                      {isOn ? <Check size={12} /> : sp.n}
                    </span>
                    {!compact && <span className="min-w-0 flex-1 truncate">{label.main}</span>}
                    {locked && <Lock size={11} className="shrink-0" />}
                    {!compact && sp.level && <span className="tnum shrink-0 text-[10px] opacity-70">ур. {sp.level}</span>}
                  </button>
                </Tooltip>
              )
            })}
          </div>
          {s.specs && s.specs.missing.length > 0 && (
            <p className="mt-2 text-xs text-ink-3">
              Нужно: <span className="text-accent-2">{s.specs.wanted.map((n) => `${n} «${namer.spec(s.skill, n).main}»`).join(', ')}</span>
            </p>
          )}
        </div>
      )}

      {s.target?.note && <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{s.target.note}</p>}
    </div>
  )
}

function SkillTable({ rows, ctx, showEquip }: { rows: SkillReport[]; ctx: Ctx; showEquip?: boolean }) {
  const { namer } = ctx
  return (
    <div className="-mx-2">
      {rows.map((s) => (
        <div key={s.skill} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
          <div className="min-w-0 flex-1">
            <Name label={namer.skill(s.skill)} className="text-[13px]" />
            {s.target?.note && <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-3">{s.target.note}</div>}
          </div>
          {showEquip && <span className={cn('shrink-0 text-[11px]', s.equipped ? 'text-good' : 'text-ink-3')}>{s.equipped ? 'надета' : 'не надета'}</span>}
          <Tooltip content={`база ${s.base} · доски +${s.bonus.daevanion} · арканы +${s.bonus.arcana} · шмот +${s.bonus.gear}`}>
            <span className="tnum w-20 shrink-0 text-right text-[13px]">
              <span className={s.levelGap ? 'text-warning' : s.learned ? 'text-ink' : 'text-ink-3'}>{s.learned ? `ур. ${s.level}` : '—'}</span>
              {s.targetLevel ? <span className="text-ink-3"> / {s.targetLevel}</span> : null}
            </span>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
