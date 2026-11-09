// Встроенный гайд: Целитель, PvE — сводный. Собран из 8 гайдов для глобальной версии и статистики
// 1 685 топ-целителей глобальных серверов (metabot.gg, 9 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/cleric-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды: X%» — доля среди 386 публичных билдов целителей ур. 16+ (подсчёт AION2 Vault, 2.11.2026).

import type { Guide } from '../types'

// Умения целителя (ID игры)
const EARTHS_RETRIBUTION = 17010000
const JUDGMENT_THUNDER = 17040000
const CHAIN_OF_TORMENT = 17070000
const DEBILITATING_MARK = 17080000
const DIVINE_AURA = 17150000
const LIGHTNING_STRIKE = 17370000
const LIGHT_OF_REGENERATION = 17090000
const CONDEMNATION = 17350000
const HEALING_LIGHT = 17100000
const RADIANT_RECOVERY = 17120000
const BOLT = 17060000
const DEFIANCE = 17240000
const WARM_BENEDICTION = 17710000
const LORDS_BENEDICTION = 17720000
const LORDS_GRACE = 17730000
const HEALING_ENHANCEMENT = 17740000
const IMMORTAL_VEIL = 17750000
const HEAL_BLOCK = 17760000
const PRAYER_OF_CONCENTRATION = 17770000
const EARTHS_GRACE = 17780000
const SURVIVAL_WILLPOWER = 17790000
const RADIANT_BENEDICTION = 17800000
const EARTH_PUNISHMENT = 17400000
const LIGHT_OF_PROTECTION = 17410000
const NOBLE_AURA = 17440000
const PRAYER_OF_AMPLIFICATION = 17430000
const SUMMON_RESURRECTION = 17390000
const YUSTIELS_POWER = 17420000
const ABSOLUTION = 17290000
const SALVATION = 17270000
const BENEVOLENCE = 17160000

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
  moveSpeed: 205,
  cooldown: 215,
  healBoost: 218,
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
  frontDefense: 588
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

export const clericPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-cleric-pve-consensus',
  name: 'Целитель PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'cleric',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся восемь гайдов для глобальной версии и что реально носят 1 685 топ-целителей глобальных серверов. Целитель в PvE не только лечит, но и наносит урон — так играют почти все топ-целители. Урон — окна Приговора: он бьёт только по цели с Цепью боли, с Возмездием природы ур. 5 всегда критует, а крит со специализацией 4 (ур. 12) сбрасывает перезарядку — Приговор идёт подряд, пока держится Возмездие природы. Лечение растёт от АТК (через Усиление исцеления), поэтому статы — атакующие. Цель: Приговор — ур. 20; Карающая молния, Священная аура, Раскат грома и три лечения — 16; Возмездие природы — 20. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-целители (1 685 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/cleric/build',
      date: '2026-11-09',
      region: 'global',
      kind: 'data',
      note: 'Умения, стигмы и шмот — по 1 577 игрокам, статы и титулы — по 1 685, доски — по 1 669, камни — по 540. Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'Mobalytics — Aion 2 Cleric Condemnation PvE Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-cleric-condemnation-pve-build',
      author: 'Ulvier',
      date: '2026-11-08',
      region: 'global'
    },
    {
      title: 'MetaRoad — Cleric PvE Healer Build',
      url: 'https://metaroad.gg/aion2/build-guides/cleric-pve-healer-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Глобальный клиент и корейские/тайваньские патчи конца сентября. Самый подробный по статам на шмоте, роду и связке.'
    },
    {
      title: 'ExpCarry — AION 2 Cleric Build Guide',
      url: 'https://expcarry.com/aion-2-cleric-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'Глобальный сезон 1; стигмы — по выборке 200 профилей целителей от 28.10.'
    },
    {
      title: 'AION 2 Global Guides — Cleric (Whelps, Lucia, aLuckyRO, Kaeria, Grobs)',
      url: 'https://aion2-guides.info/en/cleric/',
      date: '2026-10-28',
      region: 'global',
      note: 'Бывший couga54.github.io/aion2-guides (версия от 8.10 там больше не обновляется). Связки Whelps и Lucia; видео Kaeria — тайваньский клиент.'
    },
    {
      title: 'AION2 Vault — Cleric PvE Build',
      url: 'https://aion2vault.com/builds/cleric/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка авторов (Th3Ruthless, MrRosaPony, Whelps, Lucia, aLuckyRO, BoredAF) и подсчёт специализаций в 386 публичных билдах целителей — единственные цифры по специализациям. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Cleric Macro',
      url: 'https://aion2vault.com/builds/cleric/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки шести авторов и подсчёт 472 публичных связок (задержка, что держат вне связки).'
    },
    {
      title: 'AION2 Vault — Cleric Gear',
      url: 'https://aion2vault.com/builds/cleric/gear/',
      date: '2026-10-25',
      region: 'global',
      note: 'Статы на шмоте, камни и арканы по авторам.'
    },
    {
      title: 'Skycoach — AION 2 Cleric Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/cleric-guide',
      author: 'Dallon Avery',
      date: '2026-10-19',
      region: 'mixed',
      note: 'Версия не указана, ссылается на обновление умений 16 сентября (Корея). Номера специализаций сверены со справочником.'
    },
    {
      title: 'GAMES.GG — Aion 2 Cleric Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-cleric-guide/',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, первые дни сезона.'
    },
    {
      title: 'GamerBlurb — Cleric Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-cleric-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Единственный «чистый лекарь»: стигмы только на лечение и защиту. Взят как мнение меньшинства.'
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
      skill: CONDEMNATION,
      role: 'core',
      level: 20,
      specs: [4, 2, 5],
      note: 'Главный урон. Бьёт только по цели с Цепью боли. Вариант 4 (ур. 12) — сброс перезарядки при крите: с Возмездием природы ур. 5 Приговор критует всегда и идёт подряд (все гайды). Вторым — +12% по малому числу целей (5 из 6; публичные билды: 89%), третьим на ур. 20 — мульти-удар (85%). Whelps на ур. 16–19 берёт мульти-удар вместо +12%. Ур. 20 — 6 из 6 гайдов с числами; топ: ур. 16,9 — выше всех умений.'
    },
    {
      skill: JUDGMENT_THUNDER,
      role: 'core',
      level: 16,
      specs: [5, 2, 1],
      note: 'Урон по области без перезарядки — заполнитель в связке. На ур. 16 доп. удар Divine Punishment срабатывает ещё раз (5 из 5; 93%), вариант 2 — +12% по малому числу целей (5 из 5; 93%). Третьим на ур. 20 — −20% расхода ОМ (MetaRoad, couga54); в публичных билдах чаще −10% скорости боя врага (59%). Ур. 16 — 5 гайдов (MetaRoad — 18); топ: 15,3.'
    },
    {
      skill: DIVINE_AURA,
      role: 'core',
      level: 16,
      specs: [3, 5, 4],
      note: 'Неподвижная аура у цели, перезарядка 30 с. +50% скорости атаки (6 из 6; 95%), на ур. 16 — −10 с перезарядки (6 из 6; 92%), третьим — +3 с действия (89%). Для фарма — вариант 2, по области (aLuckyRO, Whelps). Ур. 16 — 4 гайда (Whelps — 20); топ: 14,8.'
    },
    {
      skill: BOLT,
      role: 'core',
      level: 16,
      specs: [3, 5, 4],
      note: 'Заряжаемый удар по области, перезарядка 45 с — вручную и полным зарядом. +30% скорости умения (5 из 6; 96%), на ур. 16 — всегда крит (5 из 5; 81%), до 16 и третьим — +20% по малому числу целей (Skycoach; 88%). Ур. 16 — 4 гайда (Whelps, GAMES.GG — до 20); топ: 14,6. MrRosaPony считает, что связка без него бьёт не хуже.'
    },
    {
      skill: CHAIN_OF_TORMENT,
      role: 'core',
      level: 12,
      specs: [4, 2, 5],
      note: 'Без неё нет Приговора. Вариант 4 — босс получает больше урона в PvE от всей группы (6 из 6; 89%), вариант 2 — +3 с урона со временем, то есть дольше окно Приговора (5 из 5; 94%). На ур. 16 — игнор блока и уклонения (Th3Ruthless, MrRosaPony; 83%). Ур. 12 — 4 гайда (MetaRoad — 14); топ: 14,4.'
    },
    {
      skill: DEBILITATING_MARK,
      role: 'support',
      level: 12,
      specs: [2, 4, 5],
      note: '−15% ЗЩТ цели на время урона (6 из 6; 99%) и сильнее снижает урон босса в PvE (4 из 4; 86%). С Благородной аурой ур. 10 аура бьёт цель с Клеймом на 20% сильнее. Ур. 12 — 3 гайда (MetaRoad — 14); топ: 13,9.'
    },
    {
      skill: EARTHS_RETRIBUTION,
      role: 'support',
      level: 12,
      specs: [2, 4, 3],
      note: 'Базовая атака на ЛКМ: +110 ОМ за удар. +20% шанса разряда (6 из 6; 97%) и на ур. 12 — −7 с перезарядки Раската грома за разряд (5 гайдов). Кто не жмёт Раскат грома — мульти-удар (вариант 3; Mobalytics, MrRosaPony). Топ: 14,7.'
    },
    {
      skill: LIGHT_OF_REGENERATION,
      role: 'support',
      level: 16,
      specs: [5, 4, 1],
      note: 'Лечит группу раз в 2 с на 30 с — по откату, в связке. На ур. 16 — +5% стойкости к урону в PvE при лечении (5 из 5), затем +5% скорости движения (4 гайда). Первый вариант — любой из 1–3: «неправильного ответа нет» (Mobalytics). Топ: ур. 15; узел +1 на Неджакане берут 98%.'
    },
    {
      skill: HEALING_LIGHT,
      role: 'support',
      level: 16,
      specs: [1, 5, 4],
      note: 'Лечит вас и самого раненого в группе в 40 м — на мелкий урон, вручную. +2 применения подряд (6 из 6; 99%), на ур. 16 — −2 с перезарядки (5 из 5; 90%), +2% ОЗ (4 гайда). Ур. 16 — до групповых подземелий (couga54, GAMES.GG, BoredAF); топ: 15.'
    },
    {
      skill: RADIANT_RECOVERY,
      role: 'support',
      level: 16,
      specs: [3, 2, 5],
      note: 'Лечение всей группы и снятие дебаффа — на сильный урон по группе, вручную. −3 с перезарядки (6 из 6; 95%), +1 применение подряд (MetaRoad, Whelps; 95%), на ур. 20 — +5% ОЗ. В подземельях с дебаффами — вариант 1, снимает до 2 дебаффов (Mobalytics, Skycoach). Ур. 16 — 3 гайда, 20 — Skycoach и GAMES.GG; топ: 15,1.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [3, 1],
      note: 'Снимает оглушение, опрокидывание и страх. +10% ОЗ при применении (4 гайда), вариант 1 — цепочка «Blessing of Regeneration», по MetaRoad ещё и ОМ (MetaRoad, Skycoach); вариант 4 — +2 с стойкости (couga54). Ур. 12 — GAMES.GG, MetaRoad.'
    },
    {
      skill: LIGHTNING_STRIKE,
      role: 'situational',
      note: 'Бьёт только оглушённую цель (сбитая шкала оглушения). Whelps жмёт, когда Приговор не сбрасывается, Lucia держит ур. 16 ради −1 с перезарядки всех умений; GAMES.GG и MrRosaPony не берут. Узлы досок и арканы — не тратить. Топ: на панели у 82%, ур. 9,9.'
    },

    {
      skill: LORDS_GRACE,
      role: 'passive',
      level: 20,
      note: 'Главная пассивка урона у всех гайдов: крит, Сокрушающий удар и доп. урон при попадании. Молитва усиления с ур. 10 усиливает её в 1,5 раза. MetaRoad — ур. 18, остальные — «как можно выше»; топ: 16,1.'
    },
    {
      skill: EARTHS_GRACE,
      role: 'passive',
      level: 20,
      note: '+10,5% крит. урона и +100 меткости — Приговор, который всегда критует, бьёт сильнее. Молитва усиления ур. 15 — ×1,5. MetaRoad ведёт к 22; топ: 15,9.'
    },
    {
      skill: HEALING_ENHANCEMENT,
      role: 'passive',
      level: 14,
      note: 'Превращает АТК в усиление лечения — поэтому целителю нужна атака, а не статы лечения (все гайды). aLuckyRO качает её первой, пока на шмоте мало крита. Топ: 15,3.'
    },
    { skill: WARM_BENEDICTION, role: 'passive', level: 14, note: '+6% ОЗ и ОМ. MetaRoad — 14, GAMES.GG — 10; топ: 14,7.' },
    { skill: IMMORTAL_VEIL, role: 'passive', level: 14, note: 'ЗЩТ и сопротивление криту — выживание (у GAMES.GG — первая пассивка). Топ: 14,2.' },
    {
      skill: RADIANT_BENEDICTION,
      role: 'passive',
      level: 14,
      note: 'Лечит группу при попадании — лечение, пока вы бьёте (Skycoach — высший приоритет, Mobalytics — последней). Топ: 13,4.'
    },
    { skill: SURVIVAL_WILLPOWER, role: 'passive', note: 'Сопротивление эффектам — остатком очков. Топ: 11,8.' },
    { skill: PRAYER_OF_CONCENTRATION, role: 'passive', note: 'Щит, когда ОЗ ниже 50%, — по остатку (GAMES.GG — не брать). Топ: 9,8.' },
    { skill: LORDS_BENEDICTION, role: 'passive', note: 'Блок и лечение от блока — для PvP, в PvE не качать (GAMES.GG, MetaRoad). Топ: 8,6.' },
    { skill: HEAL_BLOCK, role: 'passive', note: 'Только PvP. Топ: 5,4.' },

    {
      skill: EARTH_PUNISHMENT,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Ключ всего урона: с ур. 5 Приговор по цели всегда критует — его берут первым делом. Ур. 10 — Сокрушающий удар вам и группе, 15 — +10% АТК и ЗЩТ, 20 — действует 20 с при перезарядке 30 с. 7 из 8 гайдов, к ур. 20 — 5 из 5; топ: 92%, в среднем ур. 15,1.'
    },
    {
      skill: LIGHT_OF_PROTECTION,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Аура-переключатель: урон и стойкость к урону в PvE вам и группе; ур. 5 — получаемое исцеление, 10 — меткость. Включите один раз до боя и не ставьте в связку — она её выключит (couga54). С чародеем не нужна: его Песнь непобедимости того же уровня или выше её перекрывает (7 гайдов). 6 из 8; ур. 20 — MetaRoad, couga54, Lucia (Whelps — 15); топ: 92%, ур. 11,3.'
    },
    {
      skill: PRAYER_OF_AMPLIFICATION,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% АТК на время действия; ур. 5 — +20% урона в PvE, ур. 10 и 15 — Благосклонность и Дар земли ×1,5, ур. 20 — ещё +15% АТК. Открывает окно Приговора. 7 из 8 (MetaRoad — ур. 14); топ: 83%, ур. 12,1.'
    },
    {
      skill: NOBLE_AURA,
      role: 'stigma',
      equip: true,
      level: 10,
      note: 'Аура на 300 с, бьёт вместе с вами. Ур. 10 — +20% урона по цели с Клеймом бессилия. 6 из 8 (Skycoach — только с чародеем, вместо Света спасения); топ: 88%, ур. 9,8. MetaRoad и GAMES.GG ведут к 20.'
    },
    {
      skill: ABSOLUTION,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'С чародеем — вместо Света спасения (MetaRoad, Vault, ExpCarry). Сильное лечение группы и снятие дебаффов; полагаться на неё — с ур. 15 (MetaRoad, couga54). Топ: 29%.'
    },
    {
      skill: SUMMON_RESURRECTION,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Воскрешает союзника в 40 м — в случайных группах и с чародеем (Skycoach, Whelps). Ур. 5 — каст на 1 с быстрее. Lucia не берёт: в случайных группах воскресаются камнем, пока вы кастуете. Топ: 62%, ур. 3,8.'
    },
    {
      skill: YUSTIELS_POWER,
      role: 'stigma',
      equip: false,
      note: '+20% стойкости к урону в PvE всей группе на 10 с — для новой сложной экспедиции, перед сильным ударом босса (ExpCarry, MetaRoad). Топ: 32%.'
    },
    {
      skill: BENEVOLENCE,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Лечение группы со временем на 20 с; ур. 20 — снятие дебаффа каждые 5 с. Для боёв с дебаффами (Th3Ruthless, MetaRoad); стоит слота с ур. 15 (couga54). Топ: 22%.'
    },
    {
      skill: SALVATION,
      role: 'stigma',
      equip: false,
      note: 'Неуязвимость на 3 с. Для сборки «только лечение» (GamerBlurb, GAMES.GG); MetaRoad считает её PvP-стигмой. Топ: 27%, ур. 4,4.'
    }
  ],

  stats: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Сводка 7 гайдов: чаще всего называют скорость боя (7 из 7), АТК, увелич. урона, крит. урон, меткость и стойкость к урону (по 5 из 7). АТК ценнее всего: от неё растёт и урон, и лечение'
    },
    { stat: S.combatSpeed, weight: 5 },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.critDamageBoost, weight: 5, note: 'Приговор под Возмездием природы критует всегда — крит. урон умножает главный урон' },
    { stat: S.attackBonus, weight: 5 },
    { stat: S.weaponDamageBoost, weight: 4, note: 'На булаве и щите (MetaRoad, couga54, Vault)' },
    { stat: S.attackIncrease, weight: 4 },
    { stat: S.double, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.cooldown, weight: 4 },
    { stat: S.accuracy, weight: 4, note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 000–1 200 Лудра), дальше — меньше' },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    {
      stat: S.critical,
      weight: 3,
      note: 'Крит упирается в 50%; Приговор под Возмездием природы и Раскат грома с вариантом 5 критуют и без него. После Возмездия природы ур. 20 строки крита можно менять на Благосклонность или Дар земли (MetaRoad)'
    },
    { stat: S.multiHit, weight: 3 },
    { stat: S.precision, weight: 3 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.hp, weight: 3, note: 'ОЗ и стойкость — «пока группа умирает» (ExpCarry, GamerBlurb)' },
    {
      stat: S.healBoost,
      weight: 3,
      note: 'На шмоте не встречается (MetaRoad): растёт от АТК через Усиление исцеления. Оценка помощника — полезно, если попадётся'
    },
    { stat: S.moveSpeed, weight: 3, note: 'Обычная строка сапог у всех, кто расписывает шмот по слотам' },
    { stat: S.constitution, weight: 2 },
    { stat: S.dexterity, weight: 2 },
    { stat: S.mp, weight: 2, note: 'Лекарю ОМ кончается быстрее (MetaRoad)' },
    { stat: S.incomingHeal, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.endurance, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.statusResist, weight: 1 },
    { stat: S.block, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.evasionBonus, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: CONDEMNATION, weight: 5 },
      { skill: LORDS_GRACE, weight: 5 },
      { skill: EARTHS_GRACE, weight: 5 },
      { skill: BOLT, weight: 4 },
      { skill: JUDGMENT_THUNDER, weight: 4 },
      { skill: DIVINE_AURA, weight: 4 },
      { skill: CHAIN_OF_TORMENT, weight: 4 },
      { skill: RADIANT_RECOVERY, weight: 4 },
      { skill: HEALING_ENHANCEMENT, weight: 4 },
      { skill: DEBILITATING_MARK, weight: 3 },
      { skill: EARTHS_RETRIBUTION, weight: 3 },
      { skill: HEALING_LIGHT, weight: 3 },
      { skill: LIGHT_OF_REGENERATION, weight: 3 },
      { skill: RADIANT_BENEDICTION, weight: 3 },
      { skill: WARM_BENEDICTION, weight: 2 },
      { skill: IMMORTAL_VEIL, weight: 2 },
      { skill: SURVIVAL_WILLPOWER, weight: 1 },
      { skill: LIGHTNING_STRIKE, weight: 1 }
    ],
    notes:
      'Что носят топ-целители: Боевой молот разъяренной Кромед (38%, в среднем +14), Наручи Нуакума (45%), броня Нуакума (62–64%), украшения разъяренной Кромед (61–66%), Благородный пояс (91%), Амулет откровения (91%), Руны столкновения (98%). Оружие +15 у 60%, наручи +15 у 48%, броня и украшения чаще +10. Кольца — крафтовые, все строки на умения: Приговор, Раскат грома, Карающая молния, Цепь боли или Свет исцеления (MetaRoad, couga54, Vault). На броне и украшениях — строка Благосклонности или Дара земли (MetaRoad, Vault, couga54).'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням 540 топ-целителей): АТК, крит, доп. меткость, ОЗ, ОМ, блок, ЗЩТ, сопр. криту, УКЛ; увелич. урона — у 27%'
    },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.weaponDamageBoost, weight: 4, note: 'MetaRoad и Th3Ruthless — первым на оружие' },
    {
      stat: S.critDamageBoost,
      weight: 3,
      note: 'MetaRoad и MrRosaPony советуют, но у топ-целителей таких камней не видно — возможно, только на оружии'
    },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.critical, weight: 3 },
    { stat: S.hp, weight: 3 },
    { stat: S.mp, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [
      CONDEMNATION,
      BOLT,
      DIVINE_AURA,
      JUDGMENT_THUNDER,
      RADIANT_RECOVERY,
      CHAIN_OF_TORMENT,
      EARTHS_RETRIBUTION,
      HEALING_LIGHT,
      LIGHT_OF_REGENERATION,
      DEBILITATING_MARK
    ],
    passive: [
      LORDS_GRACE,
      EARTHS_GRACE,
      HEALING_ENHANCEMENT,
      RADIANT_BENEDICTION,
      WARM_BENEDICTION,
      IMMORTAL_VEIL,
      SURVIVAL_WILLPOWER,
      PRAYER_OF_CONCENTRATION
    ],
    useless: [DEFIANCE, LIGHTNING_STRIKE, HEAL_BLOCK, LORDS_BENEDICTION],
    preferredSet: 'vigor',
    notes:
      'Топ-целители: Грааль «жизни» (56%), Пергамент «жизни» (44%), Зеркало «жизни» (41%), Колокол «магии» (43%); Компас — почти поровну (жизни 34%, магии 28%). Гайды здесь расходятся: MetaRoad всё, кроме Грааля, берёт «магии», Whelps и MrRosaPony — Компас и Колокол «магии», Skycoach — Колокол и Зеркало. Сходятся в двух: Грааль «жизни» (Время — скорость боя) и Колокол «магии» (Разрушение — АТК). Главное — карты с Приговором: только так он дойдёт до ур. 20 (Skycoach, couga54); на Священной ауре удачен ролл +4 (Whelps).'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Приговору, Карающей молнии, Священной ауре и Раскату грома на каждой из четырёх досок. Приговор +1 на Неджакане, Джикеле и Байзеле берут 95–98% топ-игроков, Карающую молнию на Неджакане — 96%; MetaRoad и Vault начинают с этих узлов.',
        skills: [CONDEMNATION, JUDGMENT_THUNDER, DIVINE_AURA, BOLT],
        boards: [71, 72, 73, 74]
      },
      {
        id: 'damage-passives',
        name: 'Благосклонность и Дар земли',
        description:
          'Пассивки урона: Благосклонность Владык Эмпирея (два узла на Неджакане берут 96–97% топ-игроков) и Дар земли (на Джикеле — 96%). Следом за главными умениями у Vault, couga54 и MetaRoad.',
        skills: [LORDS_GRACE, EARTHS_GRACE],
        boards: [71, 72, 73, 74]
      },
      {
        id: 'heals-support',
        name: 'Лечение и Цепь боли',
        description:
          '+1 к Целебному лучу (на Неджакане — 98% топ-игроков), Свету исцеления, Целительному свету и Цепи боли, затем Усиление исцеления и Сияющее покровительство (MetaRoad, Skycoach).',
        skills: [LIGHT_OF_REGENERATION, RADIANT_RECOVERY, HEALING_LIGHT, CHAIN_OF_TORMENT, HEALING_ENHANCEMENT, RADIANT_BENEDICTION],
        boards: [71, 72, 73, 74]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: скорость боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль). Стойкость к крит. урону и сопротивление мульти-удару — пропустить (MetaRoad, couga54).',
        boards: [71, 72, 73, 74],
        nodes: [710033, 710193, 710043, 710183, 720043, 720183, 720033, 720193, 730033, 730193, 740023, 740197, 740209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — со сложных экспедиций): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Узлы — как в сводном гайде стража (оценка помощника: гайды целителей раскладки по Ариэль не дают). У большинства топ-целителей доска пока почти пустая. Асфель — только PvP.',
        boards: [75],
        nodes: [750001, 750008, 750218, 750225, 750032, 750074, 750152, 750194, 750028, 750081, 750145, 750198]
      }
    ],
    notes:
      'Не тратить очки на узлы Покровительства Владык Эмпирея и Блокировки восстановления (PvP), Шквала молний и Снятия шока (если очки не лишние). Узлы ОМ лекарю не мешают (MetaRoad), Whelps их по возможности пропускает. Доски не рассчитаны на полное заполнение — четыре первые стоят 570 кристаллов (couga54).'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'MetaRoad, Lucia: ячейки 1 и 5 — макс. АТК или доп. АТК; качать род до ур. 9–10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.critDamageBoost, weight: 5 },
      { stat: S.weaponDamageBoost, weight: 5 },
      { stat: S.double, weight: 5, note: 'Особая ячейка — Сокрушающий удар (MetaRoad, Lucia)' },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.perfect, weight: 4 },
      { stat: S.damageBoost, weight: 4 },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad, Lucia)' },
      { stat: S.critical, weight: 4, note: 'Ячейки 3, 6, 9 — крит или меткость, чего не хватает (MetaRoad, Lucia)' },
      { stat: S.accuracyBonus, weight: 4 },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.damageTolerance, weight: 4, note: 'MetaRoad: ячейку 7 — на стойкость, когда Возмездие природы держится весь бой' },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.pveAttack, weight: 4 },
      { stat: S.bossAttack, weight: 4 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.endurance, weight: 3, note: 'Lucia: ячейка 7 — регенерация или непробиваемость' },
      { stat: S.hp, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      {
        stat: S.backAttackDamageBoost,
        weight: 3,
        note: 'Целитель бьёт издалека и может стоять за спиной босса: MetaRoad берёт урон с тыла в ячейку 4 Мутантов'
      },
      { stat: S.backAttack, weight: 2 },
      { stat: S.frontAttack, weight: 2 },
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
      'Запирайте только почти максимальные значения. Ячейка 4 у каждого рода — свой урон: Разум — крит. урон, Дикие — урон оружия, Природа — Совершенный удар, Мутанты — урон с тыла, Особый — Сокрушающий удар (MetaRoad).'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.dominatorOfDimensions, T.ruleAllCreation],
    utility: [T.throughHellAndBack, T.emptyCloset, T.journeysPath],
    notes:
      'Что носят топ-целители: атака — Unbound by Genus (48% в сумме двух версий), затем Защитник Альтгарда (8,5%; для Элийцев — Защитник Бертрона); защита — Святой Альтгарда / Бертрона (81%); другое — Прошедший огонь и воду (60%, сокращение перезарядки). MetaRoad для защиты советует Dominator of Dimensions (стойкость в PvE), для «другого» — Empty Closet (скорость боя и перезарядка), как и GAMES.GG. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель.'
  },

  statTargets: [
    {
      id: 'accuracy',
      name: 'Меткость в PvE',
      kind: 'content',
      stats: [S.accuracy, S.accuracyBonus, S.pveAccuracy],
      goals: [
        { value: 800, label: 'Трансцендентность 4' },
        { value: 1000, label: 'Лудра — минимум (Lucia)' },
        { value: 1200, label: 'Лудра, обычная и сложная' }
      ],
      raise: [S.accuracyBonus, S.pveAccuracy, S.accuracy],
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов. Порог — блок босса, от класса не зависит: меткость сверх него не нужна. 800 и 1 200 — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026), 1 000 — совет Lucia для целителя; официальных цифр нет.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [
        { value: 1000, label: 'Лудра — минимум (Lucia)' },
        { value: 1700, label: 'предел 50% шанса против Лудры' }
      ],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Приговору под Возмездием природы и Раскату грома с вариантом 5 крит не нужен — они критуют всегда.'
    },
    ...(
      [
        [S.might, 'Мощь', 45.6],
        [S.dexterity, 'Ловкость', 28.7],
        [S.precision, 'Точность', 25.9],
        [S.constitution, 'Здоровье', 21.1],
        [6, 'Воля', 10]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-целителей' }],
      note: 'Средний уровень у 1 685 топ-целителей глобальной версии (metabot.gg, 9.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 60.4],
        [7, '[Неджакан] Справедливость', 51.8],
        [14, '[Триниэль] Смерть', 45.6],
        [13, '[Джикел] Разрушение', 41.7],
        [8, '[Байзел] Свобода', 40.7],
        [17, '[Израфель] Пространство', 35.2],
        [10, '[Юстиэль] Жизнь', 33.2],
        [9, '[Кайсинель] Видение', 30.3],
        [15, '[Румиэль] Мудрость', 29.2],
        [16, '[Маркутан] Судьба', 27.1]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-целителей' }],
      note: 'Стат бога: средний у 1 685 топ-целителей глобальной версии (metabot.gg, 9.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'До пула: включите Свет спасения (переключатель, один раз; с чародеем не нужен), призовите Благородную ауру, наложите Целебный луч.',
    'Клеймо бессилия на цель, затем Молитва усиления — прямо перед окном урона.',
    'Цепь боли, затем Возмездие природы. Приговор бьёт только по цели с Цепью боли; под Возмездием природы ур. 5 он всегда критует, а крит со специализацией 4 сбрасывает перезарядку — жмите Приговор подряд, пока висит Возмездие природы.',
    'Между окнами — Священная аура у цели, Карающая молния и Возмездие земли на ЛКМ (восполняет ОМ, а разряд сокращает перезарядку Раската грома).',
    'Раскат грома — вручную, полным зарядом, лучше под Молитву усиления и когда сбита шкала оглушения босса. Шквал молний — только по оглушённой цели.',
    'Лечение — вне связки и по необходимости: Целительный свет — на мелкий урон, Свет исцеления — на урон по группе и чтобы снять дебафф. Большие защитные (Отпущение, Сила Юстиэль) — заранее, под сильный удар босса, и не все сразу.',
    'Если группа в безопасности — не стойте с полным запасом лечения: держите Клеймо и Цепь боли на боссе и бейте (GamerBlurb, couga54).'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'condemnation',
        name: 'Ячейка Приговора',
        skills: [PRAYER_OF_AMPLIFICATION, EARTH_PUNISHMENT, CHAIN_OF_TORMENT, CONDEMNATION],
        note: 'Ряд 0 — Молитва усиления, ряд 1 — Возмездие природы: обе встают по откату и держат окно урона (Whelps, Lucia, marx0310, Mobalytics). Цепь боли — главнее Приговора: он бьёт только по цели с Цепью боли, поэтому она обновляется, как только готова (Lucia, Th3Ruthless, MrRosaPony; Th3Ruthless проверял другие порядки — урон ниже). У Whelps наоборот: Приговор в ряду 2, Цепь боли в ряду 3 — тоже рабочий вариант. Шаг стоит в связке три раза подряд (Whelps, MrRosaPony; у Th3Ruthless — 8 шагов из 10): Приговор должен вылетать чаще всего.'
      },
      {
        id: 'condemnation-2',
        name: 'Ячейка Приговора (повтор)',
        skills: [PRAYER_OF_AMPLIFICATION, EARTH_PUNISHMENT, CHAIN_OF_TORMENT, CONDEMNATION],
        note: 'Та же ячейка ещё раз — см. первый шаг.'
      },
      {
        id: 'condemnation-3',
        name: 'Ячейка Приговора (повтор)',
        skills: [PRAYER_OF_AMPLIFICATION, EARTH_PUNISHMENT, CHAIN_OF_TORMENT, CONDEMNATION],
        note: 'Та же ячейка в третий раз.'
      },
      {
        id: 'mark',
        name: 'Ячейка Клейма',
        skills: [LIGHT_OF_REGENERATION, DEBILITATING_MARK, DIVINE_AURA, JUDGMENT_THUNDER],
        note: 'Целебный луч — в ряду 0: лечение группы на 30 с по откату, без него лечить приходится руками (первым его ставят Mobalytics, Th3Ruthless и MrRosaPony; Whelps — в ряд 2). Клеймо бессилия и Священная аура — по откату. Карающая молния — в ряду 3: перезарядки у неё нет, ячейка всегда готова, поэтому шаг последний. Whelps после Возмездия природы ур. 20 (действует почти весь бой) убирает Карающую молнию из связки и жмёт её отдельно на группах мобов.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс — почти у всех публичных связок целителей (из 472 задержку задают 326, почти все — 10 мс; Vault) и у Lucia; при высоком пинге — 40–50 мс (MetaRoad). Правило порядка: ячейка с Карающей молнией (без перезарядки) — последней.',
    manual: [
      {
        skill: EARTHS_RETRIBUTION,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой: +110 ОМ за удар, разряд сокращает перезарядку Раската грома (Lucia, MetaRoad, Mobalytics). Когда ОМ хватает, MrRosaPony отпускает ЛКМ — одна связка бьёт сильнее.'
      },
      {
        skill: BOLT,
        key: '4',
        when: 'Полным зарядом по откату — лучше под Молитву усиления и в сбитую шкалу оглушения (MetaRoad, couga54). Не начинайте заряд во время опасной механики (GAMES.GG).'
      },
      { skill: LIGHT_OF_PROTECTION, key: '5', when: 'Включить один раз до боя (переключатель). В связку не ставить — она его выключит.' },
      { skill: NOBLE_AURA, key: '8', when: 'До пула; держится 300 с, перезарядка 60 с — обновлять, когда спадёт.' },
      {
        skill: HEALING_LIGHT,
        key: 'E',
        when: 'Мелкий урон: лечит вас и самого раненого в группе в 40 м. Лечите только того, кого только что ударили (couga54).'
      },
      {
        skill: RADIANT_RECOVERY,
        key: '3',
        when: 'Сильный урон по всей группе или снимаемый дебафф. Не тратьте все большие лечения после первого удара по группе (GAMES.GG, Mobalytics).'
      },
      { skill: DEFIANCE, key: 'Q', when: 'Когда оглушили, опрокинули или напугали.' },
      { skill: LIGHTNING_STRIKE, optional: true, when: 'Только по оглушённой цели и когда Приговор не сбрасывается (Whelps).' },
      { skill: ABSOLUTION, optional: true, when: 'С чародеем вместо Света спасения: опасный момент или много дебаффов на группе.' },
      { skill: YUSTIELS_POWER, optional: true, when: 'Прямо перед сильным ударом босса по группе (стойкость +20% на 10 с).' },
      { skill: SUMMON_RESURRECTION, optional: true, when: 'Только в безопасное окно и когда союзник не воскресится камнем сам.' },
      { skill: BENEVOLENCE, optional: true, when: 'Долгий урон по группе или дебаффы; на ур. 20 снимает дебафф каждые 5 с.' }
    ],
    opener: [
      { skill: LIGHT_OF_PROTECTION, note: 'до пула, переключатель' },
      { skill: NOBLE_AURA, note: 'до пула' },
      { skill: LIGHT_OF_REGENERATION, note: 'до пула — лечение на 30 с' },
      { skill: DEBILITATING_MARK },
      { skill: PRAYER_OF_AMPLIFICATION, note: 'перед окном урона' },
      { skill: CHAIN_OF_TORMENT, note: 'открывает Приговор' },
      { skill: EARTH_PUNISHMENT, note: 'Приговор всегда критует' },
      { skill: CONDEMNATION, note: 'подряд, пока сбрасывается' },
      { skill: DIVINE_AURA },
      { skill: BOLT, note: 'полный заряд' }
    ],
    openerNote:
      'Порядок ExpCarry и MetaRoad (Свет спасения → Клеймо → Молитва → Цепь боли → Возмездие природы → Приговор подряд), Целебный луч до пула — GAMES.GG и GamerBlurb, Благородная аура — Mobalytics. Mobalytics ставит Молитву до Клейма и Возмездие природы до Цепи боли — разница небольшая. Дальше — связка и лечение по ситуации.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так советуют Lucia, MetaRoad и Mobalytics), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Возмездие земли. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для целителя отдельно не проверялось). ПКМ на миг отпускается в конце прогона — поэтому ячейка с всегда готовой Карающей молнией в связке последняя. Когда ОМ хватает, проще держать только ПКМ.'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка Lucia и MetaRoad). Включите в настройках резерв умений (Skill Queue), чтобы нажатия во время анимации не терялись (MetaRoad). Лечение, Снятие шока и Воскрешение — не в связку: их время решаете вы (MetaRoad, GAMES.GG, Vault — Свет исцеления вне связки почти во всех публичных связках).'
  },

  tips: [
    {
      title: 'Связка: две ячейки',
      text: 'Ячейка Приговора — Молитва усиления (ряд 0), Возмездие природы, Цепь боли, Приговор — три шага подряд; затем ячейка Клейма — Целебный луч (ряд 0), Клеймо бессилия, Священная аура, Карающая молния. Связка — на ПКМ, задержка 10 мс. Возмездие земли на ЛКМ — держать обе кнопки. Раскат грома, Благородная аура и всё лечение — вручную; Свет спасения — включить до боя. Подробно — на странице «Ротация».'
    },
    {
      title: 'Чародей в группе',
      text: "Свет спасения и Песнь непобедимости чародея не складываются: работает тот, что выше уровнем, при равных — Песнь. С чародеем меняйте Свет спасения на Отпущение (MetaRoad, Vault, ExpCarry) или Воскрешение призванного существа (Whelps). Ещё: бафф Возмездия природы (Earth's Blessing) и Повелитель бурь чародея на одного игрока вместе не ложатся — Vault советует, чтобы чародей включал Повелителя бурь первым: у него перезарядка намного дольше."
    },
    {
      title: 'Лечение растёт от АТК',
      text: 'Усиление исцеления превращает АТК в усиление лечения, а прямого усиления лечения на шмоте нет (MetaRoad). Лечение не критует (MrRosaPony) — крит нужен только урону. Поэтому шмот целителя — атакующий, как у бойца.'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Стигмы: семь гайдов из восьми — урон (Возмездие природы, Свет спасения, Молитва усиления, Благородная аура; у топ-игроков 92/92/83/88%), GamerBlurb — только лечение и защита (Отпущение, Спасение, Сила Юстиэль, Воскрешение; у топа 27–62% и низкие уровни). Приговор на ур. 16–19: +12% урона (большинство) или мульти-удар (Whelps). Свет исцеления: +1 применение (MetaRoad, Whelps) или снять 2 дебаффа (Mobalytics, Skycoach).'
    },
    {
      title: 'Порог урона',
      text: 'Весь урон держится на двух вещах: Приговор ур. 12 со специализацией 4 и Возмездие природы ур. 5. Пока их нет, урон заметно ниже — это нормально (Mobalytics, ExpCarry). Дальше — Возмездие природы до 20: оно держится 20 с из 30, а с ~34% сокращения перезарядки — почти весь бой (MetaRoad).'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Talisra (−4% перезарядки) — цель (MetaRoad, couga54, GAMES.GG). Пантеон: гайды советуют Разрушение (АТК), Мудрость (Сокрушающий удар), Видение (перезарядка) и Время (скорость боя), затем Свобода (меткость) и Смерть (крит) — MetaRoad, couga54, GAMES.GG. У топ-целителей больше всего Времени и Справедливости, а Видения и Мудрости — меньше всего.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить связку: ячейка Приговора три раза, затем ячейка Клейма; на ПКМ, задержка 10 мс' },
    { id: 'binds', text: 'Возмездие земли — на ЛКМ; Раскат грома, Целительный свет и Свет исцеления — на отдельных клавишах' },
    { id: 'stigmas', text: 'Стигмы: Возмездие природы, Свет спасения, Молитва усиления, Благородная аура (с чародеем — Отпущение вместо Света спасения)' },
    { id: 'breakpoint', text: 'Приговор — ур. 12 и специализация 4, Возмездие природы — ур. 5: с этого начинается весь урон' },
    { id: 'protection-toggle', text: 'Перед боем включить Свет спасения — это переключатель, в связку его не ставить' },
    { id: 'weapon15', text: 'Булава — заточка +15 (так у большинства топ-целителей)' },
    { id: 'arcana-vigor', text: 'Арканы: Грааль, Пергамент и Зеркало «жизни», Колокол «магии», Компас — любой' }
  ]
}
