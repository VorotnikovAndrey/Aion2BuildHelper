// Ключи перевода: все t('…') и tn(n, '…') в исходниках + { "$t": "…" } во встроенных гайдах.
// npm run i18n             — сколько ключей, чего не хватает в каждом языке
// npm run i18n -- --missing — выписать недостающие ключи в .cache/i18n/<язык>.missing.json (для перевода)
// npm run i18n -- --prune   — убрать из словарей ключи, которых больше нет в коде, и отсортировать
// npm run i18n -- --merge   — дописать в словари переводы из .cache/i18n/out/<язык>/*.json (куски от переводчика)
// Тест src/shared/i18n/i18n.test.ts проверяет то же самое.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@babel/parser'
import traverseMod from '@babel/traverse'

const traverse = traverseMod.default ?? traverseMod
export const ROOT = resolve(fileURLToPath(import.meta.url), '../../..')
export const LOCALES_DIR = join(ROOT, 'src/shared/i18n/locales')
const SOURCES = ['src/renderer/src', 'src/main', 'src/shared']
const GUIDES = ['questlog', 'web'].map((d) => join(ROOT, 'src/shared/guide/builtin', d))

const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => walk(join(p, f))) : [p])

/** Подстановки ключа: «{n}», «{name}». */
export const placeholders = (s) => [...new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort()

/**
 * Все ключи: Map<ключ, { plural, where }>. Ошибки — вызовы t() не со строкой (их нельзя собрать).
 */
export function collectKeys() {
  const keys = new Map()
  const errors = []
  const add = (key, plural, where) => {
    const k = keys.get(key)
    if (k) k.where.length < 3 && k.where.push(where)
    else keys.set(key, { plural, where: [where] })
  }
  const files = SOURCES.flatMap((d) => walk(join(ROOT, d))).filter(
    (f) => /\.(ts|tsx)$/.test(f) && !/\.(test|d)\.ts$/.test(f) && !f.includes(`${sep}i18n${sep}`)
  )
  for (const file of files) {
    const src = readFileSync(file, 'utf8')
    if (!/\btn?\(/.test(src)) continue
    const rel = relative(ROOT, file).split(sep).join('/')
    const ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    traverse(ast, {
      CallExpression(path) {
        const c = path.node.callee
        if (c.type !== 'Identifier' || (c.name !== 't' && c.name !== 'tn')) return
        if (path.scope.getBinding(c.name)?.kind !== 'module') return
        const arg = path.node.arguments[c.name === 't' ? 0 : 1]
        const where = `${rel}:${path.node.loc.start.line}`
        if (arg?.type === 'StringLiteral') add(arg.value, c.name === 'tn', where)
        else if (arg?.type === 'TemplateLiteral' && !arg.expressions.length) add(arg.quasis[0].value.cooked, c.name === 'tn', where)
        // localize.ts переводит ключи из встроенных гайдов — они собираются из JSON ниже.
        else if (!rel.endsWith('guide/localize.ts')) errors.push(`${where}: ${c.name}() не со строкой — ключ не собрать`)
      }
    })
  }
  const visit = (v, where) => {
    if (Array.isArray(v)) v.forEach((x) => visit(x, where))
    else if (v && typeof v === 'object') {
      if (typeof v.$t === 'string') add(v.$t, false, where)
      Object.values(v).forEach((x) => visit(x, where))
    }
  }
  for (const dir of GUIDES.filter(existsSync))
    for (const f of readdirSync(dir)) visit(JSON.parse(readFileSync(join(dir, f), 'utf8')), `${relative(ROOT, dir)}/${f}`)
  return { keys, errors }
}

export function readLocales() {
  const out = {}
  if (!existsSync(LOCALES_DIR)) return out
  for (const f of readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json')))
    out[f.replace('.json', '')] = JSON.parse(readFileSync(join(LOCALES_DIR, f), 'utf8'))
  return out
}

/** Что не так со словарём языка: нет ключа, лишний ключ, подстановки не совпадают, у числительного нет форм. */
export function checkLocale(dict, keys) {
  const missing = []
  const stale = []
  const broken = []
  for (const [key, info] of keys) {
    const v = dict[key]
    if (v === undefined || v === '') {
      missing.push(key)
      continue
    }
    const want = placeholders(key).filter((p) => !(info.plural && p === 'n'))
    const forms = info.plural ? (typeof v === 'object' ? Object.values(v) : null) : typeof v === 'string' ? [v] : null
    if (!forms || !forms.length) {
      broken.push(`${key} — ${info.plural ? 'нужен объект форм { one, other… }' : 'нужна строка'}`)
      continue
    }
    if (info.plural && !('other' in v)) broken.push(`${key} — нет формы other`)
    for (const f of forms) {
      const got = placeholders(f).filter((p) => !(info.plural && p === 'n'))
      if (got.join() !== want.join()) broken.push(`${key} — подстановки ${JSON.stringify(got)} вместо ${JSON.stringify(want)}`)
    }
  }
  for (const key of Object.keys(dict)) if (!keys.has(key)) stale.push(key)
  return { missing, stale, broken }
}

const sortObj = (o) =>
  Object.fromEntries(
    Object.keys(o)
      .sort()
      .map((k) => [k, o[k]])
  )

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const { keys, errors } = collectKeys()
  console.log(`Ключей: ${keys.size} (числительных: ${[...keys.values()].filter((k) => k.plural).length})`)
  for (const e of errors) console.log('  !', e)
  const OUT = join(ROOT, '.cache/i18n/out')
  if (args.includes('--merge') && existsSync(OUT)) {
    mkdirSync(LOCALES_DIR, { recursive: true })
    for (const lang of readdirSync(OUT)) {
      const file = join(LOCALES_DIR, `${lang}.json`)
      const dict = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
      for (const part of readdirSync(join(OUT, lang)).filter((f) => f.endsWith('.json')))
        Object.assign(dict, JSON.parse(readFileSync(join(OUT, lang, part), 'utf8')))
      writeFileSync(file, JSON.stringify(sortObj(dict), null, 1) + '\n')
      console.log(`${lang}: +${readdirSync(join(OUT, lang)).length} кусков`)
    }
  }
  const locales = readLocales()
  mkdirSync(join(ROOT, '.cache/i18n'), { recursive: true })
  // Полный список ключей с местом в коде — для переводчика.
  writeFileSync(join(ROOT, '.cache/i18n/keys.json'), JSON.stringify(Object.fromEntries([...keys].map(([k, v]) => [k, v])), null, 1))
  for (const [lang, dict] of Object.entries(locales)) {
    const r = checkLocale(dict, keys)
    console.log(`${lang}: нет ${r.missing.length}, лишних ${r.stale.length}, с ошибками ${r.broken.length}`)
    for (const b of r.broken.slice(0, 10)) console.log('   ', b)
    if (args.includes('--missing'))
      writeFileSync(join(ROOT, `.cache/i18n/${lang}.missing.json`), JSON.stringify(Object.fromEntries(r.missing.map((k) => [k, keys.get(k)])), null, 1))
    if (args.includes('--prune')) {
      for (const k of r.stale) delete dict[k]
      writeFileSync(join(LOCALES_DIR, `${lang}.json`), JSON.stringify(sortObj(dict), null, 1) + '\n')
    }
  }
}
