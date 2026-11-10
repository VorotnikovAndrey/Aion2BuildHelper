import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Check, ChevronDown, Copy, Download, ExternalLink, Flag, Heart, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { CLASSES, classInfo } from '@shared/gamedata/classes'
import { applyStage, pickStage, sortedStages } from '@shared/guide/stages'
import { titleDef } from '@shared/gamedata/titles'
import { emptyGuide, MODE_LABEL, ROLE_LABEL, type Guide, type GuideSource, type GuideStage } from '@shared/guide/types'
import type { ClassKey } from '@shared/types'
import { TitleEmblem } from '@/components/art'
import { titleName } from '@/components/collections'
import { ClassIcon } from '@/components/game'
import { SkillIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal, PageHeader } from '@/components/ui/misc'
import { Tooltip } from '@/components/ui/InfoTip'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useNamer } from '@/lib/report'
import { api, useActiveGuide, useApp, useCharacter, useCharacterPrefs, useGuides } from '@/lib/store'
import { intlLocale, t } from '@shared/i18n'
import { term } from '@shared/names'

export function GuidesPage() {
  const guides = useGuides()
  const char = useCharacter()
  const active = useActiveGuide(char)
  const [cls, setCls] = useState<ClassKey>(char?.cls ?? guides[0]?.cls ?? 'templar')
  const ofClass = useMemo(() => guides.filter((g) => g.cls === cls), [guides, cls])
  const builtin = ofClass.filter((g) => g.builtin)
  const custom = ofClass.filter((g) => !g.builtin)
  const [selectedId, setSelectedId] = useState<string | null>(active?.id ?? null)
  const selected = ofClass.find((g) => g.id === selectedId) ?? (active?.cls === cls ? active : undefined) ?? ofClass[0]
  const counts = useMemo(() => new Map(CLASSES.map((c) => [c.key, guides.filter((g) => g.cls === c.key).length])), [guides])
  const pickClass = (c: ClassKey) => {
    setCls(c)
    setSelectedId(null)
  }
  const saveGuide = useApp((s) => s.saveGuide)
  const removeGuide = useApp((s) => s.removeGuide)
  const importGuide = useApp((s) => s.importGuide)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Guide | null>(null)

  const duplicate = async (g: Guide) => {
    const copy = await saveGuide({ ...g, id: `guide-${Date.now()}`, name: t('{g} (моя версия)', { g: g.name }), builtin: undefined })
    navigate(`/guides/${copy.id}/edit`)
  }
  const create = async () => {
    const g = await saveGuide({ ...emptyGuide(cls, `guide-${Date.now()}`) })
    navigate(`/guides/${g.id}/edit`)
  }
  const doImport = async () => {
    setError(null)
    try {
      const g = await importGuide()
      if (g) {
        setCls(g.cls)
        setSelectedId(g.id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      <PageHeader
        icon={<BookOpen size={22} />}
        title={t('Гайды')}
        subtitle={t(
          'Гайд — это цель, с которой приложение сравнивает персонажа: нужные умения и специализации, приоритеты статов, арканы, узлы досок. Формат свой и не зависит от сайта: можно взять встроенный, скопировать и поправить, собрать с нуля или импортировать файл.'
        )}
        actions={
          <>
            <Button icon={<Upload size={14} />} onClick={() => void doImport()}>
              {t('Импорт')}
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => void create()}>
              {t('Новый гайд')}
            </Button>
          </>
        }
      />
      {error && (
        <div className="mb-4 rounded-xl border border-critical/30 bg-critical-soft px-4 py-3 text-[13px] text-critical">
          {t('Не получилось импортировать: {error}', { error })}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-1.5">
        {CLASSES.map((c) => {
          const n = counts.get(c.key) ?? 0
          const mine = char?.cls === c.key
          return (
            <button
              key={c.key}
              onClick={() => pickClass(c.key)}
              disabled={!n}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] transition-colors disabled:opacity-40',
                cls === c.key ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:bg-surface-2'
              )}
            >
              <ClassIcon cls={c.key} size={18} />
              <span className="font-medium">{term(c)}</span>
              {mine && <span className="text-[10.5px] text-ink-3">{t('ваш')}</span>}
              <span className="tnum rounded-full bg-surface-3 px-1.5 text-[10.5px] text-ink-2">{n}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          {builtin.length > 0 && (
            <GuideGroup
              title={t('Билды Questlog')}
              hint={t('Пять самых популярных билдов класса на questlog.gg (по лайкам). По умолчанию персонажа ведёт первый.')}
            >
              {builtin.map((g, i) => (
                <GuideRow key={g.id} guide={g} rank={i + 1} selected={selected?.id === g.id} active={active?.id === g.id} onClick={() => setSelectedId(g.id)} />
              ))}
            </GuideGroup>
          )}
          <GuideGroup title={t('Свои')} hint={t('Ваши гайды: копии встроенных, собранные в редакторе или импортированные из файла.')}>
            {custom.map((g) => (
              <GuideRow key={g.id} guide={g} selected={selected?.id === g.id} active={active?.id === g.id} onClick={() => setSelectedId(g.id)} />
            ))}
            {custom.length === 0 && (
              <button
                onClick={() => void create()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-3.5 py-3 text-left text-[12.5px] text-ink-3 hover:border-line-strong hover:text-ink-2"
              >
                <Plus size={14} /> {t('Своих гайдов для класса «{classInfo}» нет — собрать с нуля', { classInfo: term(classInfo(cls)) })}
              </button>
            )}
          </GuideGroup>
        </div>

        {selected && (
          <GuideDetail
            key={selected.id}
            guide={selected}
            charKey={char?.key}
            charGs={char?.gearScore ?? 0}
            isActive={active?.id === selected.id}
            canActivate={!!char && char.cls === selected.cls}
            onActivate={() => char && void setPrefs(char.key, { guideId: selected.id })}
            onDuplicate={() => void duplicate(selected)}
            onEdit={() => navigate(`/guides/${selected.id}/edit`)}
            onExport={() => void api.guides.exportFile(selected)}
            onDelete={() => setConfirmDelete(selected)}
          />
        )}
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={t('Удалить гайд?')}>
        <p className="text-[13px] text-ink-2">
          {t('«{confirmDelete}» удалится из приложения. Если он ещё нужен — сначала сделайте экспорт в файл.', { confirmDelete: confirmDelete?.name })}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            {t('Отмена')}
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 size={14} />}
            onClick={async () => {
              if (confirmDelete) await removeGuide(confirmDelete.id)
              setConfirmDelete(null)
              setSelectedId(null)
            }}
          >
            {t('Удалить')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

/** Группа в списке гайдов: заголовок с подсказкой и строки. */
function GuideGroup({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <Tooltip content={hint}>
        <div className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{title}</div>
      </Tooltip>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

/** Строка гайда: место у Questlog, название, автор, лайки, стадии, регион. */
function GuideRow({ guide, rank, selected, active, onClick }: { guide: Guide; rank?: number; selected: boolean; active: boolean; onClick: () => void }) {
  const src = guide.source
  const questlog = src?.kind === 'questlog'
  const title = questlog ? (src?.title ?? guide.name) : guide.name
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
        selected ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'
      )}
    >
      {rank ? (
        <span className="tnum mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-bold text-ink-2">{rank}</span>
      ) : (
        <ClassIcon cls={guide.cls} size={16} className="mt-1 shrink-0 text-accent" />
      )}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[13px] leading-snug font-semibold">{title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-3">
          {questlog ? (
            <>
              <span>{src?.author}</span>
              <span className="tnum inline-flex items-center gap-0.5">
                <Heart size={10} className="text-critical" /> {src?.likes ?? 0}
              </span>
              {guide.stages?.length ? (
                <span className="inline-flex items-center gap-0.5">
                  <Flag size={10} /> {guide.stages.length}
                </span>
              ) : null}
              {src?.region === 'korea' && <span className="text-warning">{t('Корея')}</span>}
            </>
          ) : (
            <span>
              {t('{MODE_LABEL} · свой', { MODE_LABEL: MODE_LABEL[guide.mode] })}
              {guide.stages?.length ? t(' · стадий: {stagesCount}', { stagesCount: guide.stages.length }) : ''}
            </span>
          )}
        </span>
      </span>
      {active && <Pill tone="good">{t('ведёт')}</Pill>}
    </button>
  )
}

function GuideDetail({
  guide: base,
  charKey,
  charGs,
  isActive,
  canActivate,
  onActivate,
  onDuplicate,
  onEdit,
  onExport,
  onDelete
}: {
  guide: Guide
  charKey?: string
  charGs: number
  isActive: boolean
  canActivate: boolean
  onActivate: () => void
  onDuplicate: () => void
  onEdit: () => void
  onExport: () => void
  onDelete: () => void
}) {
  const n = useNamer()
  const prefs = useCharacterPrefs(charKey)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const target = isActive ? pickStage(base, prefs.stages?.[base.id], charGs) : null
  const [previewId, setPreviewId] = useState<string | null>(null)
  const stages = sortedStages(base)
  const preview = stages.find((s) => s.id === previewId) ?? target ?? (stages.length ? stages[stages.length - 1] : null)
  const guide = applyStage(base, preview)
  const by = (role: string) => guide.skills.filter((s) => s.role === role)
  const questlog = base.source?.kind === 'questlog'
  const [summary, authorText] = splitDescription(base.description)
  const makeTarget = (st: GuideStage) => charKey && void setPrefs(charKey, { stages: { ...(prefs.stages ?? {}), [base.id]: st.id } })
  return (
    <div className="min-w-0 space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{questlog ? (base.source?.title ?? base.name) : base.name}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
              <span>
                {term(classInfo(base.cls))} · {MODE_LABEL[base.mode]}
                {base.source?.author ? ` · ${base.source.author}` : ''}
                {base.source?.date ? ` · ${base.source.date}` : ''}
              </span>
              {questlog && (
                <span className="tnum inline-flex items-center gap-1">
                  <Heart size={11} className="text-critical" /> {base.source?.likes ?? 0}
                </span>
              )}
              {base.source?.region && (
                <Pill tone={REGION[base.source.region].tone} tip={REGION[base.source.region].tip}>
                  {REGION[base.source.region].ru}
                </Pill>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActive ? (
              <Pill tone="good" icon={<Check size={12} />}>
                {t('ведёт персонажа')}
              </Pill>
            ) : (
              <Button variant="primary" size="sm" disabled={!canActivate} onClick={onActivate} title={canActivate ? undefined : t('Гайд для другого класса')}>
                {t('Следовать этому гайду')}
              </Button>
            )}
            {guide.builtin ? (
              <Button size="sm" icon={<Copy size={13} />} onClick={onDuplicate}>
                {t('Скопировать и править')}
              </Button>
            ) : (
              <Button size="sm" icon={<Pencil size={13} />} onClick={onEdit}>
                {t('Изменить')}
              </Button>
            )}
            <Button size="sm" variant="ghost" icon={<Download size={13} />} onClick={onExport}>
              {t('Экспорт')}
            </Button>
            {!guide.builtin && (
              <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={onDelete}>
                {t('Удалить')}
              </Button>
            )}
          </div>
        </div>
        {summary && <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{summary}</p>}
        {authorText && <AuthorText text={authorText} />}
        {base.source?.url && (
          <button
            onClick={() => void api.app.openExternal(base.source!.url!)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            {questlog ? t('Открыть билд на Questlog') : (base.source.title ?? base.source.url)} <ExternalLink size={12} />
          </button>
        )}
        {base.sources && base.sources.length > 1 && <SourceList sources={base.sources} />}
      </Card>

      {stages.length > 0 && (
        <Card
          title={t('Стадии прокачки · {stagesCount}', { stagesCount: stages.length })}
          hint={t(
            'Стадии билда по уровню снаряжения. Нажмите на стадию — ниже покажутся её умения, титулы и цели досок. Целевую стадию для персонажа выбирают здесь или рядом с выбором гайда на страницах билда.'
          )}
        >
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {stages.map((st) => {
              const isTarget = target?.id === st.id
              const shown = preview?.id === st.id
              const done = st.gearScore !== undefined && st.gearScore <= charGs
              return (
                <div
                  key={st.id}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors',
                    shown ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface-2/40 hover:border-line-strong'
                  )}
                >
                  <button onClick={() => setPreviewId(st.id)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-1.5">
                      {st.gearScore ? (
                        <span className="tnum shrink-0 text-[11px] font-semibold text-accent-2">{st.gearScore.toLocaleString(intlLocale())} GS</span>
                      ) : null}
                      {isTarget && <Flag size={11} className="shrink-0 text-accent" />}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug">{st.name}</span>
                    <span className="mt-0.5 block text-[10.5px] text-ink-3">
                      {[...(st.tags ?? []), done ? t('пройдена по GS') : ''].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                  {isActive &&
                    (isTarget ? (
                      <Pill tone="accent" tip={t('С этой стадией сейчас сравнивается персонаж.')}>
                        {t('цель')}
                      </Pill>
                    ) : (
                      <Tooltip content={t('Сравнивать персонажа с этой стадией.')}>
                        <button onClick={() => makeTarget(st)} className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-accent hover:bg-surface-3">
                          {t('сделать целью')}
                        </button>
                      </Tooltip>
                    ))}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        <Card title={preview ? t('Умения · {preview}', { preview: preview.name }) : t('Умения')}>
          {(['core', 'support', 'stigma', 'passive'] as const).map((role) =>
            by(role).length ? (
              <div key={role} className="mb-3 last:mb-0">
                <div className="mb-1.5 text-[11px] text-ink-3">{ROLE_LABEL[role]}</div>
                <div className="flex flex-wrap gap-1.5">
                  {by(role).map((s) => (
                    <Pill
                      key={s.skill}
                      tone={role === 'core' ? 'accent' : role === 'stigma' && s.equip === false ? 'neutral' : 'aether'}
                      icon={<SkillIcon id={s.skill} size={14} />}
                      tip={s.note ?? n.skill(s.skill).alt}
                    >
                      {n.skill(s.skill).main}
                      {s.level ? t(' · ур. {level}', { level: s.level }) : ''}
                      {s.specs?.length ? t(' · спец. {specs}', { specs: s.specs.join(', ') }) : ''}
                    </Pill>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </Card>
        <Card title={t('Главные статы')}>
          <div className="flex flex-wrap gap-1.5">
            {guide.stats
              .filter((s) => s.weight >= 4)
              .map((s) => (
                <Pill key={s.stat} tone={s.weight === 5 ? 'accent' : 'neutral'}>
                  {n.stat(s.stat).main}
                </Pill>
              ))}
          </div>
          {guide.stats.some((s) => s.note) && <p className="mt-3 text-xs text-ink-3">{guide.stats.find((s) => s.note)?.note}</p>}
        </Card>
        {guide.rotation && guide.rotation.length > 0 && (
          <Card title={t('Ротация')}>
            <ol className="space-y-1.5 text-[13px] text-ink-2">
              {guide.rotation.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="tnum w-4 shrink-0 text-ink-3">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ol>
          </Card>
        )}
        {guide.tips && guide.tips.length > 0 && (
          <Card title={t('Советы')}>
            <div className="space-y-3">
              {guide.tips.map((t, i) => (
                <div key={i}>
                  <div className="text-[13px] font-medium">{t.title}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{t.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
        {guide.titles && (
          <Card
            title={t('Титулы')}
            hint={t('Какие титулы надевать — по порядку предпочтения. На странице «Питомцы и коллекции» видно, какие из них уже собраны.')}
          >
            <div className="space-y-3">
              {(
                [
                  ['attack', t('Атака')],
                  ['defense', t('Защита')],
                  ['utility', t('Другое')]
                ] as const
              ).map(([key, ru]) =>
                guide.titles?.[key]?.length ? (
                  <div key={key}>
                    <div className="mb-1.5 text-[11px] text-ink-3">{ru}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {guide.titles[key]!.map((id, i) => {
                        const t = titleDef(id)
                        return (
                          <Pill
                            key={id}
                            tone={i === 0 ? 'accent' : 'neutral'}
                            icon={t ? <TitleEmblem category={t.category} grade={t.grade} size={14} /> : undefined}
                          >
                            {t ? titleName(t) : `#${id}`}
                          </Pill>
                        )
                      })}
                    </div>
                  </div>
                ) : null
              )}
              {guide.titles.notes && <p className="text-xs leading-relaxed text-ink-3">{guide.titles.notes}</p>}
            </div>
          </Card>
        )}
        {guide.daevanion.goals.length > 0 && (
          <Card title={t('Цели Даэваниона')}>
            <div className="space-y-2.5">
              {guide.daevanion.goals.map((g) => (
                <div key={g.id}>
                  <div className="text-[13px] font-medium">{g.name}</div>
                  {g.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{g.description}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

const REGION: Record<NonNullable<GuideSource['region']>, { ru: string; tip: string; tone: 'good' | 'warning' | 'neutral' }> = {
  global: { ru: t('глобальная'), tip: t('Писался для глобальной версии — как у вас.'), tone: 'good' },
  korea: {
    ru: t('Корея / Тайвань'),
    tip: t('Основан на корейской или тайваньской версии: числа и набор стигм могут отличаться от глобальной.'),
    tone: 'warning'
  },
  mixed: { ru: t('смешанно'), tip: t('Собран из источников разных версий игры.'), tone: 'neutral' }
}

/** Источники сводного гайда: откуда что взято и для какой версии игры. */
function SourceList({ sources }: { sources: GuideSource[] }) {
  return (
    <div className="mt-4 border-t border-line pt-3">
      <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
        {t('Источники ({sourcesCount})', { sourcesCount: sources.length })}
      </div>
      <div className="space-y-1">
        {sources.map((src, i) => (
          <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {src.url ? (
              <button onClick={() => void api.app.openExternal(src.url!)} className="inline-flex items-center gap-1 text-accent hover:underline">
                {src.title ?? src.url} <ExternalLink size={11} />
              </button>
            ) : (
              <span className="text-ink-2">{src.title}</span>
            )}
            {src.date && <span className="tnum text-ink-3">{src.date}</span>}
            {src.kind === 'data' && (
              <Pill tone="aether" tip={t('Не статья, а статистика: что реально носят игроки.')}>
                {t('данные игроков')}
              </Pill>
            )}
            {src.region && (
              <Pill tone={REGION[src.region].tone} tip={REGION[src.region].tip}>
                {REGION[src.region].ru}
              </Pill>
            )}
            {src.note && (
              <Tooltip content={src.note}>
                <span className="text-ink-3 underline decoration-dotted underline-offset-2">{t('заметка')}</span>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Описание встроенного гайда: наша строка сверху, текст автора после «Описание автора:». */
function splitDescription(text?: string): [string | undefined, string | undefined] {
  if (!text) return [undefined, undefined]
  const mark = t('Описание автора:')
  const i = text.indexOf(mark)
  if (i < 0) return [text, undefined]
  // Пустые строки между абзацами автора — лишние в свёрнутом виде
  const author = text
    .slice(i + mark.length)
    .replace(/\n\s*\n+/g, '\n')
    .trim()
  return [text.slice(0, i).trim() || undefined, author || undefined]
}

/** Текст автора билда — как есть (обычно по-английски), свёрнут до нескольких строк. */
function AuthorText({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 280
  return (
    <div className="mt-3 rounded-xl border border-line bg-surface-2/40 px-3.5 py-3">
      <div className="mb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{t('Описание автора')}</div>
      <p className={cn('text-[12.5px] leading-relaxed whitespace-pre-line text-ink-2', !open && long && 'line-clamp-4')}>{text}</p>
      {long && (
        <button onClick={() => setOpen((v) => !v)} className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent hover:underline">
          {open ? t('Свернуть') : t('Показать полностью')}
          <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}
