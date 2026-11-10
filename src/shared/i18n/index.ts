// Перевод интерфейса. Ключ — русский текст (приложение пишется по-русски): t('Обзор').
// Переводы — locales/<язык>.json: «русский текст» → перевод; нет перевода — показывается русский.
// Подстановки: t('Не хватает {n}', { n: 2 }). Числительные: tn(n, '{n} умение|{n} умения|{n} умений').
// Язык выбирается один раз при загрузке окна (?lang= от main-процесса); смена языка перезагружает окно,
// поэтому t() можно звать и в константах модулей. Список ключей и проверка переводов — npm run i18n.

export type Locale = 'ru' | 'uk' | 'en' | 'de' | 'fr' | 'es' | 'pt' | 'ja' | 'ko'

export interface LocaleInfo {
  id: Locale
  /** Название языка на нём самом — так его ищут в списке. */
  name: string
  /** Тег для Intl: числа, даты, правила числительных. */
  intl: string
  /** Есть ли у игры (и базы Questlog) этот язык — тогда и игровые названия официальные. */
  game: boolean
}

export const LOCALES: LocaleInfo[] = [
  { id: 'ru', name: 'Русский', intl: 'ru-RU', game: true },
  { id: 'uk', name: 'Українська', intl: 'uk-UA', game: false },
  { id: 'en', name: 'English', intl: 'en-US', game: true },
  { id: 'de', name: 'Deutsch', intl: 'de-DE', game: true },
  { id: 'fr', name: 'Français', intl: 'fr-FR', game: true },
  { id: 'es', name: 'Español', intl: 'es-ES', game: true },
  { id: 'pt', name: 'Português (Brasil)', intl: 'pt-BR', game: true },
  { id: 'ja', name: '日本語', intl: 'ja-JP', game: true },
  { id: 'ko', name: '한국어', intl: 'ko-KR', game: true }
]

/** Формы числительного по правилам CLDR (Intl.PluralRules). Нет нужной формы — берётся other. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>
export type Dictionary = Record<string, string | PluralForms>

const LANG_KEY = 'a2bh-lang'

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && LOCALES.some((l) => l.id === v)

const DICTS: Partial<Record<Locale, Dictionary>> = {}
for (const [path, dict] of Object.entries(import.meta.glob<Dictionary>('./locales/*.json', { eager: true, import: 'default' }))) {
  const id = path.match(/([a-z]+)\.json$/)?.[1]
  if (isLocale(id)) DICTS[id] = dict
}

/** Язык окна: ?lang= (его ставит main-процесс по настройкам), иначе запомненный в браузере, иначе русский. */
function detect(): Locale {
  try {
    const q = new URLSearchParams(globalThis.location?.search ?? '').get('lang')
    if (isLocale(q)) return q
  } catch {
    // Не браузер (main-процесс, тесты).
  }
  try {
    const s = globalThis.localStorage?.getItem(LANG_KEY)
    if (isLocale(s)) return s
  } catch {
    // Хранилище недоступно.
  }
  return 'ru'
}

let current: Locale = detect()
let dict: Dictionary = DICTS[current] ?? {}

export const getLocale = (): Locale => current
export const localeInfo = (id: Locale = current): LocaleInfo => LOCALES.find((l) => l.id === id) ?? LOCALES[0]
/** Тег для toLocaleString / Intl.NumberFormat. */
export const intlLocale = (): string => localeInfo().intl

/** Сменить язык без перезагрузки — для main-процесса и тестов. Окно интерфейса при смене языка перезагружается. */
export function setLocale(id: Locale): void {
  current = id
  dict = DICTS[id] ?? {}
  try {
    globalThis.localStorage?.setItem(LANG_KEY, id)
  } catch {
    // Не браузер.
  }
}

/** Первый из языков системы, который есть в приложении; иначе английский. */
export function systemLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split(/[-_]/)[0]
    if (isLocale(base)) return base
  }
  return 'en'
}

type Params = Record<string, string | number | null | undefined>

function fill(text: string, params?: Params): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name] ?? '') : m))
}

/** Название внутри фразы — со строчной буквы; в немецком существительные пишутся с заглавной, там как есть. */
export const lowerInSentence = (s: string): string => (current === 'de' ? s : s.toLowerCase())

/** Перевод строки интерфейса. key — русский текст с {подстановками}. */
export function t(key: string, params?: Params): string {
  if (current === 'ru') return fill(key, params)
  const v = dict[key]
  return fill(typeof v === 'string' && v ? v : key, params)
}

const RU_FORMS: Intl.LDMLPluralRule[] = ['one', 'few', 'many']

function ruForm(n: number): Intl.LDMLPluralRule {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return 'many'
  if (b > 1 && b < 5) return 'few'
  if (b === 1) return 'one'
  return 'many'
}

const rules = new Map<string, Intl.PluralRules>()
function pluralCategory(n: number): Intl.LDMLPluralRule {
  const tag = intlLocale()
  let r = rules.get(tag)
  if (!r) rules.set(tag, (r = new Intl.PluralRules(tag)))
  return r.select(n)
}

/**
 * Строка с числом: key — три русские формы через «|» (1 умение | 2 умения | 5 умений), {n} — само число.
 * В переводе — объект форм CLDR своего языка: { "one": "{n} skill", "other": "{n} skills" }.
 */
export function tn(n: number, key: string, params?: Params): string {
  const all = { n, ...params }
  const v = current === 'ru' ? undefined : dict[key]
  if (v && typeof v === 'object') {
    const form = v[pluralCategory(n)] ?? v.other ?? Object.values(v)[0] ?? key
    return fill(form, all)
  }
  const forms = key.split('|')
  return fill(forms[RU_FORMS.indexOf(ruForm(n))] ?? forms[forms.length - 1], all)
}
