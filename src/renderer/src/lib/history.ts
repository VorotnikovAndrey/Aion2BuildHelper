import { useEffect, useState } from 'react'
import type { HistoryEntry } from '@shared/analysis/history'
import { api, useApp } from './store'

/** История персонажа; перечитывается, когда оверлей обновил файл. */
export function useHistory(key: string | undefined): { entries: HistoryEntry[]; loading: boolean } {
  const readAt = useApp((s) => s.source?.readAt)
  const [state, setState] = useState<{ key?: string; entries: HistoryEntry[]; loading: boolean }>({ entries: [], loading: true })
  useEffect(() => {
    if (!key) return
    let alive = true
    api.history
      .list(key)
      .then((entries) => alive && setState({ key, entries, loading: false }))
      .catch(() => alive && setState({ key, entries: [], loading: false }))
    return () => {
      alive = false
    }
  }, [key, readAt])
  return state.key === key ? state : { entries: [], loading: true }
}

/** Ранг Бездны по номеру: 18 — «Воин 9-го ранга» (как в оверлее), дальше вверх. */
export function abyssRankName(grade: number): string {
  if (grade >= 10 && grade <= 18) return `Воин ${grade - 9}-го ранга`
  return `Ранг ${grade}`
}
