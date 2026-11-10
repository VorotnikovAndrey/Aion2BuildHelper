// Проверка куска перевода: node scripts/i18n/check-chunk.mjs <язык> <номер куска>
// Читает .cache/i18n/chunks/<N>.json (ключи) и .cache/i18n/out/<язык>/<N>.json (перевод), печатает ошибки.
// Нужен на время перевода; итоговые словари проверяет src/shared/i18n/i18n.test.ts.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkLocale, ROOT } from './keys.mjs'

const [lang, n] = process.argv.slice(2)
const keys = new Map(Object.entries(JSON.parse(readFileSync(join(ROOT, `.cache/i18n/chunks/${n}.json`), 'utf8'))))
let dict
try {
  dict = JSON.parse(readFileSync(join(ROOT, `.cache/i18n/out/${lang}/${n}.json`), 'utf8'))
} catch (e) {
  console.log('Файл не читается как JSON:', e.message)
  process.exit(1)
}
const r = checkLocale(dict, keys)
const spaces = [...keys.keys()].filter((k) => typeof dict[k] === 'string' && (/^\s/.test(k) !== /^\s/.test(dict[k]) || /\s$/.test(k) !== /\s$/.test(dict[k])))
console.log(
  `ключей ${keys.size}: нет перевода ${r.missing.length}, лишних ${r.stale.length}, ошибок ${r.broken.length}, пробелы по краям не совпадают ${spaces.length}`
)
for (const k of r.missing.slice(0, 40)) console.log('  нет:', k)
for (const k of r.stale.slice(0, 20)) console.log('  лишний:', k)
for (const b of r.broken.slice(0, 40)) console.log('  ошибка:', b)
for (const k of spaces.slice(0, 20)) console.log('  пробелы:', JSON.stringify(k), '→', JSON.stringify(dict[k]))
process.exit(r.missing.length || r.stale.length || r.broken.length || spaces.length ? 1 : 0)
