// Встроенный гайд: Убийца, PvE — сводный. Собран из 8 гайдов для глобальной версии и статистики
// 1 280 топ-убийц глобальных серверов (metabot.gg, данные на 8 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/assassin-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды: X%» — доля среди публичных билдов убийц (подсчёт AION2 Vault, 2.11.2026).

import type { Guide } from '../types'

// Умения убийцы (ID игры)
const QUICK_SLICE = 13010000
const SAVAGE_ROAR = 13100000
const SHADOWSTRIKE = 13070000
const AMBUSH = 13060000
const HEART_GORE = 13350000
const STORM_RAMPAGE = 13340000
const WHIRLWIND_SLICE = 13210000
const FLASH_SLICE = 13050000
const INFILTRATE = 13360000
const SHADOW_FALL = 13220000
const INSIGNIA_EXPLOSION = 13130000
const DEFIANCE = 13260000
const HEIGHTENED_SIXTH_SENSE = 13710000
const EXPLOIT_WEAKNESS = 13720000
const APPLY_POISON = 13730000
const REAR_SMITE = 13740000
const ASSAULT_STANCE = 13750000
const IMPACT_HIT = 13760000
const AMBUSH_STANCE = 13770000
const DEFENSE_BREAK = 13780000
const REVITALIZATION_CONTRACT = 13790000
const DETERMINATION = 13800000
const ILLUSIVE_CLONE = 13310000
const SWIFT_CONTRACT = 13390000
const TRINIELS_DAGGER = 13300000
const SAVAGE_FANG = 13270000
const EVASION_STANCE = 13080000
const THROW_SHADOWBLADE = 13020000

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
  backAttackCritical: 100,
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

export const assassinPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-assassin-pve-consensus',
  name: 'Убийца PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'assassin',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся восемь гайдов для глобальной версии и что реально носят 1 280 топ-убийц глобальных серверов. Почти весь урон — Пронзание сердца (~30%) и Взрыв эмблемы (~25%). Пронзание сердца срабатывает только после крит. удара; со специализацией 5 (ур. 16) крит сбрасывает его перезарядку, а Иллюзорный двойник снимает перезарядку совсем на 10–20 с. Окно урона — раз в минуту: Обет ускорения, Иллюзорный двойник и Клык хищника (сразу 5 эмблем), следом Кинжал Триниэля. Бить — со спины босса. Цель: Пронзание сердца — ур. 20; Взрыв эмблемы, Быстрый разрез и Неистовый шквал — 16. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-убийцы (1 280 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/assassin/build',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Умения, стигмы, шмот и доски — по 1 202 игрокам, статы и титулы — по 1 280 (Европа 480, Сев. Америка 401, Азия 246, Лат. Америка 153). Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'Mobalytics — Aion 2 Assassin Burst PvE Build',
      url: 'https://mobalytics.gg/gamebase/guides/aion-2-assassin-burst-pve-build',
      author: 'Ulvier',
      date: '2026-11-08',
      region: 'global',
      note: 'Специализации по номерам, связка по рядам (автор проверял её на своём убийце).'
    },
    {
      title: 'MetaRoad — Assassin PvE Burst Build',
      url: 'https://metaroad.gg/aion2/build-guides/assassin-pve-burst-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Глобальный клиент, часть чисел — с корейских и тайваньских серверов. Самый подробный по строкам шмота, камням, роду, доскам и титулам.'
    },
    {
      title: 'ExpCarry — AION 2 Assassin Guide',
      url: 'https://expcarry.com/aion-2-assassin-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'После глобального патча 28 октября; стигмы — по выборке 200 профилей убийц от 28.10.'
    },
    {
      title: 'AION 2 Global Guides — Assassin (Arthars Gaming, XifanGG, aLuckyRO, Grobs)',
      url: 'https://aion2-guides.info/en/assassin/',
      date: '2026-11-03',
      region: 'global',
      note: 'Проверено 8.11. Видео Arthars и XifanGG записаны на тайваньском клиенте; статы шмота — по корейской выборке aion2-meta (747 топ-убийц).'
    },
    {
      title: 'AION2 Vault — Assassin PvE Build',
      url: 'https://aion2vault.com/builds/assassin/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка Grobs, Nellan97 и delcatta и подсчёт по публичным билдам убийц: специализации — 424 билда, стигмы — 500. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Assassin Macro',
      url: 'https://aion2vault.com/builds/assassin/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки авторов и подсчёт 456 публичных связок (что ставят первым и последним, задержка, что держат вне связки).'
    },
    {
      title: 'AION2 Vault — Assassin Gear',
      url: 'https://aion2vault.com/builds/assassin/gear/',
      date: '2026-10-28',
      region: 'global',
      note: 'Строки шмота (набор j0ei) и арканы по авторам.'
    },
    {
      title: 'Skycoach — AION 2 Assassin Class Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/assassin-guide',
      author: 'Dallon Avery',
      date: '2026-10-28',
      region: 'mixed',
      note: 'Версия не указана; перезарядка Иллюзорного двойника ещё 90 с — написано до патча 28 октября.'
    },
    {
      title: 'GAMES.GG — Aion 2 Assassin Build Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-assassin-build-guide/',
      date: '2026-10-04',
      region: 'mixed',
      note: 'Самый ранний; ссылается на корейско-тайваньский патч сентября, пороги крита — не для глобальной версии.'
    },
    {
      title: 'GamerBlurb — Assassin Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-assassin-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Без чисел: приоритеты умений, статов и ротация.'
    },
    {
      title: 'Timesaver — сколько меткости и крита нужно (отчёты игроков)',
      url: 'https://timesaver.gg/blog/aion-2-accuracy-cap',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Пороги меткости и крита для Трансцендентности и Лудры — по отчётам игроков, от класса не зависят; удары с тыла не проверяют блок и парирование. Официальных цифр нет.'
    }
  ],
  updatedAt: '2026-11-09T00:00:00.000Z',

  skills: [
    {
      skill: HEART_GORE,
      role: 'core',
      level: 20,
      specs: [5, 4, 1],
      note: 'Главный урон (~30%; Arthars, MetaRoad). Срабатывает только после крит. удара, перезарядка 5 с. Вариант 5 (ур. 16) — сброс перезарядки при крите: «первым делом» у всех 8 гайдов (публичные билды: 91%). Вторым — мульти-удар (8 из 8; 76%), но Grobs вместо него берёт вариант 3 (+20% крита по малому числу целей), MetaRoad — тоже, если крита мало. Третьим на ур. 20 — поглощение ОЗ (Mobalytics, MetaRoad, Skycoach, GAMES.GG, Arthars). Ур. 20 — MetaRoad, GAMES.GG, ExpCarry, aion2-guides, Skycoach, Nellan97 (все — сначала 16); Grobs — 16; топ: ур. 17,1 — выше всех умений.'
    },
    {
      skill: INSIGNIA_EXPLOSION,
      role: 'core',
      level: 16,
      specs: [5, 3, 2],
      note: 'Второй урон (~25%): бьёт тем сильнее, чем больше эмблем на цели (до 5). Перезарядка 10 с; вариант 5 — ещё −3 с (8 из 8; публичные билды: 93%). Вторым — сохранить 2 эмблемы после взрыва (Mobalytics, MetaRoad, ExpCarry, aion2-guides, Grobs; 60%), но в публичных билдах чаще мульти-удар — вариант 2 (75%; Skycoach, GAMES.GG, Nellan97). Мульти-удар — третьим на ур. 20. Ур. 16 — 4 гайда, 20 — ExpCarry, aion2-guides, Nellan97; топ: 16,3.'
    },
    {
      skill: QUICK_SLICE,
      role: 'core',
      level: 16,
      specs: [5, 4, 3],
      note: 'Базовая атака на зажатой ЛКМ: +100 ОМ за удар. Вариант 4 — −1 с перезарядки Взрыва эмблемы за попадание (8 из 8; публичные билды: 92%). Вариант 5 (ур. 16) — всегда крит сквозь блок и уклонение (Mobalytics, MetaRoad, ExpCarry, aion2-guides, Skycoach, GAMES.GG, GamerBlurb, Nellan97; публичные билды: 77%): каждый крит запускает Пронзание сердца, Nellan97 намерил +5–10% урона. Третьим на ур. 20 — мульти-удар (68%) или поглощение ОЗ. До ур. 12 Mobalytics и Skycoach берут поглощение ОЗ. Ур. 16, затем 20 (ExpCarry, aion2-guides, Nellan97, GAMES.GG); топ: 16,3.'
    },
    {
      skill: STORM_RAMPAGE,
      role: 'core',
      level: 16,
      specs: [5, 4],
      note: 'Бьёт только ошеломлённую цель (сбитая шкала Ошеломления), зато сколько угодно раз подряд. Вариант 5 (ур. 16) — −1 с перезарядки всех умений за удар, стигм тоже: 1–2 лишних Иллюзорных двойника за бой (Nellan97). «Очень важен для урона» — Mobalytics; 5 — 6 гайдов (публичные билды: 82%), до 16 — мульти-удар, вариант 4 (69%). Ур. 16 — Mobalytics, ExpCarry, aion2-guides, Vault, Skycoach; MetaRoad — 14, с Компасом 16; топ: 13,5.'
    },
    {
      skill: SAVAGE_ROAR,
      role: 'support',
      level: 12,
      specs: [2, 4, 3],
      note: 'Заполнитель в связке: тратит ОМ, цепочка из трёх ударов, каждый — эмблема. +20% скорости умения (6 из 6; публичные билды: 98%), на ур. 12 — −1 с перезарядки Удара из сумрака за попадание (6 гайдов; 57%). Nellan97 вместо него берёт +12% по малому числу целей (вариант 3) — у MetaRoad он третий на ур. 20. Ур. 12 — 5 гайдов (delcatta — 16, MetaRoad — 18); топ: 14,9.'
    },
    {
      skill: AMBUSH,
      role: 'support',
      level: 12,
      specs: [5, 1, 2],
      note: 'С тыла +30% урона, перезарядка 10 с. Вариант 1 — 2 эмблемы при ударе с тыла (MetaRoad, aion2-guides, ExpCarry, GamerBlurb), 2 — поглощение 3% ОЗ (MetaRoad, XifanGG; публичные билды: 82%). На ур. 16 вариант 5 — +2 применения подряд (aion2-guides, GamerBlurb, MetaRoad; 87%) — вместо варианта 1. Ур. 12 — ExpCarry, 14 — MetaRoad, 16 — aion2-guides, delcatta, alan218; топ: 13.'
    },
    {
      skill: SHADOWSTRIKE,
      role: 'support',
      level: 8,
      specs: [2],
      note: 'Рывок за спину цели в 20 м — главный способ встать с тыла. Вариант 2 — +20% крит. урона на 10 с (все, кто разбирает специализации): жмите прямо перед окном урона. Ур. 8 — ExpCarry, aion2-guides, Skycoach, Nellan97 («хватает»); 12 — MetaRoad, GAMES.GG; топ: 12,7.'
    },
    {
      skill: FLASH_SLICE,
      role: 'support',
      level: 12,
      specs: [2, 4],
      note: 'Переносит на противоположную сторону цели — запасной путь за спину, когда Удар из сумрака на откате (проверьте, где вы стоите). +6 м дальности и на ур. 12 — второе применение подряд (Mobalytics, MetaRoad, Skycoach). Ур. 12 — 4 гайда; топ: 12,6.'
    },
    {
      skill: INFILTRATE,
      role: 'support',
      level: 8,
      specs: [2, 1],
      note: 'Рывок за спину после уклонения или в полёте. +10 м дальности (все, кто разбирает), вторым — +300 ОД (Mobalytics, MetaRoad, Nellan97). Ур. 8 — Grobs, Skycoach; 12 — MetaRoad; топ: 11,8.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [5, 4, 3],
      note: 'Снимает оглушение, опрокидывание и страх. Вариант 4 — +2 с непреклонности (MetaRoad, aion2-guides), 3 — +20% ОЗ (Skycoach, Grobs); на ур. 16 вариант 5 — +50% стойкости к урону в PvE на время непреклонности (MetaRoad, aion2-guides). Ур. 12 — Grobs, aion2-guides; MetaRoad — 14–16.'
    },
    {
      skill: WHIRLWIND_SLICE,
      role: 'situational',
      note: 'В PvE-ротацию не входит (aion2-guides) — узлы досок и арканы не тратить. MetaRoad держит ур. 12. Топ: на панели у 96%, ур. 9,4.'
    },
    {
      skill: SHADOW_FALL,
      role: 'situational',
      note: 'Бьёт только оглушённую цель. В PvE — разве что поглощение 10% ОЗ в беде (aion2-guides, MetaRoad); GAMES.GG: «бесполезен в PvE». Топ: ур. 8,3 — ниже всех умений.'
    },

    {
      skill: REAR_SMITE,
      role: 'passive',
      level: 20,
      note: 'Увелич. урона с тыла и в PvE — первая или вторая пассивка у всех гайдов. Обет ускорения ур. 10 — ×1,5. MetaRoad — 21; топ: 16,7 — выше всех пассивок.'
    },
    {
      skill: EXPLOIT_WEAKNESS,
      role: 'passive',
      level: 20,
      note: 'Крит. удар (+290 на ур. 20), шанс +АТК и клоны при крите, которые ставят эмблемы. Иллюзорный двойник ур. 15 — ×1,5. Nellan97 ставит первой: в глобальной версии на шмоте мало АТК в процентах. MetaRoad — 21; топ: 16,1.'
    },
    {
      skill: ASSAULT_STANCE,
      role: 'passive',
      level: 20,
      note: 'Увелич. крит. урона (25% на ур. 20). Обет ускорения ур. 15 — ×1,5. Тройка главных пассивок — у всех гайдов. MetaRoad — 20; топ: 16,3.'
    },
    {
      skill: IMPACT_HIT,
      role: 'passive',
      level: 15,
      note: 'Попадание шок. эффектами и немного Сокрушающего удара. Grobs, Mobalytics, Skycoach — в первой четвёрке; Nellan97 и aion2-guides — «слабая в PvE». MetaRoad — 15; топ: 15,3.'
    },
    {
      skill: DETERMINATION,
      role: 'passive',
      level: 14,
      note: 'Доп. урон по цели с ОЗ ниже 30% (aLuckyRO — важна, Mobalytics — пятая). MetaRoad — 14; топ: 13,9.'
    },
    {
      skill: HEIGHTENED_SIXTH_SENSE,
      role: 'passive',
      note: 'УКЛ и ОЗ — выживание; после патча 28 октября даёт больше ОЗ (ExpCarry). Остатком очков: MetaRoad — 5, топ: 13,5.'
    },
    {
      skill: AMBUSH_STANCE,
      role: 'passive',
      note: 'Срабатывает от рывков. aion2-guides и MetaRoad — «только очками», GAMES.GG — не брать в PvE. Топ: 14,1.'
    },
    {
      skill: DEFENSE_BREAK,
      role: 'passive',
      note: '−12% ЗЩТ цели при Ошеломлении или шок. эффекте. Гайды расходятся: GAMES.GG качает до максимума, MetaRoad и aion2-guides пропускают. Топ: 12,4.'
    },
    { skill: REVITALIZATION_CONTRACT, role: 'passive', note: 'Лечит 35% ОЗ раз в минуту при ОЗ ниже 10% — остатком очков (MetaRoad — 5). Топ: 11.' },
    { skill: APPLY_POISON, role: 'passive', note: 'Для PvP (снижает лечение врага). В PvE не качать (aion2-guides, GAMES.GG, MetaRoad). Топ: 9,3.' },

    {
      skill: ILLUSIVE_CLONE,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Сердце сборки: на время действия снимает перезарядку Пронзания сердца и добавляет 20% урона. Действует 10 с, на ур. 20 — 20 с; перезарядка 60 с (до патча 28 октября — 90). Ур. 10 — +20% крит. урона, 15 — Выжидание момента ×1,5, 20 — шанс доп. урона при крите. 8 из 8 гайдов, ур. 20 — 5 из 5; топ: 95%, в среднем ур. 16,8.'
    },
    {
      skill: SWIFT_CONTRACT,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% скорости боя на 10 с, перезарядка 60 с. Ур. 10 — «Удар с тыла» ×1,5, 15 — Стойка нападения ×1,5, 20 — ещё +10% скорости боя. 8 из 8; ур. 20 — MetaRoad, GAMES.GG, aion2-guides, delcatta (сначала 15); топ: 95%, ур. 14,6.'
    },
    {
      skill: TRINIELS_DAGGER,
      role: 'stigma',
      equip: true,
      level: 10,
      note: 'С тыла +30% урона; на ур. 10 — −10% оставшейся перезарядки всех умений при попадании: жмите сразу после баффов, чтобы урезать и их (Grobs). 8 из 8, ур. 10 — все, кто называет уровень; топ: 87%, ур. 10,8.'
    },
    {
      skill: SAVAGE_FANG,
      role: 'stigma',
      equip: true,
      level: 15,
      note: 'Сразу 5 эмблем на 10 с — первый Взрыв эмблемы идёт с полным стаком; ур. 10 — +50 к шкале Ошеломления, 15 — +10% урона в PvE на 10 с. Перезарядка 60 с, как у Двойника и Обета. 7 из 8 (кроме GAMES.GG); ур. 15 — MetaRoad, aion2-guides, Vault; топ: 77%, ур. 9,3.'
    },
    {
      skill: EVASION_STANCE,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Гарантированное уклонение на миг; ур. 5 — второе применение. Вместо Клыка хищника, пока учите новую сложную экспедицию (MetaRoad) или пока Клык ниже ур. 15 (Nellan97). Топ: 47%, ур. 6,8; публичные билды: 37%.'
    },
    {
      skill: THROW_SHADOWBLADE,
      role: 'stigma',
      equip: false,
      level: 10,
      note: 'Бросок на 20 м; ур. 10 — сброс перезарядки при убийстве. Только для фарма (MetaRoad, ExpCarry, aion2-guides). Топ: 49%, ур. 4,8.'
    }
  ],

  stats: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Сводка 7 гайдов со статами: чаще всего называют АТК, скорость боя и крит. урон (7 из 7), крит, увелич. урона с тыла и урон оружия (по 6), меткость до порога (5), мульти-удар (4)'
    },
    {
      stat: S.critical,
      weight: 5,
      note: 'Пронзание сердца срабатывает только от крита, Выжидание момента — тоже. Но шанс упирается в 50%: после порога (~1 700 против Лудры) ценнее крит. урон и урон с тыла'
    },
    { stat: S.critDamageBoost, weight: 5 },
    {
      stat: S.backAttackDamageBoost,
      weight: 5,
      note: 'Убийца бьёт со спины: «Удар с тыла», Внезапное нападение и Кинжал Триниэля. Отдельный множитель — складывается с крит. уроном (GAMES.GG)'
    },
    { stat: S.weaponDamageBoost, weight: 5, note: 'Первая строка на кинжалах и наручах (MetaRoad, aion2-meta, Vault)' },
    { stat: S.combatSpeed, weight: 5, note: 'Nellan97: +10% скорости боя ≈ +5% урона (его оценка)' },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 4, note: 'В одной категории с увелич. урона — отдача падает (GAMES.GG)' },
    { stat: S.double, weight: 4, note: 'Шлем, наплечники, плащ (MetaRoad, aion2-meta, Vault)' },
    { stat: S.perfect, weight: 4 },
    { stat: S.multiHit, weight: 4 },
    { stat: S.attackIncrease, weight: 4 },
    { stat: S.backAttack, weight: 4 },
    { stat: S.backAttackCritical, weight: 4 },
    {
      stat: S.accuracy,
      weight: 4,
      note: 'Удары с тыла не проверяют блок и парирование (timesaver.gg) — меткость нужна на то время, когда вы не за спиной (до порога ≈800 Трансцендентность 4, ≈1 200 Лудра)'
    },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.might, weight: 4 },
    { stat: S.precision, weight: 4, note: 'Даёт крит и меткость (ExpCarry); строка оружия и украшений' },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.attackBonus, weight: 4 },
    { stat: S.cooldown, weight: 4, note: 'Окна урона завязаны на перезарядку стигм — 60 с' },
    { stat: S.bossDamageBoost, weight: 4 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.damageTolerance, weight: 3, note: 'Строка поножей у всех, кто расписывает шмот по слотам' },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hp, weight: 3, note: 'Защиты мало, ОЗ мало — «следите за выживанием» (Skycoach, ExpCarry)' },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.moveSpeed, weight: 3, note: 'Строка сапог (MetaRoad, aion2-meta, GAMES.GG)' },
    { stat: S.dexterity, weight: 2 },
    { stat: S.constitution, weight: 2 },
    { stat: S.mp, weight: 2 },
    { stat: S.evasionBonus, weight: 2, note: 'ExpCarry — для сложных подземелий, после атакующих' },
    { stat: S.incomingHeal, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.endurance, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.statusResist, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.block, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: HEART_GORE, weight: 5 },
      { skill: QUICK_SLICE, weight: 5 },
      { skill: INSIGNIA_EXPLOSION, weight: 5 },
      { skill: REAR_SMITE, weight: 5 },
      { skill: ASSAULT_STANCE, weight: 5 },
      { skill: EXPLOIT_WEAKNESS, weight: 5 },
      { skill: IMPACT_HIT, weight: 3 },
      { skill: SAVAGE_ROAR, weight: 3 },
      { skill: STORM_RAMPAGE, weight: 2 },
      { skill: AMBUSH, weight: 2 },
      { skill: DETERMINATION, weight: 2 },
      { skill: DEFENSE_BREAK, weight: 1 },
      { skill: SHADOWSTRIKE, weight: 1 }
    ],
    notes:
      'Что носят топ-убийцы: Серебряные кинжалы разъяренной Кромед (29%, в среднем +14,7), Блестящие кинжалы Короля мрачных драконов (15%, +15) или Кинжалы Аулламуса (14%); Наручи Нуакума (38%); броня Нуакума (59–61%); украшения разъяренной Кромед (54–60%); Благородный пояс (91%), Амулет откровения (90%), Руны столкновения (98%). Кинжалы +15 у 65%, наручи +15 у 53%, броня чаще +10. Строки: кинжалы и наручи — только статы (урон оружия, скорость боя, увелич. урона, Мощь, Точность); кольца — умения Пронзание сердца, Быстрый разрез, Взрыв эмблемы; броня и украшения — «Удар с тыла», Стойка нападения, Выжидание момента (MetaRoad, Vault, GAMES.GG). Конечная цель MetaRoad — крафтовые кинжалы Короля драконов: строки сохраняются при повышении ступени.'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням топ-убийц): АТК, крит, доп. меткость, ОЗ, ОМ, блок, ЗЩТ, сопр. криту, УКЛ; увелич. урона оружия — у 29%'
    },
    { stat: S.critical, weight: 5, note: 'Для Пронзания сердца (ExpCarry); MetaRoad — по одному камню крита на каждую вещь' },
    { stat: S.weaponDamageBoost, weight: 4, note: 'MetaRoad — второй после урона с тыла' },
    {
      stat: S.backAttackDamageBoost,
      weight: 4,
      note: 'MetaRoad — первым на готовые вещи, aion2-guides — по корейской выборке. У топ-убийц глобальной версии таких камней не видно — возможно, их здесь нет'
    },
    { stat: S.accuracyBonus, weight: 4, note: 'Если удары не проходят (ExpCarry)' },
    { stat: S.critDamageBoost, weight: 3, note: 'MetaRoad советует, ExpCarry — «редкий»; у топ-убийц не видно' },
    { stat: S.damageBoost, weight: 3, note: 'ExpCarry: «редкий, ценный»' },
    { stat: S.hp, weight: 3 },
    { stat: S.evasionBonus, weight: 2 },
    { stat: S.mp, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [HEART_GORE, QUICK_SLICE, INSIGNIA_EXPLOSION, STORM_RAMPAGE, AMBUSH, SAVAGE_ROAR, SHADOWSTRIKE, DEFIANCE, FLASH_SLICE, INFILTRATE],
    passive: [
      REAR_SMITE,
      EXPLOIT_WEAKNESS,
      ASSAULT_STANCE,
      IMPACT_HIT,
      DETERMINATION,
      AMBUSH_STANCE,
      HEIGHTENED_SIXTH_SENSE,
      DEFENSE_BREAK,
      REVITALIZATION_CONTRACT
    ],
    useless: [WHIRLWIND_SLICE, SHADOW_FALL, APPLY_POISON],
    preferredSet: 'vigor',
    notes:
      'Топ-убийцы: Грааль «жизни» (62%), Пергамент «жизни» (43%), Компас «жизни» (38%), Зеркало «жизни» (41%), Колокол «магии» (44%) — ровно так советует aion2-guides: четыре «жизни» (2 карты — +60, 4 — +150 АТК в PvE, пока ОЗ от 70%) и Колокол «магии» ради Разрушения (АТК). MetaRoad берёт «магии» Компас и Зеркало (без бонуса сета), часть авторов Vault — все пять «жизни». Главное на картах — умения: Пергамент — Пронзание сердца, Быстрый разрез, Взрыв эмблемы (все гайды); Компас — Неистовый шквал, Внезапное нападение, Рев зверя; Колокол — Стойка нападения; Зеркало — «Удар с тыла» и Выжидание момента; Грааль — то главное умение, которому не хватает до 20.'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Пронзанию сердца, Взрыву эмблемы и Быстрому разрезу на каждой из четырёх досок. Эти узлы берут 97–98% топ-игроков — с них начинают все гайды (Mobalytics — с Пронзания сердца и Взрыва эмблемы).',
        skills: [HEART_GORE, INSIGNIA_EXPLOSION, QUICK_SLICE],
        boards: [41, 42, 43, 44]
      },
      {
        id: 'support-skills',
        name: 'Неистовый шквал, Внезапное нападение, Рев зверя',
        description: 'Следом — +1 к Неистовому шквалу и Внезапному нападению (aion2-guides: все пять умений по +4; MetaRoad) и к Реву зверя (MetaRoad, Vault).',
        skills: [STORM_RAMPAGE, AMBUSH, SAVAGE_ROAR],
        boards: [41, 42, 43, 44]
      },
      {
        id: 'damage-passives',
        name: '«Удар с тыла», Выжидание момента, Стойка нападения',
        description: 'Пассивки урона: на Неджакане — по два узла каждой, затем Попадание шоком (два узла на Джикеле) — MetaRoad, Vault, GamerBlurb.',
        skills: [REAR_SMITE, EXPLOIT_WEAKNESS, ASSAULT_STANCE, IMPACT_HIT],
        boards: [41, 42, 43, 44]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: скорость боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль). Стойкость к крит. урону и сопротивление мульти-удару — пропустить (MetaRoad).',
        boards: [41, 42, 43, 44],
        nodes: [410033, 410193, 410043, 410183, 420043, 420183, 420033, 420193, 430033, 430193, 440023, 440197, 440209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — со сложных экспедиций: ExpCarry, aion2-guides): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Узлы — как в сводном гайде стража (оценка помощника: гайды убийц раскладки по Ариэль не дают). У топ-убийц доска пока пустая. Асфель — только PvP.',
        boards: [45],
        nodes: [450001, 450008, 450218, 450225, 450032, 450074, 450152, 450194, 450028, 450081, 450145, 450198]
      }
    ],
    notes:
      'Не тратить очки на узлы ОМ, Нанесения яда, Бреши в защите, сопротивления мульти-удару и стойкости к крит. урону (MetaRoad, aion2-guides), Броска тени и Удара торнадо (в PvE-ротацию не входят — aion2-guides, GAMES.GG), если очки не лишние. Доски не рассчитаны на полное заполнение (Mobalytics); перед дальним узлом проверьте стоимость пути.'
  },

  genus: {
    stats: [
      { stat: S.maxAttack, weight: 5, note: 'MetaRoad: ячейки 1 и 5 — макс. АТК, затем доп. АТК; качать род до ур. 10 перед запиранием' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.critDamageBoost, weight: 5 },
      { stat: S.weaponDamageBoost, weight: 5 },
      { stat: S.backAttackDamageBoost, weight: 5, note: 'Ячейка 4 Мутантов — урон с тыла (MetaRoad)' },
      { stat: S.double, weight: 5, note: 'GAMES.GG: ячейки 3 и 9 — Сокрушающий удар от 2%; MetaRoad — ячейка 4 Особого рода' },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.backAttackCritical, weight: 5, note: 'MetaRoad: ячейки 3 и 9 — крит. удар с тыла' },
      { stat: S.perfect, weight: 4 },
      { stat: S.damageBoost, weight: 4 },
      { stat: S.backAttack, weight: 4 },
      { stat: S.pveAttack, weight: 4 },
      { stat: S.bossAttack, weight: 4 },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad)' },
      { stat: S.damageTolerance, weight: 4, note: 'Ячейка 7 — стойкость к урону (MetaRoad)' },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.accuracyBonus, weight: 4, note: 'Ячейка 6 — меткость, а когда её хватает — крит (MetaRoad)' },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.critical, weight: 4 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.hp, weight: 3 },
      { stat: S.endurance, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.powerShardDamage, weight: 2 },
      { stat: S.mp, weight: 2 },
      { stat: S.block, weight: 1 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Запирайте только уникальные значения у верха диапазона и не раньше ур. 9–10 рода (MetaRoad, GAMES.GG). Ячейка 4 у каждого рода — свой урон: Разум — крит. урон, Дикие — урон оружия, Природа — Совершенный удар, Мутанты — урон с тыла, Особый — Сокрушающий удар. Порядок MetaRoad: ячейка 4, затем 7, затем 2 и 8; Особый род и Мутантов — первыми. Урон спереди убийце не нужен.'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.dominatorOfDimensions, T.ruleAllCreation],
    utility: [T.throughHellAndBack, T.emptyCloset, T.journeysPath],
    notes:
      'Что носят топ-убийцы: атака — Unbound by Genus (55% в сумме двух версий), затем Защитник Альтгарда (5,9%; для Элийцев — Защитник Бертрона); защита — Святой Альтгарда / Бертрона (75%), Rule All Creation (12%); другое — Прошедший огонь и воду (52%, сокращение перезарядки). MetaRoad для защиты советует Dominator of Dimensions (стойкость в PvE), для «другого» — Empty Closet (скорость боя и перезарядка). Титул «Playing God» из MetaRoad в справочнике глобальной версии не находится. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель.'
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
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов. Порог — блок и парирование босса, от класса не зависит. Удары с тыла эту проверку пропускают (timesaver.gg), поэтому убийце со спины меткость почти не нужна — но за спиной вы 60–80% боя (MetaRoad, aion2-guides). Один убийца с ~1 500 советует «1 400 с бафами» для сложного режима — не проверено. Цифры — отчёты игроков глобальной версии (8.11.2026), официальных нет.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [{ value: 1700, label: 'предел 50% шанса против Лудры' }],
      raise: [S.critical, S.precision],
      note: 'Пронзание сердца срабатывает только от крита, поэтому убийце крит нужнее, чем другим, — но шанс в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Быстрый разрез с вариантом 5 критует всегда. GAMES.GG пишет «1 300 — около 50%» — это ранний гайд под корейский предел, к глобальной версии не подходит.'
    },
    ...(
      [
        [S.might, 'Мощь', 53],
        [S.dexterity, 'Ловкость', 29.8],
        [S.precision, 'Точность', 29.3],
        [S.constitution, 'Здоровье', 20.2],
        [6, 'Воля', 10.5]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-убийц' }],
      note: 'Средний уровень у 1 280 топ-убийц глобальной версии (metabot.gg, данные на 8.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 61.9],
        [7, '[Неджакан] Справедливость', 51.4],
        [14, '[Триниэль] Смерть', 45.9],
        [8, '[Байзел] Свобода', 42.3],
        [13, '[Джикел] Разрушение', 41.9],
        [10, '[Юстиэль] Жизнь', 34.1],
        [17, '[Израфель] Пространство', 33.5],
        [9, '[Кайсинель] Видение', 33.3],
        [15, '[Румиэль] Мудрость', 30.9],
        [16, '[Маркутан] Судьба', 27.6]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-убийц' }],
      note: 'Стат бога: средний у 1 280 топ-убийц глобальной версии (metabot.gg, данные на 8.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'Перед боем включите индикатор ориентации босса и выберите «Спина» (настройки отображения боя) — так видно, где у босса тыл (Mobalytics, Skycoach, Vault). Попросите танка развернуть босса от вас (MetaRoad).',
    'Окно урона — раз в минуту: Обет ускорения и Иллюзорный двойник (перезарядка обоих 60 с), Удар из сумрака — за спину и +20% крит. урона, Клык хищника — сразу 5 эмблем, Кинжал Триниэля — урезает оставшуюся перезарядку всех умений, баффов тоже.',
    'Дальше держите связку и Быстрый разрез: Взрыв эмблемы — по откату на полном стаке, Пронзание сердца — после каждого крита. Под Двойником у него нет перезарядки, но крит всё равно нужен: Быстрый разрез с вариантом 5 критует всегда и запускает его.',
    'Между окнами — то же без баффов: Быстрый разрез восполняет ОМ и сокращает перезарядку Взрыва эмблемы, Рев зверя и Внезапное нападение копят эмблемы. Не взрывайте одну эмблему — урон растёт со стаком (Skycoach).',
    'Неистовый шквал — только по ошеломлённому боссу и лучше, когда стигмы на откате: с вариантом 5 каждый удар снимает 1 с со всех перезарядок, и окно урона вернётся раньше (Grobs, Skycoach).',
    'Не открывайте окно перед неуязвимостью босса или его прыжком — Двойник сгорит впустую (ExpCarry, Skycoach, GAMES.GG). Если окно вот-вот закроется — придержите Двойник.',
    'Потеряли спину — Удар из сумрака, Вторжение (после уклонения или в полёте) или Ослепляющий разрез (переносит на противоположную сторону — проверьте, где стоите). Снятие шока — когда оглушили.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'damage',
        name: 'Ячейка урона',
        skills: [INSIGNIA_EXPLOSION, HEART_GORE, AMBUSH, SAVAGE_ROAR],
        note: 'Ряд 0 — Взрыв эмблемы: вылетает, как только готов (Mobalytics, aion2-guides; в публичных связках 351 из 379 ставят его первым или сразу после Клыка хищника). Ряд 1 — Пронзание сердца: срабатывает после каждого крита и перебивает всё, что ниже. Ряд 2 — Внезапное нападение (Mobalytics, aion2-guides, MetaRoad; Mobalytics: без него ряд можно оставить пустым). Ряд 3 — Рев зверя, заполнитель: 420 из 433 связок с ним ставят его последним (Vault). Одна ячейка — так у Mobalytics, aion2-guides и в 52% публичных связок. Grobs и Skycoach ставят в ряд 0 Клык хищника (тогда без Внезапного нападения) — здесь он вручную, вместе с баффами: с 28 октября у них общая минута перезарядки.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс — у aion2-guides и delcatta и почти у всех публичных связок убийц, где задержка задана (173 шага из 177; Vault). При пинге 80–100 мс delcatta советует проверить 20–40 мс на манекене. Неистовый шквал в связку не ставьте: во время Ошеломления он всегда готов и перебивает Взрыв эмблемы (Nellan97 проверял на манекене).',
    manual: [
      {
        skill: QUICK_SLICE,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой (Mobalytics, aion2-guides, Grobs, Skycoach): ОМ за каждый удар, −1 с Взрыва эмблемы, а с вариантом 5 — гарантированный крит, который запускает Пронзание сердца. Вне связки — в 92% публичных связок.'
      },
      { skill: SWIFT_CONTRACT, key: '6', when: 'Окно урона: вместе с Иллюзорным двойником, когда босс точно будет доступен 10–20 с.' },
      {
        skill: ILLUSIVE_CLONE,
        key: '5',
        when: 'Окно урона — раз в минуту. Не перед неуязвимостью или прыжком босса. Под ним Пронзание сердца без перезарядки — держите связку и Быстрый разрез.'
      },
      {
        skill: SHADOWSTRIKE,
        key: '2',
        when: 'Прямо перед окном урона: за спину и +20% крит. урона на 10 с. Дальше — чтобы вернуться за спину (Рев зверя с вариантом 4 сокращает его перезарядку).'
      },
      {
        skill: SAVAGE_FANG,
        key: '7',
        when: 'Сразу после баффов: 5 эмблем — первый Взрыв эмблемы идёт на полном стаке; заодно сильно бьёт по шкале Ошеломления.'
      },
      { skill: TRINIELS_DAGGER, key: '8', when: 'Сразу после баффов и со спины: −10% оставшейся перезарядки всех умений (ур. 10), Двойника и Обета тоже.' },
      {
        skill: STORM_RAMPAGE,
        key: '3',
        when: 'Только по ошеломлённому боссу, вперемешку с Быстрым разрезом. Лучше, когда стигмы на откате: −1 с со всех перезарядок за удар (Grobs, Skycoach).'
      },
      { skill: FLASH_SLICE, key: '4', when: 'Запасной путь за спину, когда Удар из сумрака на откате. Переносит на противоположную сторону цели.' },
      { skill: INFILTRATE, key: 'Q', when: 'После уклонения или в полёте — рывок за спину.' },
      { skill: DEFIANCE, key: 'E', when: 'Когда оглушили, опрокинули или напугали.' },
      { skill: EVASION_STANCE, optional: true, when: 'Под удар босса, от которого иначе не уйти (если стоит вместо Клыка хищника).' },
      { skill: THROW_SHADOWBLADE, optional: true, when: 'Фарм: по отбившимся целям; на ур. 10 перезарядка сбрасывается при убийстве.' }
    ],
    opener: [
      { skill: SWIFT_CONTRACT, note: 'босс доступен' },
      { skill: ILLUSIVE_CLONE, note: 'Пронзание сердца без перезарядки' },
      { skill: SHADOWSTRIKE, note: 'за спину, +20% крит. урона' },
      { skill: SAVAGE_FANG, note: '5 эмблем' },
      { skill: TRINIELS_DAGGER, note: '−10% перезарядки всех умений' },
      { skill: INSIGNIA_EXPLOSION, note: 'на полном стаке' },
      { skill: HEART_GORE, note: 'после каждого крита' }
    ],
    openerNote:
      'Порядок Mobalytics, MetaRoad и XifanGG (баффы → Удар из сумрака → Клык хищника → Кинжал Триниэля → связка). Skycoach и Grobs жмут Кинжал Триниэля до Клыка хищника — разница небольшая; MetaRoad сначала встаёт за спину, потом баффы. Дальше — связка с Быстрым разрезом и ручные умения по откату.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так советуют Mobalytics, aion2-guides, Grobs и Skycoach), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Быстрый разрез. XifanGG так и играет: Быстрый разрез — макросом мыши, резерв умений включён. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для убийцы отдельно не проверялось). ПКМ на миг отпускается в конце прогона — в ячейке всегда есть готовый Рев зверя, так что связка не простаивает.'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка MetaRoad). Включите в настройках резерв умений (Skill Queue), чтобы нажатия во время анимации не терялись (XifanGG, delcatta). Баффы, Удар из сумрака, Ослепляющий разрез и Вторжение — вне связки почти у всех (89–98% публичных связок; Vault): их время решаете вы.'
  },

  tips: [
    {
      title: 'Связка: одна ячейка',
      text: 'Взрыв эмблемы (ряд 0), Пронзание сердца, Внезапное нападение, Рев зверя (ряд 3) — на ПКМ, задержка 10 мс. Быстрый разрез на ЛКМ — держать обе кнопки или одну боковую с макросом мыши. Обет ускорения, Иллюзорный двойник, Клык хищника, Кинжал Триниэля, Удар из сумрака и Неистовый шквал — вручную. Подробно — на странице «Ротация».'
    },
    {
      title: 'Пронзание сердца — от крита',
      text: 'Оно срабатывает только после крит. удара. Вариант 5 (ур. 16) сбрасывает его перезарядку при крите, Иллюзорный двойник снимает её на 10–20 с — но крит нужен всё равно (ExpCarry, GamerBlurb). Отсюда всё остальное: крит до предела, Быстрый разрез с вариантом 5 (всегда крит), Выжидание момента. Пока у Пронзания сердца нет ур. 16 — урон заметно ниже, это нормально (Mobalytics, Skycoach, ExpCarry).'
    },
    {
      title: 'Только со спины',
      text: '«Удар с тыла» усиливает урон с тыла, Внезапное нападение и Кинжал Триниэля бьют с тыла на 30% сильнее, а удары с тыла не проверяют блок и парирование. Nellan97 добивается 85–90% урона с тыла; на манекене это 100%, в реальном бою — 60–80% (aion2-guides, MetaRoad). Удар из сумрака и Вторжение ставят за спину, Ослепляющий разрез — на противоположную сторону.'
    },
    {
      title: 'Окно урона раз в минуту',
      text: 'С патча 28 октября у Иллюзорного двойника, Обета ускорения и Клыка хищника одна и та же перезарядка — 60 с, жмите их вместе (aion2-guides). Кинжал Триниэля — сразу после, чтобы урезать перезарядку и им. Неистовый шквал по ошеломлённому боссу снимает по 1 с со всех перезарядок за удар — это 1–2 лишних окна за бой (Nellan97).'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Четвёртая стигма: Клык хищника (7 из 8 гайдов, у топ-игроков 77%) или Стойка уклонения (47%; MetaRoad — на новую сложную экспедицию, Nellan97 — пока Клык ниже ур. 15). Второй вариант Пронзания сердца: мульти-удар (большинство) или +20% крита (Grobs). Взрыв эмблемы: сохранить 2 эмблемы (5 гайдов) или мульти-удар (75% публичных билдов). Клык хищника: в связку (Grobs, Skycoach) или вручную с баффами (MetaRoad, Mobalytics, aion2-guides). Брешь в защите: качать (GAMES.GG) или нет (MetaRoad, aion2-guides).'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Talisra (−4% перезарядки) — цель (MetaRoad, aion2-guides). Пантеон: MetaRoad советует Смерть (крит), Мудрость (Сокрушающий удар), Разрушение (АТК) и Видение (перезарядка), GAMES.GG особенно выделяет Видение. У топ-убийц больше всего Времени и Справедливости, а Мудрости — одна из самых низких.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить связку: одна ячейка — Взрыв эмблемы, Пронзание сердца, Внезапное нападение, Рев зверя; на ПКМ, задержка 10 мс' },
    { id: 'binds', text: 'Быстрый разрез — на ЛКМ (держать вместе со связкой); стигмы и Удар из сумрака — на отдельных клавишах' },
    { id: 'stigmas', text: 'Стигмы: Иллюзорный двойник, Обет ускорения, Кинжал Триниэля, Клык хищника' },
    { id: 'breakpoint', text: 'Пронзание сердца — ур. 16 и специализация 5 (сброс при крите): с этого начинается урон' },
    { id: 'orientation', text: 'Включить индикатор ориентации босса — «Спина»' },
    { id: 'weapon15', text: 'Кинжалы — заточка +15 (так у большинства топ-убийц)' },
    { id: 'arcana-vigor', text: 'Арканы: Грааль, Пергамент, Компас и Зеркало «жизни», Колокол «магии»' }
  ]
}
