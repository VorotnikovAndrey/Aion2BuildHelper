import { FileSearch, FolderOpen, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/misc'
import { api, isWebMode, useApp } from '@/lib/store'

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
        title={hasFile ? 'В файле оверлея пока нет персонажа с подробными данными' : 'Не нашёл данные оверлея Questlog'}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" icon={<RefreshCw size={14} />} onClick={() => void reload()}>
              Проверить снова
            </Button>
            {!isWebMode && (
              <Button icon={<FolderOpen size={14} />} onClick={() => void pick()}>
                Указать файл вручную
              </Button>
            )}
          </div>
        }
      >
        <p>
          Приложение берёт персонажа из файла, который ведёт оверлей <b className="text-ink-2">Questlog</b> для AION 2: шмот, арканы, умения, Даэванион, питомцы
          и статы. Сам оверлей обновляет файл, пока игра запущена — обычно при смене зоны.
        </p>
        <ol className="mt-4 space-y-1.5 text-left">
          <li>1. Установите и запустите оверлей Questlog, зайдите в игру персонажем.</li>
          <li>2. Смените зону (телепорт, вход в данж) — оверлей «считает» персонажа.</li>
          <li>3. Вернитесь сюда — данные подтянутся сами.</li>
        </ol>
        {source?.path && (
          <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-left font-mono text-[11px] break-all text-ink-3">
            {source.path}
            {source.error ? ` — ${source.error}` : hasFile ? '' : ' — файла нет'}
          </p>
        )}
      </EmptyState>
    </div>
  )
}
