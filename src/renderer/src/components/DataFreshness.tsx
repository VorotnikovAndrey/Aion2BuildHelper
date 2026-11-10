// Полоска «насколько свежи данные» для разделов, которые оверлей Questlog подтягивает с задержкой:
// Знание о видах и доски Даэваниона. Показывает, когда оверлей видел персонажа и когда раздел
// последний раз менялся (по истории), и по шагам объясняет, что делать, если в игре уже другое.

import { useState } from 'react'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { sectionFreshness, type SlowSection } from '@shared/analysis/freshness'
import type { Character } from '@shared/types'
import { Tooltip } from '@/components/ui/InfoTip'
import { ago, cn, dateTime } from '@/lib/format'
import { useHistory } from '@/lib/history'
import { lowerInSentence, t } from '@shared/i18n'

const TEXT: Record<SlowSection, { what: string; question: string; action: string }> = {
  genus: { what: t('Ячейки рода'), question: t('Перекрутили статы, а здесь старые?'), action: t('перекрутили статы') },
  daevanion: { what: t('Узлы досок'), question: t('Переставили узлы, а здесь старые?'), action: t('переставили узлы') }
}

export function DataFreshness({ char, section, className }: { char: Character; section: SlowSection; className?: string }) {
  const { entries, loading } = useHistory(char.key)
  const [open, setOpen] = useState(false)
  const copy = TEXT[section]
  const f = sectionFreshness(char, entries, section)
  const changed = f.changedAt
    ? `${ago(f.changedAt)} (${dateTime(f.changedAt)})`
    : f.trackedSince
      ? t('не менялись с {dateTime}', { dateTime: dateTime(f.trackedSince) })
      : t('пока неизвестно — история только началась')

  return (
    <div className={cn('rounded-xl border border-line bg-surface-2/40 px-4 py-2.5 text-[12.5px] text-ink-2', className)}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <RefreshCw size={14} className="shrink-0 text-ink-3" />
        <Tooltip
          content={t('Когда оверлей Questlog последний раз переписал данные персонажа. Он делает это при смене зоны, а не после каждого действия в игре.')}
        >
          <span>
            {t('Оверлей обновил персонажа:')} <b className="text-ink">{ago(f.seenAt)}</b>
          </span>
        </Tooltip>
        {!loading && (
          <Tooltip
            content={t('Когда этот раздел последний раз менялся в данных оверлея — по истории приложения. Своей отметки времени у раздела в файле нет.')}
          >
            <span>
              {t('{what} в данных менялись:', { what: copy.what })} <b className="text-ink">{changed}</b>
            </span>
          </Tooltip>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-accent-2 hover:bg-surface-2"
        >
          {copy.question}
          <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <ol className="mt-2.5 space-y-1.5 border-t border-line pt-2.5 leading-relaxed">
          <li>
            <b className="text-ink">{t('1. Смените локацию')}</b>{' '}
            {t(
              '— телепорт, вход в подземелье или выход из него. Оверлей перепишет данные, и строка «Оверлей обновил персонажа» станет «только что». Оверлей Questlog должен быть запущен.'
            )}
          </li>
          <li>
            <b className="text-ink">{t('2. Если там «только что», а {toLowerCase} здесь прежние', { toLowerCase: lowerInSentence(copy.what) })}</b>{' '}
            {t(
              '— оверлей ещё не получил новые значения. Они придут сами позже: доски Даэваниона, например, приходили примерно через 12 часов. Приложению ничего делать не нужно — оно обновится, как только обновится файл.'
            )}
          </li>
          <li className="text-ink-3">
            {t('Приложение показывает ровно то, что записал оверлей: если вы {action} после времени выше, здесь пока прежние значения.', {
              action: copy.action
            })}
          </li>
        </ol>
      )}
    </div>
  )
}
