import { FileSearch, FolderOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/misc'
import { api, isWebMode, useApp } from '@/lib/store'
import { t } from '@shared/i18n'

/** Экран, когда персонажа ещё нет: объясняет, откуда берутся данные и что сделать. */
export function NoData() {
  const source = useApp((s) => s.source)
  const reload = useApp((s) => s.reload)
  const setSource = useApp((s) => s.setSource)
  const pick = async () => {
    const s = await api.source.pick()
    if (s) setSource(s)
  }
  const hasFile = source?.exists
  return (
    <div className="mx-auto max-w-2xl pt-16">
      <EmptyState
        icon={<FileSearch size={36} />}
        title={hasFile ? t('В файле оверлея пока нет персонажа с подробными данными') : t('Не нашёл данные оверлея Questlog')}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" icon={<RefreshCw size={14} />} onClick={() => void reload()}>
              {t('Проверить снова')}
            </Button>
            {!isWebMode && (
              <Button icon={<FolderOpen size={14} />} onClick={() => void pick()}>
                {t('Указать файл вручную')}
              </Button>
            )}
          </div>
        }
      >
        <p>
          {t('Приложение берёт персонажа из файла, который ведёт оверлей')} <b className="text-ink-2">Questlog</b>{' '}
          {t('для AION 2: шмот, арканы, умения, Даэванион, питомцы и статы. Сам оверлей обновляет файл, пока игра запущена — обычно при смене зоны.')}
        </p>
        <ol className="mt-4 space-y-1.5 text-left">
          <li>{t('1. Установите и запустите оверлей Questlog, зайдите в игру персонажем.')}</li>
          <li>{t('2. Смените зону (телепорт, вход в данж) — оверлей «считает» персонажа.')}</li>
          <li>{t('3. Вернитесь сюда — данные подтянутся сами.')}</li>
        </ol>
        {source?.path && (
          <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-left font-mono text-[11px] break-all text-ink-3">
            {source.path}
            {source.error ? ` — ${source.error}` : hasFile ? '' : t(' — файла нет')}
          </p>
        )}
      </EmptyState>
    </div>
  )
}
