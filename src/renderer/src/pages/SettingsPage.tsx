import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FolderOpen, RefreshCw, RotateCcw, Settings } from 'lucide-react'
import { classSkills } from '@shared/gamedata/skills'
import { skillDef } from '@shared/gamedata/skills'
import type { NameMode } from '@shared/names'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader, Segmented, Tabs } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ago, cn, compact } from '@/lib/format'
import { api, isWebMode, useApp, useCharacter } from '@/lib/store'
import { AppearanceSection } from './settings/AppearanceSection'

type Tab = 'general' | 'appearance'

export function SettingsPage() {
  const source = useApp((s) => s.source)
  const settings = useApp((s) => s.settings)
  const update = useApp((s) => s.updateSettings)
  const reload = useApp((s) => s.reload)
  const setSource = useApp((s) => s.setSource)
  const char = useCharacter()
  const [version, setVersion] = useState('')
  useEffect(() => {
    void api.app.version().then(setVersion)
  }, [])

  const roster = source?.data?.characters ?? []
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'appearance' ? 'appearance' : 'general'

  return (
    <>
      <PageHeader icon={<Settings size={22} />} title="Настройки" />
      <div className="mb-5">
        <Tabs<Tab>
          value={tab}
          onChange={(t) => setParams(t === 'general' ? {} : { tab: t }, { replace: true })}
          items={[
            { id: 'general', label: 'Данные и названия' },
            { id: 'appearance', label: 'Оформление' }
          ]}
        />
      </div>
      {tab === 'appearance' ? (
        <AppearanceSection />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card
            title="Источник данных"
            hint="Приложение читает файл оверлея Questlog и само подхватывает изменения. В игру оно не лезет и ничего не отправляет."
          >
            <div className="flex items-center gap-2">
              <Pill tone={source?.exists && !source.error ? 'good' : 'critical'}>
                {source?.exists ? (source.error ? 'ошибка чтения' : 'файл найден') : 'файла нет'}
              </Pill>
              {source?.modifiedAt && <span className="text-xs text-ink-3">обновлён {ago(source.modifiedAt)}</span>}
              {source?.custom && <Pill tone="accent">свой путь</Pill>}
            </div>
            <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 font-mono text-[11px] break-all text-ink-3 select-text">{source?.path}</p>
            {source?.error && <p className="mt-2 text-xs text-critical">{source.error}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button icon={<RefreshCw size={14} />} onClick={() => void reload()}>
                Перечитать
              </Button>
              {!isWebMode && (
                <>
                  <Button
                    icon={<FolderOpen size={14} />}
                    onClick={async () => {
                      const s = await api.source.pick()
                      if (s) setSource(s)
                    }}
                  >
                    Выбрать файл…
                  </Button>
                  {source?.custom && (
                    <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={async () => setSource(await api.source.reset())}>
                      Стандартный путь
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          <Card title="Названия" hint="Английские названия — официальные из клиента игры. Русские — перевод приложения; любое можно заменить своим ниже.">
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
              {settings.nameMode === 'both' && <span className="ml-1 text-[11px]">(Judgment)</span>} — английский вариант удобен, когда сверяетесь с
              англоязычным гайдом.
            </p>
          </Card>

          {char?.cls && (
            <Card
              title="Свои названия умений"
              className="xl:col-span-2"
              hint="Если в вашем клиенте умение называется иначе — впишите своё название. Пусто — название приложения."
            >
              <SkillRenames cls={char.cls} />
            </Card>
          )}

          <Card title="Персонажи" hint="Скрытые персонажи не показываются в переключателе (например, твинки первого уровня).">
            <div className="-mx-2">
              {roster.map((c) => {
                const hidden = settings.hiddenCharacters.includes(c.key)
                return (
                  <label key={c.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={!hidden}
                      onChange={(e) =>
                        void update({
                          hiddenCharacters: e.target.checked ? settings.hiddenCharacters.filter((k) => k !== c.key) : [...settings.hiddenCharacters, c.key]
                        })
                      }
                      className="accent-[var(--color-accent)]"
                    />
                    <span className={cn('flex-1', hidden && 'text-ink-3')}>{c.name}</span>
                    <span className="tnum text-xs text-ink-3">
                      ур. {c.level} · БМ {compact(c.combatPower)}
                    </span>
                  </label>
                )
              })}
            </div>
          </Card>

          <Card title="О приложении">
            <p className="text-[13px] text-ink-2">Aion2 Build Helper {version && `v${version}`}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              Данные персонажа — из оверлея Questlog. Справочники (умения, специализации, доски Даэваниона, пулы аркан) собраны из клиента глобальной версии
              через metabot.gg и лежат внутри приложения — интернет для работы не нужен. Обновить справочники:{' '}
              <code className="text-ink-2">npm run gamedata</code>.
            </p>
            {!isWebMode && (
              <Button className="mt-4" icon={<FolderOpen size={14} />} onClick={() => void api.app.openDataFolder()}>
                Папка с данными приложения
              </Button>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

function SkillRenames({ cls }: { cls: NonNullable<ReturnType<typeof useCharacter>>['cls'] }) {
  const settings = useApp((s) => s.settings)
  const update = useApp((s) => s.updateSettings)
  const skills = classSkills(cls!)
  const set = (id: number, value: string) => {
    const next = { ...settings.names.skills }
    if (value.trim()) next[id] = value.trim()
    else delete next[id]
    void update({ names: { ...settings.names, skills: next } })
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 md:grid-cols-2 2xl:grid-cols-3">
      {skills.map((s) => {
        const def = skillDef(s.id)!
        return (
          <label key={s.id} className="flex items-center gap-2">
            <span className="w-40 shrink-0 truncate text-xs text-ink-3" title={def.en}>
              {def.en}
            </span>
            <input
              defaultValue={settings.names.skills?.[s.id] ?? ''}
              placeholder={def.ru ?? def.en}
              onBlur={(e) => set(s.id, e.target.value)}
              className="h-8 min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-accent"
            />
          </label>
        )
      })}
    </div>
  )
}
