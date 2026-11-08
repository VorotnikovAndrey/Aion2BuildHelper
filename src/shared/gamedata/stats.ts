// Статы игры: ID → ключ, английское название (официальное, из клиента) и русское.
// Русские названия — как в русском клиенте (сверены по окнам «Показатели персонажа», «Пантеон», «Арканы»
// и странице билда Questlog на русском, 8 ноября 2026). Редкие статы, которых там не было, — наш перевод.
// Пользователь может переименовать любой стат в настройках — см. lib/names в интерфейсе.

import statsJson from './generated/stats.json'

export interface StatDef {
  id: number
  key: string
  en: string
  ru?: string
  category: string
  /** Значение хранится в сотых долях процента (1355 = 13,55%). */
  percent: boolean
  main: boolean
}

const RU: Record<string, string> = {
  str: 'Мощь',
  dex: 'Ловкость',
  int: 'Интеллект',
  con: 'Здоровье',
  agi: 'Точность',
  wis: 'Воля',
  justice: '[Неджакан] Справедливость',
  freedom: '[Байзел] Свобода',
  illusion: '[Кайсинель] Видение',
  life: '[Юстиэль] Жизнь',
  time: '[Сиэль] Время',
  light: '[Ариэль] Свет',
  destruction: '[Джикел] Разрушение',
  death: '[Триниэль] Смерть',
  wisdom: '[Румиэль] Мудрость',
  destiny: '[Маркутан] Судьба',
  space: '[Израфель] Пространство',
  dark: '[Асфель] Тьма',
  fixingdamage: 'Доп. АТК',
  amplifyalldamage: 'Увелич. урона',
  weapondamage: 'Макс. АТК',
  amplifyweapondamage: 'Увелич. урона оружия',
  weaponmindamage: 'Мин. АТК',
  criticaladddamage: 'Крит. АТК',
  criticaldamagedefense: 'ЗЩТ от крит. удара',
  amplifycriticaldamage: 'Увелич. крит. урона',
  decreasecriticaldamage: 'Стойкость к крит. урону',
  bossnpcadddamage: 'АТК по боссу',
  bossnpcdefense: 'ЗЩТ от босса',
  defense: 'Доп. ЗЩТ',
  pveadddamage: 'АТК в PvE',
  pvedamagedefense: 'ЗЩТ в PvE',
  pvpadddamage: 'АТК в PvP',
  pvpdamagedefense: 'ЗЩТ в PvP',
  pvpamplifydamage: 'Увелич. урона в PvP',
  sealstoneadddamage: 'Доп. урон от камней силы',
  decreasedamage: 'Стойкость к урону',
  decreaseweapondamage: 'Стойкость к урону от оружия',
  pvpdecreasedamage: 'Стойкость к урону в PvP',
  decreaseshieldblock: 'Снижение урона от блока щитом',
  decreaseweaponblock: 'Снижение урона от блока оружием',
  maxweaponblock: 'Предел парирования',
  maxshieldblock: 'Предел блока щитом',
  backattackdamage: 'АТК с тыла',
  backattackdefense: 'ЗЩТ с тыла',
  backattackcritical: 'Крит. удар с тыла',
  backattackcriticalresist: 'Сопр. крит. удару с тыла',
  amplifybackattack: 'Увелич. урона с тыла',
  decreasebackattack: 'Стойкость к урону с тыла',
  accuracy: 'Доп. меткость',
  pveaccuracy: 'Меткость в PvE',
  pvpaccuracy: 'Меткость в PvP',
  evasion: 'Доп. УКЛ',
  pveevasion: 'Уклонение в PvE',
  pvpevasion: 'Уклонение в PvP',
  critical: 'Крит. удар',
  pvpcritical: 'Крит. удар в PvP',
  criticalresist: 'Сопротивление крит. удару',
  pvpcriticalresist: 'Сопр. крит. удару в PvP',
  additionalhitrate: 'Попадание мультиударом',
  additionalhitresistrate: 'Сопротивление мультиудару',
  abnormalaccuracy: 'Шанс эффектов',
  abnormalresistance: 'Сопротивление негат. эффектам',
  hpmax: 'ОЗ',
  hpregen: 'Естественное восстановление ОЗ',
  resthpregen: 'Естественное восстановление ОЗ вне боя',
  maxhpratio: 'Увеличение ОЗ',
  maxmpratio: 'Увеличение ОМ',
  mpmax: 'ОМ',
  mpregen: 'Естественное восстановление ОМ',
  restmpregen: 'Естественное восстановление ОМ вне боя',
  movespeed: 'Скорость движения',
  groundvehiclespeed: 'Скорость ездового',
  flyspeed: 'Скорость полёта',
  cooltimedecrease: 'Сокращение времени перезарядки',
  experiencebonus: 'Бонус опыта',
  hphealrate: 'Усиление лечения',
  hppotionrate: 'Увеличение восстановления от зелий ОЗ',
  hppotionregen: 'Восстановление от зелий ОЗ',
  amplifyhphealget: 'Получ. исцеление',
  amplifyaggro: 'Увеличение агрессии',
  sprintspeed: 'Скорость бега',
  spmax: 'ОД',
  dpmax: 'Божественная сила',
  block: 'Блок',
  blockpierce: 'Пробитие блока',
  battlehpregen: 'Естественное восстановление ОЗ в бою',
  battlempregen: 'Естественное восстановление ОМ в бою',
  combatspeed: 'СКР боя',
  defensepierce: 'Пробитие',
  fpmax: 'Запас полёта',
  armordefense: 'ЗЩТ',
  armorevasion: 'УКЛ',
  weaponfixingdamage: 'АТК',
  weaponaccuracy: 'Меткость',
  shockpropertyaccuracy: 'Попадание шок. эффектами',
  pveamplifydamage: 'Увеличение урона в PvE',
  pvedecreasedamage: 'Стойкость к урону в PvE',
  cooltimeincrease: 'Перезарядка',
  mpuseincrease: 'Расход ОМ',
  mpusedecrease: 'Снижение расхода ОМ',
  spregen: 'Естественное восстановление ОД',
  restspregen: 'Естественное восстановление ОД вне боя',
  battlespregen: 'Естественное восстановление ОД в бою',
  damageratio: 'Увеличение АТК',
  defenseratio: 'Увеличение ЗЩТ',
  accuracyratio: 'Увеличение меткости',
  evasionratio: 'Увеличение уклонения',
  criticalratio: 'Увеличение крит. удара',
  criticalresistratio: 'Увеличение сопр. крит. удару',
  blockratio: 'Увеличение блока',
  perfect: 'Совершенный удар',
  hardhit: 'Сокрушающий удар',
  restoration: 'Регенерация',
  ironwall: 'Непробиваемость',
  perfectresist: 'Сопр. совершенному удару',
  hardhitresist: 'Сопротивление сокрушающему удару',
  ignorerestoration: 'Пробитие восстановления',
  ignoreironwall: 'Пробитие Непробиваемости',
  sworddamageratio: 'Увеличение АТК меча',
  helmetdefenseratio: 'Увеличение ЗЩТ шлема',
  torsodefenseratio: 'Увеличение ЗЩТ нагрудника',
  pantsdefenseratio: 'Увеличение ЗЩТ поножей',
  glovesdefenseratio: 'Увеличение ЗЩТ перчаток',
  bootsdefenseratio: 'Увеличение ЗЩТ сапог',
  capedefenseratio: 'Увеличение ЗЩТ плаща',
  shoulderdefenseratio: 'Увеличение ЗЩТ наплечников',
  necklacedamageratio: 'Увеличение АТК ожерелья',
  necklacedefenseratio: 'Увеличение ЗЩТ ожерелья',
  earringdamageratio: 'Увеличение АТК серёг',
  earringdefenseratio: 'Увеличение ЗЩТ серёг',
  bossnpcamplifydamage: 'Увелич. урона по боссам',
  bossnpcdecreasedamage: 'Стойкость к урону боссов',
  sealstoneamplifydamage: 'Увелич. урона от камней силы',
  abyssamplifydamage: 'Увелич. урона в Бездне',
  pvpblock: 'Блок в PvP',
  pvpblockpierce: 'Пробитие блока в PvP',
  apmax: 'Ярость (ресурс)',
  frontattackdamage: 'АТК спереди',
  frontattackdefense: 'ЗЩТ спереди',
  amplifyfrontattack: 'Увелич. урона спереди',
  decreasefrontattack: 'Стойкость к урону спереди',
  frontattackcritical: 'Крит. удар спереди',
  frontattackcriticalresist: 'Сопр. крит. удару спереди'
}

export const STATS: StatDef[] = (statsJson as Omit<StatDef, 'ru'>[]).map((s) => ({ ...s, ru: RU[s.key] }))

const byId = new Map(STATS.map((s) => [s.id, s]))
const byKey = new Map(STATS.map((s) => [s.key.toLowerCase(), s]))

export const statDef = (id: number): StatDef | undefined => byId.get(id)
/** Стат по ключу без учёта регистра: «CombatSpeed», «combatspeed». */
export const statByKey = (key: string): StatDef | undefined => byKey.get(key.toLowerCase())

/** Значение стата для показа: «13,55%» или «1 352». */
export function formatStatValue(id: number, value: number, opts: { sign?: boolean } = {}): string {
  const def = statDef(id)
  const sign = opts.sign && value > 0 ? '+' : ''
  if (def?.percent) {
    const v = value / 100
    return sign + v.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + '%'
  }
  return sign + value.toLocaleString('ru-RU')
}

/** Группы статов для экрана «Статы». Порядок — от того, что важнее в бою. */
export const STAT_GROUPS: { id: string; ru: string; keys: string[] }[] = [
  {
    id: 'attack',
    ru: 'Атака',
    keys: [
      'weaponfixingdamage',
      'fixingdamage',
      'weapondamage',
      'weaponmindamage',
      'amplifyalldamage',
      'amplifyweapondamage',
      'damageratio',
      'combatspeed',
      'additionalhitrate',
      'defensepierce',
      'cooltimedecrease'
    ]
  },
  {
    id: 'critical',
    ru: 'Крит',
    keys: ['critical', 'criticaladddamage', 'amplifycriticaldamage', 'criticalratio', 'frontattackcritical', 'backattackcritical']
  },
  {
    id: 'pve',
    ru: 'PvE и боссы',
    keys: [
      'pveadddamage',
      'pveamplifydamage',
      'pveaccuracy',
      'bossnpcadddamage',
      'bossnpcamplifydamage',
      'pvedamagedefense',
      'pvedecreasedamage',
      'bossnpcdefense',
      'sealstoneadddamage',
      'sealstoneamplifydamage',
      'abyssamplifydamage'
    ]
  },
  {
    id: 'special',
    ru: 'Особые удары',
    keys: [
      'perfect',
      'hardhit',
      'restoration',
      'ironwall',
      'ignoreironwall',
      'ignorerestoration',
      'frontattackdamage',
      'amplifyfrontattack',
      'backattackdamage',
      'amplifybackattack'
    ]
  },
  {
    id: 'accuracy',
    ru: 'Меткость',
    keys: ['weaponaccuracy', 'accuracy', 'accuracyratio', 'blockpierce', 'abnormalaccuracy', 'shockpropertyaccuracy']
  },
  {
    id: 'defense',
    ru: 'Защита',
    keys: [
      'hpmax',
      'maxhpratio',
      'armordefense',
      'defense',
      'defenseratio',
      'block',
      'blockratio',
      'decreasedamage',
      'decreasecriticaldamage',
      'criticalresist',
      'criticaldamagedefense',
      'frontattackdefense',
      'backattackdefense',
      'armorevasion',
      'evasion',
      'abnormalresistance',
      'additionalhitresistrate',
      'perfectresist',
      'hardhitresist'
    ]
  },
  {
    id: 'pvp',
    ru: 'PvP',
    keys: [
      'pvpadddamage',
      'pvpamplifydamage',
      'pvpdamagedefense',
      'pvpdecreasedamage',
      'pvpaccuracy',
      'pvpevasion',
      'pvpcritical',
      'pvpcriticalresist',
      'pvpblock'
    ]
  },
  {
    id: 'resource',
    ru: 'Ресурсы и восстановление',
    keys: [
      'mpmax',
      'maxmpratio',
      'hpregen',
      'mpregen',
      'battlehpregen',
      'battlempregen',
      'amplifyhphealget',
      'hphealrate',
      'hppotionrate',
      'movespeed',
      'mpuseincrease'
    ]
  },
  {
    id: 'main',
    ru: 'Основные и божества',
    keys: [
      'str',
      'dex',
      'int',
      'con',
      'agi',
      'wis',
      'justice',
      'destruction',
      'freedom',
      'death',
      'illusion',
      'life',
      'time',
      'wisdom',
      'destiny',
      'space',
      'light',
      'dark'
    ]
  }
]
