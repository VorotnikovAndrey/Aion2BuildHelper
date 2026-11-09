// Настройки → «Обновления»: версия, проверка, скачивание и установка новой версии.

import { useState } from 'react'
import { Download, RefreshCw, RotateCw } from 'lucide-react'
import type { UpdateState } from '@shared/updates'
import { StatusBadge, type BadgeKind } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { ago } from '@/lib/format'
import { api, useApp } from '@/lib/store'
import { useUpdates } from '@/lib/updates'

/** Подпись и значок состояния — статус не только цветом. */
export function updateStatus(s: UpdateState): { label: string; tone: BadgeKind } {
  const v = s.version ?? ''
  switch (s.phase) {
    case 'unsupported':
      return { label: 'Запущено не из установщика — обновления не проверяются', tone: 'info' }
    case 'idle':
      return { label: 'Ещё не проверяли', tone: 'info' }
    case 'checking':
      return { label: 'Проверяю…', tone: 'info' }
    case 'latest':
      return { label: 'Последняя версия', tone: 'ok' }
    case 'available':
      return { label: `Есть версия ${v}`, tone: 'warn' }
    case 'downloading':
      return { label: `Скачиваю версию ${v}`, tone: 'info' }
    case 'ready':
      return { label: `Версия ${v} скачана — установится при перезапуске`, tone: 'ok' }
    case 'error':
      return { label: 'Не удалось проверить', tone: 'warn' }
  }
}

const mb = (bytes: number) => Math.round(bytes / 1024 / 1024).toLocaleString('ru-RU')

export function UpdatesCard() {
  const state = useUpdates((s) => s.state)
  const auto = useApp((s) => s.settings.autoUpdate !== false)
  const [busy, setBusy] = useState(false)
  const status = updateStatus(state)
  const supported = state.phase !== 'unsupported'

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      title="Обновления"
      hint="Новые версии приходят сами: приложение проверяет выпуски на GitHub, скачивает новую версию в фоне и ставит её при перезапуске. Настройки, свои гайды и история при обновлении сохраняются."
    >
      <div className="space-y-3 text-[13px] text-ink-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>
            Установлена версия <b className="tnum text-ink">{state.current}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <StatusBadge tone={status.tone} size={15} />
            {status.label}
          </span>
          {state.checkedAt && state.phase !== 'checking' && <span className="text-[11px] text-ink-3">проверено {ago(Date.parse(state.checkedAt))}</span>}
        </div>

        {state.error && state.phase !== 'checking' && (
          <p className="text-xs text-warning">
            {state.error.kind === 'offline'
              ? 'Нет связи с GitHub — проверю позже сама.'
              : state.error.kind === 'noRelease'
                ? 'Выпусков ещё нет.'
                : `Ошибка: ${state.error.message}`}
          </p>
        )}

        {state.phase === 'downloading' && (
          <div className="max-w-md space-y-1">
            <ProgressBar value={(state.progress ?? 0) * 100} color="var(--color-accent)" />
            {state.total ? (
              <div className="tnum text-[11px] text-ink-3">
                {mb((state.progress ?? 0) * state.total)} из {mb(state.total)} МБ
              </div>
            ) : null}
          </div>
        )}

        {state.notes && state.notes.length > 0 && (state.phase === 'available' || state.phase === 'downloading' || state.phase === 'ready') && (
          <div className="rounded-xl border border-line bg-surface-2/60 px-4 py-3">
            <div className="mb-1.5 text-xs font-semibold text-ink">Что нового в {state.version}</div>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed">
              {state.notes.slice(0, 12).map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {supported && (
          <div className="flex flex-wrap items-center gap-2">
            {state.phase === 'ready' ? (
              <Button variant="primary" icon={<RotateCw size={14} />} onClick={() => void api.updates.install()}>
                Перезапустить и обновить
              </Button>
            ) : state.phase === 'available' ? (
              <Button variant="primary" icon={<Download size={14} />} disabled={busy} onClick={() => void run(() => api.updates.download())}>
                Скачать
              </Button>
            ) : (
              <Button
                icon={<RefreshCw size={14} className={state.phase === 'checking' ? 'animate-spin' : undefined} />}
                disabled={busy || state.phase === 'checking' || state.phase === 'downloading'}
                onClick={() => void run(() => api.updates.check())}
              >
                Проверить обновления
              </Button>
            )}
          </div>
        )}

        {supported && (
          <label className="flex cursor-pointer items-center gap-2.5 border-t border-line pt-3">
            <input
              type="checkbox"
              checked={auto}
              onChange={async (e) => useApp.setState({ settings: await api.updates.setAuto(e.target.checked) })}
              className="accent-[var(--color-accent)]"
            />
            <span>
              <span className="block text-ink">Скачивать обновления сами</span>
              <span className="block text-[11px] text-ink-3">Выключено — приложение только сообщит о новой версии, скачаете кнопкой.</span>
            </span>
          </label>
        )}
      </div>
    </Card>
  )
}
