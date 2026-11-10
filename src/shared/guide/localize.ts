// Тексты встроенных гайдов на языке интерфейса. Генератор (scripts/guides/questlog-guides.mjs) пишет свои
// описания и заметки не строкой, а ключом перевода — здесь они превращаются в строки:
//   { $t: 'Текст {n}', p: { n: 1 } } → t('Текст {n}', { n: 1 })
//   { $skill: 12100000 }               → название умения
//   { $join: [...], sep?: ' → ' }       → склейка частей
// Всё остальное (тексты авторов, названия стадий) остаётся как есть.

import { t } from '../i18n'
import { gameSkillName } from '../names'

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function text(v: unknown): string {
  const r = localizeTexts(v)
  return typeof r === 'string' || typeof r === 'number' ? String(r) : ''
}

export function localizeTexts(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(localizeTexts)
  if (!isObj(v)) return v
  if (typeof v.$t === 'string') {
    const p = isObj(v.p) ? Object.fromEntries(Object.entries(v.p).map(([k, x]) => [k, typeof x === 'number' ? x : text(x)])) : undefined
    return t(v.$t, p)
  }
  if (typeof v.$skill === 'number') return gameSkillName(v.$skill)
  if (Array.isArray(v.$join)) return v.$join.map(text).join(typeof v.sep === 'string' ? v.sep : '')
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, localizeTexts(x)]))
}
