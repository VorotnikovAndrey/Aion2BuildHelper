// Выпуск обновления: собрать установщик и выложить его в выпуски GitHub (VorotnikovAndrey/Aion2BuildHelper),
// откуда установленные копии Aion2 Build Helper скачают новую версию сами.
// Использование: npm run release. Порядок выпуска — docs/development.md#выпуск-версии,
// почему так — docs/decisions/0007-installer-and-updates.md. Сделано по образцу IndieRocket.
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'

const root = resolve(import.meta.dirname, '..')
const fail = (message) => {
  console.error(`\n[release] ${message}\n`)
  process.exit(1)
}

const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const builderYml = readFileSync(resolve(root, 'electron-builder.yml'), 'utf8')
const owner = /^\s+owner:\s*(\S+)/m.exec(builderYml)?.[1]
const repo = /^\s+repo:\s*(\S+)/m.exec(builderYml)?.[1]
if (!owner || !repo) fail('В electron-builder.yml нет owner/repo в блоке publish.')

// Описание выпуска — раздел этой версии из CHANGELOG.md. Его же приложение покажет в «Что нового».
const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8').replace(/\r/g, '')
const start = changelog.search(new RegExp(`^## ${version.replace(/\./g, '\\.')}\\b.*$`, 'm'))
if (start < 0) fail(`В CHANGELOG.md нет раздела «## ${version} — дата». Добавьте его и запустите снова.`)
const rest = changelog.slice(start).split('\n').slice(1)
const end = rest.findIndex((line) => line.startsWith('## '))
const notes = (end < 0 ? rest : rest.slice(0, end))
  .join('\n')
  .replace(/\[([^\]]+)\]\((?!https?:)[^)]*\)/g, '$1')
  .trim()
if (!notes) fail(`Раздел ${version} в CHANGELOG.md пустой.`)
writeFileSync(resolve(root, 'build', 'release-notes.md'), notes + '\n', 'utf8')

// Выпуск должен соответствовать коду на GitHub: тег ставится на текущий коммит, и он должен быть отправлен.
const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' })
if (git('status', '--porcelain').stdout?.trim()) fail('В рабочей папке есть незакоммиченные изменения. Закоммитьте и отправьте их (git push), затем запустите снова.')
const head = git('rev-parse', 'HEAD').stdout.trim()
git('fetch', '--quiet', 'origin')
if (!git('branch', '-r', '--contains', head).stdout.trim()) fail('Текущий коммит ещё не на GitHub. Отправьте его (git push) и запустите снова.')

// Ключ «запись» нужен только для выкладки. Его можно положить в %USERPROFILE%\.aion2buildhelper-release\release-token.txt
// (вне папки проекта): тогда скрипт ничего не спрашивает и выпуск может сделать AI-агент по просьбе владельца.
const savedToken = join(homedir(), '.aion2buildhelper-release', 'release-token.txt')
const ask = async (question) => {
  if (!process.stdin.isTTY) return ''
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await rl.question(question)).trim()
  rl.close()
  return answer
}
let token = process.env.GH_TOKEN?.trim() || (existsSync(savedToken) ? readFileSync(savedToken, 'utf8').trim() : '')
if (!token) token = await ask('Ключ GitHub «Aion2 Build Helper: выпуск» (Contents: Read and write): ')
if (!token) fail(`Нужен ключ для выкладки выпуска — переменная GH_TOKEN или файл ${savedToken}. Как его получить — docs/development.md#выпуск-версии.`)

const github = (path, init = {}) =>
  fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'aion2buildhelper-release', ...init.headers }
  }).catch((err) => fail(`Нет связи с GitHub: ${err.message}`))
async function api(path, init = {}) {
  const res = await github(path, init)
  if (res.status === 401) fail('GitHub не принял ключ (опечатка или истёк срок).')
  if (!res.ok) fail(`GitHub ответил ${res.status} на ${init.method ?? 'GET'} ${path}: ${(await res.text()).slice(0, 300)}`)
  return res.status === 204 ? null : res.json()
}
const info = await api('')
if (!info.permissions?.push) fail(`Ключ не даёт права записи в ${owner}/${repo}: нужен доступ Contents: Read and write.`)

const run = (cmd, env) => {
  const res = spawnSync(cmd, { cwd: root, stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
  if (res.status !== 0) fail(`Команда «${cmd}» завершилась с ошибкой.`)
}
run('npx electron-vite build')
run('npx electron-builder --win --publish never')

const tag = `v${version}`
const exeName = `Aion2BuildHelper-Setup-${version}.exe`
const assets = [exeName, `${exeName}.blockmap`, 'latest.yml']
for (const name of assets) if (!existsSync(resolve(root, 'dist', name))) fail(`Сборка не создала dist\\${name}.`)

// Пакеты, которые main загружает во время работы, должны лежать в сборке — иначе приложение не запустится
// и уже не сможет обновиться само.
const { listPackage } = createRequire(import.meta.url)('@electron/asar')
const packed = new Set(listPackage(resolve(root, 'dist', 'win-unpacked', 'resources', 'app.asar'), {}).map((f) => f.replace(/\\/g, '/')))
const { dependencies = {} } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const missing = Object.keys(dependencies).filter((dep) => !packed.has(`/node_modules/${dep}/package.json`))
if (missing.length) fail(`В сборку не попали пакеты: ${missing.join(', ')}. Установите зависимости заново (npm ci).`)

// Выпуск сначала черновик (его не видят установленные копии), файлы грузятся по одному, latest.yml — последним,
// и только потом выпуск публикуется.
const isComplete = (release) => assets.every((name) => release.assets.some((a) => a.name === name && a.state === 'uploaded'))
const findRelease = async () => (await api('/releases?per_page=100')).find((r) => r.tag_name === tag)
let release = await findRelease()
if (release && !release.draft && isComplete(release)) fail(`Версия ${version} уже выпущена. Повысьте version в package.json и добавьте раздел в CHANGELOG.md.`)
if (release && !release.draft) {
  console.log(`[release] Выпуск ${tag} на GitHub неполный — выкладываю заново.`)
  await api(`/releases/${release.id}`, { method: 'DELETE' })
  release = undefined
}
if (release) {
  release = await api(`/releases/${release.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: version, body: notes }) })
  for (const a of release.assets) await api(`/releases/assets/${a.id}`, { method: 'DELETE' })
} else {
  release = await api('/releases', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tag_name: tag, target_commitish: head, name: version, body: notes, draft: true })
  })
}

for (const name of assets) {
  const data = readFileSync(resolve(root, 'dist', name))
  console.log(`[release] Загружаю ${name} (${Math.round(data.length / 1024 / 1024)} МБ)…`)
  const res = await fetch(`https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'aion2buildhelper-release', 'content-type': 'application/octet-stream' },
    body: data
  }).catch((err) => fail(`Не удалось загрузить ${name}: ${err.message}. Запустите снова — черновик выпуска доделается.`))
  if (!res.ok) fail(`GitHub не принял ${name} (${res.status}): ${(await res.text()).slice(0, 300)}. Запустите снова — черновик выпуска доделается.`)
}

await api(`/releases/${release.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ draft: false, make_latest: 'true' }) })
const published = await findRelease()
if (!published || published.draft || !isComplete(published)) fail(`Выпуск ${tag} опубликован не полностью — проверьте страницу выпусков на GitHub и запустите снова.`)

console.log(`\n[release] Версия ${version} выпущена: https://github.com/${owner}/${repo}/releases/tag/${tag}`)
console.log('[release] Установленные копии найдут её сами (при запуске или в течение 4 часов). Новым людям дайте ссылку на страницу выпусков.')
