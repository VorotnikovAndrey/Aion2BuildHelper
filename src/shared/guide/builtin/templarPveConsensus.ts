// Встроенный гайд: Страж, PvE — сводный. Собран из 8 гайдов для глобальной версии и статистики
// 3 741 топ-стража глобальных серверов (metabot.gg, 8 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/templar-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков.

import type { Guide } from '../types'

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
const EMPYREAN_LORDS_PUNISHMENT = 12310000
const NEZEKANS_SHIELD = 12320000
const BATTLEFIELD_BANNER = 12450000

// Статы (ID игры)
const S = {
  might: 1,
  criticalDamageTolerance: 47,
  bossAttack: 50,
  bossDefense: 51,
  pveDefense: 57,
  powerShardDamage: 69,
  frontAttack: 587,
  frontDefense: 588,
  frontCritical: 591,
  dexterity: 2,
  constitution: 4,
  precision: 5,
  attackBonus: 19,
  damageBoost: 28,
  maxAttack: 31,
  weaponDamageBoost: 32,
  criticalAttack: 38,
  critDamageBoost: 44,
  defenseBonus: 52,
  pveAttack: 56,
  damageTolerance: 70,
  accuracyBonus: 104,
  pveAccuracy: 110,
  evasionBonus: 116,
  critical: 128,
  criticalResist: 133,
  multiHit: 146,
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
  perfect: 442,
  double: 443,
  endurance: 445,
  bossDamageBoost: 520,
  frontAttackDamageBoost: 589
} as const

// Титулы (ID игры)
const T = {
  unboundByGenus: 13010021,
  goldenGlow: 13050017,
  saintOfVerteron: 12030003,
  saintOfAltgard: 22030003,
  dominatorOfDimensions: 13050011,
  ruleAllCreation: 13010025,
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  journeysPath: 13051004
} as const

export const templarPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-templar-pve-consensus',
  name: 'Страж PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'templar',
  mode: 'pve',
  builtin: true,
  description:
    'Не один гайд, а то, в чём сходятся восемь гайдов для глобальной версии и что реально носят 3 741 топ-страж глобальных серверов. Урон — окна Суда (их открывают Удар щитом, Кара хранителя, Рывок со щитом и Щит погибели), заряженная Кровавая месть и Град ударов; Ярость от блоков усиливает всю группу. Цель: Суд, Кровавая месть, Град ударов, Жестокий удар и Кара хранителя — ур. 16, затем Суд — ур. 20. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-08' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-стражи (3 741 игрок, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/templar/build',
      date: '2026-11-08',
      region: 'global',
      kind: 'data'
    },
    {
      title: 'Mobalytics — Aion 2 Templar PvE Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-templar-pve-build',
      author: 'Mobalytics-Oli / NoBS Game Guides',
      date: '2026-10-16',
      region: 'global'
    },
    {
      title: 'MetaRoad — Templar PvE Tank Build (+ опрос 200 стражей)',
      url: 'https://metaroad.gg/aion2/build-guides/templar-pve-tank-build',
      date: '2026-10-29',
      region: 'global'
    },
    {
      title: 'ExpCarry — AION 2 Templar Build Guide',
      url: 'https://expcarry.com/aion-2-templar-guide',
      date: '2026-10-21',
      region: 'korea',
      note: 'Собран на корейском/тайваньском патче 23.09 под глобальный запуск — самый подробный по специализациям и статам.'
    },
    {
      title: 'AION 2 Global Guides — Templar (SolAshur, Leonis, trueeevil, Inven)',
      url: 'https://couga54.github.io/aion2-guides/en/templar/',
      author: 'SolAshur и др.',
      date: '2026-10-10',
      region: 'global'
    },
    {
      title: 'SolAshur — Templar Global Season 1',
      url: 'https://solashur.com/builds/aion2-templar-global-build-guide.html',
      author: 'SolAshur (Rank 1, арена 1×1)',
      date: '2026-10-30',
      region: 'global',
      note: 'Уклон в PvP/PvX.'
    },
    {
      title: 'Skycoach — AION 2 Templar Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/templar-guide',
      author: 'Dallon Avery',
      date: '2026-10-28',
      region: 'global'
    },
    {
      title: 'GamerBlurb — Templar Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-templar-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global'
    },
    {
      title: 'GAMES.GG — Aion 2 Templar Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-templar-guide/',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, на старте сезона.'
    }
  ],
  updatedAt: '2026-11-08T00:00:00.000Z',

  skills: [
    {
      skill: JUDGMENT,
      role: 'core',
      level: 20,
      specs: [5, 4, 3],
      earlySpecs: [3, 4],
      note: 'Главный урон. Сначала ур. 16 — снятие перезарядки (6 из 6), затем ур. 20 ради третьего слота (4 гайда; у топ-игроков в среднем ур. 18). Второй вариант — «крит при попадании» (5 из 7): крит упирается в 50%, а Суд с ним критует всегда. Mobalytics вместо этого берёт доп. урон — он идёт третьим.'
    },
    {
      skill: PUNISHMENT,
      role: 'core',
      level: 16,
      specs: [5, 3, 2],
      earlySpecs: [3, 2],
      note: 'Заряжаемый удар; его бафф держится 20 с. На ур. 16 — игнор блока и уклонения + крит (4 из 4). Вторым — +30% скорости умения (5 из 7), третьим — урон со временем (4 из 7). Вариант «в движении» и поглощение ОЗ большинство не берёт. Топ: ур. 16; два гайда ведут Кровавую месть к 20.'
    },
    {
      skill: PUMMEL,
      role: 'core',
      level: 16,
      specs: [5, 4, 3],
      earlySpecs: [4, 3],
      note: 'Заполнитель между окнами Суда. На ур. 16 — доп. урон «Удара возмездия» (3 из 3). Вторым — −1 с перезарядки Кровавой мести (4 гайда; Leonis проверял на манекене), третьим — +12% урона по малому числу целей. Топ: ур. 16.'
    },
    {
      skill: VICIOUS_STRIKE,
      role: 'core',
      level: 16,
      specs: [5, 4, 3],
      earlySpecs: [4, 3],
      note: 'Базовая атака на зажатой ЛКМ. −2 с перезарядки Кары хранителя (4 из 4) — после корейского патча 4.09 это вариант 4, и он же в глобальной версии. На ур. 16 — четвёртый удар в цепочке. Топ: ур. 16.'
    },
    {
      skill: WARDING_STRIKE,
      role: 'core',
      level: 16,
      specs: [1, 5, 2],
      earlySpecs: [1, 2],
      note: '−5 с перезарядки — больше окон Суда (4 гайда). На ур. 16 — +10% стойкости к урону в PvE всей группе (3 гайда). До этого — +100 блока (чаще блок — чаще Ярость). Топ: ур. 15,4.'
    },
    {
      skill: SHIELD_SMITE,
      role: 'support',
      level: 12,
      specs: [4, 3],
      note: '−2 с перезарядки и 50% шанс Удара изнеможения (2 из 2). Открывает окно Суда на 2 с. Топ: ур. 14.'
    },
    {
      skill: ANNIHILATE,
      role: 'support',
      level: 12,
      specs: [3, 4],
      note: '+100% урона по целям с иммунитетом к контролю (боссы) и −10 с перезарядки (3 из 3). Топ: ур. 14,5.'
    },
    {
      skill: DEBILITATING_SMASH,
      role: 'support',
      level: 12,
      specs: [2, 4],
      note: '+3 с ослабления и игнор блока с мульти-ударом (2 из 2). Снижение лечения — только для PvP.'
    },
    { skill: SHIELD_RUSH, role: 'support', level: 12, specs: [2, 4], note: '+10 м дальности и −10 с перезарядки (4 из 4). Тоже открывает окно Суда.' },
    {
      skill: POACH,
      role: 'support',
      level: 12,
      specs: [1, 4],
      note: 'Подтягивает к боссам, которых нельзя притянуть, + щит 10% ОЗ. В фарме — вариант 3 (сброс при убийстве).'
    },
    { skill: DEFIANCE, role: 'situational', specs: [3, 2], note: 'Снятие контроля по ситуации; +20% ОЗ при применении.' },
    {
      skill: FLASH_RAMPAGE,
      role: 'situational',
      note: 'В PvE не качать (3 гайда): узлы досок и арканы на него — потеря. У топ-игроков на панели у 69%, в среднем ур. 8.'
    },

    {
      skill: FURY,
      role: 'passive',
      level: 20,
      note: 'Первая пассивка у всех 8 гайдов: блок даёт +урон в PvE вам и группе на 20 с. Топ: ур. 17. Благородные доспехи ур. 15 усиливают её в 1,5 раза.'
    },
    { skill: INSULTING_ROAR, role: 'passive', level: 16, note: 'Агро и +АТК при атаке спереди. Топ: ур. 16,3 — вторая после Ярости.' },
    { skill: PUNISHING_BENEDICTION, role: 'passive', level: 16, note: 'Крит. удар и доп. урон при попадании. Топ: ур. 15,6.' },
    { skill: IMPACT_HIT, role: 'passive', level: 16, note: 'Попадание шок. эффектами и Сокрушающий удар. Топ: ур. 15,9.' },
    { skill: IRONCLAD_DEFENSE, role: 'passive', level: 14, note: 'ЗЩТ и непробиваемость. Топ: ур. 15,6.' },
    { skill: ENHANCE_HEALTH, role: 'passive', level: 14, note: 'ОЗ и получаемое исцеление. Топ: ур. 15,5.' },
    { skill: BLOCK_PAIN, role: 'passive', note: 'Стойкость к урону после блока. Топ: ур. 13,5.' },

    {
      skill: DOOM_SHIELD,
      role: 'stigma',
      equip: true,
      level: 10,
      note: 'Рывок, открывает окно Суда на 3 с. 6 из 8 гайдов; топ: 87%. Ур. 5 — сброс Истребления, ур. 10 — +200 блока.'
    },
    {
      skill: BATTLEFIELD_BANNER,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Мульти-удар (ур. 5), урон оружия (10), АТК от ЗЩТ (15). 5 из 8; топ: 86%, в среднем ур. 14.'
    },
    {
      skill: NOBLE_ARMOR,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Перед пулом. Ур. 10 — Неповиновение ×1,5, ур. 15 — Ярость ×1,5. 4 из 8; топ: 82%, в среднем ур. 14.'
    },
    {
      skill: TAUNT,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Агро и «Сжатие»: с ур. 5 снижает стойкость босса к урону в PvE на 10% — плюс всей группе; ур. 15 — −5 с перезарядки. 5 из 8; топ: 81%.'
    },
    {
      skill: EMPYREAN_LORDS_PUNISHMENT,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Замена Благородным доспехам в соло и там, где важен урон по шкале оглушения: на ур. 15 — +10% урона в PvE на 10 с. 4 из 8; топ: 55%.'
    },
    {
      skill: SHIELD_OF_PROTECTION,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Для новой сложной экспедиции, пока учите босса: гарантированный блок, ур. 5 — второе применение. Топ: 67%.'
    },
    { skill: NEZEKANS_SHIELD, role: 'stigma', equip: false, note: 'Щит группе от больших атак босса — вместо Щита погибели по ситуации. Топ: 40%.' }
  ],

  stats: [
    {
      stat: S.weaponDamageBoost,
      weight: 5,
      note: 'Сводка 8 гайдов: чаще всего называют скорость боя, урон оружия, меткость (до порога контента) и урон/урон спереди'
    },
    { stat: S.combatSpeed, weight: 5, note: 'Мягкий предел ~50%' },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.frontAttackDamageBoost, weight: 5, note: 'Страж бьёт босса лицом к лицу' },
    { stat: S.attack, weight: 5 },
    { stat: S.attackBonus, weight: 5 },
    { stat: S.accuracy, weight: 4, note: 'Нужна до порога контента (≈900 завоевание, ≈1 300 святилище), дальше — меньше' },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.critDamageBoost, weight: 4 },
    { stat: S.double, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.cooldown, weight: 4 },
    { stat: S.critical, weight: 4, note: 'Крит упирается в 50%; Суд с вариантом 4 критует всегда' },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.multiHit, weight: 3 },
    { stat: S.frontAttack, weight: 3 },
    { stat: S.frontCritical, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.precision, weight: 3 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.block, weight: 3, note: 'Блок запускает Ярость' },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.endurance, weight: 3 },
    { stat: S.hp, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.incomingHeal, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.frontDefense, weight: 1 },
    { stat: S.moveSpeed, weight: 2 },
    { stat: S.dexterity, weight: 2 },
    { stat: S.constitution, weight: 2 },
    { stat: S.mp, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.evasionBonus, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: JUDGMENT, weight: 5 },
      { skill: PUNISHMENT, weight: 5 },
      { skill: VICIOUS_STRIKE, weight: 5 },
      { skill: FURY, weight: 5 },
      { skill: PUMMEL, weight: 4 },
      { skill: WARDING_STRIKE, weight: 4 },
      { skill: INSULTING_ROAR, weight: 4 },
      { skill: PUNISHING_BENEDICTION, weight: 4 },
      { skill: IMPACT_HIT, weight: 4 },
      { skill: SHIELD_SMITE, weight: 3 },
      { skill: ANNIHILATE, weight: 3 },
      { skill: IRONCLAD_DEFENSE, weight: 3 },
      { skill: ENHANCE_HEALTH, weight: 3 },
      { skill: DEBILITATING_SMASH, weight: 2 },
      { skill: BLOCK_PAIN, weight: 2 },
      { skill: SHIELD_RUSH, weight: 1 },
      { skill: POACH, weight: 1 },
      { skill: SURVIVAL_WILLPOWER, weight: 1 },
      { skill: GUARDING_SEAL, weight: 1 },
      { skill: WARDING_SHIELD, weight: 1 }
    ],
    notes:
      'Что носят топ-стражи: меч разъяренной Кромед (44%) или крафтовый Короля драконов, наручи и броня Нуакума (52–75%), украшения разъяренной Кромед (71–76%), Благородный пояс (95%), Амулет откровения (94%), Руны столкновения (99%). Оружие и наручи у большинства +15, броня +10…+12, украшения +12…+15. Кольца — со строками умений (Суд, Кровавая месть, Жестокий удар), серьги — с пассивками (Ярость).'
  },

  manastones: [
    {
      stat: S.weaponDamageBoost,
      weight: 5,
      note: 'Пул камней глобальной версии (по данным топ-игроков): АТК, крит, доп. меткость, ОЗ, блок, ЗЩТ, ОМ, сопр. криту, УКЛ; урон оружия — реже'
    },
    { stat: S.attack, weight: 5 },
    { stat: S.critical, weight: 4 },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.block, weight: 3 },
    { stat: S.hp, weight: 3 },
    { stat: S.defense, weight: 2 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.mp, weight: 1 }
  ],

  arcana: {
    attack: [JUDGMENT, VICIOUS_STRIKE, PUNISHMENT, PUMMEL, WARDING_STRIKE, SHIELD_SMITE, ANNIHILATE, SHIELD_RUSH, DEBILITATING_SMASH, POACH],
    passive: [
      FURY,
      INSULTING_ROAR,
      PUNISHING_BENEDICTION,
      IMPACT_HIT,
      IRONCLAD_DEFENSE,
      ENHANCE_HEALTH,
      BLOCK_PAIN,
      SURVIVAL_WILLPOWER,
      GUARDING_SEAL,
      WARDING_SHIELD
    ],
    useless: [DEFIANCE, FLASH_RAMPAGE],
    preferredSet: 'vigor',
    notes:
      'Топ-стражи: Грааль жизни (69%), Пергамент жизни (49%), Компас жизни (43%), Колокол магии (46%), Зеркало — поровну. ExpCarry советует ровно так же: 3 «жизни» + 2 «магии». Главные эффекты «жизни» — Время (скорость боя), Жизнь (ОЗ), Свобода (меткость); у Колокола магии — Разрушение (АТК). Суд на карте важнее сета: он нужен для ур. 20.'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Суду, Кровавой мести, Граду ударов и Жестокому удару на каждой из четырёх досок. Эти узлы берут 97–98% топ-игроков — с них начинают все гайды.',
        skills: [JUDGMENT, PUNISHMENT, PUMMEL, VICIOUS_STRIKE],
        boards: [21, 22, 23, 24]
      },
      {
        id: 'support-passives',
        name: 'Кара хранителя и Ярость',
        description:
          '+1 к Каре хранителя и Удару щитом, затем пассивки Ярость, Неповиновение и Попадание шоком (ExpCarry, metaroad). Ярость +1 на Джикеле берут 98% топ-игроков.',
        skills: [WARDING_STRIKE, SHIELD_SMITE, FURY, INSULTING_ROAR, IMPACT_HIT],
        boards: [21, 22, 23, 24]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: скорость боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль). Стойкость к крит. урону и сопротивление мульти-удару — пропустить (ExpCarry, SolAshur).',
        boards: [21, 22, 23, 24],
        nodes: [210033, 210193, 210043, 210183, 220043, 220183, 220033, 220193, 230033, 230193, 240023, 240197, 240209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (в глобальной версии с 21 октября): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Для сложных экспедиций (metaroad). Асфель — только PvP.',
        boards: [25],
        nodes: [250001, 250008, 250218, 250225, 250032, 250074, 250152, 250194, 250028, 250081, 250145, 250198]
      }
    ],
    notes:
      'Не тратить очки на узлы ОМ, Сияющий клинок, Священный щит и Охранную печать (если очки не лишние). Перед дальним углом доски проверьте стоимость пути — вдруг рядом узел к Суду или Жестокому удару.'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'ExpCarry, SolAshur: ячейки 4 → 7 → 2 и 8 запирать первыми; качать каждый род до ур. 10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.critDamageBoost, weight: 5 },
      { stat: S.weaponDamageBoost, weight: 5 },
      { stat: S.double, weight: 5 },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.perfect, weight: 4 },
      { stat: S.frontAttackDamageBoost, weight: 4 },
      { stat: S.damageBoost, weight: 4 },
      { stat: S.damageTolerance, weight: 4 },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.pveAttack, weight: 4, note: 'Страж бьёт босса лицом к лицу: урон спереди и по боссам полезен, с тыла — нет' },
      { stat: S.bossAttack, weight: 4 },
      { stat: S.frontAttack, weight: 4 },
      { stat: S.frontCritical, weight: 3 },
      { stat: S.hpIncrease, weight: 3 },
      { stat: S.endurance, weight: 3 },
      { stat: S.critical, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.accuracyBonus, weight: 3 },
      { stat: S.pveAccuracy, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.block, weight: 2 },
      { stat: S.hp, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.powerShardDamage, weight: 2 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 },
      { stat: S.mp, weight: 1 }
    ],
    notes:
      'Запирайте только верхние значения уникальной строки. Если в ячейку 4 не выпало нужное — «Увелич. урона в PvE» (1,5–3%) лучше простого «Увелич. урона» (1–2%).'
  },

  titles: {
    attack: [T.unboundByGenus, T.goldenGlow],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.dominatorOfDimensions, T.ruleAllCreation],
    utility: [T.throughHellAndBack, T.emptyCloset, T.journeysPath],
    notes:
      'Что носят топ-стражи: атака — Unbound by Genus (61% вместе с версией второй фракции), затем Golden Glow (6%); защита — Святой Бертрона / Альтгарда (83%); другое — Прошедший огонь и воду (49%). ExpCarry для «другого» советует Empty Closet (скорость боя и перезарядка). Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель.'
  },

  rotation: [
    'До пула — Благородные доспехи. На подходе — Провокация, затем Рывок со щитом или Ловушка.',
    'Боевое знамя — в спокойное окно урона.',
    'Зарядите Кровавую месть (её бафф держится 20 с) — в тихий момент, не посреди окна Суда.',
    'Откройте окно Суда: Удар щитом, Кара хранителя или Рывок со щитом — 2 с, Щит погибели — 3 с. Потратьте все применения Суда.',
    'Между окнами — Град ударов (сокращает перезарядку Кровавой мести) и Жестокий удар (сокращает перезарядку Кары хранителя).',
    'Удар изнеможения — после Удара щитом или блока; Истребление — по откату.',
    'Щит защиты, Defiance и Щит Неджакана — вручную, под удары босса.'
  ],

  tips: [
    {
      title: 'Макрос: две строки',
      text: 'Строка Суда: Суд (высший приоритет) → Удар щитом → Кара хранителя. Строка Града: Удар изнеможения → Истребление → Град ударов. Жестокий удар на ЛКМ, макрос на ПКМ — держать обе. Задержка 10 мс (при пинге выше ~40 — 25 мс). Кровавая месть, Щит погибели, Рывок со щитом и Ловушка — вручную (так у большинства гайдов).'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Четвёртая стигма: Благородные доспехи (выживание, усиление Ярости) или Кара Владыки Эмпирея (урон, оглушение) — у топ-игроков 82% против 55%. Второй вариант Суда: крит (большинство) или доп. урон (Mobalytics). Град ударов: −1 с Кровавой мести или +12% по одной цели — оба годятся.'
    },
    {
      title: 'Корея и глобальная версия',
      text: 'В глобальной версии 4 слота стигм (в Корее и на Тайване — больше), поэтому корейские наборы стигм не переносятся. Глобальный клиент уже включает корейский патч 4.09: вариант 4 Жестокого удара сокращает перезарядку Кары хранителя, а у Града ударов — Кровавой мести. Советы из корейских гайдов до этого патча по этим вариантам устарели.'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Talisra (−4% перезарядки) в итоге, Dark Veil на старте. Пантеон: статы Мудрость (Сокрушающий удар) и Видение (перезарядка), затем Пространство (блок) и Время (скорость боя); картина «Драупнир» — цель (ExpCarry).'
    },
    {
      title: 'Порог урона',
      text: 'Сначала — ур. 16 у Суда (снятие перезарядки) и Кровавой мести (игнор блока и крит). Правило SolAshur: не можешь дотянуть умение до 16 — остановись на 12; не можешь до 20 — остановись на 16.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить макрос: строка Суда и строка Града ударов, задержка 10 мс' },
    { id: 'binds', text: 'Жестокий удар на ЛКМ, макрос на ПКМ; Кровавая месть и Щит погибели — на отдельных клавишах' },
    { id: 'stigmas', text: 'Стигмы: Щит погибели, Боевое знамя, Благородные доспехи, Провокация' },
    { id: 'weapon15', text: 'Оружие и наручи — заточка +15 (так у большинства топ-стражей)' },
    { id: 'arcana-vigor', text: 'Арканы: Грааль, Пергамент и Компас «жизни», Колокол «магии»' }
  ]
}
