// Встроенный гайд: Страж, PvE (Mobalytics, октябрь 2026).
// Умения, специализации, стигмы, ротация и цели Даэваниона — по гайду (пересказ своими словами).
// Приоритеты статов, манакамней и умений на шмоте в гайде не расписаны — здесь наша оценка
// для PvE-стража «урон + удержание босса»; в интерфейсе это помечено. Поправить можно в редакторе гайдов.

import type { Guide } from '../guide/types'

// Умения стража (ID игры)
const VICIOUS_STRIKE = 12010000
const PUMMEL = 12040000
const POACH = 12130000
const SHIELD_SMITE = 12100000
const JUDGMENT = 12240000
const FLASH_RAMPAGE = 12340000
const DEBILITATING_SMASH = 12270000
const WARDING_STRIKE = 12350000
const SHIELD_RUSH = 12430000
const ANNIHILATE = 12300000
const PUNISHMENT = 12090000
const DEFIANCE = 12260000
const ENHANCE_HEALTH = 12710000
const WARDING_SHIELD = 12720000
const PUNISHING_BENEDICTION = 12730000
const IRONCLAD_DEFENSE = 12740000
const GUARDING_SEAL = 12750000
const IMPACT_HIT = 12760000
const INSULTING_ROAR = 12770000
const FURY = 12780000
const SURVIVAL_WILLPOWER = 12790000
const BLOCK_PAIN = 12800000
const DOOM_SHIELD = 12070000
const SHIELD_OF_PROTECTION = 12110000
const TAUNT = 12120000
const NOBLE_ARMOR = 12230000
const NEZEKANS_SHIELD = 12320000
const BATTLEFIELD_BANNER = 12450000

// Статы (ID игры)
const S = {
  attack: 317,
  attackBonus: 19,
  maxAttack: 31,
  damageBoost: 28,
  weaponDamageBoost: 32,
  pveDamageBoost: 379,
  pveAttack: 56,
  bossAttack: 50,
  bossDamageBoost: 520,
  critical: 128,
  criticalAttack: 38,
  critDamageBoost: 44,
  combatSpeed: 282,
  multiHit: 146,
  double: 443,
  perfect: 442,
  frontAttack: 587,
  frontCritical: 591,
  pveAccuracy: 110,
  accuracy: 318,
  accuracyBonus: 104,
  penetration: 284,
  cooldown: 215,
  hp: 193,
  hpIncrease: 196,
  block: 255,
  damageTolerance: 70,
  pveDamageTolerance: 380,
  defense: 307,
  pveDefense: 57,
  critDamageTolerance: 47,
  incomingHeal: 235,
  endurancePenetration: 449,
  mp: 199,
  criticalResist: 133,
  defenseBonus: 52,
  frontDefense: 588
} as const

const ASSISTANT = 'Оценка помощника: в гайде приоритет статов не расписан'

export const templarPveMobalytics: Guide = {
  schema: 1,
  id: 'builtin-templar-pve-mobalytics',
  name: 'Страж PvE — Mobalytics (Суд и Кровавая месть)',
  cls: 'templar',
  mode: 'pve',
  builtin: true,
  description:
    'Урон через частые применения Суда и заряженную Кровавую месть, при этом страж держит босса и сам управляет защитой и перемещением. Главная цель прокачки — довести Суд, Жестокий удар, Град ударов и Кровавую месть до ур. 16 и надеть их главные специализации.',
  source: {
    title: 'Aion 2 Templar PvE Build',
    url: 'https://mobalytics.gg/gamebase/guides/aion-2-templar-pve-build',
    author: 'Mobalytics-Oli (по материалам NoBS Game Guides)',
    date: '2026-10-16'
  },
  updatedAt: '2026-11-08T00:00:00.000Z',

  skills: [
    {
      skill: JUDGMENT,
      role: 'core',
      level: 16,
      specs: [5, 3],
      earlySpecs: [3],
      note: 'Главный источник урона. На ур. 16 — снятие перезарядки (несколько применений за окно) + доп. урон при попадании. Окно открывают Удар щитом, Кара хранителя, Удар щитом (рывок) и Щит погибели.'
    },
    {
      skill: VICIOUS_STRIKE,
      role: 'core',
      level: 16,
      specs: [5, 4, 3],
      earlySpecs: [3, 4],
      note: 'Базовая атака — держать зажатой вместе с макросом. На ур. 16 — 4-я комбинация «Ожесточённый удар». Раньше — мульти-удар и сокращение перезарядки Кары хранителя.'
    },
    {
      skill: PUMMEL,
      role: 'core',
      level: 16,
      specs: [5, 3, 4],
      earlySpecs: [3, 4],
      note: 'Заполнитель в ячейке Суда. На ур. 16 — доп. урон «Удара возмездия». Для боссов — больше урона по малому числу целей.'
    },
    {
      skill: PUNISHMENT,
      role: 'core',
      level: 16,
      specs: [5, 2, 4],
      earlySpecs: [2, 4],
      note: 'Заряжаемый удар на отдельной клавише. На ур. 16 — игнор блока и уклонения + гарантированный крит. До этого — урон со временем; применение в движении — для свободы манёвра.'
    },
    { skill: WARDING_STRIKE, role: 'support', specs: [1, 3], note: '−5 с перезарядки и лечение во время Протекции. Открывает окно Суда.' },
    { skill: SHIELD_SMITE, role: 'support', specs: [4, 3], note: 'Сокращение перезарядки и шанс вызвать Удар изнеможения. В ячейке — выше Кары хранителя.' },
    { skill: ANNIHILATE, role: 'support', specs: [3, 4], note: 'Доп. урон по целям с иммунитетом к контролю и −10 с перезарядки.' },
    {
      skill: DEBILITATING_SMASH,
      role: 'support',
      specs: [2, 4],
      note: 'PvE: +3 с ослабления и игнор блока с мульти-ударом. Снижение лечения — только для PvP.'
    },
    {
      skill: POACH,
      role: 'support',
      specs: [1, 4, 3],
      note: 'Перемещение к боссам, которых нельзя притянуть; щит 10% ОЗ на боссах или сброс при убийстве в фарме.'
    },
    { skill: SHIELD_RUSH, role: 'support', specs: [2, 4], note: '+10 м дальности и −10 с перезарядки. Доступен после уклонения в бою.' },
    { skill: FLASH_RAMPAGE, role: 'situational' },
    { skill: DEFIANCE, role: 'situational' },

    { skill: FURY, role: 'passive', note: 'Первый приоритет: блок даёт бафф урона вам и группе на 20 с.' },
    { skill: PUNISHING_BENEDICTION, role: 'passive', note: 'Атакующая пассивка — качать вместе с Неповиновением.' },
    { skill: INSULTING_ROAR, role: 'passive', note: 'Атакующая пассивка.' },
    { skill: ENHANCE_HEALTH, role: 'passive', note: 'Больше ОЗ — больше запаса на ошибку.' },
    { skill: IRONCLAD_DEFENSE, role: 'passive', note: 'ЗЩТ и несокрушимость.' },
    { skill: GUARDING_SEAL, role: 'passive', note: 'Щит, когда ОЗ ниже 50%.' },

    {
      skill: SHIELD_OF_PROTECTION,
      role: 'stigma',
      equip: true,
      level: 5,
      note: 'Нажимать прямо перед ударом босса; держится ~3 с. На ур. 5 — второе применение подряд.'
    },
    { skill: NOBLE_ARMOR, role: 'stigma', equip: true, level: 15, note: 'Лечение + бафф на 2 мин (равен перезарядке). Ур. 15 — важная цель.' },
    {
      skill: BATTLEFIELD_BANNER,
      role: 'stigma',
      equip: true,
      note: 'Часть ЗЩТ превращается в АТК. В позднем групповом контенте заменить на Провокацию ур. 15.'
    },
    {
      skill: DOOM_SHIELD,
      role: 'stigma',
      equip: true,
      note: 'Рывок, который открывает окно Суда. Особенно хорош, когда у Суда снята перезарядка.'
    },
    {
      skill: TAUNT,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Поздний групповой контент: вместо Боевого знамени. Снижает стойкость цели к урону на 10% — плюс всей группе.'
    },
    { skill: NEZEKANS_SHIELD, role: 'stigma', equip: false, note: 'По ситуации вместо Щита погибели: щит группе от больших атак босса.' }
  ],

  stats: [
    { stat: S.attack, weight: 5, note: ASSISTANT },
    { stat: S.attackBonus, weight: 5 },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.critical, weight: 5 },
    { stat: S.weaponDamageBoost, weight: 4 },
    { stat: S.combatSpeed, weight: 4 },
    { stat: S.multiHit, weight: 4 },
    { stat: S.critDamageBoost, weight: 4 },
    { stat: S.pveAttack, weight: 4 },
    { stat: S.bossAttack, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.double, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.maxAttack, weight: 3 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.frontAttack, weight: 3 },
    { stat: S.frontCritical, weight: 3 },
    { stat: S.pveAccuracy, weight: 3 },
    { stat: S.accuracy, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.cooldown, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.block, weight: 3, note: 'Блок запускает Ярость' },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hp, weight: 2 },
    { stat: S.accuracyBonus, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.critDamageTolerance, weight: 2 },
    { stat: S.incomingHeal, weight: 2 },
    { stat: S.endurancePenetration, weight: 2 },
    { stat: S.mp, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.defenseBonus, weight: 1 },
    { stat: S.frontDefense, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: JUDGMENT, weight: 5 },
      { skill: VICIOUS_STRIKE, weight: 5 },
      { skill: PUMMEL, weight: 5 },
      { skill: PUNISHMENT, weight: 5 },
      { skill: FURY, weight: 5 },
      { skill: PUNISHING_BENEDICTION, weight: 4 },
      { skill: INSULTING_ROAR, weight: 4 },
      { skill: WARDING_STRIKE, weight: 3 },
      { skill: SHIELD_SMITE, weight: 3 },
      { skill: ANNIHILATE, weight: 3 },
      { skill: ENHANCE_HEALTH, weight: 3 },
      { skill: IRONCLAD_DEFENSE, weight: 3 },
      { skill: DEBILITATING_SMASH, weight: 2 },
      { skill: GUARDING_SEAL, weight: 2 },
      { skill: WARDING_SHIELD, weight: 2 },
      { skill: IMPACT_HIT, weight: 2 },
      { skill: BLOCK_PAIN, weight: 2 },
      { skill: SURVIVAL_WILLPOWER, weight: 1 },
      { skill: POACH, weight: 1 },
      { skill: SHIELD_RUSH, weight: 1 }
    ],
    notes: 'Гайд не требует полного крафтового сета: билд собирается и на данжевом шмоте. Улучшайте шмот параллельно с умениями.'
  },

  manastones: [
    { stat: S.attack, weight: 5, note: ASSISTANT },
    { stat: S.critical, weight: 5 },
    { stat: S.hp, weight: 3 },
    { stat: S.block, weight: 3 },
    { stat: S.accuracyBonus, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.mp, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [JUDGMENT, VICIOUS_STRIKE, PUMMEL, PUNISHMENT, WARDING_STRIKE, SHIELD_SMITE, ANNIHILATE, DEBILITATING_SMASH, SHIELD_RUSH, POACH, FLASH_RAMPAGE],
    passive: [
      FURY,
      PUNISHING_BENEDICTION,
      INSULTING_ROAR,
      ENHANCE_HEALTH,
      IRONCLAD_DEFENSE,
      GUARDING_SEAL,
      WARDING_SHIELD,
      IMPACT_HIT,
      BLOCK_PAIN,
      SURVIVAL_WILLPOWER
    ],
    useless: [DEFIANCE],
    notes:
      'Арканы фармятся в Трансцендентности. Ищите бонусы к четырём главным умениям. Перед заменой карты проверьте, как изменятся итоговые уровни — замена не должна отнять доступ к ключевой специализации.'
  },

  daevanion: {
    goals: [
      {
        id: 'early-140',
        name: 'Ранняя раскладка (~140 очков)',
        description: '+1 к Суду, Жестокому удару, Граду ударов и Кровавой мести на каждой из четырёх досок — это +4 уровня, чтобы дотянуть до ур. 16.',
        skills: [JUDGMENT, VICIOUS_STRIKE, PUMMEL, PUNISHMENT],
        boards: [21, 22, 23, 24]
      },
      {
        id: 'endgame-360',
        name: 'Эндгейм (~360 очков)',
        description: 'Те же +4 к главным умениям, плюс бонусы к поддерживающим атакам и пассивкам: Ярость, Кара небес, Несокрушимая защита.',
        skills: [JUDGMENT, VICIOUS_STRIKE, PUMMEL, PUNISHMENT, FURY, PUNISHING_BENEDICTION, IRONCLAD_DEFENSE, WARDING_STRIKE, SHIELD_SMITE, ANNIHILATE],
        boards: [21, 22, 23, 24]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Предложение помощника (в гайде доски Ариэль нет): крупные узлы «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Доска Ариэль — PvE, Асфель — PvP.',
        boards: [25],
        nodes: [250001, 250008, 250218, 250225, 250032, 250074, 250152, 250194, 250028, 250081, 250145, 250198]
      }
    ],
    notes: 'Точные раскладки досок в гайде даны картинками; здесь цели сведены к узлам «+1 к умению». Стат-узлы по пути выбирайте по приоритету статов.'
  },

  genus: { notes: 'В гайде не расписано — используются общие приоритеты статов.' },

  rotation: [
    'Наденьте Благородные доспехи и, если стоит, Боевое знамя.',
    'Если нужно подойти к боссу — Ловушка со специализацией на перемещение.',
    'Полностью зарядите и отпустите Кровавую месть.',
    'Зажмите Жестокий удар и макрос одновременно.',
    'Потратьте все применения Суда, и только потом открывайте новое окно Щитом погибели или Ударом щитом (рывком).',
    'Кровавая месть — снова, как откатится, между окнами Суда.',
    'Обновляйте баффы; Щит спасения — прямо перед ударами босса.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      { id: 'smash', name: 'Ячейка Истребления', skills: [ANNIHILATE, DEBILITATING_SMASH] },
      {
        id: 'judgment',
        name: 'Ячейка Суда',
        skills: [JUDGMENT, SHIELD_SMITE, WARDING_STRIKE, PUMMEL],
        note: 'Град ударов — в этой же ячейке: иначе связка будет уходить от Суда, пока он доступен.'
      }
    ],
    delayMs: 10,
    delayNote: 'В связке два шага — ячейки Истребления и Суда; по кругу, пока клавиша зажата.',
    manual: [
      { skill: VICIOUS_STRIKE, key: 'ЛКМ', when: 'Держать зажатой вместе с макросом.' },
      { skill: PUNISHMENT, when: 'Полностью зарядить и отпустить; снова — как откатится, между окнами Суда.' },
      { skill: DOOM_SHIELD, when: 'Новое окно Суда — когда все применения Суда потрачены.' },
      { skill: SHIELD_RUSH, when: 'Новое окно Суда или сближение. Авто-рывок может затащить в механику босса.' },
      { skill: POACH, when: 'Подойти к боссу — со специализацией на перемещение.' },
      { skill: SHIELD_OF_PROTECTION, when: 'Прямо перед ударами босса.' },
      { skill: NOBLE_ARMOR, when: 'До боя; обновлять.' },
      { skill: BATTLEFIELD_BANNER, optional: true, when: 'До боя, если стоит.' }
    ]
  },

  tips: [
    {
      title: 'Связка: две ячейки',
      text: 'Ячейка Истребления: Истребление → Удар изнеможения. Ячейка Суда: Суд → Удар щитом → Кара хранителя → Град ударов. В связке два шага (Истребление и Суд, задержка 10 мс), режим — по кругу, пока зажато.'
    },
    {
      title: 'Град ударов — в ячейке Суда',
      text: 'Если вынести Град ударов в другую ячейку, макрос будет уходить от Суда, пока он доступен, и терять часть короткого окна.'
    },
    {
      title: 'Что держать вручную',
      text: 'Ловушка, Щит спасения, Кровавая месть, Щит погибели и Удар щитом (рывок) — вне автоматических ячеек. Авто-рывок может затащить в механику босса.'
    },
    {
      title: 'Не ломайте окно Суда',
      text: 'Не начинайте заряжать Кровавую месть посреди окна Суда и не жмите Щит погибели, пока окно ещё открыто — так теряются применения.'
    },
    {
      title: 'Поздний групповой контент',
      text: 'Провокация ур. 15 вместо Боевого знамени: её дебафф снижает стойкость цели к урону на 10% для всей группы и помогает вернуть агро.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить макрос: ячейки Истребления и Суда, режим «по кругу»' },
    { id: 'binds', text: 'Жестокий удар на ЛКМ, макрос на ПКМ' },
    { id: 'manual', text: 'Кровавая месть, Щит погибели, Удар щитом (рывок), Щит спасения и Ловушка — на отдельных клавишах' }
  ]
}
