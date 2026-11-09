// Встроенный гайд: Волшебник, PvE — сводный. Собран из 8 гайдов (7 — для глобальной версии) и статистики
// 1 402 топ-волшебников глобальных серверов (metabot.gg, 9 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/sorcerer-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды» — подсчёты AION2 Vault по публичным билдам волшебников (2.11.2026).

import type { Guide } from '../types'

// Умения волшебника (ID игры)
const FLAME_ARROW = 15210000
const ICE_CHAIN = 15090000
const FIRESTORM = 15040000
const BITTERCOLD_WIND = 15280000
const BLAZE = 15050000
const FLAME_SCATTERSHOT = 15010000
const FROST = 15150000
const WINTERS_SHACKLES = 15110000
const FROST_BURST = 15220000
const WISH_OF_CONCENTRATION = 15310000
const HELLFIRE = 15060000
const DEFIANCE = 15240000
const FIRE_MARK = 15710000
const ROBE_OF_EARTH = 15720000
const COLD_SNAP = 15730000
const ROBE_OF_FLAME = 15740000
const ABSORB_ESSENCE = 15760000
const GRACE_OF_RESISTANCE = 15770000
const ROBE_OF_COLD = 15750000
const GRACE_OF_ENHANCEMENT = 15780000
const REVITALIZATION_CONTRACT = 15790000
const VITALITY_EVAPORATION = 15800000
const ELEMENT_ENHANCEMENT = 15400000
const DELAYED_EXPLOSION = 15320000
const FIRE_WALL = 15390000
const COLD_STORM = 15200000
const STEEL_BARRIER = 15160000
const DIVINE_BURST = 15360000
const ARCTIC_ARMOR = 15230000
const GLACIAL_SMITE = 15120000

// Статы (ID игры)
const S = {
  might: 1,
  dexterity: 2,
  constitution: 4,
  precision: 5,
  attackBonus: 19,
  damageBoost: 28,
  maxAttack: 31,
  weaponDamageBoost: 32,
  criticalAttack: 38,
  critDamageBoost: 44,
  criticalDamageTolerance: 47,
  bossAttack: 50,
  bossDefense: 51,
  defenseBonus: 52,
  pveAttack: 56,
  pveDefense: 57,
  powerShardDamage: 69,
  damageTolerance: 70,
  backAttack: 98,
  backAttackDamageBoost: 102,
  accuracyBonus: 104,
  pveAccuracy: 110,
  evasionBonus: 116,
  critical: 128,
  criticalResist: 133,
  multiHit: 146,
  statusResist: 159,
  hp: 193,
  hpIncrease: 196,
  mp: 199,
  mpRegen: 200,
  moveSpeed: 205,
  cooldown: 215,
  incomingHeal: 235,
  block: 255,
  combatSpeed: 282,
  penetration: 284,
  defense: 307,
  attack: 317,
  accuracy: 318,
  pveDamageBoost: 379,
  pveDamageTolerance: 380,
  attackIncrease: 425,
  defenseIncrease: 426,
  perfect: 442,
  double: 443,
  endurance: 445,
  bossDamageBoost: 520,
  frontAttack: 587,
  frontDefense: 588,
  frontAttackDamageBoost: 589
} as const

// Титулы (ID игры)
const T = {
  unboundByGenus: 13010021,
  guardianOfVerteron: 12030002,
  guardianOfAltgard: 22030002,
  saintOfVerteron: 12030003,
  saintOfAltgard: 22030003,
  ruleAllCreation: 13010025,
  dominatorOfDimensions: 13050011,
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  executionerOfLagta: 13020030
} as const

export const sorcererPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-sorcerer-pve-consensus',
  name: 'Волшебник PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'sorcerer',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся восемь гайдов и что реально носят 1 402 топ-волшебника глобальных серверов. Урон — окна Адского пламени: его заряжают полностью и только вручную, под Усилением стихий, Замедленным взрывом и Оковами зимы. Между окнами — Леденящий ветер, Зарево и Огненный гарпун (он сокращает перезарядку Адского пламени), а Огненная стрела летит без перерыва и восполняет ОМ. ОМ держите выше 25%: от этого зависит Дар усиления (+20% урона в PvE). Цель: Адское пламя — ур. 20; Исток силы, Зарево, Огненный гарпун, Огненная стрела, Леденящий ветер и Оковы зимы — 16; стигма Усиление стихий — 20. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-волшебники (1 402 игрока, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/sorcerer/build',
      date: '2026-11-09',
      region: 'global',
      kind: 'data',
      note: 'Умения, стигмы и шмот — по 1 302 игрокам, статы, титулы и крылья — по 1 402, доски — по 1 394, камни — по 533. Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'MetaRoad — Sorcerer PvE DPS Build',
      url: 'https://metaroad.gg/aion2/build-guides/sorcerer-pve-dps-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Глобальный клиент, сверено с корейскими и тайваньскими серверами. Самый подробный: уровни всех умений и пассивок, строки по слотам, камни, арканы, род, доски, титулы, пороги перезарядки.'
    },
    {
      title: 'AION2 Vault — Sorcerer PvE Build',
      url: 'https://aion2vault.com/builds/sorcerer/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка авторов (EUTOPIA, shr1kn, FrozenCloud, aLuckyRO, berdugz) и подсчёт стигм в 430 публичных билдах. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Sorcerer Macro',
      url: 'https://aion2vault.com/builds/sorcerer/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки shr1kn и других авторов, подсчёт 433 публичных связок: задержка, что держат вне связки.'
    },
    {
      title: 'AION2 Vault — Sorcerer Gear',
      url: 'https://aion2vault.com/builds/sorcerer/gear/',
      date: '2026-10-25',
      region: 'global',
      note: 'Строки на шмоте и арканы shr1kn.'
    },
    {
      title: 'AION 2 Global Guides — Sorcerer (Hwades, EUTOPIA, aLuckyRO, Grobs)',
      url: 'https://aion2-guides.info/en/sorcerer/',
      date: '2026-11-02',
      region: 'global',
      note: 'Бывший couga54.github.io/aion2-guides, проверено 8.11. Специализации Hwades на ур. 16–19, раскладка ячеек по рядам, замеры урона EUTOPIA.'
    },
    {
      title: 'ExpCarry — AION 2 Sorcerer Build Guide',
      url: 'https://expcarry.com/aion-2-sorcerer-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'После патча 28.10; стигмы — по выборке 200 профилей (28.10, без разделения PvE и PvP).'
    },
    {
      title: 'Skycoach — AION 2 Sorcerer Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/sorcerer-guide',
      author: 'Wayne Halkett',
      date: '2026-11-03',
      note: 'Версия игры не указана («текущий патч»). Тексты специализаций и связка из трёх ячеек.'
    },
    {
      title: 'GAMES.GG — Aion 2 Sorcerer Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-sorcerer-guide/',
      author: 'Abdalla',
      date: '2026-10-04',
      region: 'global',
      note: 'Клиент 1.0.21.0, до официального запуска 5 октября — самый ранний. Числа умений из подсказок игры.'
    },
    {
      title: 'GamerBlurb — Sorcerer Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-sorcerer-build-guide-pve-pvp-and-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Без чисел: только порядок умений, стигм и статов.'
    },
    {
      title: 'Game8 — Hellfire Sorcerer PvE Build',
      url: 'https://game8.co/games/Aion-2/archives/626191',
      date: '2026-10-16',
      note: 'Версия не указана; стигмы (Снежные доспехи, Стальная защитная оболочка, Рождение звезды) не совпадают ни с одним глобальным гайдом — взят как мнение меньшинства.'
    },
    {
      title: 'Aion 2 Meta — Sorcerer (Корея + 67 лучших глобальных)',
      url: 'https://aion2-meta.com/guides/sorcerer/',
      date: '2026-11-03',
      region: 'mixed',
      kind: 'data',
      note: 'Специализации и доли — по 6 145 корейским игрокам (там слотов стигм больше); глобальная колонка — 67 лучших игроков. Взят для сверки, не как основа.'
    },
    {
      title: 'Timesaver — сколько меткости и крита нужно (отчёты игроков)',
      url: 'https://timesaver.gg/blog/aion-2-accuracy-cap',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Пороги меткости и крита для Трансцендентности и Лудры — по отчётам игроков, от класса не зависят; официальных цифр нет.'
    }
  ],
  updatedAt: '2026-11-09T00:00:00.000Z',

  skills: [
    {
      skill: HELLFIRE,
      role: 'core',
      level: 20,
      specs: [1, 5, 4],
      note: 'Главный урон: перезарядка 45 с, заряд в 3 ступени, бьёт до 4 целей. +30% скорости умения (7 из 7), на ур. 16 — −15 с перезарядки (7 из 7), третьим на ур. 20 — игнор блока и уклонения + мульти-удар (6 из 7). До ур. 16 — варианты 1 и 4. Hwades держит вариант 4 до 20, а −15 с берёт только на 20. На подвижных боссах и пока учите бой — вариант 3, каст в движении (MetaRoad, Game8, aion2-meta). Ур. 20 — 5 гайдов; топ: ур. 16,5 — выше всех умений.'
    },
    {
      skill: WISH_OF_CONCENTRATION,
      role: 'core',
      level: 16,
      specs: [5, 4, 2],
      note: 'Бафф: +10% АТК и +100 меткости на 10 с, перезарядка 60 с. На ур. 16 — −10 с перезарядки всем умениям (7 из 7): с этого момента его жмут после больших умений, а не перед ними. Вторым — +10% скорости боя (MetaRoad, Hwades; корейские билды); shr1kn, berdugz и Game8 вместо неё оставляют +10% АТК — на ур. 20 будут оба. До ур. 16 — +10% АТК и скорость боя. Ур. 16 — 6 гайдов (Hwades — 20); топ: 16,2.'
    },
    {
      skill: BLAZE,
      role: 'core',
      level: 16,
      specs: [5, 3, 4],
      note: 'Бьёт только цель с Огненной меткой, перезарядка 5 с, +100 ОМ за удар. Отложенный урон через 3 с (7 из 7), на ур. 16 — −3 с перезарядки Истока силы за попадание (7 из 7), мульти-удар (6 из 7) — на ур. 16–19 его держит EUTOPIA вместо отложенного урона. В соло на сложных боссах — вариант 1, поглощение ОЗ (aLuckyRO, GAMES.GG). Ур. 16 — 4 гайда (GAMES.GG и Game8 — дальше 20); топ: 15,6.'
    },
    {
      skill: FIRESTORM,
      role: 'core',
      level: 16,
      specs: [4, 5, 2],
      note: 'Каждый огненный шар — −2 с перезарядки Адского пламени (вариант 4, ур. 12; 8 из 8): поэтому ур. 12 — первый порог. На ур. 16 — +15% урона за шар, до +75% (5 гайдов), на ур. 20 возвращается +20% скорости умения (6 гайдов). Дорогой по ОМ (250): пока ОМ не хватает — вариант 1, −50% расхода (aLuckyRO, MetaRoad, GAMES.GG). Ур. 16 — 5 гайдов; топ: 15,3.'
    },
    {
      skill: FLAME_ARROW,
      role: 'core',
      level: 16,
      specs: [4, 5, 3],
      note: 'Базовая атака на ЛКМ: +100 ОМ за выстрел и держит Огненную метку для Зарева. +5% урона огнём на 10 с (5 из 6), на ур. 16 — сброс перезарядки Зарева (MetaRoad, Vault, Hwades, GAMES.GG), мульти-удар — до 16 и на 20 (Vault, Hwades, Skycoach, Game8). На старте, пока ОМ не хватает, — вариант 1, +20% ОМ (aLuckyRO, Hwades). Ур. 16 — 5 гайдов (MetaRoad — 14); топ: 15,3.'
    },
    {
      skill: BITTERCOLD_WIND,
      role: 'core',
      level: 16,
      specs: [4, 1, 2],
      note: 'Урон водой по области, перезарядка 15 с. Вариант 4 (ур. 12) — игнор блока и уклонения и всегда крит (5 из 6), +1 с действия (4 из 6). Третьим на ур. 20 — каст в движении (MetaRoad, Hwades); −1 с Заморозки (вариант 5, Skycoach) не нужен, если Заморозки нет на панели. Ур. 16 — 3 гайда (MetaRoad — 18, GAMES.GG — 12); топ: 15.'
    },
    {
      skill: WINTERS_SHACKLES,
      role: 'support',
      level: 16,
      specs: [3, 5, 4],
      note: "+20% урона в PvE на 5 с после попадания (вариант 3; 5 из 5) — кастуйте прямо перед зарядом Адского пламени. Без него урон ниже примерно на 3% (MetaRoad). На ур. 16 — −15 с перезарядки (4 гайда), на 20 — доп. умение «Winter's Illusion» (EUTOPIA, Hwades, Skycoach); MetaRoad и Game8 вместо него берут каст в движении. Ур. 16 — Skycoach, Game8, shr1kn (MetaRoad — 14); топ: 14,6."
    },
    {
      skill: FLAME_SCATTERSHOT,
      role: 'situational',
      specs: [5, 4, 3],
      note: 'Бьёт только цель со сбитой шкалой оглушения. На ур. 16 — −1 с перезарядки всем умениям за попадание (MetaRoad, Hwades, shr1kn): в окно оглушения — подряд. Ниже 16 MetaRoad советует убрать с панели, EUTOPIA часто не жмёт. Топ: ур. 11,6.'
    },
    {
      skill: ICE_CHAIN,
      role: 'situational',
      specs: [4, 2, 3],
      note: 'Для групп мобов, на боссах не нужна (jblah, narsu, EUTOPIA). Вариант 4 — −1 с перезарядки Оков зимы за попадание (Hwades; в 139 из 223 публичных связок с ней). Узлы досок и арканы — не тратить. Топ: ур. 10,7.'
    },
    {
      skill: FROST,
      role: 'situational',
      specs: [3, 2],
      note: 'Умение прокачки: заморозка и сброс Замораживающего взрыва (shr1kn). В эндгейме снимают с панели (aion2-guides); арканы и узлы — не тратить. Топ: ур. 10,6.'
    },
    {
      skill: FROST_BURST,
      role: 'situational',
      specs: [1, 2],
      note: 'Бьёт только замороженную цель; вариант 1 — поглощение ОЗ, «это и есть лечение» (MetaRoad). Hwades держит до ~2 700 уровня шмота, по замерам EUTOPIA прибавка от +0,8% до −3%. Топ: ур. 11,5.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [3, 4],
      note: 'Снимает оглушение, опрокидывание, заморозку и страх. +20% ОЗ при применении (MetaRoad), +2 с стойкости (Hwades); на ур. 16 Hwades берёт +50% стойкости к урону в PvE на время стойкости. Ур. 12 — MetaRoad, Hwades.'
    },

    {
      skill: ROBE_OF_FLAME,
      role: 'passive',
      level: 20,
      note: 'Первая пассивка у 6 гайдов: меткость, урон в PvE и Сокрушающий удар. Усиление стихий ур. 10 — ×1,5. Строка Ауры пламени есть на каждой вещи брони (MetaRoad, Vault, Hwades, Skycoach), поэтому её можно вести далеко за 20: MetaRoad — к 32, у 67 лучших глобальных волшебников — 24,8 (aion2-meta). Топ: 16,8 — выше всех пассивок.'
    },
    {
      skill: GRACE_OF_ENHANCEMENT,
      role: 'passive',
      level: 16,
      note: '+20% урона в PvE, пока ОМ не ниже 25%. Усиление стихий ур. 15 — ×1,5. Вторая у MetaRoad и Vault, у Skycoach — первая; MetaRoad — ур. 16, Game8 — 20. Топ: 14,1.'
    },
    {
      skill: FIRE_MARK,
      role: 'passive',
      level: 16,
      note: 'Без неё не работает Зарево; цель с меткой получает доп. урон огнём. EUTOPIA — «максимум», MetaRoad — 18, Game8 — 15. Топ: 15,3.'
    },
    {
      skill: ROBE_OF_EARTH,
      role: 'passive',
      level: 14,
      note: 'Макс. ОМ и восстановление ОМ, а пока ОМ не ниже 50% — крит. Skycoach и EUTOPIA ставят высоко, aLuckyRO — низко на старте; MetaRoad — 14. Топ: 14,4.'
    },
    {
      skill: VITALITY_EVAPORATION,
      role: 'passive',
      level: 14,
      note: 'Доп. урон по цели, у которой больше 70% ОЗ — начало боя. aLuckyRO — сразу за первыми тремя; MetaRoad — 14. Топ: 14,2.'
    },
    { skill: ROBE_OF_COLD, role: 'passive', level: 12, note: 'ЗЩТ и сопротивление криту — выживание на сложных боссах (Hwades). MetaRoad — 12; топ: 12,9.' },
    { skill: COLD_SNAP, role: 'passive', note: 'Доп. урон по замедленной цели (Метель, Оковы зимы). MetaRoad — 14, EUTOPIA оставляет низко. Топ: 11,7.' },
    { skill: ABSORB_ESSENCE, role: 'passive', note: 'ОМ за попадание и шанс эффектов — по остатку; MetaRoad пропускает, aLuckyRO — для PvP. Топ: 10,6.' },
    { skill: REVITALIZATION_CONTRACT, role: 'passive', note: 'Сопротивление эффектам — по остатку (MetaRoad пропускает). Топ: 9,9.' },
    { skill: GRACE_OF_RESISTANCE, role: 'passive', note: 'Только PvP (aLuckyRO, MetaRoad). Топ: 7,9.' },

    {
      skill: ELEMENT_ENHANCEMENT,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% АТК огнём и водой на 10 с, перезарядка 60 с — открывает окно урона. Ур. 5 — +200 меткости, 10 — Аура пламени ×1,5, 15 — Дар усиления ×1,5, 20 — ещё +10% АТК огнём и водой. Есть во всех 8 гайдах, и все, кто даёт порядок, качают её первой (aLuckyRO и shr1kn — сначала до 15); MetaRoad и Hwades — до 20. Топ: 95%, в среднем ур. 16,6.'
    },
    {
      skill: DELAYED_EXPLOSION,
      role: 'stigma',
      equip: true,
      level: 14,
      note: 'Взрыв через 4 с; пока он не случился, цель получает от вас на 15% больше — в это окно и бьют Адским пламенем. Ур. 5 — +200 ОМ, 10 — −10 с перезарядки (shr1kn, Hwades — первый порог), 15 — по области, 20 — ещё +10% получаемого урона. 7 из 8 гайдов; ур. 14 — MetaRoad; топ: 91%, ур. 12,2.'
    },
    {
      skill: FIRE_WALL,
      role: 'stigma',
      equip: true,
      level: 14,
      note: 'Стена огня на 3 с с горением по площади. Ставится на место и не двигается — на подвижного босса бесполезна (MetaRoad). Ур. 5 — сильнее горение (aLuckyRO: «минимум 5»), 10 — шире на 2 м, 15 — +2 с, 20 — горение +10 с. 7 из 8; ур. 14 — MetaRoad (Hwades качает второй после Усиления стихий); топ: 91%, ур. 11,8.'
    },
    {
      skill: COLD_STORM,
      role: 'stigma',
      equip: true,
      level: 14,
      note: 'Урон водой, замедление и поле обморожения на 7 с; тоже ставится на место. Ур. 5 — сильнее обморожение, 10 — шанс обездвижить, 15 — +3 с, 20 — обморожение +10 с. 7 из 8 (GamerBlurb допускает Ледяной удар вместо неё); ур. 14 — MetaRoad; топ: 75%, ур. 9. Этот слот меняют по ситуации.'
    },
    {
      skill: STEEL_BARRIER,
      role: 'stigma',
      equip: false,
      note: 'Щит на 16% макс. ОЗ на 60 с и +10% стойкости к урону в PvE. Вместо Метели — в Трансцендентности и Кошмаре (EUTOPIA), в «безопасном» наборе для сложной экспедиции (ExpCarry), в соло и на прокачке (MetaRoad, Hwades). Ур. 15 — ещё +10% стойкости в PvE. Топ: 44%, ур. 5,6.'
    },
    {
      skill: DIVINE_BURST,
      role: 'stigma',
      equip: false,
      note: '50 урона по шкале оглушения — больше всех умений. Ставят, когда группа не сбивает шкалу (EUTOPIA, MetaRoad, shr1kn); aLuckyRO считает бесполезной в PvE, а EUTOPIA на контенте 1 400–1 600 проблем со шкалой не видел: Адское пламя само даёт 20–35. Топ: 25%.'
    },
    {
      skill: ARCTIC_ARMOR,
      role: 'stigma',
      equip: false,
      note: '+20% стойкости к урону в PvE на 10 с. В «защитном» наборе GAMES.GG и у Game8; Hwades берёт для Бездны. Топ: 18%.'
    },
    {
      skill: GLACIAL_SMITE,
      role: 'stigma',
      equip: false,
      note: 'Урон по области: MetaRoad ставит его для фарма мобов вместо Стены огня или Метели, GamerBlurb — вместо Метели ради мгновенного урона. Топ: 15%.'
    }
  ],

  stats: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Сводка 8 гайдов: чаще всего называют скорость боя и АТК (8 из 8), меткость, крит и крит. урон (по 6), урон оружия, увелич. урона и сокращение перезарядки (по 5)'
    },
    { stat: S.combatSpeed, weight: 5, note: 'Ускоряет и касты (подсказка игры: скорость боя включает скорость умений)' },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5, note: 'Тот же множитель, что дают Дар усиления и Аура пламени' },
    { stat: S.weaponDamageBoost, weight: 5, note: 'На гримуаре и наручах (MetaRoad, Vault, Hwades, Skycoach)' },
    { stat: S.critDamageBoost, weight: 5 },
    { stat: S.attackBonus, weight: 5 },
    {
      stat: S.accuracy,
      weight: 4,
      note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 200 Лудра), дальше — меньше. Skycoach ставит меткость выше всего'
    },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    {
      stat: S.critical,
      weight: 4,
      note: 'Крит упирается в 50%; Леденящий ветер с вариантом 4 критует и без него, а Мантия даёт крит, пока ОМ не ниже 50%'
    },
    { stat: S.double, weight: 4, note: 'Сокрушающий удар — шлем, наплечники, плащ (MetaRoad, Hwades, Vault, Skycoach)' },
    { stat: S.attackIncrease, weight: 4 },
    {
      stat: S.cooldown,
      weight: 4,
      note: 'Строкой на шмоте не бывает (ExpCarry): даёт её Исток силы, доски, титулы и крылья. Пороги MetaRoad — ниже, в «Целях статов»'
    },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.perfect, weight: 3, note: 'Перчатки, поножи, сапоги (Hwades, Skycoach); MetaRoad — «низкий приоритет»' },
    { stat: S.precision, weight: 3 },
    { stat: S.multiHit, weight: 3, note: 'Hwades, Skycoach, GamerBlurb — на оружии' },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    {
      stat: S.mp,
      weight: 3,
      note: 'Волшебнику ОМ нужнее, чем другим: Дар усиления работает при ОМ от 25%, крит Мантии — от 50% (ExpCarry, GAMES.GG, Hwades)'
    },
    { stat: S.moveSpeed, weight: 3, note: 'Сапоги и серьги (MetaRoad, Hwades, Vault, GamerBlurb)' },
    { stat: S.damageTolerance, weight: 3, note: 'Строка поножей (MetaRoad)' },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.hp, weight: 2, note: 'ОЗ и стойкость — «сколько нужно, чтобы пережить бой» (GAMES.GG, ExpCarry)' },
    { stat: S.mpRegen, weight: 2, note: 'aion2-guides: следите за макс. ОМ и восстановлением ОМ' },
    { stat: S.frontAttackDamageBoost, weight: 2, note: 'Спорно: MetaRoad видел ~¾ урона спереди на тайваньском замере, в глобальной версии не проверено' },
    { stat: S.constitution, weight: 2 },
    { stat: S.dexterity, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.endurance, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.incomingHeal, weight: 1 },
    { stat: S.statusResist, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: HELLFIRE, weight: 5 },
      { skill: WISH_OF_CONCENTRATION, weight: 5 },
      { skill: BLAZE, weight: 5 },
      { skill: FIRESTORM, weight: 5 },
      { skill: ROBE_OF_FLAME, weight: 5 },
      { skill: GRACE_OF_ENHANCEMENT, weight: 4 },
      { skill: FIRE_MARK, weight: 4 },
      { skill: BITTERCOLD_WIND, weight: 4 },
      { skill: FLAME_ARROW, weight: 3 },
      { skill: WINTERS_SHACKLES, weight: 3 },
      { skill: ROBE_OF_EARTH, weight: 3 },
      { skill: VITALITY_EVAPORATION, weight: 2 },
      { skill: ROBE_OF_COLD, weight: 2 },
      { skill: FLAME_SCATTERSHOT, weight: 1 },
      { skill: COLD_SNAP, weight: 1 }
    ],
    notes:
      'Что носят топ-волшебники: Гримуар разъяренной Кромед (27%, в среднем +14,6), Aulamus Spellbook (14%), Гримуар духовного начала (13%); Наручи Нуакума (41%); броня Нуакума (56–59%); украшения разъяренной Кромед (53–58%); Благородный пояс (91%), Амулет откровения (90%), Руна столкновения (98%). Гримуар +15 у 61%, наручи +15 у 48%, броня чаще +10. Строки (MetaRoad, Vault, Hwades, Skycoach — совпадают почти полностью): гримуар и наручи — скорость боя, увелич. урона оружия, увелич. урона, Мощь, Точность; на каждой вещи брони — Аура пламени; шлем и плащ — Сокрушающий удар и увеличение АТК, наплечники — крит. урон, нагрудник — увелич. урона, поножи — стойкость к урону, перчатки — скорость боя, сапоги — скорость движения; ожерелье и серьги — скорость боя или движения, Мощь, Точность, Аура пламени; кольца — уровни Адского пламени, Истока силы, Зарева и Огненного гарпуна (АТК — только когда цели по уровням взяты, MetaRoad).'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням 533 топ-волшебников): доп. меткость, крит, ОЗ, ОМ, АТК, ЗЩТ, блок, сопр. криту, УКЛ; урон оружия — у 30%. aion2-guides: АТК, крит, меткость'
    },
    { stat: S.weaponDamageBoost, weight: 4, note: 'MetaRoad — первым на гримуар и наручи' },
    { stat: S.accuracyBonus, weight: 4, note: 'Сначала — если промахиваетесь (GAMES.GG)' },
    { stat: S.critical, weight: 4 },
    { stat: S.critDamageBoost, weight: 3, note: 'MetaRoad советует на оружие, у топ-волшебников таких камней не видно' },
    { stat: S.mp, weight: 3, note: 'Корейские билды ставят ОМ на оружие (aion2-meta)' },
    { stat: S.hp, weight: 3 },
    { stat: S.frontAttackDamageBoost, weight: 2, note: 'MetaRoad, спорно — см. статы' },
    { stat: S.defense, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [HELLFIRE, WISH_OF_CONCENTRATION, BLAZE, FIRESTORM, BITTERCOLD_WIND, WINTERS_SHACKLES, FLAME_ARROW, FLAME_SCATTERSHOT, ICE_CHAIN],
    passive: [ROBE_OF_FLAME, GRACE_OF_ENHANCEMENT, FIRE_MARK, ROBE_OF_EARTH, VITALITY_EVAPORATION, ROBE_OF_COLD, COLD_SNAP, REVITALIZATION_CONTRACT],
    useless: [DEFIANCE, FROST, FROST_BURST, GRACE_OF_RESISTANCE, ABSORB_ESSENCE],
    preferredSet: 'vigor',
    notes:
      'Топ-волшебники: Грааль «жизни» (54%), Пергамент «жизни» (39%), Зеркало «жизни» (39%), Компас «жизни» (33% против 22% «магии»), Колокол «магии» (38%). Гайды сходятся в трёх картах: Грааль и Пергамент «жизни», Колокол «магии» (MetaRoad, shr1kn, aion2-guides). Компас: «магии» — те же трое (у MetaRoad — ради Смерти, крит), у топа чаще «жизни». Зеркало: «жизни» — MetaRoad (Видение — перезарядка; после ~35% сокращения перезарядки — менять на «магии»), «магии» — shr1kn, aion2-guides. Vault советует 2 «жизни» + 3 «магии»; у топа скорее 4 + 1. Главное — карты с умениями: Пергамент — Адское пламя, Исток силы, Зарево, Огненный гарпун (только так Адское пламя дойдёт до 20, MetaRoad); Компас — Леденящий ветер, Оковы зимы, Огненная пальба; Зеркало — Аура пламени, Дар усиления, Мантия, Угасание; Колокол — Огненная метка, Пелена льда, Призыв холода. Грааль берёт любое умение — его MetaRoad советует делать последним.'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Адскому пламени, Истоку силы, Зареву и Огненному гарпуну на каждой из четырёх досок. Зарево и Адское пламя +1 на Неджакане берут 98% топ-игроков, Огненный гарпун и Адское пламя на Джикеле — 97%, Исток силы на Байзеле — 97%. С узлов умений начинают MetaRoad, Vault, Skycoach и GamerBlurb.',
        skills: [HELLFIRE, WISH_OF_CONCENTRATION, BLAZE, FIRESTORM],
        boards: [61, 62, 63, 64]
      },
      {
        id: 'support-skills',
        name: 'Огненная стрела, Леденящий ветер, Оковы зимы',
        description:
          '+1 к Огненной стреле (на Неджакане и Джикеле — 97% топ-игроков), Леденящему ветру и Оковам зимы — следом за главными у MetaRoad, Vault и Hwades.',
        skills: [FLAME_ARROW, BITTERCOLD_WIND, WINTERS_SHACKLES],
        boards: [61, 62, 63, 64]
      },
      {
        id: 'passives',
        name: 'Аура пламени, Дар усиления, Огненная метка',
        description:
          'Пассивки урона: Аура пламени (два узла на Неджакане, по одному на Байзеле и Триниэле, на Джикеле нет — MetaRoad), затем Дар усиления (MetaRoad, Hwades, GamerBlurb), Огненная метка (Vault, GamerBlurb) и Мантия (Hwades).',
        skills: [ROBE_OF_FLAME, GRACE_OF_ENHANCEMENT, FIRE_MARK, ROBE_OF_EARTH],
        boards: [61, 62, 63, 64]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: скорость боя и сокращение перезарядки (Неджакан), увелич. урона (Джикел), крит. урон (Байзел) — MetaRoad, aion2-guides, Vault, Game8; aion2-guides и Game8 берут их даже раньше узлов умений. Стойкость к урону на Джикеле — по желанию; мульти-удар на Триниэле Hwades пропускает, MetaRoad — «по желанию»; стойкость к крит. урону и сопротивление мульти-удару — пропустить.',
        boards: [61, 62, 63, 64],
        nodes: [610033, 610193, 610043, 610183, 620043, 620183, 630033, 630193]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — со сложных экспедиций; Hwades закладывает на неё 120 очков): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Узлы — как в сводном гайде стража (оценка помощника: гайды волшебников точной раскладки по Ариэль не дают, Skycoach и ExpCarry советуют её ради урона в PvE). У большинства топ-волшебников доска пока пустая. Асфель — только PvP.',
        boards: [65],
        nodes: [650001, 650008, 650218, 650225, 650032, 650074, 650152, 650194, 650028, 650081, 650145, 650198]
      }
    ],
    notes:
      'Не тратить очки на узлы ОЗ, ЗЩТ, ОМ и сопротивления криту (на старте), Поглощения силы, Благословения стойкости и Контракта оживления (MetaRoad); Снятие шока, Заморозку и Замораживающий взрыв — если очки не лишние (оценка помощника). Доски не рассчитаны на полное заполнение — четыре первые стоят 570 кристаллов (aion2-guides); полный PvE-набор MetaRoad — 471 очко.'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'MetaRoad: ячейки 1 и 5 — макс. АТК, затем доп. АТК; качать каждый род до ур. 10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.critDamageBoost, weight: 5, note: 'Ячейка 4 Разума (MetaRoad); Hwades там берёт крит или урон в PvE' },
      { stat: S.weaponDamageBoost, weight: 5, note: 'Ячейка 4 Диких; Hwades — «где выпадет»' },
      { stat: S.double, weight: 5, note: 'Ячейка 4 Особого рода (MetaRoad); Hwades — первый род на Сокрушающий удар и АТК' },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.multiHit, weight: 4, note: 'Ячейка 4 Природы (MetaRoad, Hwades, Game8)' },
      {
        stat: S.frontAttackDamageBoost,
        weight: 4,
        note: 'Ячейка 4 Мутантов (MetaRoad); Hwades — урон спереди или с тыла, что выпадет: волшебник бьёт издалека'
      },
      { stat: S.backAttackDamageBoost, weight: 3 },
      { stat: S.damageBoost, weight: 4, note: 'Запасной вариант, если в ячейку 4 Разума или Диких не выпало нужное (MetaRoad)' },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad)' },
      { stat: S.critical, weight: 4, note: 'Ячейки 3, 6, 9 — крит или меткость, чего не хватает (MetaRoad)' },
      { stat: S.accuracyBonus, weight: 4 },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.damageTolerance, weight: 4, note: 'Ячейка 7 — стойкость к урону (MetaRoad: после ячейки 4 запирать её)' },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.perfect, weight: 3 },
      { stat: S.pveAttack, weight: 3 },
      { stat: S.bossAttack, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.hp, weight: 3 },
      { stat: S.frontAttack, weight: 2 },
      { stat: S.backAttack, weight: 2 },
      { stat: S.mp, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.powerShardDamage, weight: 2 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Порядок запирания (MetaRoad): ячейка 4 → 7 → 2 и 8, остальное — АТК и крит/меткость. Запирайте только уникальные значения у верха диапазона. Ячейка 4 у каждого рода — свой урон: Разум — крит. урон, Дикие — урон оружия, Природа — мульти-удар, Мутанты — урон спереди, Особый — Сокрушающий удар (MetaRoad). Корейские роллы Сокрушающего удара и урона спереди в ячейках 3 и 9 в глобальной версии не выпадают.'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.ruleAllCreation, T.dominatorOfDimensions],
    utility: [T.throughHellAndBack, T.emptyCloset, T.executionerOfLagta],
    notes:
      'Что носят топ-волшебники: атака — Unbound by Genus (50% в сумме двух версий), затем Защитник Альтгарда (8,8%; для Элийцев — Защитник Бертрона); защита — Святой Альтгарда / Бертрона (76%), Rule All Creation (10%); другое — Прошедший огонь и воду (60%, сокращение перезарядки). Hwades советует Unbound by Genus, Empty Closet (скорость боя и перезарядка) и Rule All Creation, MetaRoad на старте — Защитника, Святого и Executioner of High Commander Lagta (скорость боя и движения), позже — Dominator of Dimensions и Empty Closet. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель.'
  },

  statTargets: [
    {
      id: 'accuracy',
      name: 'Меткость в PvE',
      kind: 'content',
      stats: [S.accuracy, S.accuracyBonus, S.pveAccuracy],
      goals: [
        { value: 800, label: 'Трансцендентность 4' },
        { value: 1200, label: 'Лудра, обычная и сложная' }
      ],
      raise: [S.accuracyBonus, S.pveAccuracy, S.accuracy],
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов (Исток силы и Усиление стихий ур. 5 дают ещё ~300 в бою — MetaRoad). Порог — блок босса, от класса не зависит: меткость сверх него не нужна. Цифры — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026), официальных нет.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [{ value: 1700, label: 'предел 50% шанса против Лудры' }],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Леденящему ветру с вариантом 4 крит не нужен — он критует всегда. Мантия добавляет крит, пока ОМ не ниже 50%.'
    },
    {
      id: 'cooldown',
      name: 'Сокращение перезарядки',
      kind: 'content',
      stats: [S.cooldown],
      goals: [
        { value: 2500, label: 'минимум (MetaRoad)' },
        { value: 3500, label: 'комфортно (MetaRoad)' },
        { value: 6000, label: 'предел (MetaRoad)' }
      ],
      note: 'Пороги одного источника — MetaRoad (откуда числа, не сказано). Волшебник живёт сокращением перезарядок: Адское пламя, Исток силы и Зарево укорачивают друг друга. На шмоте строки нет — растёт от досок (Неджакан), титулов, крыльев Talisra и Видения в пантеоне.'
    },
    ...(
      [
        [S.might, 'Мощь', 48.5],
        [S.precision, 'Точность', 27],
        [S.dexterity, 'Ловкость', 25.4],
        [S.constitution, 'Здоровье', 19.9],
        [6, 'Воля', 10.7]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-волшебников' }],
      note: 'Средний уровень у 1 402 топ-волшебников глобальной версии (metabot.gg, 9.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 59.8],
        [7, '[Неджакан] Справедливость', 51],
        [14, '[Триниэль] Смерть', 45],
        [8, '[Байзел] Свобода', 40.6],
        [13, '[Джикел] Разрушение', 39],
        [17, '[Израфель] Пространство', 34.1],
        [10, '[Юстиэль] Жизнь', 32.4],
        [9, '[Кайсинель] Видение', 31.1],
        [15, '[Румиэль] Мудрость', 29.9],
        [16, '[Маркутан] Судьба', 26.7]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-волшебников' }],
      note: 'Стат бога: средний у 1 402 топ-волшебников глобальной версии (metabot.gg, 9.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'Встаньте там, где сможете стоять: волшебник — «турель» (Skycoach). Адское пламя при заряде держит на месте, а Стена огня и Метель остаются там, где их поставили, — на подвижном боссе они пропадают зря (MetaRoad).',
    'Окно урона: Усиление стихий → Замедленный взрыв (4 с цель получает от вас на 15% больше) → Оковы зимы (+20% урона в PvE на 5 с) → Адское пламя полным зарядом. Так открывают MetaRoad, Skycoach, aion2-guides и EUTOPIA.',
    'Сразу после — Стена огня и Метель под босса. Каждое Адское пламя — хотя бы под одним баффом или Замедленным взрывом (aion2-guides).',
    'Между окнами держите связку (Леденящий ветер, Зарево, Огненный гарпун) и Огненную стрелу на ЛКМ: она восполняет ОМ и держит Огненную метку, без которой Зарево не применяется.',
    'Исток силы: до ур. 16 — первым, прямо перед окном (бафф АТК на 10 с). С ур. 16 (вариант 5: −10 с перезарядки всем умениям) — после больших умений, последним (MetaRoad, aion2-guides, Skycoach, EUTOPIA).',
    'Перезарядки укорачивают друг друга: каждый огненный шар Огненного гарпуна — −2 с Адского пламени, Зарево — −3 с Истока силы, Огненная стрела на ур. 16 сбрасывает Зарево. Поэтому Огненный гарпун ур. 12 — первый порог урона.',
    'ОМ держите выше 25% (Дар усиления: +20% урона в PvE), лучше выше 50% (крит Мантии). Проседает — больше Огненной стрелы; на старте — вариант 1 у Огненного гарпуна (−50% расхода ОМ).',
    'Шкала оглушения босса сбита — Огненная пальба подряд. Рождение звезды (если надето) — когда группа не добивает шкалу; не жать, пока босс неуязвим, меняет фазу или уже оглушён (shr1kn).'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'core',
        name: 'Основная ячейка',
        skills: [BITTERCOLD_WIND, BLAZE, FIRESTORM, WISH_OF_CONCENTRATION],
        when: { skill: WISH_OF_CONCENTRATION, minLevel: 16 },
        note: 'Та же ячейка у EUTOPIA, Skycoach, GAMES.GG и в корейских билдах (aion2-meta): Леденящий ветер (ряд 0) — по откату, Зарево — по Огненной метке, Огненный гарпун — сокращает перезарядку Адского пламени, Исток силы — в ряду 3: с ур. 16 он сбрасывает 10 с всем умениям и должен идти после остальных. aion2-guides ставит в ряд 0 Зарево, MetaRoad в ряд 3 — Оковы зимы вместо Истока силы, а Исток силы жмёт сам (как и 82% публичных билдов, Vault). Адского пламени здесь нет: связка отпускает его на первой ступени заряда.'
      },
      {
        id: 'core-early',
        name: 'Основная ячейка — пока Исток силы ниже 16',
        skills: [BITTERCOLD_WIND, BLAZE, FIRESTORM],
        when: { skill: WISH_OF_CONCENTRATION, maxLevel: 15 },
        note: 'До ур. 16 у Истока силы нет сброса перезарядок — это просто бафф АТК на 10 с, и жмут его вручную прямо перед окном Адского пламени (Vault, aion2-guides, Skycoach, GAMES.GG).'
      },
      {
        id: 'burst',
        name: 'Ячейка окна — вручную, не в связке',
        skills: [DELAYED_EXPLOSION, WINTERS_SHACKLES],
        key: 'Q',
        note: 'Отдельная клавиша, не шаг связки: окно должно совпасть с зарядом Адского пламени, а связка жмёт по откату. Два нажатия: Замедленный взрыв (ряд 0), затем Оковы зимы — и сразу заряжайте Адское пламя. Так у Skycoach и EUTOPIA; aion2-guides и корейские билды кладут сюда же и Адское пламя. По замеру EUTOPIA такие ручные ячейки бьют сильнее связки: ~21 100 урона в секунду против ~19 200 у его связки и ~17 400 у «всё в одной связке».'
      },
      {
        id: 'field',
        name: 'Ячейка стигм — вручную, не в связке',
        skills: [ELEMENT_ENHANCEMENT, FIRE_WALL, COLD_STORM],
        key: 'E',
        note: 'Усиление стихий в ряду 0 — первым нажатием, перед окном (так у aion2-guides, корейских билдов и у shr1kn: Усиление стихий первым в своей ячейке у 328 из 339 публичных связок). Следующие нажатия, уже после Адского пламени, — Стена огня и Метель под стоящего босса. Перезарядка у всех трёх 60 с, поэтому порядок сохраняется сам. Skycoach и EUTOPIA держат Усиление стихий на своей клавише, а ячейку — из Стены огня и Метели.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс при пинге ниже 50 (aLuckyRO, Hwades, MetaRoad; у shr1kn — 10, 10 и 11 мс, так у 133 из 433 публичных связок). Пинг выше 50 — 15–20 мс (aion2-guides), 80 и выше — 40–50 мс (MetaRoad, aLuckyRO). Повторять один шаг несколько раз не нужно: каждый повтор добавляет ~30 мс (aion2-guides). Популярная альтернатива — всё в связке, три ячейки shr1kn (Усиление стихий, Стена огня, Метель, Замедленный взрыв / Оковы зимы, Леденящий ветер, Заморозка, Огненный гарпун / Зарево, Замораживающий взрыв): удобнее, но окно не подгадаешь под Адское пламя.',
    manual: [
      {
        skill: FLAME_ARROW,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой: +100 ОМ за выстрел, держит Огненную метку для Зарева, а на ур. 16 сбрасывает Зарево (shr1kn, MetaRoad). Цель — в жёсткий захват, чтобы стрела летела после умений сама (aion2-guides).'
      },
      {
        skill: HELLFIRE,
        key: '2',
        when: 'Только вручную и полным зарядом (3 ступени): в связке оно уходит на первой ступени — у EUTOPIA ~15–16 тыс. урона в секунду против ~22 тыс. с полным зарядом. Жмите сразу после Замедленного взрыва и Оков зимы, внутри 10 с Усиления стихий. Не начинайте заряд, если босс вот-вот двинется или пойдёт механика.'
      },
      {
        skill: WISH_OF_CONCENTRATION,
        key: '1',
        when: 'До ур. 16 — прямо перед окном Адского пламени (бафф АТК на 10 с). С ур. 16 он уже в основной ячейке (ряд 3) и отдельно не нужен; MetaRoad и shr1kn и с 16 жмут его сами — после больших умений.'
      },
      {
        skill: FLAME_SCATTERSHOT,
        key: '3',
        optional: true,
        when: 'Только по цели со сбитой шкалой оглушения — подряд всё окно; на ур. 16 каждое попадание −1 с всем перезарядкам (shr1kn).'
      },
      { skill: ICE_CHAIN, key: '4', optional: true, when: 'Только на группах мобов; на боссах не нужна.' },
      { skill: DEFIANCE, key: 'R', when: 'Когда оглушили, опрокинули, заморозили или напугали.' },
      {
        skill: STEEL_BARRIER,
        optional: true,
        when: 'Если стоит вместо Метели: до пула и снова, когда щит лопнул (aion2-meta); shr1kn — когда ОЗ ниже половины.'
      },
      {
        skill: DIVINE_BURST,
        optional: true,
        when: 'Если стоит: когда группа не сбивает шкалу оглушения. Не жать, пока босс неуязвим, меняет фазу или уже оглушён (shr1kn).'
      },
      { skill: ARCTIC_ARMOR, optional: true, when: 'Если стоит: прямо перед сильным ударом босса (+20% стойкости в PvE на 10 с).' }
    ],
    opener: [
      { skill: ELEMENT_ENHANCEMENT, note: 'E, первое нажатие' },
      { skill: DELAYED_EXPLOSION, note: 'Q — окно +15% на 4 с' },
      { skill: WINTERS_SHACKLES, note: 'Q — +20% урона в PvE на 5 с' },
      { skill: HELLFIRE, note: 'полный заряд' },
      { skill: FIRE_WALL, note: 'E' },
      { skill: COLD_STORM, note: 'E' },
      { skill: BITTERCOLD_WIND, note: 'дальше — связка' },
      { skill: BLAZE },
      { skill: FIRESTORM, note: 'сокращает перезарядку Адского пламени' },
      { skill: WISH_OF_CONCENTRATION, note: 'с ур. 16 — последним; до 16 — самым первым' }
    ],
    openerNote:
      'Порядок MetaRoad, Skycoach, aion2-guides и EUTOPIA: Усиление стихий → Замедленный взрыв → Оковы зимы → Адское пламя полным зарядом → Стена огня и Метель → Леденящий ветер, Зарево, Огненный гарпун. GamerBlurb и FrozenCloud ставят Стену огня и Метель до Адского пламени — если босс точно не двинется, разница небольшая. Дальше — связка и окно по откату Адского пламени.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки мыши (так советуют MetaRoad и shr1kn), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Огненная стрела. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для волшебника отдельно не проверялось). Окно (Q), стигмы (E) и Адское пламя (2) жмите сами — их время решаете вы.'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка aion2-guides и MetaRoad). Режим боя — «Цель», а не «Действие»: в режиме действия базовая атака прерывается (MetaRoad, aion2-guides). Включите резерв умений (Skill Queue), если умения не срабатывают (MetaRoad). Если видите «послеобразы» — анимации обрываются, увеличьте задержку (aion2-guides).'
  },

  tips: [
    {
      title: 'Связка и две ручные ячейки',
      text: 'Связка на ПКМ — одна основная ячейка: Леденящий ветер (ряд 0), Зарево, Огненный гарпун, Исток силы (с ур. 16), задержка 10 мс. Огненная стрела — на ЛКМ, держать обе кнопки. Ячейка окна на Q — Замедленный взрыв и Оковы зимы, ячейка стигм на E — Усиление стихий, Стена огня, Метель. Адское пламя — на своей клавише, только полный заряд. Подробно — на странице «Ротация».'
    },
    {
      title: 'ОМ — это урон',
      text: 'Дар усиления даёт +20% урона в PvE, пока ОМ не ниже 25%, а Мантия — крит, пока ОМ не ниже 50% (ExpCarry, MetaRoad, Hwades). Огненный гарпун стоит 250 ОМ, Адское пламя — 200. Восполняют Огненная стрела и Зарево (+100 ОМ за удар), Замедленный взрыв ур. 5 (+200). На старте помогают вариант 1 у Огненного гарпуна (−50% расхода) и у Огненной стрелы (+20% ОМ); две карты «магии» дают +1 500 ОМ, когда ОМ ниже 20%.'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Исток силы: в основной ячейке (EUTOPIA, Skycoach, GAMES.GG, Hwades) или вручную (MetaRoad, shr1kn; 82% публичных билдов). Третий вариант Адского пламени: игнор блока (большинство) или каст в движении (MetaRoad, Game8). Четвёртая стигма: Метель (топ: 75%), Стальная защитная оболочка на сложном контенте (44%) или Рождение звезды под шкалу оглушения (25%). Арканы: 2 «жизни» + 3 «магии» (Vault) или 4 + 1 (топ).'
    },
    {
      title: 'Пороги урона',
      text: 'Огненный гарпун ур. 12 (вариант 4: −2 с Адского пламени за шар) — первый порог: ExpCarry, GAMES.GG и GamerBlurb ставят его в начало. Дальше ур. 16 у Истока силы (−10 с всем) и Адского пламени (−15 с), затем Адское пламя — 20. Стигма Усиление стихий: ур. 10 — Аура пламени ×1,5, ур. 15 — Дар усиления ×1,5. Очками умений любое умение доходит только до 10 — остальное дают доски (+4), кольца (+2) и арканы (MetaRoad).'
    },
    {
      title: 'Корея и глобальная версия',
      text: 'В глобальной версии 4 слота стигм (ур. 22, 27, 32, 37), поэтому корейские наборы не переносятся: там Стальную защитную оболочку носят 95%, у глобального топа — 44%. Предел крита в глобальной версии — 50% (в Корее — 80%). Корейские билды берут у Адского пламени на ур. 8 урон со временем (вариант 2), глобальные гайды — +30% скорости (вариант 1).'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Talisra (−4% перезарядки) — цель (MetaRoad; у 67 лучших глобальных волшебников — 70%, aion2-meta); у топа MetaBot пока чаще Ultimate Daeva (31%) и Dark Veil (23%). Пантеон (MetaRoad): портреты Видения (перезарядка) и Мудрости (Сокрушающий удар), колосс со Временем, Мудростью и Разрушением; браслеты — Видение, Мудрость, Разрушение, Время.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить связку: основная ячейка (Леденящий ветер, Зарево, Огненный гарпун, Исток силы с ур. 16) на ПКМ, задержка 10 мс' },
    { id: 'binds', text: 'Огненная стрела — на ЛКМ; Адское пламя — на своей клавише; ячейки окна (Q) и стигм (E) — вручную' },
    { id: 'stigmas', text: 'Стигмы: Усиление стихий, Замедленный взрыв, Стена огня, Метель (на сложном контенте — Стальная защитная оболочка вместо Метели)' },
    { id: 'breakpoint', text: 'Огненный гарпун — ур. 12 и специализация 4; Исток силы и Адское пламя — ур. 16 и специализация 5' },
    { id: 'mp', text: 'Держать ОМ выше 25% — иначе Дар усиления не даёт +20% урона в PvE' },
    { id: 'target-mode', text: 'Режим боя «Цель», жёсткий захват цели — тогда Огненная стрела не прерывается' },
    { id: 'weapon15', text: 'Гримуар — заточка +15 (так у большинства топ-волшебников)' },
    { id: 'arcana', text: 'Арканы: Грааль и Пергамент «жизни», Колокол «магии»; Компас и Зеркало — по выбору' }
  ]
}
