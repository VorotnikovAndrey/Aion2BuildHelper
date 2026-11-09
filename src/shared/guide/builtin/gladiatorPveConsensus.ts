// Встроенный гайд: Гладиатор, PvE — сводный. Собран из 9 гайдов для глобальной версии и статистики
// 4 206 топ-гладиаторов глобальных серверов (metabot.gg, 9 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/gladiator-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды/связки: X%» — подсчёт AION2 Vault по публичным билдам гладиаторов (2.11.2026).

import type { Guide } from '../types'

// Умения гладиатора (ID игры)
const KEEN_STRIKE = 11020000
const RENDING_BLOW = 11010000
const LEAPING_SLAM = 11190000
const MOCKING_BLADE = 11290000
const OVERHEAD_SLAM = 11170000
const SWORD_AURA_RAMPAGE = 11280000
const ANKLE_SLICE = 11200000
const CRUSHING_WAVE = 11050000
const RUSH_STRIKE = 11360000
const AERIAL_SNARE = 11300000
const RUINOUS_BLOW = 11100000
const DEFIANCE = 11260000
const SURVIVAL_STANCE = 11710000
const PROTECTION_ARMOR = 11720000
const BLOOD_ABSORPTION = 11730000
const IDENTIFY_WEAKNESS = 11740000
const ATTACK_PREPARATION = 11750000
const IMPACT_HIT = 11760000
const DESTRUCTIVE_IMPULSE = 11770000
const EXPERIENCED_COUNTERSTRIKE = 11780000
const SURVIVAL_WILLPOWER = 11790000
const MURDEROUS_BURST = 11800000
const LUNGE_STANCE = 11400000
const RAGE_BURST = 11390000
const ZIKELS_BLESSING = 11250000
const FOCUSED_BLOCK = 11110000
const BLADE_TOSS = 11080000
const LIFESTEALING_BLADE = 11340000
const WAVE_ARMOR = 11410000
const TENACIOUSNESS = 11380000
const WRATH_WAVE = 11240000

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
  frontAttackDamageBoost: 589,
  frontCritical: 591
} as const

// Титулы (ID игры)
const T = {
  unboundByGenus: 13010021,
  guardianOfVerteron: 12030002,
  guardianOfAltgard: 22030002,
  goldenGlow: 13050017,
  saintOfVerteron: 12030003,
  saintOfAltgard: 22030003,
  ruleAllCreation: 13010025,
  dominatorOfDimensions: 13050011,
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  journeysPath: 13051004
} as const

export const gladiatorPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-gladiator-pve-consensus',
  name: 'Гладиатор PvE — сводный (9 гайдов + топ-игроки)',
  cls: 'gladiator',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся девять гайдов для глобальной версии и что реально носят 4 206 топ-гладиаторов глобальных серверов. Урон гладиатора — окна Разящего удара: он бьёт только сбитую с ног цель, а боссов сбить с ног нельзя, поэтому окно на 10 с открывает стигма Выплеск гнева. Со специализацией 5 (ур. 16) у Разящего удара нет перезарядки — в окне он идёт подряд. Между окнами — Ожесточенный удар и Резня с «Боевой готовностью»; ОМ — главный предел, его возвращают Точный удар на ЛКМ и Ожесточенный удар с вариантом 5. Стойте перед боссом: Искусная контратака усиливает удары спереди, а парирование Концентрацией на блоке даёт урон всей группе. Цель: Разящий удар и Ожесточенный удар — ур. 20, Резня и Неистовый клинок — 16. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 9 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-гладиаторы (4 206 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/gladiator/build',
      date: '2026-11-09',
      region: 'global',
      kind: 'data',
      note: 'Умения и стигмы — по 4 132 игрокам, доски — по 4 142, статы и титулы — по 4 206. Клиент 0.0.4387.0, после патча 4 ноября. Описания умений — страницы умений metabot.gg.'
    },
    {
      title: 'Mobalytics — Aion 2 Gladiator PvE DPS Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-gladiator-pve-build',
      author: 'Ulfhednar',
      date: '2026-11-02',
      region: 'global'
    },
    {
      title: 'Mobalytics — Aion 2 Gladiator Endgame PvE Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-gladiator-endgame-build',
      author: 'Ulfhednar',
      date: '2026-10-24',
      region: 'global',
      note: 'Тот же автор, продолжение для 45 ур.: специализации на ур. 16–19, арканы по картам, строки шмота. В счёте «N из M» вместе с первой страницей — один гайд.'
    },
    {
      title: 'MetaRoad — Gladiator PvE DPS Build',
      url: 'https://metaroad.gg/aion2/build-guides/gladiator-pve-dps-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Самый подробный: специализации по номерам, строки шмота по слотам, камни, род, доски, наборы стигм под группу.'
    },
    {
      title: 'ExpCarry — AION 2 Gladiator Build Guide',
      url: 'https://expcarry.com/aion-2-gladiator-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'Глобальная версия после патча 28.10; стигмы — по выборке 200 профилей гладиаторов от 28.10.'
    },
    {
      title: 'AION 2 Global Guides — Gladiator (Arthars Gaming, aLuckyRO, Sen, Ulfhednar, Grobs)',
      url: 'https://aion2-guides.info/en/gladiator/',
      date: '2026-11-02',
      region: 'global',
      note: 'Обновлено 2.11, проверено 8.11. Связки по рядам, маршрут по доскам. Строки шмота и камни — по данным 810 топ-гладиаторов Кореи (aion2-meta, 26.10); сам сайт оговаривает, что часть советов — из корейских и тайваньских гайдов.'
    },
    {
      title: 'AION2 Vault — Gladiator PvE Build',
      url: 'https://aion2vault.com/builds/gladiator/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка видео Grobs (29.09) и Ulfhednar (6.10) + подсчёт стигм в 430 публичных билдах гладиаторов. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Gladiator Macro',
      url: 'https://aion2vault.com/builds/gladiator/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки шести авторов и подсчёт 343 публичных связок (что в связке, что вне её, задержка).'
    },
    {
      title: 'AION2 Vault — Gladiator Gear',
      url: 'https://aion2vault.com/builds/gladiator/gear/',
      date: '2026-10-17',
      region: 'global',
      note: 'Строки шмота и пантеон по Ulfhednar; доли шмота — ранние (8.10).'
    },
    {
      title: 'Skycoach — AION 2 Gladiator Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/gladiator-guide',
      author: 'Dallon Avery',
      date: '2026-10-28',
      region: 'global',
      note: 'Версия не указана, упоминает глобальный предел крита 50%. В тексте и таблице специализаций есть противоречия.'
    },
    {
      title: 'AllThings.How — Gladiator PvE Build and the Level 16 Overhead Slam Rotation',
      url: 'https://allthings.how/aion-2-gladiator-pve-build-skills-stigmas-and-the-level-16-overhead-slam-rotation/',
      date: '2026-10-12',
      region: 'global',
      note: 'Пересказ видео Soulgrot: замер урона на манекене до и после ур. 16 Разящего удара, стигмы до и после 16. Регион не указан.'
    },
    {
      title: 'GAMES.GG — Aion 2 Gladiator PvE Build',
      url: 'https://games.gg/aion-2/guides/aion-2-gladiator-pve-build/',
      author: 'Abdalla',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, первые дни сезона; регион не указан.'
    },
    {
      title: 'GamerBlurb — AION 2 Gladiator Build Guide: PvE and PvP',
      url: 'https://gamerblurb.com/guides/aion-2-gladiator-build-guide-pve-and-pvp',
      date: '2026-10-06',
      region: 'global',
      note: 'Без чисел и номеров специализаций — только порядок и смысл.'
    },
    {
      title: 'Timesaver — сколько меткости и крита нужно (отчёты игроков)',
      url: 'https://timesaver.gg/blog/aion-2-accuracy-cap',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Пороги меткости и крита для Трансцендентности и Лудры — по отчётам игроков (среди них и гладиатора), привязаны к блоку босса, а не к классу; официальных цифр нет.'
    }
  ],
  updatedAt: '2026-11-09T00:00:00.000Z',

  skills: [
    {
      skill: OVERHEAD_SLAM,
      role: 'core',
      level: 20,
      specs: [5, 4, 3],
      earlySpecs: [3, 4],
      note: 'Главный урон: бьёт только сбитую с ног цель, по боссу — в окне Выплеска гнева или с шансом 7%. Вариант 5 (ур. 16) убирает перезарядку 5 с — все 9 гайдов; его нужно надеть, а не только открыть (Mobalytics, AllThings). Вторым на ур. 16–19 — крит при попадании (вариант 4: Mobalytics, Grobs, aion2-guides) или цепочку Апперкот (вариант 3: Skycoach, GAMES.GG); на ур. 20 — оба. До 16 — 3 и 4. Ур. 20 — MetaRoad, aion2-guides, Skycoach, ExpCarry; топ: ур. 18,8 — выше всех умений.'
    },
    {
      skill: RENDING_BLOW,
      role: 'core',
      level: 20,
      specs: [5, 3, 4],
      note: 'Заполнитель без перезарядки (120 ОМ). Вариант 5 (ур. 16) — 50 ОМ за крит: главный источник ОМ после 16 (9 из 9). Вариант 3 — бить на ходу, «обязателен» (6 из 6, кто его упоминает), вариант 4 — +12% по малому числу целей (5 гайдов): до 16 — 3 и 4, на ур. 20 — все три. Сначала 16 (все гайды), затем 20 — MetaRoad, aion2-guides: если до 20 дотягивается только одно умение, берите это, а не Резню. Топ: ур. 17,2.'
    },
    {
      skill: RUINOUS_BLOW,
      role: 'core',
      level: 16,
      specs: [4, 5, 3],
      note: 'Рывок и сильный удар (перезарядка 45 с); даёт «Боевую готовность» на 20 с — +20% урона в PvE и +100 крит. удара (Vault). Вариант 4 — доп. урон (5 из 5), на ур. 16 — игнор блока и уклонения с мульти-ударом (вариант 5: aion2-guides, MetaRoad, GamerBlurb). До 16 и третьим на ур. 20 — +30% крита (вариант 3: aion2-guides, Grobs, GamerBlurb); +20% скорости умения (вариант 1) — на прокачке (Grobs, GAMES.GG, Skycoach). Ур. 16 — MetaRoad, Vault, aion2-guides; топ: 16,2.'
    },
    {
      skill: SWORD_AURA_RAMPAGE,
      role: 'support',
      level: 16,
      specs: [5, 2, 4],
      note: 'Бьёт только цель со сбитой шкалой ошеломления — вне этого окна бесполезен (aion2-guides, Skycoach). Вариант 2 — +120 ОМ за удар (MetaRoad, Mobalytics, AllThings), на ур. 16 — −1 с перезарядки всех умений за удар (вариант 5: aion2-guides, Skycoach, Mobalytics). До 16 вторым — мульти-удар (вариант 4, MetaRoad). Ур. 16 — aion2-guides, Vault, Mobalytics (MetaRoad — 14); топ: 12,9.'
    },
    {
      skill: KEEN_STRIKE,
      role: 'support',
      level: 12,
      specs: [1, 4, 3],
      note: 'Базовая атака на ЛКМ: +100 ОМ за удар. Вариант 1 — +20% ОМ (7 гайдов), на ур. 12 — −1 с перезарядки Резни за удар (вариант 4: Ulfhednar, MetaRoad, aion2-guides, AllThings). Мульти-удар (вариант 3) — GAMES.GG и Skycoach. После ур. 16 Grobs и aion2-guides её бросают (ОМ даёт Ожесточенный удар), Mobalytics, Skycoach и MetaRoad держат на ЛКМ. Ур. 12 — aion2-guides, Vault (MetaRoad — 14); топ: 14,3.'
    },
    {
      skill: LEAPING_SLAM,
      role: 'support',
      level: 12,
      specs: [1, 2],
      note: 'Сближение в начале боя. Вариант 1 — «Боевая готовность» на 3 с, как у Резни, вариант 2 — 50% шанс Подсечки (MetaRoad). Для фарма — вариант 3, сброс перезарядки при убийстве (Mobalytics, aion2-guides, Skycoach, Vault, AllThings). Ур. 12 — aion2-guides (MetaRoad — 14); топ: 13,7.'
    },
    {
      skill: RUSH_STRIKE,
      role: 'support',
      level: 12,
      specs: [2, 4],
      note: 'Второе сближение. +10 м дальности и −10 с перезарядки (MetaRoad, Skycoach); вариант 1 — +300 ОД (aion2-guides). Ур. 12 — aion2-guides (MetaRoad — 14); топ: 13,4.'
    },
    {
      skill: MOCKING_BLADE,
      role: 'support',
      level: 12,
      specs: [1, 4],
      note: 'Гарантированно сбивает моба с ног — и открывает по нему Разящий удар (aion2-guides). Боссов сбить с ног нельзя: по ним вариант 1 лечит — поглощает 15% ОЗ (по обычным целям — 4%; MetaRoad, Mobalytics). Вариант 4 — +1 с к сбиванию с ног (MetaRoad). Жать вручную, когда Выплеск гнева на откате (MetaRoad). Ур. 12 — оценка помощника между aion2-guides (10) и MetaRoad (14); топ: 11,2.'
    },
    {
      skill: CRUSHING_WAVE,
      role: 'situational',
      level: 12,
      specs: [4, 1],
      note: 'Удар по области вокруг себя — для групп мобов (aion2-guides, GamerBlurb). Вариант 4 — сброс перезарядки при крите, вариант 1 — поглощение ОЗ (MetaRoad). MetaRoad ведёт к 18 через Грааль, aion2-guides — 12; топ: 9,8, на панели у 89%.'
    },
    {
      skill: ANKLE_SLICE,
      role: 'situational',
      level: 10,
      specs: [2, 4],
      note: 'Запасное сближение (aion2-guides). Цепочка «Пробитие лодыжки» и игнор блока и уклонения (MetaRoad). Топ: 10,5.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [3, 2],
      note: 'Снимает оглушение и сбивание с ног. Вариант 3 — +20% ОЗ при применении (Vault, MetaRoad, Skycoach), вариант 2 — +1 000 ОД (Skycoach). Ур. 12 — Vault, MetaRoad; в данных топа умения нет.'
    },
    {
      skill: AERIAL_SNARE,
      role: 'situational',
      specs: [3, 4],
      note: 'Удар по сбитой с ног цели; вариант 3 — вдвое больше урона по целям с иммунитетом к обездвиживанию (боссы), вариант 4 — цепочка «Принудительное падение» (MetaRoad). aion2-guides жмёт только по боссу и качает максимум до 12 (aLuckyRO), AllThings — «в PvE не важен». Узлы досок и арканы — не тратить. Топ: ур. 9 — ниже всех.'
    },

    {
      skill: ATTACK_PREPARATION,
      role: 'passive',
      level: 20,
      note: 'Первая пассивка у всех гайдов: урон в PvE без условий (на ур. 20 — 15%, MetaRoad), ЗЩТ и +100 меткости. Узел +1 на Неджакане берут 98% топ-игроков. Ур. 20 — MetaRoad; топ: 17,3 — выше всех пассивок.'
    },
    {
      skill: EXPERIENCED_COUNTERSTRIKE,
      role: 'passive',
      level: 20,
      note: 'Урон спереди + при блоке вам и группе +урон в PvE на 20 с (на ур. 1 — 5,4%). Не складывается с Яростью стража. Первая у Skycoach и GAMES.GG, вторая у остальных; Доспехи волны ур. 10 усиливают её в 1,5 раза. Ур. 20 — MetaRoad; топ: 16,9.'
    },
    {
      skill: MURDEROUS_BURST,
      role: 'passive',
      level: 16,
      note: 'Каждый удар — заряд угрозы, на 5 зарядах удар по области и крит. урон на 3 с. Поэтому MetaRoad не берёт камни на крит. урон. Доспехи волны ур. 15 — ×1,5. MetaRoad — 15; топ: 16,3.'
    },
    {
      skill: IMPACT_HIT,
      role: 'passive',
      level: 16,
      note: 'Шанс шоковых эффектов и Сокрушающий удар — ради него и берут (Mobalytics, Vault). MetaRoad — 14; топ: 16,3.'
    },
    {
      skill: IDENTIFY_WEAKNESS,
      role: 'passive',
      level: 14,
      note: 'Крит. удар и Совершенный удар; Боевой натиск ур. 15 усиливает её в 1,5 раза (Mobalytics). MetaRoad — 12, aion2-guides — +2 на досках; топ: 16,1.'
    },
    { skill: SURVIVAL_STANCE, role: 'passive', level: 14, note: 'ОЗ, восстановление ОЗ и стойкость к урону в PvE. MetaRoad — 14; топ: 15,2.' },
    {
      skill: BLOOD_ABSORPTION,
      role: 'passive',
      level: 14,
      note: 'Лечение при ударах и большое лечение при ОЗ ниже 50% (раз в минуту). aion2-guides: работает и без очков. MetaRoad — 14; топ: 15.'
    },
    {
      skill: DESTRUCTIVE_IMPULSE,
      role: 'passive',
      note: 'Доп. урон по цели со сбитой шкалой ошеломления или под шоковым эффектом — после главных пассивок (aion2-guides). MetaRoad — 5; топ: 13,3.'
    },
    { skill: SURVIVAL_WILLPOWER, role: 'passive', note: 'Сопротивление эффектам — остатком очков (MetaRoad — 5). Топ: 13,3.' },
    {
      skill: PROTECTION_ARMOR,
      role: 'passive',
      note: 'Блок и лечение при блоке — мелочь: MetaRoad не качает, aion2-guides советует перековывать шмот с этой строкой. Топ: 9,1.'
    },

    {
      skill: LUNGE_STANCE,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '«Мотор» билда (MetaRoad): +20% СКР боя на 10 с. Ур. 5 — +5% Сокрушающего удара, 15 — Ахиллесова пята ×1,5, 20 — каждый второй крит сокращает перезарядку всех умений на 1 с. Ур. 20 — 9 из 9, первой после Выплеска ур. 5 (Grobs). AllThings: до ур. 15 слабая. Топ: 96%, в среднем ур. 17,9.'
    },
    {
      skill: RAGE_BURST,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Без неё нет урона: на 10 с открывает Разящий удар по цели, даёт +10% урона в PvE и −10% АТК врага. Ур. 5 — перезарядка 45 → 30 с, берут первым (Grobs, Skycoach, GAMES.GG); 15 — всегда крит, 20 — урон в PvE сильнее (MetaRoad, Mobalytics). Снижение АТК не складывается с Провокацией стража. 9 из 9; топ: 95%, ур. 15,2.'
    },
    {
      skill: ZIKELS_BLESSING,
      role: 'stigma',
      equip: true,
      level: 15,
      note: '+20% АТК и +100 меткости на 10 с, перезарядка 120 с. Ур. 5 — +50% урона по шкале ошеломления, 10 — +10% урона в PvE (ExpCarry, Vault, aion2-guides — цель 10), 15 — +50% мульти-удара (Mobalytics, MetaRoad — 10–15). Не тратить прямо перед тем, как босс станет неуязвимым (ExpCarry, Mobalytics). 9 из 9 (у MetaRoad — не во всех наборах); топ: 95%, ур. 14,6.'
    },
    {
      skill: FOCUSED_BLOCK,
      role: 'stigma',
      equip: true,
      level: 5,
      note: 'Гарантированное парирование: запускает Искусную контратаку (урон в PvE всей группе на 20 с) и возвращает 110 ОМ. Ур. 5 — второе применение подряд. 7 из 9 (ExpCarry, aion2-guides, Vault, Skycoach, GAMES.GG, GamerBlurb, Mobalytics — для 45 ур.); топ: 76%, ур. 7,9; публичные билды: 70%. Вне связки у 100% публичных связок.'
    },
    {
      skill: BLADE_TOSS,
      role: 'stigma',
      equip: false,
      note: 'Вместо Концентрации на блоке в слаженной группе: −30% ЗЩТ цели на 10 с с 20 м — урон всей группе (Mobalytics, Ulfhednar, ExpCarry, aion2-guides, AllThings). Уровни стигмы дают только PvP-эффекты — качать не нужно. Топ: 24%, ур. 3,6.'
    },
    {
      skill: LIFESTEALING_BLADE,
      role: 'stigma',
      equip: false,
      level: 10,
      note: 'Поглощение ОЗ с 4 целей — соло, фарм и когда лечения не хватает (Mobalytics, ExpCarry, GamerBlurb, AllThings, Vault). Ур. 10 — эффект Хищника группе на 20 с (MetaRoad; aion2-guides для групп — до 20). Топ: 30%, ур. 6,5.'
    },
    {
      skill: WAVE_ARMOR,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Ур. 10 — Искусная контратака ×1,5, ур. 15 — Энергия смерти ×1,5. MetaRoad ставит её, когда в группе страж, вместо Концентрации на блоке (бафф контратаки всё равно не складывается с Яростью стража), aion2-guides — наоборот, только без стража (ур. 15). Топ: 26%, ур. 9,1.'
    },
    {
      skill: TENACIOUSNESS,
      role: 'stigma',
      equip: false,
      note: 'Короткая неуязвимость к урону и эффектам — под опасную механику (GamerBlurb); держать на второй контроль после Снятия шока (aion2-guides). Топ: 27%, ур. 4.'
    },
    {
      skill: WRATH_WAVE,
      role: 'stigma',
      equip: false,
      note: 'Удар по области, сильно бьёт по шкале ошеломления — для больших пачек мобов (ExpCarry) и когда босса нужно быстро ошеломить (MetaRoad). aion2-guides — не брать в PvE. Топ: 16%.'
    }
  ],

  stats: [
    {
      stat: S.combatSpeed,
      weight: 5,
      note: 'Сводка 8 гайдов со статами: чаще всего — СКР боя, Сокрушающий удар, увелич. урона, урон оружия (по 7 из 8) и крит (8 из 8, но он упирается в 50%); АТК и Мощь — строкой почти на каждом слоте'
    },
    {
      stat: S.double,
      weight: 5,
      note: 'Сокрушающий удар: Ulfhednar — «самый важный стат», Skycoach — высший приоритет; его дают Мудрость, Боевой натиск и Попадание шоком'
    },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.weaponDamageBoost, weight: 5, note: 'Первая строка на оружии и наручах (Mobalytics, Vault, aion2-guides, AllThings)' },
    { stat: S.attack, weight: 5 },
    { stat: S.attackBonus, weight: 5 },
    {
      stat: S.critical,
      weight: 4,
      note: 'Крит упирается в 50% за вычетом сопротивления босса. Он нужен не только урону: за крит Ожесточенный удар возвращает ОМ, Боевой натиск сокращает перезарядки, Потрошитель сбрасывается (MetaRoad). У предела — менять строки крита на меткость'
    },
    { stat: S.critDamageBoost, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.maxAttack, weight: 4 },
    {
      stat: S.accuracy,
      weight: 4,
      note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 200 Лудра), дальше — меньше. ExpCarry ставит её первой, остальные — «сколько нужно»'
    },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.attackIncrease, weight: 4 },
    { stat: S.cooldown, weight: 4, note: 'Skycoach — высший приоритет; MetaRoad — узлы досок, крылья Talisra и Видение' },
    { stat: S.multiHit, weight: 4 },
    {
      stat: S.frontAttackDamageBoost,
      weight: 4,
      note: 'Гладиатор бьёт босса спереди (Искусная контратака). ExpCarry: брать, только если реально стоите спереди'
    },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.precision, weight: 3 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.frontAttack, weight: 3 },
    { stat: S.frontCritical, weight: 3 },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    {
      stat: S.mp,
      weight: 3,
      note: 'ОМ — главный предел гладиатора (MetaRoad, Mobalytics, aion2-guides, AllThings): строки ОМ и восстановления ОМ, если не хватает'
    },
    { stat: S.moveSpeed, weight: 3, note: 'Обычная строка сапог (MetaRoad, aion2-guides, Mobalytics)' },
    { stat: S.hp, weight: 2, note: 'ОЗ и стойкость — «если главная проблема — смерти» (ExpCarry, GamerBlurb)' },
    { stat: S.endurance, weight: 2 },
    {
      stat: S.block,
      weight: 2,
      note: 'Искусная контратака срабатывает от блока. Оценка помощника — гайды блок не советуют, кроме редкой строки украшений'
    },
    { stat: S.dexterity, weight: 2 },
    { stat: S.constitution, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.incomingHeal, weight: 1 },
    { stat: S.statusResist, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.frontDefense, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: OVERHEAD_SLAM, weight: 5 },
      { skill: RENDING_BLOW, weight: 5 },
      { skill: RUINOUS_BLOW, weight: 5 },
      { skill: ATTACK_PREPARATION, weight: 5 },
      { skill: EXPERIENCED_COUNTERSTRIKE, weight: 5 },
      { skill: MURDEROUS_BURST, weight: 4 },
      { skill: IMPACT_HIT, weight: 4 },
      { skill: IDENTIFY_WEAKNESS, weight: 3 },
      { skill: SWORD_AURA_RAMPAGE, weight: 3 },
      { skill: KEEN_STRIKE, weight: 2 },
      { skill: CRUSHING_WAVE, weight: 2 },
      { skill: LEAPING_SLAM, weight: 2 },
      { skill: SURVIVAL_STANCE, weight: 2 },
      { skill: BLOOD_ABSORPTION, weight: 2 },
      { skill: RUSH_STRIKE, weight: 1 },
      { skill: MOCKING_BLADE, weight: 1 },
      { skill: DESTRUCTIVE_IMPULSE, weight: 1 },
      { skill: SURVIVAL_WILLPOWER, weight: 1 }
    ],
    notes:
      'Что носят топ-гладиаторы: Цвайхендер разъяренной Кромед (43%, в среднем +14,7) или крафтовые блестящие двуручные мечи Короля драконов (25% в сумме, +15), Наручи Нуакума (53%, +14,5), броня Нуакума (75–77%), украшения разъяренной Кромед (71–78%), Браслет освободителя (55%), Благородный пояс (95%), Амулет откровения (94%), Руны столкновения (99%). Меч +15 у 81%, наручи +15 у 70%, броня чаще +10…+12. Строки: меч и наручи — СКР боя, урон оружия, увелич. урона, Мощь (Mobalytics, MetaRoad, Vault, aion2-guides); MetaRoad строк умений на них не ставит, Mobalytics на наручах ищет Разящий удар. Кольца — Мощь, Точность и строки Разящего удара, Ожесточенного удара, Резни: оба кольца нужны, чтобы довести Разящий и Ожесточенный удар до 20 (MetaRoad). Шлем и плащ — Сокрушающий удар, перчатки — СКР боя, сапоги — скорость движения; серьги, ожерелье, шлем, плащ — строки Подготовки к атаке, Искусной контратаки, Энергии смерти (MetaRoad). Браслет Бездны (рецепт — три талона снаряжения Лудры) — позже (Mobalytics, MetaRoad).'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (камни топ-гладиаторов): доп. меткость, АТК, крит, ОЗ, ОМ, ЗЩТ, блок, сопр. криту, УКЛ; увелич. урона — у 32%. АТК — первым у MetaRoad, aion2-guides и ExpCarry'
    },
    { stat: S.damageBoost, weight: 4 },
    { stat: S.weaponDamageBoost, weight: 4, note: 'MetaRoad — на меч и наручи' },
    { stat: S.critical, weight: 4, note: 'MetaRoad: по одному на вещь, пока не у предела 50%' },
    { stat: S.accuracyBonus, weight: 4, note: 'Если промахиваетесь по боссу (ExpCarry)' },
    {
      stat: S.frontAttackDamageBoost,
      weight: 3,
      note: 'MetaRoad (меч и наручи) и корейские данные aion2-guides; у топ-гладиаторов глобальной версии таких камней не видно'
    },
    { stat: S.hp, weight: 3 },
    { stat: S.mp, weight: 3, note: 'Если не хватает ОМ' },
    { stat: S.defense, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [OVERHEAD_SLAM, RENDING_BLOW, RUINOUS_BLOW, SWORD_AURA_RAMPAGE, KEEN_STRIKE, CRUSHING_WAVE, LEAPING_SLAM, RUSH_STRIKE, MOCKING_BLADE, ANKLE_SLICE],
    passive: [
      ATTACK_PREPARATION,
      EXPERIENCED_COUNTERSTRIKE,
      MURDEROUS_BURST,
      IMPACT_HIT,
      IDENTIFY_WEAKNESS,
      SURVIVAL_STANCE,
      BLOOD_ABSORPTION,
      DESTRUCTIVE_IMPULSE,
      SURVIVAL_WILLPOWER
    ],
    useless: [DEFIANCE, AERIAL_SNARE, PROTECTION_ARMOR],
    notes:
      'Топ-гладиаторы: Грааль «жизни» (75%), Пергамент «жизни» (52%, «магии» — 25%), Колокол «магии» (63%), Зеркало «магии» (52%), Компас — поровну (жизни 39%, магии 38%). Mobalytics советует ровно так же: две «магии» дают 1 500 ОМ, когда ОМ падает до 20% (раз в 30 с). Гайды тут расходятся: ExpCarry и aion2-guides — четыре «жизни» (+150 АТК в PvE при ОЗ от 70%), MetaRoad — Грааль «жизни» и четыре «магии» (ради ОМ). Сходятся в Граале «жизни» (Время — СКР боя). Главное — умения на картах: Разящий удар — Пергамент и Грааль, Ожесточенный удар — Компас, Резня — Пергамент, Подготовка к атаке — Колокол, Искусная контратака и Энергия смерти — Зеркало. Карта ур. 5 даёт в среднем +2 к умению (aion2-guides).'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Разящему удару, Ожесточенному удару и Резне на каждой из четырёх досок. Эти узлы берут 97–98% топ-игроков (Разящий удар — на Неджакане, Джикеле и Триниэле), с них начинают все гайды.',
        skills: [OVERHEAD_SLAM, RENDING_BLOW, RUINOUS_BLOW],
        boards: [11, 12, 13, 14]
      },
      {
        id: 'damage-passives',
        name: 'Подготовка к атаке и контратака',
        description:
          'Пассивки урона: Подготовка к атаке (на Неджакане — 98% топ-игроков; aion2-guides берёт +4 сразу после главных умений), Искусная контратака, Энергия смерти, Попадание шоком, затем Ахиллесова пята (Mobalytics, MetaRoad, Vault, aion2-guides).',
        skills: [ATTACK_PREPARATION, EXPERIENCED_COUNTERSTRIKE, MURDEROUS_BURST, IMPACT_HIT, IDENTIFY_WEAKNESS],
        boards: [11, 12, 13, 14]
      },
      {
        id: 'support-skills',
        name: 'Неистовый клинок и сближение',
        description:
          '+1 к Неистовому клинку и Удару с рывком (aion2-guides — по +2), Потрошителю, Точному удару и Удару в прыжке (MetaRoad) — когда главное уже взято.',
        skills: [SWORD_AURA_RAMPAGE, KEEN_STRIKE, LEAPING_SLAM, RUSH_STRIKE, CRUSHING_WAVE],
        boards: [11, 12, 13, 14]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: СКР боя и сокращение перезарядки (Неджакан), увелич. урона и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль). Стойкость к крит. урону и сопротивление мульти-удару — пропустить (MetaRoad, AllThings). Стойкость к урону гайды гладиатора не называют — взята как у стража (оценка помощника).',
        boards: [11, 12, 13, 14],
        nodes: [110033, 110193, 110043, 110183, 120043, 120183, 120033, 120193, 130033, 130193, 140023, 140197, 140209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — со сложных экспедиций): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10» — ExpCarry советует узлы урона в PvE и по боссам, aion2-guides закладывает на Ариэль 120 кристаллов. У топ-гладиаторов взято пока ~20 узлов из 152. Асфель — только PvP.',
        boards: [15],
        nodes: [150001, 150008, 150218, 150225, 150032, 150074, 150152, 150194, 150028, 150081, 150145, 150198]
      }
    ],
    notes:
      'Не тратить очки на Благословенные Доспехи, Воздушные путы и Снятие шока; Инстинкт выживания и Инстинкт разрушения — только если очки лишние (MetaRoad). Узлы АТК, крита и +50 ОМ MetaRoad берёт специально: ОМ — главный предел. Доски не рассчитаны на полное заполнение: кристаллов за сезон ~416, а четыре доски стоят 570 (aion2-guides).'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'MetaRoad: ячейки 1 и 5 — макс. АТК, затем доп. АТК; качать каждый род до ур. 10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.damageBoost, weight: 5, note: 'Ячейка 4 Разума (MetaRoad)' },
      { stat: S.weaponDamageBoost, weight: 5, note: 'Ячейка 4 Диких (MetaRoad)' },
      { stat: S.double, weight: 5, note: 'Ячейка 4 Особого рода (MetaRoad)' },
      { stat: S.frontAttackDamageBoost, weight: 5, note: 'Ячейка 4 Мутантов (MetaRoad); Mobalytics — если стоите перед боссом' },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.perfect, weight: 4, note: 'Ячейка 4 Природы (MetaRoad)' },
      { stat: S.critDamageBoost, weight: 4, note: 'Особые строки — Mobalytics' },
      { stat: S.multiHit, weight: 4 },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad)' },
      { stat: S.critical, weight: 4, note: 'Ячейки 3, 6, 9 — крит или меткость, чего не хватает (MetaRoad)' },
      { stat: S.accuracyBonus, weight: 4 },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.damageTolerance, weight: 4, note: 'Ячейка 7 Разума, Диких и Особого рода (MetaRoad)' },
      { stat: S.endurance, weight: 4, note: 'Ячейка 7 Природы и Мутантов — непробиваемость (MetaRoad)' },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.pveAttack, weight: 4 },
      { stat: S.bossAttack, weight: 4 },
      { stat: S.frontAttack, weight: 4 },
      { stat: S.frontCritical, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.hp, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.block, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.powerShardDamage, weight: 2 },
      { stat: S.mp, weight: 2 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Запирайте только уникальные значения у верхней границы (MetaRoad). Ячейки 4 и 7 — главные: у каждого рода в ячейке 4 свой урон (Разум — увелич. урона, Дикие — урон оружия, Природа — Совершенный удар, Мутанты — урон спереди, Особый — Сокрушающий удар). Питомцы поднимают боевую мощь, но не уровень снаряжения — для допуска в контент это не поможет (Mobalytics).'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard, T.goldenGlow],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.ruleAllCreation, T.dominatorOfDimensions],
    utility: [T.throughHellAndBack, T.emptyCloset, T.journeysPath],
    notes:
      "Что носят топ-гладиаторы: атака — Unbound by Genus (68% в сумме двух версий), Golden Glow (5,3%); защита — Святой Альтгарда (44%) и Бертрона (35%), Rule All Creation (10%); другое — Прошедший огонь и воду (35% в сумме двух версий), Journey's Path (17%). Mobalytics и Vault для атаки советуют Защитника Альтгарда / Бертрона (урон в PvE и пробитие), пока Unbound by Genus не собран (нужны все роды ур. 10); для «другого» — титулы на СКР боя или Прошедший огонь и воду. MetaRoad — Empty Closet (СКР боя и перезарядка). Титула «Playing God» из MetaRoad в справочнике глобальной версии нет. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель."
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
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов (Благословение Джикела даёт ещё +100 на 10 с). Порог — блок босса, от класса не зависит: меткость сверх него не нужна. Цифры — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026), официальных нет.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [{ value: 1700, label: 'предел 50% шанса против Лудры' }],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Разящему удару с вариантом 4 крит не нужен — он критует всегда; но крит нужен Ожесточенному удару (ОМ) и Боевому натиску (перезарядки).'
    },
    ...(
      [
        [S.might, 'Мощь', 62.6],
        [S.precision, 'Точность', 33.9],
        [S.dexterity, 'Ловкость', 30.3],
        [S.constitution, 'Здоровье', 22.2],
        [6, 'Воля', 10.3]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-гладиаторов' }],
      note: 'Средний уровень у 4 206 топ-гладиаторов глобальной версии (metabot.gg, 9.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 67.4],
        [13, '[Джикел] Разрушение', 56.8],
        [7, '[Неджакан] Справедливость', 52.8],
        [14, '[Триниэль] Смерть', 49.5],
        [8, '[Байзел] Свобода', 43.4],
        [15, '[Румиэль] Мудрость', 43.2],
        [10, '[Юстиэль] Жизнь', 38.4],
        [17, '[Израфель] Пространство', 36.4],
        [16, '[Маркутан] Судьба', 32.6],
        [9, '[Кайсинель] Видение', 31.6]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-гладиаторов' }],
      note: 'Стат бога: средний у 4 206 топ-гладиаторов глобальной версии (metabot.gg, 9.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'До пула — Благословение Джикела (перезарядка 120 с): не тратьте его прямо перед тем, как босс станет неуязвимым или уведёт вас из ближнего боя (ExpCarry, Mobalytics).',
    'Сближение — Удар в прыжке (или Удар с рывком), сразу Резня: её «Боевая готовность» (+20% урона в PvE и +100 крит. удара на 20 с) должен висеть всё окно урона.',
    'Боевой натиск, затем Выплеск гнева: 10 секунд Разящий удар работает по боссу. Со специализацией 5 (ур. 16) у него нет перезарядки — жмите его всё окно (в связке это делает ячейка Разящего удара).',
    'Между окнами — Ожесточенный удар (без перезарядки; с вариантом 5 крит возвращает 50 ОМ) и Точный удар на ЛКМ: +ОМ и −1 с перезарядки Резни за удар.',
    'Шкала ошеломления босса сбита — Неистовый клинок: бьёт только в это окно, возвращает ОМ и сокращает перезарядки. Вне ошеломления не работает — не тратьте на него клавиши.',
    'Стойте перед боссом: Искусная контратака усиливает удары спереди. Первый блокируемый удар босса — под Концентрацию на блоке: парирование даёт вам и группе урон в PvE на 20 с и 110 ОМ (Grobs, aion2-guides). Включите в настройках боя индикатор направления босса.',
    'Выплеск гнева на откате — Попрание: моба сбивает с ног (и открывает Разящий удар), по боссу лечит (вариант 1). Снятие шока — когда оглушили или сбили с ног.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'ruinous',
        name: 'Ячейка Резни',
        skills: [RUINOUS_BLOW, RAGE_BURST, SWORD_AURA_RAMPAGE],
        note: 'Резня (ряд 0) — по откату, чтобы «Боевая готовность» висела перед окном Выплеска: так почти во всех началах боя, и Резня есть в 63% публичных связок (aion2-guides, Ulfhednar на Vault, Grobs, Skycoach). Выплеск гнева (ряд 1) открывает окно Разящего удара — в связке у всех гайдов. Неистовый клинок (ряд 2) бьёт только по сбитой шкале ошеломления — в связке он сам ловит этот момент (aion2-guides, Ulfhednar, Netero, Mobalytics; есть в 51% публичных связок). Шаг первый: все три почти всё время на откате или недоступны, и связка быстро уходит дальше. MetaRoad, Mobalytics (для 45 ур.) и GAMES.GG жмут Резню вручную, чтобы попасть «Боевой готовностью» в окно урона, — тоже рабочий вариант; Резня — рывок на 8 м, и в связке она может затащить в механику босса.'
      },
      {
        id: 'overhead',
        name: 'Ячейка Разящего удара',
        skills: [OVERHEAD_SLAM, RENDING_BLOW],
        note: 'Разящий удар (ряд 0) срабатывает только по сбитой с ног цели или в окне Выплеска (по боссу — ещё с шансом 7%); с вариантом 5 (ур. 16) перезарядки нет, и в окне он идёт снова и снова. Ожесточенный удар (ряд 1) — заполнитель без перезарядки: связка бьёт им, когда Разящий удар недоступен. Порядок «Выплеск → Разящий удар → Ожесточенный удар» — у Grobs, Vault, GAMES.GG, ExpCarry, MetaRoad и Mobalytics. Шаг последний: в ячейке всегда есть готовое умение. aion2-guides держит Ожесточенный удар в другой ячейке, чтобы чередовать его с Разящим ударом, а Mobalytics на ур. 16 предлагает проверить отдельную клавишу для Ожесточенного удара — больше урона, но и больше расход ОМ.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате или недоступно. 10 мс — aion2-guides, MetaRoad, Netero, aLuckyRO, AllThings и почти все публичные связки, где задержка задана (108 из 343; Vault); при пинге выше ~80 мс — 40–50 мс (MetaRoad, aLuckyRO). Правило порядка: ячейка с всегда готовым Ожесточенным ударом — последней.',
    manual: [
      {
        skill: KEEN_STRIKE,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой: +100 ОМ за удар (с вариантом 1 — больше) и −1 с перезарядки Резни (вариант 4) — Mobalytics, MetaRoad, Skycoach, Ulfhednar. Если ОМ хватает и после ур. 16 Ожесточенного удара, Grobs и aion2-guides её отпускают.'
      },
      {
        skill: LUNGE_STANCE,
        when: 'Перед Выплеском гнева, в безопасное окно урона (перезарядка 60 с — каждый второй Выплеск; MetaRoad). Вне связки — у MetaRoad, Mobalytics, GAMES.GG и ExpCarry.'
      },
      {
        skill: ZIKELS_BLESSING,
        when: 'До пула или вместе с Боевым натиском; перезарядка 120 с — не перед неуязвимостью босса.'
      },
      {
        skill: FOCUSED_BLOCK,
        when: 'Под первый блокируемый удар босса и дальше под тяжёлые удары: парирование — урон в PvE группе на 20 с и 110 ОМ. Некоторые атаки босса её игнорируют (GAMES.GG). В связку не ставить — у 100% публичных связок вне её.'
      },
      { skill: LEAPING_SLAM, key: '3', when: 'Сближение в начале боя и после отхода; для фарма — с вариантом 3 (сброс при убийстве).' },
      { skill: RUSH_STRIKE, key: '3', when: 'Второе сближение, когда Удар в прыжке на откате (в одной ячейке с ним — MetaRoad).' },
      {
        skill: MOCKING_BLADE,
        key: '4',
        when: 'Когда Выплеск гнева на откате: моба сбивает с ног — бейте Разящим ударом; по боссу — лечение (вариант 1).'
      },
      { skill: DEFIANCE, key: 'Q', when: 'Когда оглушили или сбили с ног.' },
      { skill: CRUSHING_WAVE, key: '2', optional: true, when: 'Группа мобов вокруг: удар по области, с вариантом 4 сбрасывается при крите.' },
      { skill: BLADE_TOSS, optional: true, when: 'Если стоит вместо Концентрации на блоке: перед окном Выплеска — −30% ЗЩТ цели на 10 с.' },
      { skill: LIFESTEALING_BLADE, optional: true, when: 'Если стоит четвёртой стигмой: по группе мобов или когда не хватает лечения.' },
      { skill: WAVE_ARMOR, optional: true, when: 'Если стоит четвёртой стигмой: в окно урона — усиливает контратаку и Энергию смерти.' },
      { skill: TENACIOUSNESS, optional: true, when: 'Под опасную механику или на второй контроль после Снятия шока.' },
      { skill: AERIAL_SNARE, optional: true, when: 'По сбитой с ног цели после Разящего удара (aion2-guides) — если умение вкачано.' }
    ],
    opener: [
      { skill: ZIKELS_BLESSING, note: 'до пула' },
      { skill: LUNGE_STANCE, note: 'перед сближением' },
      { skill: LEAPING_SLAM, note: 'сближение' },
      { skill: RUINOUS_BLOW, note: '«Боевая готовность» на 20 с' },
      { skill: FOCUSED_BLOCK, note: 'под первый удар босса' },
      { skill: RAGE_BURST, note: 'окно 10 с' },
      { skill: OVERHEAD_SLAM, note: 'подряд всё окно' },
      { skill: RENDING_BLOW, note: 'заполнитель' }
    ],
    openerNote:
      'Порядок Grobs (Vault, aion2-guides): Боевой натиск и Благословение Джикела → Удар в прыжке → Резня → парировать первый удар босса Концентрацией на блоке → связка. MetaRoad включает Благословение до пула, а Боевой натиск — после Резни, перед Выплеском; GAMES.GG и Skycoach — оба баффа до сближения. Разница небольшая. Дальше — связка и ручные умения по откату.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так советуют Mobalytics, MetaRoad и Skycoach), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Точный удар. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для гладиатора отдельно не проверялось). ПКМ на миг отпускается в конце прогона — поэтому ячейка с всегда готовым Ожесточенным ударом в связке последняя.'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка MetaRoad: ЛКМ — Точный удар, ПКМ — связка, 3 — сближение, 4 — Попрание, Q — Снятие шока). Включите в настройках резерв умений (Skill Queue), чтобы нажатия во время анимации не терялись (MetaRoad). Защитные и сближения — не в связку: их время решаете вы (у публичных связок вне её Концентрация на блоке — 100%, Попрание — 99%, Удар с рывком и Удар в прыжке — 94%; Vault).'
  },

  tips: [
    {
      title: 'Связка: две ячейки',
      text: 'Шаг 1 — ячейка Резни: Резня (ряд 0), Выплеск гнева, Неистовый клинок. Шаг 2 — ячейка Разящего удара: Разящий удар (ряд 0), Ожесточенный удар. Связка — на ПКМ, задержка 10 мс (при пинге выше ~80 — 40–50 мс). Точный удар на ЛКМ — держать обе кнопки. Боевой натиск, Благословение Джикела, Концентрация на блоке, Попрание и сближения — вручную. Подробно — на странице «Ротация».'
    },
    {
      title: 'Окно Выплеска',
      text: 'Разящий удар бьёт только сбитую с ног цель, а у боссов иммунитет к обездвиживанию — по ним он срабатывает лишь с шансом 7%. Выплеск гнева открывает его по цели на 10 с (на ур. 5 перезарядка 45 → 30 с). Вариант 5 Разящего удара (ур. 16) убирает перезарядку — его нужно надеть, а не только открыть. На манекене ур. 16 с вариантом 5 поднимает урон примерно с 20–25 до 41 тыс. в секунду (AllThings по видео Soulgrot).'
    },
    {
      title: 'ОМ — главный предел',
      text: 'Ожесточенный удар стоит 120 ОМ и идёт без перезарядки, поэтому ОМ кончается быстро (MetaRoad). Источники: Точный удар (+100 ОМ за удар, с вариантом 1 — больше), Ожесточенный удар с вариантом 5 (+50 за крит), Неистовый клинок с вариантом 2 (+120 за удар по ошеломлённому боссу), парирование Концентрацией на блоке (+110). Не хватает — строки ОМ, узлы +50 ОМ на досках, две арканы «магии» (1 500 ОМ при 20% ОМ) и зелья ОМ (Алхимия).'
    },
    {
      title: 'Страж в группе',
      text: 'Бафф Искусной контратаки не складывается с Яростью стража, а снижение АТК от Выплеска гнева — с Провокацией стража (описания умений, Vault, MetaRoad). Поэтому со стражем MetaRoad меняет Концентрацию на блоке на Доспехи волны: они усиливают контратаку и Энергию смерти для вас самих. aion2-guides, наоборот, берёт Доспехи волны только без стража — тут гайды спорят.'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Четвёртая стигма: Концентрация на блоке (7 из 9; у топа 76%) или Летающие лезвия в слаженной группе (24%), Клинок кровопийцы соло (30%), Доспехи волны со стражем (26%). Разящий удар на ур. 16–19: крит (Mobalytics, Grobs) или Апперкот (Skycoach, GAMES.GG). Точный удар после 16: держать (Mobalytics, MetaRoad, Skycoach) или бросить (Grobs, aion2-guides). Резня: в связке (aion2-guides, 63% публичных связок) или вручную (MetaRoad, Mobalytics). Компас аркан: «жизни» или «магии» — у топа поровну.'
    },
    {
      title: 'Крылья и пантеон',
      text: "Крылья: Talisra (−4% перезарядки) — цель (MetaRoad, Mobalytics), Dark Veil — на старте; у топа Dark Veil 38%, Forest Spirit 11%, Talisra 8,7%. Пантеон: Мудрость (Сокрушающий удар и меньше расход ОМ), Время (СКР боя), Разрушение (урон); Видение (перезарядка) — по желанию, Свобода — если не хватает меткости (MetaRoad, Mobalytics, Vault). Статуя Colossus: Zikel's Apparition — сильная цель для гладиатора (Mobalytics). У топ-гладиаторов больше всего Времени и Разрушения, Видения — меньше всего."
    },
    {
      title: 'Порог урона',
      text: 'Сначала — Разящий удар ур. 16 с вариантом 5 и Выплеск гнева ур. 5 (перезарядка 30 с), затем Ожесточенный удар ур. 16 (ОМ за крит). Потом Боевой натиск до 20 и Разящий удар до 20 (третий вариант). Стигмы ниже — по остатку: Благословение Джикела 10, Концентрация на блоке 5 (Grobs, ExpCarry).'
    }
  ],

  checklist: [
    {
      id: 'macro',
      text: 'Настроить связку: ячейка Резни (Резня, Выплеск гнева, Неистовый клинок), затем ячейка Разящего удара (Разящий удар, Ожесточенный удар); на ПКМ, задержка 10 мс'
    },
    { id: 'binds', text: 'Точный удар — на ЛКМ; Боевой натиск, Благословение Джикела и Концентрация на блоке — на отдельных клавишах' },
    { id: 'stigmas', text: 'Стигмы: Боевой натиск, Выплеск гнева, Благословение Джикела, Концентрация на блоке' },
    { id: 'breakpoint', text: 'Разящий удар — ур. 16 и специализация 5 (надеть!), Выплеск гнева — ур. 5: с этого начинается весь урон' },
    { id: 'boss-facing', text: 'Включить в настройках боя индикатор направления босса — бить спереди ради Искусной контратаки' },
    { id: 'weapon15', text: 'Двуручный меч и наручи — заточка +15 (так у большинства топ-гладиаторов)' },
    { id: 'arcana', text: 'Арканы: Грааль и Пергамент «жизни», Колокол и Зеркало «магии», Компас — любой' }
  ]
}
