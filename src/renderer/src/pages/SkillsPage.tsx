import type { ReactNode } from 'react'
import { AlertTriangle, Check, Lock, RotateCcw, Swords } from 'lucide-react'
import type { SkillReport } from '@shared/analysis/skills'
import { skillSpecs } from '@shared/gamedata/skills'
import { ROLE_LABEL } from '@shared/guide/types'
import { GuideSwitcher } from '@/components/GuideSwitcher'
import { StaleBoardsNotice } from '@/components/StaleBoardsNotice'
import { SkillIcon, SpecIcon } from '@/components/icons'
import { Name } from '@/components/game'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Legend, PageHeader } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/Progress'
import { cn } from '@/lib/format'
import { useCharacterContext } from '@/lib/report'
import { levelTone, skillTone, TONE_BOX, TONE_LABEL, TONE_TEXT, type Tone } from '@/lib/status'
import { useApp, useCharacterPrefs } from '@/lib/store'

type Ctx = NonNullable<ReturnType<typeof useCharacterContext>>

const PILL_TONE: Record<Tone, 'good' | 'warning' | 'critical' | 'neutral'> = { ok: 'good', warn: 'warning', bad: 'critical', neutral: 'neutral' }

const ROLE_TIP: Record<string, string> = {
  core: 'Главное умение гайда: на нём строится урон. Его уровень и специализации важнее всего.',
  support: 'Поддерживающее: открывает окна главных умений, контроль, мобильность.',
  passive: 'Пассивное: работает всегда, уровни растут от досок, аркан и строк на броне.',
  stigma: 'Стигма: отдельный набор умений, уровни — очками стигм.',
  situational: 'По ситуации: гайд не делает на него ставку.'
}

export function SkillsPage() {
  const ctx = useCharacterContext()!
  const { char, report } = ctx
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
        subtitle="Уровни против целей гайда, откуда берутся бонусные уровни (доски Даэваниона, арканы, шмот) и какие специализации нужны. Зелёное — как в гайде, жёлтое — обратить внимание, красное — не по гайду. Наведите на любой элемент, чтобы увидеть пояснение."
        actions={<GuideSwitcher char={char} />}
      />

      {report.specsUncertain && (
        <div className="mb-5 flex gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] leading-relaxed">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <div className="text-ink-2">
            <b className="text-ink">Оверлей не видит выбранные специализации.</b> У всех умений он показывает «1, 2» — это открытые слоты, а не выбранные
            варианты. Нажмите на варианты, которые реально стоят в игре (окно «Умения», яркие строки в «Уник. особенность»), — приложение запомнит отметку.
            Умения с отметкой помечены «отмечено вручную».
          </div>
        </div>
      )}

      <StaleBoardsNotice list={report.boardsStale} namer={ctx.namer} className="mb-5" />

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
        <Section title="Поддерживающие" hint="Открывают окна Суда, контроль и мобильность.">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {support.map((s) => (
              <SkillCard key={s.skill} s={s} ctx={ctx} compact />
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Стигмы"
          hint="Набор стигм против гайда. Варианты стигм открываются сами на ур. 5, 10, 15 и 20 — золотые значки показывают, какие уже работают."
        >
          <div className="mb-4 flex flex-wrap gap-1.5">
            {report.stigmas.equipped.map((id) => {
              const wanted = report.stigmas.wanted.includes(id)
              const optional = report.stigmas.optional.includes(id)
              return (
                <Pill
                  key={id}
                  tone={wanted ? 'good' : optional ? 'warning' : 'critical'}
                  icon={<SkillIcon id={id} size={14} />}
                  tip={
                    wanted
                      ? 'Надета, и гайд держит её постоянно.'
                      : optional
                        ? 'Надета; гайд советует её только в особых случаях.'
                        : 'Надета, но гайд о ней молчит — слот можно занять стигмой из гайда.'
                  }
                >
                  {ctx.namer.skill(id).main}
                </Pill>
              )
            })}
            {report.stigmas.missing.map((id) => (
              <Pill key={id} tone="critical" icon={<SkillIcon id={id} size={14} dim />} tip="Гайд держит эту стигму надетой, а у вас её нет в наборе.">
                надеть: {ctx.namer.skill(id).main}
              </Pill>
            ))}
          </div>
          <SkillTable rows={stigmas} ctx={ctx} stigma />
        </Card>
        <Card
          title="Пассивные"
          hint="Работают всегда. Порядок — по важности в гайде. Уровни растут от досок, аркан (Колокол, Зеркало, Грааль) и строк на броне."
        >
          <SkillTable rows={passives} ctx={ctx} />
        </Card>
      </div>

      {others.length > 0 && (
        <Card title="Остальные умения класса" className="mt-5" hint="Гайд не делает на них ставку — серые, без оценки.">
          <SkillTable rows={others} ctx={ctx} />
        </Card>
      )}

      <Legend
        items={[
          { swatch: <span className="h-3 w-3 rounded-full bg-good" />, text: 'как в гайде' },
          { swatch: <span className="h-3 w-3 rounded-full bg-warning" />, text: 'почти / проверьте / приемлемо' },
          { swatch: <span className="h-3 w-3 rounded-full bg-critical" />, text: 'не по гайду — исправить' },
          { swatch: <span className="h-3 w-3 rounded-full bg-ink-3" />, text: 'гайд не оценивает' }
        ]}
      />
    </>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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
    { label: 'база', value: s.base, tip: 'Вложено очками умений: итоговый уровень минус все бонусы. В игре — число после «Ур.» в названии.' },
    { label: 'доски', value: s.bonus.daevanion, tip: 'Узлы «+1 к умению» на досках Даэваниона (по одному на доску у главных умений).' },
    { label: 'арканы', value: s.bonus.arcana, tip: 'Строки этого умения на картах аркан (уровни на карте складываются).' },
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
      <Tooltip content="Сумма бонусов — в игре она показана зелёным «(+N)» рядом с названием умения.">
        <span className="tnum rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-good">(+{s.bonus.daevanion + s.bonus.arcana + s.bonus.gear})</span>
      </Tooltip>
    </div>
  )
}

function SkillCard({ s, ctx, compact }: { s: SkillReport; ctx: Ctx; compact?: boolean }) {
  const { namer, char, report } = ctx
  const prefs = useCharacterPrefs(char.key)
  const setPrefs = useApp((st) => st.updateCharacterPrefs)
  const specs = skillSpecs(s.skill)
  const current = s.specs?.current ?? []
  const manual = prefs.manualSpecs?.[s.skill]
  const unsure = report.specsUncertain && s.specsSource === 'overlay'
  const verdict = skillTone(s, report.specsUncertain)
  const lvl = levelTone(s)
  const slots = s.specs?.slots ?? 0
  const wantedCount = s.specs?.wanted.length ?? 0

  const toggle = (n: number) => {
    const base = manual ?? current
    const next = base.includes(n) ? base.filter((x) => x !== n) : [...base, n].slice(-Math.max(1, slots || 3))
    void setPrefs(char.key, { manualSpecs: { ...prefs.manualSpecs, [s.skill]: next.sort() } })
  }
  const reset = () => {
    const rest = { ...prefs.manualSpecs }
    delete rest[s.skill]
    void setPrefs(char.key, { manualSpecs: rest })
  }

  return (
    <div
      className={cn(
        'rounded-2xl border bg-surface p-4',
        verdict.tone === 'ok' ? 'border-good/25' : verdict.tone === 'bad' ? 'border-critical/30' : 'border-line'
      )}
    >
      <div className="flex items-start gap-3">
        <Tooltip content={`${namer.skill(s.skill).main}${s.def?.unlock ? ` — открывается на ур. ${s.def.unlock} персонажа` : ''}. ${verdict.why}`} wide>
          <SkillIcon id={s.skill} size={compact ? 40 : 48} tone={verdict.tone} />
        </Tooltip>
        <div className="min-w-0 flex-1">
          <Name label={namer.skill(s.skill)} className="text-[15px] font-semibold" />
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {s.target && <Pill tip={ROLE_TIP[s.target.role]}>{ROLE_LABEL[s.target.role]}</Pill>}
            <Pill tone={PILL_TONE[verdict.tone]} tip={verdict.why}>
              {TONE_LABEL[verdict.tone]}
            </Pill>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Tooltip content={lvl.why} wide>
          <span className="tnum shrink-0 text-[13px]">
            ур. <b className={TONE_TEXT[lvl.tone]}>{s.level}</b>
            {s.targetLevel ? <span className="text-ink-3"> / {s.targetLevel}</span> : null}
          </span>
        </Tooltip>
        <ProgressBar
          value={s.targetLevel ? (Math.min(s.level, s.targetLevel) / s.targetLevel) * 100 : s.level ? 100 : 0}
          height={5}
          className="flex-1"
          color={
            lvl.tone === 'ok' ? 'var(--color-good)' : lvl.tone === 'warn' ? 'var(--color-warning)' : lvl.tone === 'bad' ? 'var(--color-critical)' : undefined
          }
        />
      </div>
      <div className="mt-2">
        <Breakdown s={s} />
      </div>

      {specs.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-3">
            <Tooltip content="Слоты открываются на ур. умения 8, 12 и 20; варианты — на 8, 12 и 16. На ур. 16–19 вариант 5 уже есть, но слотов только два.">
              <span>Специализации · слотов: {slots}</span>
            </Tooltip>
            {s.specsSource === 'manual' ? (
              <Tooltip content="Отметка ваша (из игры), а не из оверлея. Нажмите, чтобы убрать отметку и вернуться к данным оверлея.">
                <button onClick={reset} className="flex items-center gap-1 text-accent hover:text-accent-2">
                  отмечено вручную <RotateCcw size={11} />
                </button>
              </Tooltip>
            ) : unsure ? (
              <span className="text-warning">не отмечено — нажмите на стоящие варианты</span>
            ) : null}
          </div>
          <div className={cn('grid gap-1.5', compact ? 'grid-cols-5' : 'grid-cols-1')}>
            {specs.map((sp) => {
              const isOn = current.includes(sp.n)
              const wanted = s.specs?.wanted.includes(sp.n) ?? false
              const inGuide = s.target?.specs?.includes(sp.n) ?? false
              const locked = sp.level !== null && sp.level > s.level
              const label = namer.spec(s.skill, sp.n)
              const tone: Tone =
                isOn && wanted ? 'ok' : !isOn && wanted ? (unsure ? 'warn' : 'bad') : isOn && !wanted ? (wantedCount >= slots ? 'bad' : 'warn') : 'neutral'
              const state =
                isOn && wanted
                  ? 'Стоит, и гайд просит именно его.'
                  : !isOn && wanted
                    ? unsure
                      ? 'Гайд просит поставить его сейчас. Проверьте в игре и отметьте, если стоит.'
                      : 'Гайд просит поставить его сейчас — а он не стоит.'
                    : isOn
                      ? wantedCount >= slots
                        ? 'Стоит, но занимает слот, который гайд отдаёт другому варианту.'
                        : 'Стоит; гайд его не просит, но и свободный слот он не отнимает.'
                      : locked
                        ? `Откроется на ур. ${sp.level}.${inGuide ? ' Гайд попросит его, когда откроется.' : ''}`
                        : inGuide
                          ? 'Гайд просит его, но на этом уровне не хватает слотов или он запасной.'
                          : 'Гайд его не просит.'
              const tip = (
                <>
                  <b className="text-ink">Вариант {sp.n}</b>
                  {sp.level ? ` · с ур. ${sp.level}` : ''}
                  <br />
                  {label.main}
                  {label.alt && <span className="block text-ink-3">{label.alt}</span>}
                  <span className={cn('mt-1 block', TONE_TEXT[tone])}>{state}</span>
                  <span className="mt-1 block text-ink-3">Нажмите, чтобы отметить, стоит ли он у вас в игре.</span>
                </>
              )
              return (
                <Tooltip key={sp.n} content={tip} wide block={!compact}>
                  <button
                    onClick={() => toggle(sp.n)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors',
                      TONE_BOX[tone],
                      tone === 'ok' && 'text-good',
                      tone === 'warn' && 'text-warning',
                      tone === 'bad' && 'text-critical',
                      tone === 'neutral' && 'text-ink-3 hover:text-ink-2',
                      !isOn && tone !== 'neutral' && 'border-dashed',
                      locked && 'opacity-55'
                    )}
                  >
                    <span className="relative shrink-0">
                      <SpecIcon n={sp.n} size={20} dim={!isOn} />
                      {isOn && <Check size={11} strokeWidth={3} className="absolute -right-1 -bottom-1 rounded-full bg-good text-bg" />}
                    </span>
                    {!compact && <span className="min-w-0 flex-1 truncate">{label.main}</span>}
                    {compact && <span className="tnum text-[11px] font-semibold">{sp.n}</span>}
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

/** Стигма «по ситуации» (гайд не держит её надетой) — не ругаем за уровень. */
const situational = (s: SkillReport) => s.target?.role === 'situational' || (s.target?.role === 'stigma' && s.target.equip === false)

/** Строки стигм / пассивок / остальных: иконка, название, уровень с вердиктом, у стигм — открытые варианты. */
function SkillTable({ rows, ctx, stigma }: { rows: SkillReport[]; ctx: Ctx; stigma?: boolean }) {
  const { namer, report } = ctx
  return (
    <div className="-mx-2">
      {rows.map((s) => {
        const verdict = s.target ? skillTone(s, report.specsUncertain) : { tone: 'neutral' as Tone, why: 'Гайд не делает ставку на это умение.' }
        const specs = stigma ? skillSpecs(s.skill).filter((sp) => sp.level !== null) : []
        return (
          <div key={s.skill} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
            <Tooltip content={verdict.why} wide>
              <SkillIcon id={s.skill} size={32} tone={verdict.tone} dim={!s.learned} />
            </Tooltip>
            <div className="min-w-0 flex-1">
              <Tooltip content={verdict.why} wide>
                <Name label={namer.skill(s.skill)} className="text-[13px]" />
              </Tooltip>
              {s.target?.note && <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-3">{s.target.note}</div>}
              {specs.length > 0 && s.learned && (
                <div className="mt-1 flex gap-1">
                  {specs.map((sp) => {
                    const active = (sp.level ?? 99) <= s.level
                    return (
                      <Tooltip
                        key={sp.n}
                        content={
                          <>
                            <b className="text-ink">{namer.spec(s.skill, sp.n).main}</b>
                            <span className={cn('mt-1 block', active ? 'text-good' : 'text-ink-3')}>
                              {active ? `Работает — открылся сам на ур. ${sp.level}.` : `Откроется на ур. ${sp.level}.`}
                            </span>
                          </>
                        }
                      >
                        <SpecIcon n={sp.n} stigma size={16} dim={!active} />
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>
            {stigma && (
              <Tooltip content={s.equipped ? 'Стигма в наборе.' : 'Стигма изучена, но не в наборе.'}>
                <span className={cn('shrink-0 text-[11px]', s.equipped ? 'text-good' : 'text-ink-3')}>{s.equipped ? 'надета' : 'не надета'}</span>
              </Tooltip>
            )}
            <Tooltip content={s.target ? levelTone(s).why : 'Гайд не задаёт уровень этого умения.'} wide>
              <span className="tnum w-20 shrink-0 text-right text-[13px]">
                <span className={s.target && !situational(s) ? TONE_TEXT[levelTone(s).tone] : s.learned ? 'text-ink-2' : 'text-ink-3'}>
                  {s.learned ? `ур. ${s.level}` : '—'}
                </span>
                {s.targetLevel ? <span className="text-ink-3"> / {s.targetLevel}</span> : null}
              </span>
            </Tooltip>
          </div>
        )
      })}
    </div>
  )
}
