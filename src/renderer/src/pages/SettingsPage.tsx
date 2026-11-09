import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FolderOpen, PartyPopper, RefreshCw, RotateCcw, Settings } from 'lucide-react'
import type { ProgressEvent } from '@shared/analysis/progress'
import { CELEBRATE_EVENT, showNotification } from '@/components/Celebrations'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader, Segmented, Tabs } from '@/components/ui/misc'
import { Pill } from '@/components/ui/Pill'
import { ago, cn, compact } from '@/lib/format'
import { api, isWebMode, useApp, useCharacter } from '@/lib/store'
import { AppearanceSection } from './settings/AppearanceSection'
import { NamesSection } from './settings/NamesSection'
import { GamedataCheckCard } from './settings/GamedataCheckCard'
import { UpdatesCard } from './settings/UpdatesCard'

type Tab = 'general' | 'names' | 'appearance'

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
  const raw = params.get('tab')
  const tab: Tab = raw === 'appearance' || raw === 'names' ? raw : 'general'

  return (
    <>
      <PageHeader icon={<Settings size={22} />} title="Настройки" />
      <div className="mb-5">
        <Tabs<Tab>
          value={tab}
          onChange={(t) => setParams(t === 'general' ? {} : { tab: t }, { replace: true })}
          items={[
            { id: 'general', label: 'Данные' },
            { id: 'names', label: 'Названия' },
            { id: 'appearance', label: 'Оформление' }
          ]}
        />
      </div>
      {tab === 'appearance' ? (
        <AppearanceSection />
      ) : tab === 'names' ? (
        <NamesSection />
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

          <Card
            title="Уведомления"
            hint="Когда оверлей присылает свежие данные, приложение сравнивает персонажа «до» и «после» и празднует прогресс: взятый порог меткости, умение на уровне гайда, новая вещь, рост оценки. Всплывашка с искрами — всегда, уведомление Windows — если включено."
          >
            <Segmented<'on' | 'off'>
              value={settings.notifications === false ? 'off' : 'on'}
              onChange={(v) => void update({ notifications: v === 'on' })}
              items={[
                { id: 'on', label: 'Уведомления Windows включены' },
                { id: 'off', label: 'Только в приложении' }
              ]}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                icon={<PartyPopper size={14} />}
                onClick={() => {
                  const sample: ProgressEvent[] = [
                    {
                      id: `demo-${Date.now()}`,
                      kind: 'threshold',
                      title: 'Порог взят: Меткость в PvE — Трансцендентность 4',
                      text: 'Пример: так выглядит празднование.'
                    },
                    { id: `demo2-${Date.now()}`, kind: 'score', title: 'Оценка билда 65 → 67' }
                  ]
                  window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: sample }))
                  if (settings.notifications !== false) showNotification(sample)
                }}
              >
                Показать пример
              </Button>
              {isWebMode && <span className="text-[11px] text-ink-3">В браузерном режиме уведомлений Windows нет — только всплывашки.</span>}
            </div>
          </Card>

          <UpdatesCard />

          <GamedataCheckCard cls={char?.cls ?? null} />

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
