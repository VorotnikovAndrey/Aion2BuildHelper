// Помощник для переноса интерфейса на t(): оборачивает русские строки в t('…') прямо в исходниках.
// Запуск: node scripts/i18n/wrap.mjs <файлы или папки> [--dry]. Затем npm run format, typecheck и просмотр диффа.
// Что делает:
//   'Текст'                     → t('Текст')
//   `Уровень ${lvl} из ${max}`  → t('Уровень {lvl} из {max}', { lvl, max })
//   <p>Видел {ago(x)}</p>        → <p>{t('Видел {ago}', { ago: ago(x) })}</p>
//   label="Текст"               → label={t('Текст')}
// Чего не трогает (и печатает списком — эти места смотрим руками): ключи объектов, сравнения (=== 'Текст'),
// case, строковые типы, аргументы .includes/.split/… — там русская строка, скорее всего, данные, а не надпись.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { parse } from '@babel/parser'
import traverseMod from '@babel/traverse'

const traverse = traverseMod.default ?? traverseMod
const ROOT = process.cwd()
const CYR = /[А-Яа-яЁё]/
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const DATA = args.includes('--data')
const files = args.filter((a) => !a.startsWith('--')).flatMap(collect)
const report = []

function collect(p) {
  if (statSync(p).isDirectory()) return readdirSync(p).flatMap((f) => collect(join(p, f)))
  return /\.(ts|tsx)$/.test(p) && !/\.(test|d)\.ts$/.test(p) ? [p] : []
}

const quote = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '') + "'"

const ENTITIES = { nbsp: ' ', laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
const decode = (s) => s.replace(/&([a-z]+);/g, (m, n) => ENTITIES[n] ?? m)

/** Как React склеивает текст в JSX: строки с переносами обрезаются и соединяются пробелом. */
function cleanJsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/)
  let out = ''
  lines.forEach((line, i) => {
    let l = line.replace(/\t/g, ' ')
    if (i !== 0) l = l.replace(/^[ ]+/, '')
    if (i !== lines.length - 1) l = l.replace(/[ ]+$/, '')
    if (l) out += (out && i !== 0 ? ' ' : '') + l
  })
  return decode(out)
}

const GENERIC = new Set(['main', 'text', 'value', 'label', 'ru', 'en', 'current', 'name'])
const FORMATTERS = new Set([
  'fmt',
  'compact',
  'pct',
  'String',
  'Number',
  'round',
  'abs',
  'ceil',
  'floor',
  'formatStatValue',
  'toLocaleString',
  'toFixed',
  'trim',
  'toString',
  'join',
  'max',
  'min'
])

function nameFor(node) {
  switch (node.type) {
    case 'Identifier':
      return node.name
    case 'MemberExpression':
    case 'OptionalMemberExpression': {
      if (node.computed) return nameFor(node.object)
      const n = node.property.name
      if (n === 'length') return nameFor(node.object) + 'Count'
      if (GENERIC.has(n)) {
        const inner = nameFor(node.object)
        return inner && inner !== 'p' ? inner : n
      }
      return n
    }
    case 'CallExpression':
    case 'OptionalCallExpression': {
      const c = node.callee
      const callee = c.type === 'Identifier' ? c.name : c.type.endsWith('MemberExpression') && !c.computed ? c.property.name : ''
      if (FORMATTERS.has(callee)) {
        if (c.type.endsWith('MemberExpression') && ['toLocaleString', 'toFixed', 'trim', 'toString', 'join'].includes(callee)) return nameFor(c.object)
        return node.arguments[0] ? nameFor(node.arguments[0]) : 'p'
      }
      return callee || 'p'
    }
    case 'TSNonNullExpression':
    case 'ParenthesizedExpression':
    case 'TSAsExpression':
      return nameFor(node.expression)
    default:
      return 'p'
  }
}

const safeName = (s) => (s.replace(/[^A-Za-z0-9_]/g, '') || 'p').replace(/^[0-9]/, 'p$&')

function makeNamer() {
  const byExpr = new Map()
  const used = new Set()
  return (exprNode, exprText) => {
    if (byExpr.has(exprText)) return byExpr.get(exprText)
    const base = safeName(nameFor(exprNode))
    let n = base
    for (let i = 2; used.has(n); i++) n = base + i
    used.add(n)
    byExpr.set(exprText, n)
    return n
  }
}

function paramsText(entries) {
  if (!entries.length) return ''
  return ', { ' + entries.map(([name, text]) => (name === text ? name : `${name}: ${text}`)).join(', ') + ' }'
}

const isSimpleExpr = (node) => {
  switch (node.type) {
    case 'Identifier':
    case 'NumericLiteral':
      return true
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return isSimpleExpr(node.object) && (!node.computed || isSimpleExpr(node.property))
    case 'CallExpression':
    case 'OptionalCallExpression':
      return isSimpleExpr(node.callee) && node.arguments.every(isSimpleExpr)
    case 'TSNonNullExpression':
      return isSimpleExpr(node.expression)
    default:
      return false
  }
}

let totalKeys = 0
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  if (!CYR.test(src)) continue
  const ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx'], errorRecovery: false })
  const edits = []
  const rel = relative(ROOT, file).split(sep).join('/')
  const note = (node, why) =>
    report.push(`${rel}:${node.loc.start.line}  ${why}: ${src.slice(node.start, Math.min(node.end, node.start + 90)).replace(/\s+/g, ' ')}`)

  const textWithEdits = (start, end) => {
    let s = src.slice(start, end)
    const inner = edits.filter((e) => e.start >= start && e.end <= end).sort((a, b) => b.start - a.start)
    for (const e of inner) s = s.slice(0, e.start - start) + e.text + s.slice(e.end - start)
    return s
  }
  const replace = (start, end, text) => {
    for (let i = edits.length - 1; i >= 0; i--) if (edits[i].start >= start && edits[i].end <= end) edits.splice(i, 1)
    edits.push({ start, end, text })
    totalKeys++
  }

  /** Строку не трогаем: это данные (ключ, сравнение, тип…), а не надпись. */
  function skipLiteral(path) {
    const p = path.parent
    const node = path.node
    if (p.type === 'ImportDeclaration' || p.type === 'ExportNamedDeclaration' || p.type === 'ExportAllDeclaration') return true
    if (p.type === 'TSLiteralType') return (note(node, 'строковый тип'), true)
    if (
      (p.type === 'ObjectProperty' ||
        p.type === 'ObjectMethod' ||
        p.type === 'TSPropertySignature' ||
        p.type === 'ClassProperty' ||
        p.type === 'TSEnumMember') &&
      p.key === node
    )
      return (note(node, 'ключ объекта'), true)
    if (p.type === 'BinaryExpression' && ['===', '!==', '==', '!='].includes(p.operator)) return (note(p, 'сравнение'), true)
    if (p.type === 'SwitchCase') return (note(node, 'case'), true)
    if ((p.type === 'MemberExpression' || p.type === 'OptionalMemberExpression') && p.property === node) return (note(p, 'индекс'), true)
    if (p.type === 'CallExpression' || p.type === 'OptionalCallExpression' || p.type === 'NewExpression') {
      const c = p.callee
      const name = c.type === 'Identifier' ? c.name : c.type?.endsWith('MemberExpression') && !c.computed ? c.property.name : ''
      if (['t', 'tn'].includes(name)) return true
      if (c.type?.endsWith('MemberExpression') && c.object.type === 'Identifier' && c.object.name === 'console') return true
      if (name === 'RegExp') return (note(p, 'RegExp'), true)
      if (
        ['includes', 'startsWith', 'endsWith', 'indexOf', 'split', 'replace', 'replaceAll', 'match', 'test', 'localeCompare', 'has', 'get', 'set'].includes(
          name
        )
      )
        return (note(p, 'операция со строкой'), true)
    }
    if (p.type === 'JSXAttribute' && ['key', 'className', 'id'].includes(p.name.name)) return true
    // --data: справочники игры. Официальные названия ({ ru: '…', en: '…' } и таблицы по ID) переводит не t(),
    // а выбор языка игровых названий (names.ts) — их не трогаем.
    if (DATA && p.type === 'ObjectProperty' && p.value === node) {
      const k = p.key
      if ((k.type === 'Identifier' && k.name === 'ru') || k.type === 'NumericLiteral') return true
    }
    return false
  }

  function onLiteral(path) {
    const node = path.node
    const value = node.type === 'StringLiteral' ? node.value : node.quasis[0].value.cooked
    if (!CYR.test(value) || skipLiteral(path)) return
    if (path.parent.type === 'TaggedTemplateExpression') return
    const call = `t(${quote(value)})`
    replace(node.start, node.end, path.parent.type === 'JSXAttribute' ? `{${call}}` : call)
  }

  function onTemplate(path) {
    const node = path.node
    if (!node.expressions.length) return onLiteral(path)
    if (!node.quasis.some((q) => CYR.test(q.value.cooked ?? ''))) return
    if (path.parent.type === 'TaggedTemplateExpression') return
    if (skipLiteral(path)) return
    const name = makeNamer()
    const params = []
    let key = ''
    node.quasis.forEach((q, i) => {
      key += q.value.cooked
      const e = node.expressions[i]
      if (!e) return
      const text = textWithEdits(e.start, e.end)
      const n = name(e, text)
      if (!params.some(([pn]) => pn === n)) params.push([n, text])
      key += `{${n}}`
    })
    const call = `t(${quote(key)}${paramsText(params)})`
    replace(node.start, node.end, path.parent.type === 'JSXAttribute' ? `{${call}}` : call)
  }

  /** Текст внутри JSX: соседние куски текста и простые {выражения} — одна фраза с подстановками. */
  function onJsxChildren(path) {
    const children = path.node.children
    let run = []
    const flush = () => {
      const pieces = run
      run = []
      if (!pieces.some((c) => c.type === 'JSXText' && CYR.test(src.slice(c.start, c.end)))) return
      const name = makeNamer()
      const params = []
      let key = ''
      for (const c of pieces) {
        if (c.type === 'JSXText') key += cleanJsxText(src.slice(c.start, c.end))
        else if (c.expression.type === 'StringLiteral') key += c.expression.value
        else {
          const text = src.slice(c.expression.start, c.expression.end)
          const n = name(c.expression, text)
          if (!params.some(([pn]) => pn === n)) params.push([n, text])
          key += `{${n}}`
        }
      }
      key = key.trim()
      if (!key) return
      // Пробелы и переносы по краям остаются в исходнике как были — заменяется только сама фраза.
      const first = pieces[0]
      const last = pieces[pieces.length - 1]
      const raw = (c) => src.slice(c.start, c.end)
      const start = first.type === 'JSXText' ? first.start + raw(first).length - raw(first).trimStart().length : first.start
      const end = last.type === 'JSXText' ? last.end - (raw(last).length - raw(last).trimEnd().length) : last.end
      replace(start, end, `{t(${quote(key)}${paramsText(params)})}`)
    }
    for (const c of children) {
      if (c.type === 'JSXText') run.push(c)
      else if (c.type === 'JSXExpressionContainer' && c.expression.type === 'StringLiteral') run.push(c)
      else if (
        c.type === 'JSXExpressionContainer' &&
        c.expression.type !== 'JSXEmptyExpression' &&
        isSimpleExpr(c.expression) &&
        !CYR.test(src.slice(c.start, c.end))
      )
        run.push(c)
      else flush()
    }
    flush()
  }

  traverse(ast, {
    StringLiteral: { exit: onLiteral },
    TemplateLiteral: { exit: onTemplate },
    JSXElement: { exit: onJsxChildren },
    JSXFragment: { exit: onJsxChildren }
  })

  if (!edits.length) continue
  // Внешние замены уже включили внутренние; пересекающихся быть не должно.
  edits.sort((a, b) => b.start - a.start)
  let out = src
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end)

  const usesT = /\bt\(/.test(out)
  const usesTn = /\btn\(/.test(out)
  const fromShared = rel.startsWith('src/shared/')
  const spec = fromShared
    ? relative(dirname(file), join(ROOT, 'src/shared/i18n'))
        .split(sep)
        .join('/')
        .replace(/^(?!\.)/, './')
    : '@shared/i18n'
  const importRe = new RegExp(`import \\{([^}]*)\\} from '${spec.replace(/[./]/g, '\\$&')}'`)
  const m = out.match(importRe)
  const want = [usesT && 't', usesTn && 'tn'].filter(Boolean)
  if (m) {
    const have = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const all = [...new Set([...have, ...want])].sort()
    out = out.replace(importRe, `import { ${all.join(', ')} } from '${spec}'`)
  } else if (want.length) {
    const lastImport = ast.program.body.filter((n) => n.type === 'ImportDeclaration').at(-1)
    const at = lastImport ? lastImport.end + 1 : 0
    out = out.slice(0, at) + `import { ${want.join(', ')} } from '${spec}'\n` + out.slice(at)
  }
  if (!DRY) writeFileSync(file, out)
  console.log(`${rel}: ${edits.length}`)
}

console.log(`\nВсего замен: ${totalKeys}. Не тронуто (проверить руками): ${report.length}`)
writeFileSync(join(ROOT, '.cache', 'i18n-wrap-report.txt'), report.join('\n') + '\n')
console.log('Список — .cache/i18n-wrap-report.txt')
