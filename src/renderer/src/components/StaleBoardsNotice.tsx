// Предупреждение: доски Даэваниона в файле оверлея, похоже, старые.
// Признак — уровень умения выше, чем объясняют очки (до 10) и все видимые бонусы.

import { RefreshCw } from 'lucide-react'
import type { UnexplainedLevel } from '@shared/analysis/skills'
import { MAX_POINT_LEVEL } from '@shared/analysis/skills'
import type { Namer } from '@shared/names'
import { cn } from '@/lib/format'

export function StaleBoardsNotice({ list, namer, className }: { list: UnexplainedLevel[]; namer: Namer; className?: string }) {
  if (!list.length) return null
  const shown = list.slice(0, 3)
  return (
    <div className={cn('flex gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] leading-relaxed', className)}>
      <RefreshCw size={18} className="mt-0.5 shrink-0 text-warning" />
      <div className="text-ink-2">
        <b className="text-ink">Доски Даэваниона в данных оверлея, похоже, устарели.</b>{' '}
        {shown.map((u, i) => (
          <span key={u.skill}>
            {i > 0 ? '; ' : ''}«{namer.skill(u.skill).main}» — ур. {u.level}, а очки умений (до {MAX_POINT_LEVEL}), доски, арканы и шмот в файле дают только{' '}
            {u.explained}
          </span>
        ))}
        {list.length > shown.length ? ` и ещё ${list.length - shown.length}` : ''}. Так бывает после перестановки узлов: оверлей Questlog обновляет уровни
        умений сразу, а доски — с задержкой (перезаход персонажем не помогает). Пока доски здесь прежние; как только оверлей их перепишет, приложение обновится
        само.
      </div>
    </div>
  )
}
