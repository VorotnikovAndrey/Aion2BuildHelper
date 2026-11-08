import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Check, Copy, Download, ExternalLink, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { classInfo } from '@shared/gamedata/classes'
import { emptyGuide, MODE_LABEL, ROLE_LABEL, type Guide } from '@shared/guide/types'
import { ClassIcon } from '@/components/game'
import { SkillIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal, PageHeader } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/format'
import { useNamer } from '@/lib/report'
import { api, useActiveGuide, useApp, useCharacter, useGuides } from '@/lib/store'

export function GuidesPage() {
  const guides = useGuides()
  const char = useCharacter()
  const active = useActiveGuide(char)
  const [selectedId, setSelectedId] = useState<string | null>(active?.id ?? guides[0]?.id ?? null)
  const selected = guides.find((g) => g.id === selectedId) ?? guides[0]
  const saveGuide = useApp((s) => s.saveGuide)
  const removeGuide = useApp((s) => s.removeGuide)
  const importGuide = useApp((s) => s.importGuide)
  const setPrefs = useApp((s) => s.updateCharacterPrefs)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Guide | null>(null)

  const duplicate = async (g: Guide) => {
    const copy = await saveGuide({ ...g, id: `guide-${Date.now()}`, name: `${g.name} (моя версия)`, builtin: undefined })
    navigate(`/guides/${copy.id}/edit`)
  }
  const create = async () => {
    const g = await saveGuide({ ...emptyGuide(char?.cls ?? 'templar', `guide-${Date.now()}`) })
    navigate(`/guides/${g.id}/edit`)
  }
  const doImport = async () => {
    setError(null)
    try {
      const g = await importGuide()
      if (g) setSelectedId(g.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <>
      <PageHeader
        icon={<BookOpen size={22} />}
        title="Гайды"
        subtitle="Гайд — это цель, с которой приложение сравнивает персонажа: нужные умения и специализации, приоритеты статов, арканы, узлы досок. Формат свой и не зависит от сайта: можно взять встроенный, скопировать и поправить, собрать с нуля или импортировать файл."
        actions={
          <>
            <Button icon={<Upload size={14} />} onClick={() => void doImport()}>
              Импорт
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => void create()}>
              Новый гайд
            </Button>
          </>
        }
      />
      {error && (
        <div className="mb-4 rounded-xl border border-critical/30 bg-critical-soft px-4 py-3 text-[13px] text-critical">
          Не получилось импортировать: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-2">
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                selected?.id === g.id ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong'
              )}
            >
              <ClassIcon cls={g.cls} size={16} className="mt-0.5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{g.name}</span>
                <span className="mt-0.5 block text-[11px] text-ink-3">
                  {classInfo(g.cls)?.ru} · {MODE_LABEL[g.mode]} · {g.builtin ? 'встроенный' : 'свой'}
                </span>
              </span>
              {active?.id === g.id && <Pill tone="good">активный</Pill>}
            </button>
          ))}
        </div>

        {selected && (
          <GuideDetail
            guide={selected}
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

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Удалить гайд?">
        <p className="text-[13px] text-ink-2">«{confirmDelete?.name}» удалится из приложения. Если он ещё нужен — сначала сделайте экспорт в файл.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Отмена
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
            Удалить
          </Button>
        </div>
      </Modal>
    </>
  )
}

function GuideDetail({
  guide,
  isActive,
  canActivate,
  onActivate,
  onDuplicate,
  onEdit,
  onExport,
  onDelete
}: {
  guide: Guide
  isActive: boolean
  canActivate: boolean
  onActivate: () => void
  onDuplicate: () => void
  onEdit: () => void
  onExport: () => void
  onDelete: () => void
}) {
  const n = useNamer()
  const by = (role: string) => guide.skills.filter((s) => s.role === role)
  return (
    <div className="min-w-0 space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{guide.name}</h2>
            <p className="mt-1 text-xs text-ink-3">
              {classInfo(guide.cls)?.ru} · {MODE_LABEL[guide.mode]}
              {guide.source?.author ? ` · ${guide.source.author}` : ''}
              {guide.source?.date ? ` · ${guide.source.date}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActive ? (
              <Pill tone="good" icon={<Check size={12} />}>
                ведёт персонажа
              </Pill>
            ) : (
              <Button variant="primary" size="sm" disabled={!canActivate} onClick={onActivate} title={canActivate ? undefined : 'Гайд для другого класса'}>
                Следовать этому гайду
              </Button>
            )}
            {guide.builtin ? (
              <Button size="sm" icon={<Copy size={13} />} onClick={onDuplicate}>
                Скопировать и править
              </Button>
            ) : (
              <Button size="sm" icon={<Pencil size={13} />} onClick={onEdit}>
                Изменить
              </Button>
            )}
            <Button size="sm" variant="ghost" icon={<Download size={13} />} onClick={onExport}>
              Экспорт
            </Button>
            {!guide.builtin && (
              <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={onDelete}>
                Удалить
              </Button>
            )}
          </div>
        </div>
        {guide.description && <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{guide.description}</p>}
        {guide.source?.url && (
          <button
            onClick={() => void api.app.openExternal(guide.source!.url!)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            {guide.source.title ?? guide.source.url} <ExternalLink size={12} />
          </button>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        <Card title="Умения">
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
                      {s.level ? ` · ур. ${s.level}` : ''}
                      {s.specs?.length ? ` · спец. ${s.specs.join(', ')}` : ''}
                    </Pill>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </Card>
        <Card title="Главные статы">
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
          <Card title="Ротация">
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
          <Card title="Советы">
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
        {guide.daevanion.goals.length > 0 && (
          <Card title="Цели Даэваниона">
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
