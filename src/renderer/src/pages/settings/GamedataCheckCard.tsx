// Настройки → «Справочники игры»: когда собраны и что изменилось на metabot.gg после патча.

import { useEffect, useState } from 'react'
import { RefreshCw, SearchCheck } from 'lucide-react'
import type { GamedataCheckResult } from '@shared/api'
import { AREA_RU, GAMEDATA_BUILT_AT, type GamedataArea } from '@shared/gamedata/diff'
import type { ClassKey } from '@shared/types'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { dateTime } from '@/lib/format'
import { api, isWebMode } from '@/lib/store'
import { t } from '@shared/i18n'

export function GamedataCheckCard({ cls }: { cls: ClassKey | null }) {
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null)
  const [result, setResult] = useState<GamedataCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => api.gamedata.onProgress(setProgress), [])

  const run = async () => {
    if (!cls) return
    setError(null)
    setResult(null)
    setProgress({ done: 0, total: 1, label: t('Начинаю') })
    try {
      setResult(await api.gamedata.check(cls))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setProgress(null)
    }
  }

  const important = result?.changes.filter((c) => c.important) ?? []
  const minor = result?.changes.filter((c) => !c.important) ?? []
  const byArea = (list: typeof important) => {
    const map = new Map<GamedataArea, string[]>()
    for (const c of list) map.set(c.area, [...(map.get(c.area) ?? []), c.text])
    return [...map.entries()]
  }

  return (
    <Card
      title={t('Справочники игры')}
      className="xl:col-span-2"
      hint={t(
        'Умения, специализации, доски Даэваниона, арканы, титулы и данные топ-игроков приложение берёт с публичных страниц metabot.gg. После патча игры проверьте, не изменилось ли что-то: приложение скачает свежие страницы (около минуты, с паузами между запросами) и сравнит. Само оно справочники не перезаписывает.'
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-ink-2">
          {t('Справочники собраны')} <b className="text-ink">{GAMEDATA_BUILT_AT}</b>
        </span>
        <Button
          size="sm"
          icon={progress ? <RefreshCw size={13} className="animate-spin" /> : <SearchCheck size={14} />}
          disabled={!!progress || isWebMode || !cls}
          onClick={() => void run()}
        >
          {progress ? t('Проверяю…') : t('Проверить обновления')}
        </Button>
        {isWebMode && <span className="text-[11px] text-ink-3">{t('Только в приложении — в браузере сайт не отдаёт страницы.')}</span>}
      </div>

      {progress && (
        <div className="mt-3 max-w-md">
          <ProgressBar value={(progress.done / Math.max(1, progress.total)) * 100} color="var(--color-accent)" />
          <div className="tnum mt-1 text-[11px] text-ink-3">
            {t('{done} из {total} · {progress}', { done: progress.done, total: progress.total, progress: progress.label })}
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-critical">{error}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-[13px]">
            <StatusBadge tone={important.length ? 'warn' : 'ok'} size={16} />
            {important.length
              ? t('Изменилось важное для билда: {importantCount}. Справочники стоит пересобрать.', { importantCount: important.length })
              : t('Умения, специализации, доски и арканы не изменились — справочники актуальны.')}
            <span className="text-[11px] text-ink-3">{t('· проверено {dateTime}', { dateTime: dateTime(Date.parse(result.checkedAt)) })}</span>
          </div>
          {byArea(important).map(([area, texts]) => (
            <div key={area}>
              <div className="mb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{AREA_RU[area]}</div>
              <ul className="space-y-0.5 text-xs text-ink-2">
                {texts.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          ))}
          {minor.length > 0 && (
            <details className="text-xs text-ink-3">
              <summary className="cursor-pointer hover:text-ink-2">{t('Прочее (меняется каждый день): {minorCount}', { minorCount: minor.length })}</summary>
              <ul className="mt-1 space-y-0.5">
                {minor.map((c, i) => (
                  <li key={i}>
                    {AREA_RU[c.area]}: {c.text}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {important.length > 0 && (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-ink-3">
              {t('Пересобрать справочники:')} <code className="text-ink-2">npm run gamedata -- --refresh</code>
              {t(', затем перезапустить приложение. Сводный гайд после крупных изменений тоже стоит перепроверить.')}
            </p>
          )}
          {result.errors.length > 0 && (
            <p className="text-[11px] text-warning">
              {t('Не удалось проверить:')} {result.errors.join('; ')}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
