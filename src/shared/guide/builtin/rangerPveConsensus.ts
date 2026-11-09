// Встроенный гайд: Стрелок, PvE — сводный. Собран из 8 гайдов для глобальной версии и статистики
// 3 950 топ-стрелков глобальных серверов (metabot.gg, 9 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/ranger-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды: X%» — доля среди 399 публичных билдов стрелков со связкой (подсчёт AION2 Vault, 2.11.2026).

import type { Guide } from '../types'

// Умения стрелка (ID игры)
const DEADSHOT = 14010000
const SNIPE = 14020000
const TEMPEST_SHOT = 14340000
const SNARE_SHOT = 14130000
const MARKING_SHOT = 14090000
const DRILL_DART = 14050000
const ARROW_SCATTERSHOT = 14330000
const GALE_ARROW = 14110000
const EXPLOSION_TRAP = 14170000
const BURST_ARROW = 14080000
const SUPPRESSING_ARROW = 14070000
const DEFIANCE = 14260000
const VIGILANT_EYE = 14710000
const CONCENTRATED_FIRE = 14720000
const WIND_VIGOR = 14730000
const FOCUSED_EYE = 14740000
const HUNTERS_RESOLVE = 14750000
const UNYIELDING_RESOLVE = 14760000
const ROOTING_EYE = 14770000
const MELEE_FIRE = 14780000
const REVITALIZATION_CONTRACT = 14790000
const HUNTERS_SOUL = 14800000
const VAIZELS_AUTHORITY = 14310000
const BOW_OF_BLESSING = 14220000
const SUPPORTING_FIRE = 14380000
const GRIFFON_ARROW = 14060000
const EXPLOSIVE_ARROW = 14360000
const ARROW_STORM = 14270000
const MOTHER_NATURES_BREATH = 14350000

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
  dominatorOfDimensions: 13050011,
  ruleAllCreation: 13010025,
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  journeysPath: 13051004
} as const

export const rangerPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-ranger-pve-consensus',
  name: 'Стрелок PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'ranger',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся восемь гайдов для глобальной версии и что реально носят 3 950 топ-стрелков глобальных серверов. Главный урон — Прицельный выстрел полным зарядом под баффом Помечающего выстрела (Precision: +300 крит. удара и +35% урона Прицельного выстрела). Между ними работает связка (Шквал стрел, Пронзающая стрела, Скоростная стрельба, Стрела грифона, Опутывающий выстрел и Рассекающая стрела) и Меткий выстрел на ЛКМ — он сокращает перезарядку Прицельного выстрела. Первая цель среди стигм — Сила Байзела ур. 20. Цель по умениям: Прицельный выстрел и Шквал стрел — ур. 20; Пронзающая стрела, Скоростная стрельба и Меткий выстрел — 16. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-стрелки (3 950 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/ranger/build',
      date: '2026-11-09',
      region: 'global',
      kind: 'data',
      note: 'Умения и стигмы — по 3 466 игрокам, доски — по 3 473, статы и титулы — по 3 950, камни — по 769. Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'Mobalytics — Aion 2 Ranger PvE Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-ranger-pve-build',
      author: 'Mobalytics-Oli (билд FRESHY)',
      date: '2026-11-07',
      region: 'global',
      note: 'Самый свежий: связка из двух ячеек, бафы вручную, уровни стигм, строки шмота, титулы.'
    },
    {
      title: 'MetaRoad — Ranger PvE DPS Build',
      url: 'https://metaroad.gg/aion2/build-guides/ranger-pve-dps-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Глобальный клиент. Самый подробный по номерам специализаций, уровням пассивок, строкам шмота, арканам, роду и доскам.'
    },
    {
      title: 'ExpCarry — AION 2 Ranger Build Guide',
      url: 'https://expcarry.com/aion-2-ranger-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'Глобальная версия после патчей 14, 21 и 28 октября; стигмы — по выборке 200 стрелков (Aion2Builds, 28.10).'
    },
    {
      title: 'AION 2 Global Guides — Ranger (Whelps, Fubgun, JOHNPAL, LordRobson, Moxsy, aLuckyRO)',
      url: 'https://aion2-guides.info/en/ranger/',
      date: '2026-10-31',
      region: 'global',
      note: 'Проверено 8.11. Бывший couga54.github.io/aion2-guides (версия от 10.10 там больше не обновляется). Связки по рядам, маршрут досок, уровни стигм.'
    },
    {
      title: 'AION2 Vault — Ranger PvE Build',
      url: 'https://aion2vault.com/builds/ranger/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка авторов (whelps, J0EI, Moxsy, Allyria, aLuckyRO) и доли стигм в 389 публичных билдах. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Ranger Macro',
      url: 'https://aion2vault.com/builds/ranger/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки семи авторов и подсчёт 399 публичных связок: задержка, порядок, что держат вне связки, доли специализаций.'
    },
    {
      title: 'AION2 Vault — Ranger Gear',
      url: 'https://aion2vault.com/builds/ranger/gear/',
      date: '2026-10-28',
      region: 'global',
      note: 'Строки шмота по слотам (Allyria), арканы (whelps, J0EI), этапы шмота.'
    },
    {
      title: 'Skycoach — AION 2 Ranger Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/a2-ranger-guide',
      author: 'Dallon Avery',
      date: '2026-10-28',
      region: 'global',
      note: 'Версия не указана. Тексты специализаций, приоритеты пассивок, досок и аркан, связка Moxsy.'
    },
    {
      title: 'GamerBlurb — Ranger Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-ranger-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Без чисел: приоритеты умений, стигм и статов.'
    },
    {
      title: 'GAMES.GG — Aion 2 Ranger Build Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-ranger-build-guide/',
      author: 'Abdalla',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, первые дни сезона; версия не указана.'
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
      skill: DEADSHOT,
      role: 'core',
      level: 20,
      specs: [2, 5, 3],
      note: 'Главный урон: заряжаемый выстрел, перезарядка 20 с. Только полным зарядом (3 ступени) и под баффом Помечающего выстрела — +35% урона (все гайды). Вариант 2 — +30% скорости умения, то есть заряд быстрее (8 из 8), на ур. 16 — вариант 5, доп. урон при попадании (6 из 6). Третьим на ур. 20 — вариант 3, заряд в движении (Mobalytics, MetaRoad, Skycoach, whelps); aion2-guides и ExpCarry берут вариант 4 — игнор блока и уклонения. Ур. 20 — 6 из 6 гайдов с числами, первым из всех умений (Mobalytics, Skycoach); топ: 17,5 — выше всех. В связку не ставить: связка отпускает заряд на первой ступени.'
    },
    {
      skill: GALE_ARROW,
      role: 'core',
      level: 20,
      specs: [4, 5, 3],
      note: 'Бафф Шквала стрел — СКР боя и увелич. урона в PvE (с вариантом 4 — по 15%, Mobalytics); перезарядка 20 с, бафф 10 с. Вариант 4 (7 из 8; публичные билды: 90%), на ур. 16 — вариант 5, −10 с перезарядки: бафф держится постоянно (6 из 6; 79%). До 16 и третьим на ур. 20 — вариант 3, в движении (MetaRoad, whelps, aion2-guides, Skycoach); MetaRoad, Allyria и ExpCarry до ур. 16 берут вариант 1 — +5 с действия. Ур. 20 — 5 из 6 (Mobalytics — 16); топ: 16,3.'
    },
    {
      skill: DRILL_DART,
      role: 'core',
      level: 16,
      specs: [5, 3, 4],
      note: 'Перезарядка 5 с, Потеря крови на 6 с (запускает Шквальный огонь), +100 ОМ при крите. На ур. 16 — вариант 5, второе срабатывание (7 из 7; публичные билды: 83%) — «одно из самых ценных улучшений» (Mobalytics). Вторым — +20% скорости умения (7 гайдов), третьим на ур. 20 — гарантированный мультиудар (MetaRoad, Skycoach; J0EI берёт его вторым). Для выживания — вариант 1, поглощение 3% ОЗ (aion2-guides, Allyria). Ур. 16 — 6 гайдов; топ: 16,3.'
    },
    {
      skill: TEMPEST_SHOT,
      role: 'core',
      level: 16,
      specs: [3, 5, 2],
      note: 'Заполнитель без перезарядки — тратит ОМ. Вариант 3 — до +12% урона по малому числу целей (8 из 8; публичные билды: 87%), на ур. 16 — вариант 5, +20% скорости умения (7; 83%). До 16 и третьим — +10% крит. удара умения (Mobalytics, Skycoach; aion2-guides — пока крит ниже предела 50%). Ур. 16 — 4 гайда (Skycoach — 12–16, MetaRoad — 14); топ: 16,6 — второе по уровню после Прицельного выстрела.'
    },
    {
      skill: SNIPE,
      role: 'core',
      level: 16,
      specs: [4, 5, 3],
      note: 'Базовая атака на зажатой ЛКМ: без затрат ОМ, восполняет 120 ОМ. Вариант 4 — −1 с перезарядки Прицельного выстрела за каждое попадание (8 из 8; публичные билды: 91%), поэтому ЛКМ не отпускают (MetaRoad). На ур. 16 — вариант 5, 4-й удар цепочки «Торнадо стрел» (6 гайдов). До 16 и третьим на ур. 20 — +50% мультиудара (Mobalytics, MetaRoad, aion2-guides); на старте aion2-guides и GAMES.GG берут +20% ОМ. Ур. 16 — 5 гайдов (MetaRoad — 18); топ: 16.'
    },
    {
      skill: BURST_ARROW,
      role: 'support',
      level: 12,
      specs: [4, 3],
      note: 'Перезарядка 20 с; бьёт только цель под Замедлением или Пленом — поэтому в ячейке перед ней Опутывающий выстрел (все гайды со связкой). Вариант 4 — до +20% урона по малому числу целей (6 гайдов), вариант 3 — в движении (MetaRoad, whelps, aion2-guides, Skycoach; публичные билды: 72%); J0EI, ExpCarry и GAMES.GG вместо движения берут мультиудар. Ур. 12 — 5 гайдов; ур. 16 (сброс перезарядки) — позже главных умений (Mobalytics). Топ: 15,1.'
    },
    {
      skill: MARKING_SHOT,
      role: 'support',
      level: 12,
      specs: [3, 1],
      note: 'Даёт бафф Precision: +300 крит. удара, +35% урона Прицельного выстрела, без него не оглушает Поражающая стрела; перезарядка 10 с. Вариант 3 — +5 с действия, итого 15 с (6 гайдов), вариант 1 — +5% Совершенного удара на время баффа (5). Сдвигает персонажа в нажатую сторону — только вручную (Allyria, ExpCarry; вне связки у 97% публичных билдов). Ур. 12 — 6 гайдов; топ: 13,9.'
    },
    {
      skill: SNARE_SHOT,
      role: 'support',
      level: 12,
      specs: [3, 2],
      note: 'Замедление: без него не срабатывает Рассекающая стрела, а Взрывная стрела бьёт слабее; перезарядка 15 с. Вариант 3 — в движении (5 гайдов; публичные билды: 77%), вариант 2 — +20% скорости умения (4). Ур. 12 — MetaRoad, Mobalytics, aion2-guides, Allyria; топ: 13,4.'
    },
    {
      skill: EXPLOSION_TRAP,
      role: 'situational',
      specs: [1, 3],
      note: 'Ставится под ноги. Для стай мобов: вариант 1 стягивает врагов при взрыве, вариант 3 — доп. урон через 3 с (MetaRoad, Vault). На боссах почти не нужен; Mobalytics использует его движение вместе с Помечающим выстрелом, чтобы уклоняться. Ур. 12 — MetaRoad, Mobalytics; топ: на панели у 97%, ур. 9,1. Вне связки — 390 из 392 публичных билдов.'
    },
    {
      skill: SUPPRESSING_ARROW,
      role: 'situational',
      specs: [3, 1],
      note: 'Оглушение для шкалы ошеломления босса; шанс оглушения работает только под баффом Помечающего выстрела. Держать для механик ошеломления, но не качать раньше главных умений (Mobalytics); варианты — MetaRoad и Skycoach. Вне связки — 97% публичных билдов. Топ: на панели у 93%, ур. 9,4.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [3],
      note: 'Снимает контроль. Вариант 3 — +20% ОЗ при применении (MetaRoad, Skycoach, aion2-guides); на ур. 16 aion2-guides добавляет вариант 5 — +50% стойкости к урону в PvE во время Непреклонности. Ур. 12 — MetaRoad. В данных топа его нет.'
    },
    {
      skill: ARROW_SCATTERSHOT,
      role: 'situational',
      note: 'Бьёт только ошеломлённую цель. В эндгейме PvE не качать (aion2-guides, Mobalytics; MetaRoad — ур. 3; Moxsy и J0EI убирают его, когда ротация ускоряется); Allyria держит ради сокращения перезарядки и ОМ. Узлы досок и арканы на него — потеря. Топ: на панели у 73%, ур. 9.'
    },

    {
      skill: FOCUSED_EYE,
      role: 'passive',
      level: 20,
      note: 'Меткость, увелич. урона в PvE и Сокрушающий удар. Первая пассивка у всех 8 гайдов; Сила Байзела ур. 10 усиливает её в 1,5 раза. MetaRoad ведёт к 22; топ: 17,6 — самая прокачанная пассивка.'
    },
    {
      skill: HUNTERS_RESOLVE,
      role: 'passive',
      level: 20,
      note: 'Увелич. крит. урона. Вместе с Оком концентрации — «единственные две, что по-настоящему важны» (whelps); 8 из 8. MetaRoad — 22; топ: 17,3.'
    },
    {
      skill: HUNTERS_SOUL,
      role: 'passive',
      level: 16,
      note: 'Доп. урон ветром при крите (шанс 50%). Сила Байзела ур. 15 — ×1,5; выстрелы Поддерживающего огня тоже её запускают (J0EI). Третья у всех гайдов; MetaRoad — 15; топ: 16,2.'
    },
    {
      skill: CONCENTRATED_FIRE,
      role: 'passive',
      level: 14,
      note: 'Доп. урон по цели с постоянным уроном — Потерей крови от Пронзающей стрелы и Багровым пламенем от Стрелы грифона. Четвёртая у 7 гайдов; MetaRoad — 14; топ: 15,1.'
    },
    {
      skill: ROOTING_EYE,
      role: 'passive',
      level: 12,
      note: 'Доп. урон по цели под Замедлением или Пленом (после Опутывающего выстрела). Пятой — у 5 гайдов; MetaRoad — 12; топ: 14,6.'
    },
    { skill: MELEE_FIRE, role: 'passive', level: 12, note: 'Следом за Пленяющим взглядом (Mobalytics, Vault, aion2-guides). MetaRoad — 12; топ: 14,4.' },
    { skill: VIGILANT_EYE, role: 'passive', note: 'Уклонение — низкий приоритет (J0EI ждёт, что в глобальной версии оно слабее). Топ: 12,8.' },
    {
      skill: WIND_VIGOR,
      role: 'passive',
      note: 'Запас сил. aion2-guides — «почти бесполезна», J0EI — в глобальной версии запас сил важнее, чем на Тайване. Топ: 12,4.'
    },
    {
      skill: REVITALIZATION_CONTRACT,
      role: 'passive',
      note: 'Раз в минуту лечит 35% ОЗ, когда их осталось 10% (MetaRoad) — по остатку очков. Топ: 10,1.'
    },
    { skill: UNYIELDING_RESOLVE, role: 'passive', note: 'Для PvP (ExpCarry), в PvE не качать. Топ: 8,7.' },

    {
      skill: VAIZELS_AUTHORITY,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% АТК на 10 с, перезарядка 60 с. Ур. 5 — +10% Совершенного удара, 10 — Око концентрации ×1,5, 15 — Душа охотника ×1,5, 20 — при крите шанс 50% сократить перезарядку всех умений на 1 с. Ур. 20 — первым делом у всех 8 гайдов (Moxsy и Skycoach: сначала всем стигмам по 5, затем сбросить и всё в Силу Байзела). Топ: 97%, ур. 17,4.'
    },
    {
      skill: BOW_OF_BLESSING,
      role: 'stigma',
      equip: true,
      level: 15,
      note: '+200 крит. удара и +100 меткости на 10 с, перезарядка 120 с. Ур. 5 — +50% мультиудара, 10 — АТК от крит. удара, 15 — +20% крит. урона, 20 — +7% Сокрушающего удара. 8 из 8; ур. 15 — Mobalytics, aion2-guides, J0EI (J0EI не берёт 20 — дорого), 20 — MetaRoad. Топ: 95%, ур. 15,2.'
    },
    {
      skill: SUPPORTING_FIRE,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Сфера на 15 с стреляет вместе с вами (шанс 25%), перезарядка 90 с. Ур. 5 — +25% шанса, 10 — +15 с, 15 — −30 с перезарядки: откат совпадает с Силой Байзела (Mobalytics), 20 — каждый выстрел критует. Выстрелы запускают Душу охотника и Пленяющий взгляд (J0EI). 7 из 8 (у Skycoach — запасная); ур. 15 — Mobalytics, J0EI (aion2-guides — 10–11, MetaRoad — 20). Топ: 89%, ур. 13,8.'
    },
    {
      skill: GRIFFON_ARROW,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Огонь по области и Багровое пламя на 10 с — постоянный урон, он запускает Шквальный огонь. Ур. 5 — в движении, 10 — +5 с горения, 15 — доп. урон по цели в Багровом пламени («важный рубеж» — Mobalytics), 20 — горение тикает вдвое чаще. Четвёртая стигма у Mobalytics, MetaRoad, GamerBlurb, aion2-guides и whelps; ур. 15 — Mobalytics, aion2-guides (MetaRoad — 20). Топ: 82%, ур. 12,6 — у топ-игроков четвёртая именно она.'
    },
    {
      skill: EXPLOSIVE_ARROW,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Пока Стрела грифона ниже ур. 15 — вместо неё (whelps, fubgun, LordRobson; так советуют aion2-guides и Vault): с ур. 5 перезарядка 30 с вместо 45, +20% урона по цели под Замедлением или Пленом. ExpCarry считает её четвёртой стигмой по умолчанию. Публичные билды: 55% против 44% у Стрелы грифона (Vault, 2.11), выборка ExpCarry — 51,5% против 49,5%; топ: 41%, ур. 5,3.'
    },
    {
      skill: ARROW_STORM,
      role: 'stigma',
      equip: false,
      note: 'Самый большой урон по шкале ошеломления (50) — замена для боссов с проверкой ошеломления (Allyria, MetaRoad, GamerBlurb). Топ: 24%, ур. 2,8.'
    },
    {
      skill: MOTHER_NATURES_BREATH,
      role: 'stigma',
      equip: false,
      note: 'Защитная замена для соло и тяжёлого прогресса: +20% стойкости к урону в PvE (MetaRoad, GamerBlurb; J0EI держит её на ур. 5). Топ: 13%, ур. 3,7.'
    }
  ],

  stats: [
    {
      stat: S.combatSpeed,
      weight: 5,
      note: 'Сводка 8 гайдов: все называют СКР боя и урон оружия; АТК, меткость до порога, Сокрушающий удар и увелич. урона — 7 из 8; крит, Совершенный удар, крит. урон и Мощь — 6. СКР боя ускоряет и заряд Прицельного выстрела (J0EI)'
    },
    { stat: S.weaponDamageBoost, weight: 5, note: 'J0EI: стрелку урон оружия выгоднее, чем увелич. урона, — из-за места в формуле урона' },
    { stat: S.attack, weight: 5 },
    { stat: S.attackBonus, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.double, weight: 5, note: 'Allyria ставит Сокрушающий удар первым; J0EI называет Мудрость (Сокрушающий удар) «королём»' },
    { stat: S.damageBoost, weight: 4 },
    { stat: S.critDamageBoost, weight: 4 },
    { stat: S.perfect, weight: 4 },
    {
      stat: S.critical,
      weight: 4,
      note: 'Крит упирается в 50%, а в окне урона Помечающий выстрел и Благословенный лук дают +500 — сверх предела ценнее АТК и крит. урон (MetaRoad). Но от крита зависят Душа охотника и Сила Байзела ур. 20'
    },
    { stat: S.accuracy, weight: 4, note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 100–1 200 эндгейм и Лудра), дальше — меньше' },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.precision, weight: 4, note: 'Точность — меткость и крит сразу (ExpCarry); строка украшений и колец у MetaRoad и Mobalytics' },
    { stat: S.cooldown, weight: 4 },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.attackIncrease, weight: 4, note: 'Шлем, плащ и набедренники (MetaRoad, aion2-guides)' },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.multiHit, weight: 3, note: 'Строка крафтового лука (MetaRoad, aion2-guides)' },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.frontAttackDamageBoost, weight: 3, note: 'Skycoach — «по ситуации», MetaRoad — камнем на лук' },
    { stat: S.moveSpeed, weight: 3, note: 'Обычная строка сапог и серёг у всех, кто расписывает шмот по слотам' },
    { stat: S.damageTolerance, weight: 3, note: 'Строка набедренников (MetaRoad, aion2-guides, Allyria)' },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.hp, weight: 3 },
    { stat: S.incomingHeal, weight: 2, note: 'Строка шлема у Mobalytics, Allyria и Skycoach' },
    { stat: S.dexterity, weight: 2 },
    { stat: S.constitution, weight: 2 },
    { stat: S.frontAttack, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.endurance, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.mp, weight: 1, note: 'Меткий выстрел и так восполняет ОМ (Skycoach)' },
    { stat: S.statusResist, weight: 1 },
    { stat: S.block, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.evasionBonus, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: DEADSHOT, weight: 5 },
      { skill: GALE_ARROW, weight: 5 },
      { skill: FOCUSED_EYE, weight: 5 },
      { skill: HUNTERS_RESOLVE, weight: 5 },
      { skill: DRILL_DART, weight: 4 },
      { skill: TEMPEST_SHOT, weight: 4 },
      { skill: SNIPE, weight: 4 },
      { skill: HUNTERS_SOUL, weight: 4 },
      { skill: BURST_ARROW, weight: 3 },
      { skill: CONCENTRATED_FIRE, weight: 3 },
      { skill: ROOTING_EYE, weight: 3 },
      { skill: MELEE_FIRE, weight: 2 },
      { skill: MARKING_SHOT, weight: 2 },
      { skill: SNARE_SHOT, weight: 2 },
      { skill: VIGILANT_EYE, weight: 1 },
      { skill: REVITALIZATION_CONTRACT, weight: 1 }
    ],
    notes:
      'Что носят топ-стрелки: Длинный лук разъяренной Кромед (33%, в среднем +14,6), Блестящий лук Короля мудрых драконов (14%, +15) или Лук Аулламуса (12%); Наручи Нуакума (52%, +14,5); броня Нуакума (71–72%); украшения разъяренной Кромед (63–71%); Благородный пояс (94%), Амулет откровения (93%), Руны столкновения (99%). Лук +15 у 76%, наручи +15 у 66%, броня чаще +10, кольца +15 у 43%. Строки (MetaRoad, Mobalytics, aion2-guides, Allyria): лук и наручи — СКР боя, урон оружия, Мощь, увелич. урона, мультиудар; шлем и мантия — Сокрушающий удар, увеличение АТК; наплечники — крит. урон и Сокрушающий удар; нагрудник — увелич. урона, Совершенный удар; набедренники — увеличение АТК, стойкость к урону; перчатки — СКР боя, Совершенный удар; сапоги — скорость движения; ожерелье и серьги — СКР боя или скорость движения, Мощь, Точность. Кольца — Мощь и уровни Прицельного выстрела, Шквала стрел, Пронзающей стрелы или Скоростной стрельбы. Пассивки (Око концентрации, Решимость охотника, Душа охотника) — строками на броне и украшениях.'
  },

  manastones: [
    {
      stat: S.weaponDamageBoost,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням 769 топ-стрелков): доп. меткость, крит, ОЗ, АТК, ОМ, УКЛ, ЗЩТ, блок, сопр. криту; урон оружия — у 35%. MetaRoad и Mobalytics — урон оружия первым на лук и наручи'
    },
    { stat: S.attack, weight: 5, note: 'На броню хватает АТК (MetaRoad, aion2-guides)' },
    { stat: S.accuracyBonus, weight: 4, note: 'Пока меткости не хватает до порога (ExpCarry, Mobalytics)' },
    { stat: S.critical, weight: 4 },
    {
      stat: S.critDamageBoost,
      weight: 3,
      note: 'MetaRoad советует на лук и наручи, но у топ-стрелков таких камней не видно — возможно, только на оружии'
    },
    { stat: S.frontAttackDamageBoost, weight: 3, note: 'MetaRoad и Skycoach; у топ-стрелков не видно' },
    { stat: S.damageBoost, weight: 3 },
    { stat: S.hp, weight: 2 },
    { stat: S.mp, weight: 1 },
    { stat: S.defense, weight: 1 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [DEADSHOT, GALE_ARROW, DRILL_DART, TEMPEST_SHOT, SNIPE, BURST_ARROW, MARKING_SHOT, SNARE_SHOT],
    passive: [FOCUSED_EYE, HUNTERS_RESOLVE, HUNTERS_SOUL, CONCENTRATED_FIRE, ROOTING_EYE, MELEE_FIRE, VIGILANT_EYE, REVITALIZATION_CONTRACT],
    useless: [DEFIANCE, ARROW_SCATTERSHOT, UNYIELDING_RESOLVE, WIND_VIGOR],
    preferredSet: 'magic',
    notes:
      'Топ-стрелки: Грааль «жизни» (70%), Пергамент «жизни» (56%), Компас «магии» (40% против 32%), Колокол «магии» (58%), Зеркало «магии» (47% против 27%) — две «жизни» и три «магии». Ровно так советуют MetaRoad и Vault (whelps, J0EI) и почти так aion2-guides: Время (СКР боя) и Жизнь — на «жизни», Смерть (крит), Разрушение (АТК) и Мудрость (Сокрушающий удар) — на «магии». ExpCarry собирает всё на «жизни» ради бонуса набора — мнение меньшинства. Главное на картах — уровни Прицельного выстрела и Шквала стрел, цель +4 (aion2-guides). Умения по картам (MetaRoad): Пергамент — Меткий выстрел, Скоростная стрельба, Пронзающая стрела; Компас — Прицельный выстрел, Шквал стрел, Помечающий выстрел; Колокол — Решимость охотника; Зеркало — Око концентрации, Душа охотника, Шквальный огонь; Грааль — любое (Шквал стрел или Прицельный выстрел), его собирают последним.'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Прицельному выстрелу, Шквалу стрел, Пронзающей стреле, Скоростной стрельбе и Меткому выстрелу на каждой из четырёх досок. Пронзающую стрелу и Шквал стрел +1 на Неджакане берут 99% топ-игроков, Скоростную стрельбу на Неджакане и Джикеле, Меткий выстрел на обеих и Прицельный выстрел на Джикеле — 98%. С этих узлов начинают MetaRoad, Vault, ExpCarry, Skycoach и GAMES.GG.',
        skills: [DEADSHOT, GALE_ARROW, DRILL_DART, TEMPEST_SHOT, SNIPE],
        boards: [31, 32, 33, 34]
      },
      {
        id: 'damage-passives',
        name: 'Око концентрации и Решимость охотника',
        description:
          'Пассивки урона: Око концентрации и Решимость охотника (по два узла на Неджакане; Око концентрации +1 на Неджакане берут 98% топ-игроков), Душа охотника (два узла на Джикеле), затем Шквальный огонь и Пленяющий взгляд (MetaRoad, Vault, Skycoach).',
        skills: [FOCUSED_EYE, HUNTERS_RESOLVE, HUNTERS_SOUL, CONCENTRATED_FIRE, ROOTING_EYE],
        boards: [31, 32, 33, 34]
      },
      {
        id: 'burst-support',
        name: 'Рассекающая стрела и Помечающий выстрел',
        description:
          '+1 к Рассекающей стреле (+4 — в PvE-маршруте aion2-guides, MetaRoad ведёт до 12), Помечающему выстрелу и Опутывающему выстрелу. У топ-игроков — 15,1, 13,9 и 13,4.',
        skills: [BURST_ARROW, MARKING_SHOT, SNARE_SHOT],
        boards: [31, 32, 33, 34]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: СКР боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мультиудар (Триниэль). Сопротивление мультиудару и стойкость к крит. урону — пропустить (MetaRoad).',
        boards: [31, 32, 33, 34],
        nodes: [310033, 310193, 310043, 310183, 320043, 320183, 320033, 320193, 330033, 330193, 340023, 340197, 340209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — из Krao Cave, Драупнира и сложных экспедиций, ExpCarry): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Узлы — как в сводном гайде стража (оценка помощника: гайды стрелков раскладки по Ариэль текстом не дают). У топ-стрелков взято в среднем 19 из 152 узлов. Асфель — только PvP.',
        boards: [35],
        nodes: [350001, 350008, 350218, 350225, 350032, 350074, 350152, 350194, 350028, 350081, 350145, 350198]
      }
    ],
    notes:
      'Не тратить очки на узлы ОМ (Skycoach, MetaRoad: Меткий выстрел и так восполняет ОМ), Град из стрел (кроме узлов по пути), сопротивление мультиудару и стойкость к крит. урону (MetaRoad). Если очков мало — Поражающая стрела, Взрывной капкан и Снятие шока подождут. Allyria берёт крупные статы раньше умений, Moxsy — наоборот; топ-игроки почти все берут узлы главных умений. Перед дальним углом доски проверьте стоимость пути (ExpCarry).'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'MetaRoad: ячейки 1 и 5 — макс. АТК, затем доп. АТК; качать каждый род до ур. 10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.critDamageBoost, weight: 5, note: 'Ячейка 4: Разум — крит. урон, Дикие — урон оружия, Особый — Сокрушающий удар (MetaRoad)' },
      { stat: S.weaponDamageBoost, weight: 5 },
      { stat: S.double, weight: 5 },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.multiHit, weight: 4, note: 'Ячейка 4 Природы (MetaRoad)' },
      { stat: S.frontAttackDamageBoost, weight: 4, note: 'Ячейка 4 Мутантов (MetaRoad)' },
      { stat: S.damageBoost, weight: 4, note: 'Запасной вариант, если в ячейку 4 Разума или Диких не выпадает нужное (MetaRoad)' },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad)' },
      { stat: S.critical, weight: 4, note: 'Ячейки 3, 6, 9 — крит или меткость, чего не хватает (MetaRoad, Mobalytics)' },
      { stat: S.accuracyBonus, weight: 4 },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.damageTolerance, weight: 4, note: 'Ячейка 7 Разума, Диких и Особого — стойкость к урону (MetaRoad)' },
      { stat: S.pveDamageTolerance, weight: 3 },
      { stat: S.endurance, weight: 3, note: 'Ячейка 7 Природы и Мутантов — непробиваемость (MetaRoad)' },
      { stat: S.powerShardDamage, weight: 3, note: 'Ячейки 3, 6, 9 — вторым после крита и меткости (MetaRoad)' },
      { stat: S.perfect, weight: 3 },
      { stat: S.pveAttack, weight: 3 },
      { stat: S.bossAttack, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.hp, weight: 3 },
      { stat: S.frontAttack, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.block, weight: 1 },
      { stat: S.mp, weight: 1 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Запирайте только почти максимальные значения уникальной строки; порядок ячеек — 4, затем 7, затем 2 и 8 (MetaRoad). Ячейка 4 у каждого рода — свой урон: Разум — крит. урон, Дикие — урон оружия, Природа — мультиудар, Мутанты — урон спереди, Особый — Сокрушающий удар. Mobalytics: в роду и у питомцев — АТК, меткость, крит, урон, крит. урон и Сокрушающий удар, с оглядкой на то, хватает ли меткости.'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.dominatorOfDimensions, T.ruleAllCreation],
    utility: [T.throughHellAndBack, T.emptyCloset, T.journeysPath],
    notes:
      "Что носят топ-стрелки: атака — Unbound by Genus (67% в сумме двух версий), затем Защитник Бертрона (6%; для Асмодиан — Защитник Альтгарда); защита — Святой Бертрона (47%) и Святой Альтгарда (28%), Rule All Creation (12%); другое — Прошедший огонь и воду (43%), Journey's Path (14%). Mobalytics советует Unbound by Genus, Dominator of Dimensions и Empty Closet (пока их нет — Святой Альтгарда и Прошедший огонь и воду), MetaRoad — тоже Dominator of Dimensions и Empty Closet. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель."
  },

  statTargets: [
    {
      id: 'accuracy',
      name: 'Меткость в PvE',
      kind: 'content',
      stats: [S.accuracy, S.accuracyBonus, S.pveAccuracy],
      goals: [
        { value: 800, label: 'Трансцендентность 4' },
        { value: 1100, label: 'эндгейм — нижняя оценка стрелков (MetaRoad, aion2-guides)' },
        { value: 1200, label: 'Лудра, обычная и сложная' }
      ],
      raise: [S.accuracyBonus, S.pveAccuracy, S.accuracy],
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов. Порог — блок босса, от класса не зависит: меткость сверх него не нужна. 800 и 1 200 — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026); 1 100–1 200 — оценка MetaRoad и aion2-guides для стрелка вместе с бафами (Благословенный лук даёт +100 на 10 с), JOHNPAL держит 1 200. Официальных цифр нет.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [
        { value: 1200, label: 'Лудра с бафами окна урона (оценка помощника)' },
        { value: 1700, label: 'предел 50% шанса против Лудры' }
      ],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). В окне урона Помечающий выстрел (+300) и Благословенный лук (+200) дают ещё 500 (MetaRoad), поэтому 1 200 без бафов — оценка помощника: 1 700 − 500. Сверх предела ценнее АТК и крит. урон (MetaRoad).'
    },
    ...(
      [
        [S.might, 'Мощь', 60.8],
        [S.precision, 'Точность', 38],
        [S.dexterity, 'Ловкость', 33.2],
        [S.constitution, 'Здоровье', 21.6],
        [6, 'Воля', 9.7]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-стрелков' }],
      note: 'Средний уровень у 3 950 топ-стрелков глобальной версии (metabot.gg, 9.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 65.6],
        [7, '[Неджакан] Справедливость', 52.6],
        [13, '[Джикел] Разрушение', 52.1],
        [14, '[Триниэль] Смерть', 50.4],
        [8, '[Байзел] Свобода', 41.7],
        [15, '[Румиэль] Мудрость', 40.1],
        [10, '[Юстиэль] Жизнь', 38.9],
        [17, '[Израфель] Пространство', 35.1],
        [9, '[Кайсинель] Видение', 30.5],
        [16, '[Маркутан] Судьба', 29.6]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-стрелков' }],
      note: 'Стат бога: средний у 3 950 топ-стрелков глобальной версии (metabot.gg, 9.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'Встаньте в 10–12 м от босса так, чтобы было куда уворачиваться (Mobalytics): почти все умения бьют на 20 м.',
    'Бафы — Сила Байзела, Поддерживающий огонь, Благословенный лук — когда босс будет доступен для атаки хотя бы 10 с. Не перед неуязвимостью и не перед механикой, которая заставит отойти (Mobalytics, Skycoach, ExpCarry).',
    'Связка открывает бой: Шквал стрел (бафф СКР боя и урона в PvE) и Стрела грифона — или Взрывная стрела, пока Стрела грифона ниже ур. 15.',
    'Помечающий выстрел — бафф Precision: +300 крит. удара и +35% урона Прицельного выстрела, со специализацией 3 — 15 с. Он сдвигает персонажа в нажатую сторону — смотрите, куда.',
    'Прицельный выстрел — только полным зарядом и под Precision. В первое окно влезает около трёх, дальше — около двух (Mobalytics). Не начинайте заряд перед механикой, которая заставит двигаться (GamerBlurb); вариант 3 на ур. 20 позволяет заряжать на ходу.',
    'Между выстрелами держите связку (ПКМ) и Меткий выстрел (ЛКМ): каждое попадание Меткого выстрела сокращает перезарядку Прицельного на 1 с и восполняет ОМ, а Сила Байзела ур. 20 при крите сокращает перезарядку всех умений. Следите за реальным откатом Прицельного выстрела, а не считайте секунды.',
    'Рассекающая стрела бьёт только цель под Замедлением или Пленом — поэтому Опутывающий выстрел в ячейке стоит перед ней.',
    'Помечающий выстрел обновляйте, когда до конца Precision 1–3 с (aion2-guides, MetaRoad); бафы — по откату, если босс не умирает: Сила Байзела раз в минуту, Благословенный лук — раз в две (MetaRoad).',
    'Стаи: соберите Метким выстрелом, Взрывной капкан со специализацией 1 стянет мобов, дальше — связка. Град из стрел — только по ошеломлённой цели, Поражающая стрела — оглушение под Precision для шкалы ошеломления.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'griffon',
        name: 'Ячейка Стрелы грифона',
        skills: [GRIFFON_ARROW, SNARE_SHOT, BURST_ARROW],
        when: { skill: GRIFFON_ARROW, minLevel: 15 },
        note: 'Стрела грифона — в ряду 0, по откату (Mobalytics, couga54/Whelps, MetaRoad). Опутывающий выстрел — в ряду 1: он накладывает Замедление, и только после него сработает Рассекающая стрела в ряду 2 — ячейка сама дождётся (Опутывающий выстрел перед Рассекающей стрелой — в 278 из 395 публичных связок). Шаг первый: в ячейке всё с перезарядкой. У Mobalytics, whelps и couga54 эта ячейка вторая — пока клавиша зажата, разницы почти нет; J0EI, fubgun и JOHNPAL ставят ячейку со Скоростной стрельбой последней — так и здесь.'
      },
      {
        id: 'explosive',
        name: 'Ячейка Взрывной стрелы — пока Стрела грифона ниже 15',
        skills: [SNARE_SHOT, EXPLOSIVE_ARROW, BURST_ARROW],
        when: { skill: GRIFFON_ARROW, maxLevel: 14 },
        note: 'Пока Стрела грифона ниже ур. 15, на её месте Взрывная стрела (whelps, fubgun, LordRobson; Vault и aion2-guides). Опутывающий выстрел — в ряду 0: Взрывная стрела бьёт сильнее по цели под Замедлением, а Рассекающая стрела без него не срабатывает. Ровно так у whelps — его связку целиком копируют 31% публичных билдов (Vault). Mobalytics предлагает другое: держать Стрелу грифона и быстрее довести её до 15, оставив Благословенный лук и Поддерживающий огонь на ур. 5.'
      },
      {
        id: 'gale',
        name: 'Ячейка Шквала стрел',
        skills: [GALE_ARROW, DRILL_DART, TEMPEST_SHOT],
        note: 'Шквал стрел — в ряду 0: его бафф (СКР боя и урон в PvE) обновляется, как только готов. Пронзающая стрела (перезарядка 5 с) — в ряду 1, Скоростная стрельба — в ряду 2: перезарядки у неё нет, ячейка всегда готова, поэтому шаг последний. Эта ячейка — у whelps, Mobalytics, MetaRoad, ExpCarry и GAMES.GG; «Шквал стрел → Пронзающая стрела → Скоростная стрельба» — в 44% публичных связок, Шквал стрел первым — в 381 из 396 (Vault).'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс — у Mobalytics, aion2-guides и во всех публичных связках стрелков, где задержка задана (130 шагов из 130; Vault); при пинге 80–100 и выше — 50 мс (aLuckyRO). Правило порядка: ячейка со Скоростной стрельбой (без перезарядки) — последней.',
    manual: [
      {
        skill: SNIPE,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой: каждое попадание со специализацией 4 сокращает перезарядку Прицельного выстрела на 1 с, плюс 120 ОМ за выстрел (MetaRoad, Mobalytics, Vault). Не отпускайте.'
      },
      {
        skill: DEADSHOT,
        key: '4',
        when: 'По откату — полным зарядом и только под баффом Помечающего выстрела, по самой крепкой цели (Moxsy). Не начинайте заряд перед механикой, которая заставит двигаться. Удобно на боковой кнопке мыши (MetaRoad, couga54).'
      },
      {
        skill: MARKING_SHOT,
        key: '3',
        when: 'Перед Прицельным выстрелом; обновлять, когда баффу осталось 1–3 с (aion2-guides, MetaRoad): примерно через каждые два Прицельных выстрела (Mobalytics). Сдвигает персонажа — проверьте направление.'
      },
      {
        skill: VAIZELS_AUTHORITY,
        key: '2',
        when: 'Бафы — одной ячейкой на клавише 2: Сила Байзела (ряд 0), Поддерживающий огонь, Благословенный лук — нажать трижды (Mobalytics, J0EI). Когда босс будет доступен хотя бы 10 с. Вне связки их держат 69–71% публичных билдов (Vault); fubgun и Moxsy ставят бафы в связку — тогда они уходят по откату.'
      },
      { skill: SUPPORTING_FIRE, key: '2', when: 'В той же ячейке бафов. С ур. 15 откат совпадает с Силой Байзела — жмутся вместе (Mobalytics).' },
      { skill: BOW_OF_BLESSING, key: '2', when: 'В той же ячейке бафов; перезарядка 120 с — выходит через раз с Силой Байзела (MetaRoad).' },
      { skill: EXPLOSION_TRAP, key: '1', when: 'Стаи мобов: стянуть и удержать (ставится под ноги). На боссах — по ситуации.' },
      { skill: DEFIANCE, key: 'Q', when: 'Когда оглушили, сбили с ног или напугали.' },
      {
        skill: SUPPRESSING_ARROW,
        optional: true,
        when: 'Когда шкала ошеломления босса почти полна: оглушает только под баффом Помечающего выстрела.'
      },
      { skill: ARROW_SCATTERSHOT, optional: true, when: 'Только по ошеломлённой цели; в эндгейме большинство его не жмёт.' },
      { skill: ARROW_STORM, optional: true, when: 'Если стоит вместо четвёртой стигмы: в окно ошеломления босса (50 урона по шкале).' },
      { skill: MOTHER_NATURES_BREATH, optional: true, when: 'Если стоит вместо стигмы: прямо перед сильным неизбежным уроном.' }
    ],
    opener: [
      { skill: VAIZELS_AUTHORITY, note: 'бафы — когда босс доступен' },
      { skill: SUPPORTING_FIRE },
      { skill: BOW_OF_BLESSING },
      { skill: GALE_ARROW, note: 'связка: бафф Шквала стрел' },
      { skill: MARKING_SHOT, note: 'Precision на 15 с' },
      { skill: DEADSHOT, note: 'полный заряд' },
      { skill: SNARE_SHOT, note: 'Замедление' },
      { skill: BURST_ARROW },
      { skill: DRILL_DART },
      { skill: DEADSHOT, note: 'снова, пока держится Precision' }
    ],
    openerNote:
      'Порядок Mobalytics и J0EI (Vault): бафы → связка (Шквал стрел и Стрела грифона) → Помечающий выстрел → Прицельный выстрел → связка с Метким выстрелом → снова Прицельный выстрел. Skycoach и MetaRoad начинают с Благословенного лука, aion2-guides — с Помечающего выстрела; разница небольшая. Стрела грифона (или Взрывная стрела) уходит связкой.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так советуют Mobalytics, MetaRoad, aion2-guides и whelps), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Меткий выстрел. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для стрелка отдельно не проверялось). ПКМ на миг отпускается в конце прогона — поэтому ячейка со Скоростной стрельбой (всегда готова) в связке последняя. Прицельный выстрел так не жмётся: его заряд держите на своей клавише. Когда игра подтормаживает в больших боях, макросы мыши сбоят (aion2-guides).'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка aion2-guides: ЛКМ — Меткий выстрел, ПКМ — связка, 2 — бафы, 3 — Помечающий выстрел, 4 — Прицельный выстрел). Клавиша связки по умолчанию не назначена — задайте её в настройках клавиш (aion2-guides). В режиме управления AION 1 (таб-таргет) связка на кнопке мыши не работает — только на клавиатуре (Vault). Резерв умений (Skill Queue): aion2-guides и MetaRoad включают, FRESHY (Mobalytics) выключает, чтобы бафы, Помечающий и Прицельный выстрел шли точно в его тайминг — попробуйте оба.'
  },

  tips: [
    {
      title: 'Связка: две ячейки',
      text: 'Шаг 1 — ячейка Стрелы грифона: Стрела грифона (ряд 0), Опутывающий выстрел, Рассекающая стрела; пока Стрела грифона ниже 15 — Опутывающий выстрел (ряд 0), Взрывная стрела, Рассекающая стрела. Шаг 2 — ячейка Шквала стрел: Шквал стрел (ряд 0), Пронзающая стрела, Скоростная стрельба. Связка — на ПКМ, задержка 10 мс; Меткий выстрел на ЛКМ — держать обе кнопки. Прицельный и Помечающий выстрел, бафы и капкан — вручную. Подробно — на странице «Ротация».'
    },
    {
      title: 'Прицельный выстрел — главный урон',
      text: 'Полный заряд (3 ступени) под баффом Помечающего выстрела: +300 крит. удара и +35% урона. Меткий выстрел со специализацией 4 и Сила Байзела ур. 20 сокращают его перезарядку — поэтому ЛКМ не отпускают. В связку не ставить: она отпускает заряд на первой ступени (Moxsy, Allyria) — вне связки его держат 99% публичных билдов.'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Четвёртая стигма: Стрела грифона (Mobalytics, MetaRoad, GamerBlurb; у топа 82%) или Взрывная стрела (ExpCarry; в публичных билдах 55%) — сводный берёт Стрелу грифона, а до её ур. 15 — Взрывную стрелу (whelps, fubgun). Третья специализация Прицельного выстрела: в движении (Mobalytics, MetaRoad, Skycoach) или игнор блока (aion2-guides, ExpCarry). Резерв умений: включить (aion2-guides, MetaRoad) или выключить (FRESHY). Доски: сначала умения (Moxsy, топ-игроки) или крупные статы (Allyria). Благословенный лук и Поддерживающий огонь: до 15 (большинство) или до 20 (MetaRoad).'
    },
    {
      title: 'Порог урона',
      text: 'Главное по уровням: Сила Байзела ур. 20 — первой из стигм (все гайды); Меткий выстрел ур. 12 с вариантом 4; на ур. 16 — Прицельный выстрел (доп. урон), Шквал стрел (−10 с: бафф держится всё время) и Пронзающая стрела (второе срабатывание). Ур. 16 = 10 очков + 4 с досок + 2 с колец; до 20 Прицельный выстрел и Шквал стрел доводят арканы (MetaRoad).'
    },
    {
      title: 'Крит и меткость',
      text: 'Шанс крита в глобальной версии упирается в 50%. В окне урона Помечающий выстрел (+300) и Благословенный лук (+200) дают 500 крита — сверх предела MetaRoad советует АТК и крит. урон, а whelps — перебрасывать строки крита и меткости на АТК или Решимость охотника, когда пределы взяты. Меткость: 1 100–1 200 с бафами (MetaRoad, aion2-guides; JOHNPAL — 1 200). Парированный удар теряет больше половины урона (couga54).'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Dark Veil (у топа 31%; лучшие у MetaRoad), в долгую — Nightmare (Mobalytics, MetaRoad), Talisra — −4% перезарядки. Пантеон: Время (СКР боя), Разрушение (АТК) и Мудрость (Сокрушающий удар) — MetaRoad, Mobalytics, Allyria; Видение (перезарядка) — MetaRoad и Skycoach; Mobalytics добавляет Справедливость. У топ-стрелков больше всего Времени, Справедливости и Разрушения, а Видения — меньше почти всех.'
    },
    {
      title: 'Корея и глобальная версия',
      text: 'В глобальной версии 4 слота стигм (ур. 22, 27, 32, 37) — региональные наборы на большее число стигм не переносятся (ExpCarry). Предел крита — 50% (в Корее — 80%), меткость для Лудры — ~1 200 (корейские стрелки держат 1 300+, MetaRoad).'
    }
  ],

  checklist: [
    {
      id: 'macro',
      text: 'Настроить связку на ПКМ: ячейка Стрелы грифона (пока она ниже 15 — ячейка Взрывной стрелы), затем ячейка Шквала стрел; задержка 10 мс'
    },
    { id: 'binds', text: 'Меткий выстрел — ЛКМ; Прицельный выстрел и Помечающий выстрел — на отдельных клавишах (Прицельный удобно на боковую кнопку мыши)' },
    { id: 'buffs', text: 'Бафы — одной ячейкой на клавише 2: Сила Байзела, Поддерживающий огонь, Благословенный лук' },
    { id: 'stigmas', text: 'Стигмы: Сила Байзела, Благословенный лук, Поддерживающий огонь, Стрела грифона (до её ур. 15 — Взрывная стрела)' },
    { id: 'vaizel20', text: 'Сила Байзела — ур. 20 раньше остальных стигм' },
    {
      id: 'breakpoints',
      text: 'Ур. 16 с вариантом 5: Прицельный выстрел, Шквал стрел, Пронзающая стрела; Меткий выстрел — вариант 4 (−1 с Прицельного выстрела)'
    },
    { id: 'weapon15', text: 'Лук и наручи — заточка +15 (так у большинства топ-стрелков)' },
    { id: 'arcana-mix', text: 'Арканы: Грааль и Пергамент «жизни», Компас, Колокол и Зеркало «магии»' }
  ]
}
