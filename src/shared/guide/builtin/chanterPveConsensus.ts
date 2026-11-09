// Встроенный гайд: Чародей, PvE — сводный. Собран из 7 гайдов для глобальной версии и статистики
// 1 785 топ-чародеев глобальных серверов (metabot.gg, 9 ноября 2026). Разбор источников, таблицы
// согласия и что взято откуда — docs/research/chanter-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков;
// «публичные билды / связки: X%» — подсчёт AION2 Vault по публичным билдам чародеев (2.11.2026).

import type { Guide } from '../types'

// Умения чародея (ID игры)
const ONSLAUGHT = 18010000
const INCANDESCENT_BLOW = 18040000
const IMPACTFUL_CRUSH = 18060000
const WAVE_BLOW = 18080000
const RUSHING_SMASH = 18090000
const DARK_CRUSH = 18100000
const RECUPERATION = 18120000
const HEAT_WAVE_BLOW = 18150000
const DEFIANCE = 18200000
const TREMOR_CRUSH = 18210000
const SPINNING_STRIKE = 18290000
const GUST_RAMPAGE = 18300000
const BLESSING_OF_LIFE = 18710000
const CROSSGUARD = 18720000
const PROTECTION_CIRCLE = 18730000
const INSPIRING_SPELL = 18740000
const ATTACK_PREPARATION = 18750000
const IMPACT_HIT = 18760000
const RAGING_SPELL = 18770000
const EARTHS_PROMISE = 18780000
const WINDS_PROMISE = 18800000
const UNDEFEATED_MANTRA = 18190000
const POWER_OF_THE_STORM = 18250000
const SPRINT_MANTRA = 18160000
const MARCHUTANS_WRATH = 18330000
const GUARDIAN_BLESSING = 18420000
const FOCUSED_DEFENSE = 18140000
const OBLITERATE = 18220000
const FRACTURING_BLOW = 18130000
const IMPEDING_AUTHORITY = 18240000
const HEALING_TOUCH = 18170000

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
  guardianOfAltgard: 22030002,
  guardianOfVerteron: 12030002,
  saintOfAltgard: 22030003,
  saintOfVerteron: 12030003,
  ruleAllCreation: 13010025,
  dominatorOfDimensions: 13050011,
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  encounteringZikelsCore: 23010010
} as const

export const chanterPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-chanter-pve-consensus',
  name: 'Чародей PvE — сводный (7 гайдов + топ-игроки)',
  cls: 'chanter',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся семь гайдов для глобальной версии и что реально носят 1 785 топ-чародеев глобальных серверов. Чародей в PvE — боец поддержки с посохом: держит группе мантры (Песнь непобедимости — урон и стойкость к урону в PvE, Заклятие ускорения), в окно урона даёт Повелителя бурь, лечит Заклинанием выздоровления, но главное — бьёт сам. Урон — окна Удара скалы: его можно применить только 2 с после Удара с вращением или Дробящего удара и 3 с после Ярости Маркутана, а с ур. 16 он теряет перезарядку и идёт в каждом окне подряд. Цель: Удар скалы — ур. 20; Разгром, Удар с вращением, Раскаленный удар и Заклинание выздоровления — 16; Песнь непобедимости — 20. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 7 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-чародеи (1 785 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/chanter/build',
      date: '2026-11-09',
      region: 'global',
      kind: 'data',
      note: 'Статы и титулы — по 1 785 игрокам, умения, стигмы и шмот — по 1 641, доски — по 1 774, камни — по 534. Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'AION 2 Global Guides — Chanter (Arthars Gaming, notXeon, WallyJTV, Grobs)',
      url: 'https://aion2-guides.info/en/chanter/',
      date: '2026-11-08',
      region: 'global',
      note: 'Бывший couga54.github.io/aion2-guides (версия от 7–10.10 там больше не обновляется). Самый подробный по специализациям, связке и арканам; гайд Arthars Gaming снят на тайваньском клиенте к глобальному запуску.'
    },
    {
      title: 'AION2 Vault — Chanter PvE Build',
      url: 'https://aion2vault.com/builds/chanter/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка авторов (Grobs, WallyJTV, notXeon, aLuckyRO, mourasb) и подсчёт наборов стигм в 374 публичных билдах. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Chanter Macro',
      url: 'https://aion2vault.com/builds/chanter/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки авторов и подсчёт 371 публичной связки: порядок, задержка, что держат вне связки.'
    },
    {
      title: 'AION2 Vault — Chanter Gear',
      url: 'https://aion2vault.com/builds/chanter/gear/',
      date: '2026-10-28',
      region: 'global',
      note: 'Строки на шмоте (mourasb), камни, арканы «жизни» и «магии» по 403 одетым чародеям.'
    },
    {
      title: 'AION2 Vault — Cleric PvE Build (чародей и целитель в одной группе)',
      url: 'https://aion2vault.com/builds/cleric/pve/',
      date: '2026-11-02',
      region: 'global',
      note: 'Взято только про совместную игру: Повелитель бурь и бафф Возмездия природы вместе не ложатся — чародею включать первым; Свет спасения не складывается с Песнью непобедимости.'
    },
    {
      title: 'ExpCarry — AION 2 Chanter Build Guide',
      url: 'https://expcarry.com/aion-2-chanter-guide',
      author: 'ExpCarry Editorial Team',
      date: '2026-10-29',
      region: 'global',
      note: 'Глобальная версия по обновление 28 октября; шмот — по выборке 200 профилей чародеев от 28.10. Подробно о мантрах и о том, что не складывается с целителем.'
    },
    {
      title: 'AION 2 Tier List — Chanter PvE Build',
      url: 'https://aion2tierlist.com/guides/aion-2-chanter-pve-build',
      date: '2026-10-30',
      region: 'global',
      note: 'Пересказ видео Rank 1 чародея глобальной версии (имя автора на странице не указано): уровни 20, стигмы, связка «держать обе кнопки». Опыт одного игрока.'
    },
    {
      title: 'GAMES.GG — Aion 2 Chanter Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-chanter-guide/',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, первые дни сезона: эффекты мантр и стигм, наборы стигм, ротация.'
    },
    {
      title: 'GamerBlurb — Chanter Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-chanter-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Без чисел; специализации и стигмы — словами, сверены со справочником.'
    },
    {
      title: 'Roonby — AION 2 Chanter PvE Guide',
      url: 'https://roonby.com/2026/10/07/aion-2-chanter-pve-guide-best-build-skills-macro-and-rotation/amp/',
      author: 'Jay',
      date: '2026-10-07',
      region: 'mixed',
      note: 'Версия игры не указана; уровни 16 после 45-го и связка «середины игры».'
    },
    {
      title: 'Timesaver — сколько меткости и крита нужно (отчёты игроков)',
      url: 'https://timesaver.gg/blog/aion-2-accuracy-cap',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Пороги меткости и крита для Трансцендентности и Лудры — по отчётам игроков; официальных цифр нет.'
    }
  ],
  updatedAt: '2026-11-09T00:00:00.000Z',

  skills: [
    {
      skill: DARK_CRUSH,
      role: 'core',
      level: 20,
      specs: [5, 4, 3],
      note: 'Главный урон: с комбинацией «Дробящее пробитие» (Piercing Strike) — около 40% всего урона (замер Arthars Gaming). Применяется только в окне после Удара с вращением, Дробящего удара или Ярости Маркутана. Вариант 5 (ур. 16) снимает перезарядку — 7 из 7; вариант 4 — комбинация «Дробящее пробитие», вариант 3 — крит при попадании (по 6 из 6). На ур. 16–19 слотов два: берут 5 и 4, а крит возвращают третьим на ур. 20 (aion2-guides, WallyJTV, ExpCarry). Ур. 20 — 3 гайда (сначала 16 — все); топ: ур. 17,2 — выше всех умений.'
    },
    {
      skill: ONSLAUGHT,
      role: 'core',
      level: 16,
      specs: [4, 5, 3],
      note: 'Базовая атака на ЛКМ: +100 ОМ за удар. Вариант 4 — −1 с перезарядки Удара с вращением за попадание (7 из 7), вариант 5 (ур. 16) — комбинация «Ураганное дробление» (Storm Chain) (6 из 6), третьим на ур. 20 — +50% мульти-удара (aion2-guides, GamerBlurb). Не хватает ОМ — вместо мульти-удара +20% восполнения ОМ (вариант 1; aion2-guides, aLuckyRO). Ур. 16 — 3 гайда, 20 — aion2-guides (после 16) и Rank 1 из aion2tierlist; топ: 15,7.'
    },
    {
      skill: SPINNING_STRIKE,
      role: 'core',
      level: 16,
      specs: [5, 1, 3],
      note: 'Открывает окно Удара скалы на 2 с и копит усиление крит. урона. −5 с перезарядки (вариант 1) — 7 из 7, на ур. 16 — игнор блока и уклонения и всегда крит (вариант 5) — 6 из 6, +20% по малому числу целей (вариант 3) — 4 гайда. На ур. 16–19 большинство оставляет −5 с (aion2-guides), Grobs у Vault — +20%. Шанс печати (ExpCarry) и усиление лечения — не брать. Ур. 16 — 3 гайда, 20 — aion2-guides и aion2tierlist; топ: 15,5.'
    },
    {
      skill: INCANDESCENT_BLOW,
      role: 'core',
      level: 16,
      specs: [5, 3, 1],
      note: 'Заполнитель — последний ряд ячейки связки. +12% по малому числу целей (вариант 3; aion2-guides, Vault, Roonby), на ур. 16 — игнор блока и уклонения и мульти-удар (вариант 5; aion2-guides, ExpCarry). Пока мало ОМ — −20% расхода ОМ (вариант 1; aion2-guides, aLuckyRO, GAMES.GG). Vault и WallyJTV берут +200 блока (вариант 2). Третий вариант на ур. 20 гайды не называют — здесь ОМ, оценка помощника. Ур. 16 — aion2-guides, aion2tierlist, ExpCarry («если хватает ресурсов»), Vault — 12; топ: 15,4.'
    },
    {
      skill: RECUPERATION,
      role: 'support',
      level: 16,
      specs: [1, 5, 4],
      note: 'Лечение группы и снятие дебаффа — всегда вручную (вне связки у 368 из 368 публичных билдов). +1 применение подряд (вариант 1) — 5 из 5, на ур. 16 — −3 с перезарядки (вариант 5) — 5 гайдов, +5% ОЗ (вариант 4) — 4. В подземельях с дебаффами — снять до 2 дебаффов (вариант 2; GamerBlurb, ExpCarry). Ур. 16 — Vault (Grobs), ExpCarry, Roonby; aion2-guides — 12; топ: 14,6.'
    },
    {
      skill: IMPACTFUL_CRUSH,
      role: 'support',
      level: 12,
      specs: [4, 3, 1],
      note: 'Второе окно Удара скалы (2 с) и оглушение. +30% скорости умения (вариант 4) — 5 гайдов, применение в движении (вариант 3) — 4: «держите в движении, иначе ротация ломается» (Rank 1 из aion2tierlist). По области (вариант 1) — WallyJTV, GamerBlurb, для фарма. Ур. 12 — aion2-guides, ExpCarry (Vault, GAMES.GG, Roonby — 8); топ: 14,2.'
    },
    {
      skill: RUSHING_SMASH,
      role: 'support',
      level: 12,
      specs: [4, 3],
      note: 'Сближение с целью. Сброс перезарядки при убийстве (вариант 4) — 4 из 4, удобно в фарме; вторым — шанс Теплового удара (WallyJTV). Заряжаемый вариант 2 не брать (aion2-guides). Вне связки у 95% публичных билдов. Ур. 12 — 4 гайда; топ: 13,8.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [5, 4, 3],
      note: 'Снимает оглушение, опрокидывание, страх и др. +2 с Непреклонности (вариант 4) и на ур. 16 — +50% стойкости к урону в PvE на время Непреклонности (вариант 5) — aion2-guides, ExpCarry; они ведут умение к 16. Вариант 3 (+10% ОЗ) — оценка помощника. В данных топа умения нет.'
    },
    {
      skill: WAVE_BLOW,
      role: 'situational',
      level: 12,
      specs: [4],
      note: 'Вариант 4 — −15% увелич. урона в PvE у цели на 10 с: босс бьёт слабее (aion2-guides, ExpCarry — ур. 12). GAMES.GG и aion2tierlist в PvE не качают. Топ: на панели у 92%, ур. 9,6.'
    },
    {
      skill: TREMOR_CRUSH,
      role: 'situational',
      specs: [2, 3],
      note: 'Дальний удар — притянуть или оглушить. +10 м дальности (Vault, Roonby), мульти-удар (aion2tierlist). Узлы досок и арканы не тратить. Топ: 99%, ур. 11,8.'
    },
    {
      skill: HEAT_WAVE_BLOW,
      role: 'situational',
      note: 'В PvE сезона 1 не стоит очков (aion2-guides, aion2tierlist). Топ: 95%, ур. 10,4.'
    },
    {
      skill: GUST_RAMPAGE,
      role: 'situational',
      note: 'Только по оглушённому боссу; на ур. 16 каждое попадание −1 с всех перезарядок (WallyJTV, ExpCarry). aion2-guides и aion2tierlist в PvE не качают. Топ: 81%, ур. 8,6.'
    },

    {
      skill: ATTACK_PREPARATION,
      role: 'passive',
      level: 20,
      note: 'Первая пассивка у всех гайдов: +5,5% увелич. урона в PvE, меткость и ЗЩТ. Узел +1 на Неджакане берут 97% топ-игроков. Топ: ур. 16,4 — выше всех пассивок.'
    },
    {
      skill: WINDS_PROMISE,
      role: 'passive',
      level: 20,
      note: 'Вторая у всех гайдов: увелич. крит. урона и 50% шанс доп. урона при крите — Удар скалы и Удар с вращением критуют всегда. Благословение хранителя ур. 15 усиливает её в 1,5 раза. Топ: 16,2.'
    },
    {
      skill: INSPIRING_SPELL,
      role: 'passive',
      level: 16,
      note: 'Крит и Совершенный удар; «качать до максимума» — aion2-guides, notXeon, GAMES.GG. Топ: 15,1.'
    },
    {
      skill: IMPACT_HIT,
      role: 'passive',
      level: 16,
      note: 'Попадание шок. эффектами и Сокрушающий удар — третья у Grobs и Rank 1 (aion2tierlist). Топ: 15,1.'
    },
    {
      skill: EARTHS_PROMISE,
      role: 'passive',
      level: 14,
      note: 'Снижает стойкость цели к урону в PvE на 5 с за удар. С целителем не складывается с его Цепью боли (ExpCarry, GAMES.GG) — поэтому у aion2-guides она пятая. Топ: 14,4.'
    },
    {
      skill: BLESSING_OF_LIFE,
      role: 'passive',
      level: 14,
      note: 'ОЗ и усиление лечения от АТК — лечение чародея растёт от атаки (GAMES.GG). aion2-guides — только очками умений, без узлов и аркан. Топ: 14,7.'
    },
    {
      skill: PROTECTION_CIRCLE,
      role: 'passive',
      level: 14,
      note: 'Заряд за каждый удар, на 10 зарядах — барьер вам и группе на 10 с: работает, пока вы бьёте (GamerBlurb, Roonby). Следующая после атакующих у aion2-guides. Топ: 13,2.'
    },
    { skill: RAGING_SPELL, role: 'passive', note: 'Доп. урон по оглушённым целям — «не стоит очков» (aion2-guides, notXeon). Топ: 10,7.' },
    { skill: CROSSGUARD, role: 'passive', note: 'Защитная, в PvE не качать (aion2-guides, notXeon, aLuckyRO). Топ: 8,1.' },

    {
      skill: UNDEFEATED_MANTRA,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Мантра-переключатель: +10,5% увелич. урона и стойкости к урону в PvE вам и группе (ExpCarry). Ур. 5 — крит, 10 — меткость, 15 — крит. урон, 20 — Сокрушающий удар. Первая стигма у 7 из 7, к ур. 20 — 5 гайдов; топ: 98%, ур. 17. Включить до боя и не ставить в связку — она её выключит. Со Светом спасения целителя не складывается: работает старший уровень, при равных — Песнь.'
    },
    {
      skill: POWER_OF_THE_STORM,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% СКР боя и сокращение перезарядки вам (20%) и группе (10%) на время действия (ExpCarry). Сначала ур. 5 — −30 с перезарядки (5 гайдов), дальше 10 — меткость, 15 — крит, 20 — АТК вам и группе (Grobs, notXeon). 7 из 7; топ: 87%, ур. 12,9. Пока на игроке бафф Возмездия природы целителя, Повелитель бурь на него не ложится.'
    },
    {
      skill: SPRINT_MANTRA,
      role: 'stigma',
      equip: true,
      level: 10,
      note: 'Мантра-переключатель: скорость движения и шанс восполнить ОЗ при атаке. Ур. 5 — получаемое исцеление, 10 — восстановление ОД (ExpCarry, aion2-guides). В основном наборе у ExpCarry, Roonby и Grobs, запасная у aion2-guides; топ: 87%, ур. 9,3 — третья по частоте.'
    },
    {
      skill: MARCHUTANS_WRATH,
      role: 'stigma',
      equip: true,
      level: 5,
      note: 'Третье окно Удара скалы — на 3 с. Много вкладывать не нужно: ур. 1 (aion2-guides), 5 — +20% по малому числу целей (Grobs). 7 из 7; топ: 75%, ур. 7,6. Во время применения нельзя двигаться (notXeon).'
    },
    {
      skill: GUARDIAN_BLESSING,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Ур. 15 — Обет ветра ×1,5, ур. 10 — Перекрестная оборона ×1,5. У Rank 1 (aion2tierlist) — постоянная стигма вместо Заклятия ускорения; aion2-guides: «стоит того на 15, но в сезоне 1 нет слота». Топ: 42%, ур. 11,7.'
    },
    {
      skill: FOCUSED_DEFENSE,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Гарантированный блок, ур. 5 — два применения. 4-я стигма у aion2-guides и GamerBlurb (с целителем); против блокируемых ударов, не против механик (ExpCarry). Топ: 29%, ур. 6,2.'
    },
    {
      skill: OBLITERATE,
      role: 'stigma',
      equip: false,
      note: 'Урон по шкале оглушения (50) — для боссов, где её надо сбить, и для паков (GAMES.GG, ExpCarry, WallyJTV, aion2-guides). Топ: 18%.'
    },
    {
      skill: FRACTURING_BLOW,
      role: 'stigma',
      equip: false,
      note: '−30% ЗЩТ цели на 5 с — в слаженной группе (Grobs, Roonby, notXeon). В публичных билдах набор с ней самый частый (36% из 374), но у топ-игроков — лишь 14%, ур. 4,8.'
    },
    {
      skill: IMPEDING_AUTHORITY,
      role: 'stigma',
      equip: false,
      note: 'Щит группе на 20 с — против предсказуемого сильного удара в сложной экспедиции (ExpCarry, GamerBlurb). Топ: 14%.'
    },
    {
      skill: HEALING_TOUCH,
      role: 'stigma',
      equip: false,
      note: 'Лечение группы в движении — если в группе нет целителя (ExpCarry, GamerBlurb, aLuckyRO). Топ: 17%.'
    }
  ],

  stats: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Сводка 6 гайдов со статами: чаще всего называют АТК (6 из 6), меткость до порога (5), скорость боя (4), увелич. урона и крит. урон (по 3). От АТК растёт и урон, и лечение'
    },
    { stat: S.combatSpeed, weight: 5 },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    {
      stat: S.critDamageBoost,
      weight: 5,
      note: 'Удар скалы (на ур. 20) и Удар с вращением (с ур. 16) критуют всегда — крит. урон умножает главный урон'
    },
    { stat: S.attackBonus, weight: 5 },
    { stat: S.weaponDamageBoost, weight: 4, note: 'GamerBlurb и Rank 1 (aion2tierlist)' },
    { stat: S.might, weight: 4, note: 'На посохе и наручах (Vault — mourasb), «сначала АТК, потом Мощь» (aion2tierlist)' },
    { stat: S.multiHit, weight: 4, note: 'Rank 1 (aion2tierlist) и строка на наручах у mourasb' },
    { stat: S.double, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.cooldown, weight: 4 },
    { stat: S.accuracy, weight: 4, note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 200 Лудра), дальше — меньше' },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    {
      stat: S.critical,
      weight: 3,
      note: 'Не перекладывать (GamerBlurb, aion2tierlist): главные удары критуют и так, а предел шанса — 50%. Но на ур. 16–19 у Удара скалы крита нет (вариант 3 — третьим), и камни крита советуют aion2-guides и GAMES.GG'
    },
    { stat: S.precision, weight: 3 },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.attackIncrease, weight: 3 },
    { stat: S.moveSpeed, weight: 3, note: 'Строка сапог (Vault — mourasb)' },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.hp, weight: 3, note: 'ОЗ и стойкость — «по мере нужды для механик» (GAMES.GG, ExpCarry)' },
    {
      stat: S.healBoost,
      weight: 2,
      note: 'Лечение чародея растёт от АТК через Благословение жизни (GAMES.GG). Оценка помощника — полезно, если попадётся'
    },
    { stat: S.mp, weight: 2, note: 'Следите за ОМ в долгих боях (GAMES.GG); Разгром восполняет ОМ' },
    { stat: S.constitution, weight: 2 },
    { stat: S.dexterity, weight: 2 },
    { stat: S.block, weight: 2 },
    { stat: S.incomingHeal, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.defenseBonus, weight: 2 },
    { stat: S.defenseIncrease, weight: 2 },
    { stat: S.pveDefense, weight: 2 },
    { stat: S.endurance, weight: 2 },
    { stat: S.powerShardDamage, weight: 2 },
    { stat: S.statusResist, weight: 1 },
    { stat: S.criticalResist, weight: 1 },
    { stat: S.evasionBonus, weight: 1 }
  ],

  gear: {
    skills: [
      { skill: DARK_CRUSH, weight: 5 },
      { skill: ONSLAUGHT, weight: 5 },
      { skill: SPINNING_STRIKE, weight: 5 },
      { skill: ATTACK_PREPARATION, weight: 5 },
      { skill: WINDS_PROMISE, weight: 5 },
      { skill: INCANDESCENT_BLOW, weight: 4 },
      { skill: INSPIRING_SPELL, weight: 4 },
      { skill: IMPACT_HIT, weight: 4 },
      { skill: RECUPERATION, weight: 3 },
      { skill: PROTECTION_CIRCLE, weight: 3 },
      { skill: EARTHS_PROMISE, weight: 3 },
      { skill: IMPACTFUL_CRUSH, weight: 3 },
      { skill: BLESSING_OF_LIFE, weight: 2 },
      { skill: RUSHING_SMASH, weight: 1 }
    ],
    notes:
      'Что носят топ-чародеи: Жезл разъяренной Кромед (40%, в среднем +14) или Посох Аулламуса (14%), Наручи Нуакума (41%, +14), броня Нуакума (55–58%), украшения разъяренной Кромед (56–60%), Благородный пояс (90%), Амулет откровения (89%), Руна столкновения (98%). Посох +15 у 57%, наручи +15 у 46%, броня и украшения чаще +10. Строки умений бывают только на кольцах: Удар скалы, Удар с вращением, Разгром, Раскаленный удар (aion2-guides, Vault — mourasb); на посохе и наручах — статы. На ожерелье и серьгах — скорость боя или движения и строки Подготовки к атаке, Обета ветра, Защитного круга (mourasb).'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням 534 топ-чародеев): АТК, крит, доп. меткость, ОЗ, ОМ, блок, ЗЩТ, сопр. криту, УКЛ; увелич. урона — у 28%. Гайды: АТК, крит, меткость (aion2-guides, GAMES.GG); важнее грейд камня, чем сам стат (desolo, Vault)'
    },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.accuracyBonus, weight: 4, note: 'Первым, если промахиваетесь (GAMES.GG)' },
    { stat: S.critical, weight: 4 },
    { stat: S.hp, weight: 3 },
    { stat: S.defense, weight: 2 },
    { stat: S.mp, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [DARK_CRUSH, ONSLAUGHT, SPINNING_STRIKE, INCANDESCENT_BLOW, RECUPERATION, IMPACTFUL_CRUSH, RUSHING_SMASH, WAVE_BLOW],
    passive: [ATTACK_PREPARATION, WINDS_PROMISE, INSPIRING_SPELL, IMPACT_HIT, EARTHS_PROMISE, PROTECTION_CIRCLE, BLESSING_OF_LIFE],
    useless: [HEAT_WAVE_BLOW, GUST_RAMPAGE, DEFIANCE, CROSSGUARD, RAGING_SPELL],
    preferredSet: 'vigor',
    notes:
      'Топ-чародеи: Грааль «жизни» (55%), Пергамент «жизни» (42%), Компас «жизни» (33%; «магии» — 21%), Колокол «магии» (40%), Зеркало — почти поровну (жизни 30%, магии 25%). Гайды: три «жизни» + Колокол и Зеркало «магии» (Arthars Gaming), четыре «жизни» + Колокол «магии» (mourasb, Vault), все пять «жизни» (desolo). Одна карта «магии» сета не даёт — для него нужны две (Vault). Умения на картах: Удар скалы, Разгром, Удар с вращением — Пергамент; Раскаленный удар и Заклинание выздоровления — Компас; Подготовка к атаке — Колокол; Попадание шоком и Обет ветра — Зеркало; Грааль — то главное умение, которому не хватает до 20 (aion2-guides, ExpCarry). Удар скалы на карте важнее сета: без аркан он не дойдёт до 20.'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Удару скалы, Разгрому, Удару с вращением и Раскаленному удару на каждой из четырёх досок. Удар скалы +1 на Неджакане и Джикеле берут 98% и 97% топ-игроков, Разгром — 97% и 96%, Раскаленный удар — 97% и 95%, Удар с вращением на Джикеле — 96%; с этих узлов начинают aion2-guides, Vault, ExpCarry и GAMES.GG.',
        skills: [DARK_CRUSH, ONSLAUGHT, SPINNING_STRIKE, INCANDESCENT_BLOW],
        boards: [81, 82, 83, 84]
      },
      {
        id: 'damage-passives',
        name: 'Подготовка к атаке и Обет ветра',
        description:
          'Пассивки урона: Подготовка к атаке (узел на Неджакане — 97% топ-игроков), Обет ветра, затем Заклинание воодушевления и Попадание шоком (ExpCarry, GAMES.GG, aion2tierlist).',
        skills: [ATTACK_PREPARATION, WINDS_PROMISE, INSPIRING_SPELL, IMPACT_HIT],
        boards: [81, 82, 83, 84]
      },
      {
        id: 'support-skills',
        name: 'Заклинание выздоровления и Дробящий удар',
        description:
          '+1 к Заклинанию выздоровления (ExpCarry, GAMES.GG) и Дробящему удару (aion2-guides, aion2tierlist), потом Волновой удар и Снятие шока (aion2-guides).',
        skills: [RECUPERATION, IMPACTFUL_CRUSH, WAVE_BLOW, DEFIANCE],
        boards: [81, 82, 83, 84]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: скорость боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль) — Vault, GAMES.GG, aion2tierlist. Стойкость к крит. урону и сопротивление мульти-удару — пропустить (оценка помощника, как у стража и целителя).',
        boards: [81, 82, 83, 84],
        nodes: [810033, 810193, 810043, 810183, 820043, 820183, 820033, 820193, 830033, 830193, 840023, 840197, 840209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — из сложных подземелий; ExpCarry и aion2-guides ставят её после досок умений): «Увелич. урона в PvE +1,5%», «Увелич. урона по боссам +1%» и «Крит. удар +10». Узлы — как в сводном гайде стража (оценка помощника: гайды чародеев раскладки по Ариэль не дают). У большинства топ-чародеев доска пока пустая. Асфель — только PvP.',
        boards: [85],
        nodes: [850001, 850008, 850218, 850225, 850032, 850074, 850152, 850194, 850028, 850081, 850145, 850198]
      }
    ],
    notes:
      'Не тратить очки на узлы Перекрестной обороны, Заклинания гнева, Теплового удара и Танца ветра (aion2-guides, notXeon, aion2tierlist), Благословение жизни и Инстинкт выживания — только очками умений (aion2-guides). Маршрут по четырём доскам у aion2-guides: ~72 кристалла на Неджакане, 49 на Джикеле, 50 на Байзеле, 58 на Триниэле.'
  },

  genus: {
    stats: [
      {
        stat: S.attackBonus,
        weight: 5,
        note: 'Rank 1 (aion2tierlist): ячейки 1 и 5 — доп. АТК и макс. АТК, ячейка 4 — единственная с увелич. урона в PvE (до 4%). Остальное — как у стража и целителя (оценка помощника: другие гайды чародея род не разбирают)'
      },
      { stat: S.maxAttack, weight: 5 },
      { stat: S.pveDamageBoost, weight: 5 },
      { stat: S.critDamageBoost, weight: 5 },
      { stat: S.weaponDamageBoost, weight: 5 },
      { stat: S.double, weight: 5 },
      { stat: S.perfect, weight: 4 },
      { stat: S.damageBoost, weight: 4 },
      { stat: S.accuracyBonus, weight: 4 },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.pveAttack, weight: 4 },
      { stat: S.bossAttack, weight: 4 },
      { stat: S.damageTolerance, weight: 4 },
      { stat: S.pveDamageTolerance, weight: 4 },
      { stat: S.hpIncrease, weight: 3 },
      { stat: S.critical, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.endurance, weight: 3 },
      {
        stat: S.backAttackDamageBoost,
        weight: 3,
        note: 'Чародей бьёт вблизи и может стоять за спиной босса — так меньше блоков и парирований (aion2-guides). Урон с тыла полезнее урона спереди — оценка помощника'
      },
      { stat: S.backAttack, weight: 2 },
      { stat: S.hp, weight: 2 },
      { stat: S.block, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.powerShardDamage, weight: 2 },
      { stat: S.mp, weight: 2 },
      { stat: S.frontAttack, weight: 1 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Запирайте только почти максимальные значения. Соберите всех питомцев: бонусы коллекции — несколько процентов урона (Rank 1, aion2tierlist). Если в ячейку 4 не выпало нужное — «Увелич. урона в PvE» лучше простого «Увелич. урона».'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfAltgard, T.guardianOfVerteron],
    defense: [T.saintOfAltgard, T.saintOfVerteron, T.ruleAllCreation, T.dominatorOfDimensions],
    utility: [T.throughHellAndBack, T.emptyCloset, T.encounteringZikelsCore],
    notes:
      "Что носят топ-чародеи: атака — Unbound by Genus (50% в сумме двух версий), затем Защитник Альтгарда (8,2%; для Элийцев — Защитник Бертрона); защита — Святой Альтгарда / Бертрона (79%), Rule All Creation (8,6%); другое — Прошедший огонь и воду (45%, сокращение перезарядки), Encountering Zikel's Core (10%). Гайды чародея титулы не разбирают; Empty Closet (скорость боя и перезарядка) — как у стража и целителя, оценка помощника. Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель."
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
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов. Порог — блок босса, от класса не зависит: меткость сверх него не нужна. Цифры — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026), официальных нет. Свои бафы чародея добавляют меткость сверху: Песнь непобедимости ур. 10 — +100, Повелитель бурь ур. 10 — +200.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [{ value: 1700, label: 'предел 50% шанса против Лудры' }],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Удар с вращением с вариантом 5 и Удар скалы с вариантом 3 критуют всегда — им крит не нужен.'
    },
    ...(
      [
        [S.might, 'Мощь', 48.4],
        [S.dexterity, 'Ловкость', 29.9],
        [S.precision, 'Точность', 27.4],
        [S.constitution, 'Здоровье', 21.7],
        [6, 'Воля', 9.3]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-чародеев' }],
      note: 'Средний уровень у 1 785 топ-чародеев глобальной версии (metabot.gg, 9.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 60.3],
        [7, '[Неджакан] Справедливость', 50.9],
        [14, '[Триниэль] Смерть', 44.5],
        [8, '[Байзел] Свобода', 40.7],
        [13, '[Джикел] Разрушение', 40.2],
        [17, '[Израфель] Пространство', 33.7],
        [10, '[Юстиэль] Жизнь', 32.7],
        [15, '[Румиэль] Мудрость', 29.7],
        [9, '[Кайсинель] Видение', 27],
        [16, '[Маркутан] Судьба', 25.6]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-чародеев' }],
      note: 'Стат бога: средний у 1 785 топ-чародеев глобальной версии (metabot.gg, 9.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'До пула: включите Песнь непобедимости и Заклятие ускорения — это переключатели, в связку их не ставить (все гайды).',
    'Когда группа у босса и по нему можно бить — Повелитель бурь: +20% СКР боя и сокращение перезарядки вам и группе. Не во время перемещения босса (GAMES.GG). С целителем — до его Возмездия природы: пока на игроке её бафф, Повелитель бурь на него не ложится.',
    'Скачок — сближение с боссом.',
    'Окна Удара скалы: его можно применить только 2 с после Удара с вращением или Дробящего удара и 3 с после Ярости Маркутана. С ур. 16 у Удара скалы нет перезарядки — жмите его в окне подряд. Между открывающим умением и Ударом скалы ничего не вставляйте (GAMES.GG); если окно уже открыто, следующее открывающее приберегите (GamerBlurb) — связка с Ударом скалы в ряду 0 делает это сама.',
    'Ярость Маркутана — вручную, когда Удар с вращением и Дробящий удар на откате; во время применения нельзя двигаться.',
    'Разгром на ЛКМ между умениями: +100 ОМ за удар, а с вариантом 4 — −1 с перезарядки Удара с вращением за попадание.',
    'Заклинание выздоровления — вручную: урон по группе или снять дебафф. Если союзник в опасности — сначала лечение и защита, потом урон (GamerBlurb, GAMES.GG). Но чародей — не второй целитель: пока группа в безопасности, бейте (Roonby, aion2-guides).',
    'Истребляющий огонь (если надет) — в фазу, когда нужно сбить шкалу оглушения босса; в связку не ставить.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'crush',
        name: 'Ячейка Удара скалы',
        skills: [DARK_CRUSH, SPINNING_STRIKE, IMPACTFUL_CRUSH, INCANDESCENT_BLOW],
        when: { skill: DARK_CRUSH, minLevel: 16 },
        note: 'Стандартная связка чародея: так у 74% из 371 публичной связки (Vault; автор — mourasb), Удар скалы в ряду 0 — у 358 из 370. Удар скалы срабатывает, только пока открыто окно, и без перезарядки (ур. 16) идёт в нём подряд; как только окно закрылось — ячейка открывает новое Ударом с вращением или Дробящим ударом. Раскаленный удар — заполнитель в ряду 3, когда всё на откате. aion2-guides, Grobs и WallyJTV ставят в ряд 2 Ярость Маркутана, а Раскаленный удар — отдельным шагом (или убирают); Ярость Маркутана в ячейке — у 15% публичных связок.'
      },
      {
        id: 'crush-early',
        name: 'Ячейка Удара скалы — пока ниже 16',
        skills: [DARK_CRUSH, SPINNING_STRIKE, INCANDESCENT_BLOW],
        when: { skill: DARK_CRUSH, maxLevel: 15 },
        note: 'До ур. 16 у Удара скалы есть перезарядка: если в связке все открывающие умения, второе откроет окно впустую. Поэтому в связке только Удар с вращением, а Дробящий удар и Ярость Маркутана — вручную, когда Удар скалы готов (Vault — Grobs, aion2-guides, notXeon). В 17 из 39 публичных связок этого уровня в ряду 2 ещё Ярость Маркутана.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс — у aion2-guides и почти у всех публичных связок, где задержка задана (104 шага из 118; Vault); при пинге выше ~80 мс — 50 мс (aLuckyRO). Порядок исполнения игра не гарантирует — проверьте на манекене (ExpCarry).',
    manual: [
      {
        skill: ONSLAUGHT,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой (так у 94% публичных билдов и у всех авторов): +100 ОМ за удар, −1 с перезарядки Удара с вращением за попадание. Анимацию Разгрома прерывает следующее умение (notXeon).'
      },
      {
        skill: UNDEFEATED_MANTRA,
        when: 'Включить до боя (переключатель) и держать весь бой. В связку не ставить — она её выключит (вне связки у 362 из 364 публичных билдов).'
      },
      { skill: SPRINT_MANTRA, when: 'Включить до боя (переключатель). В связку не ставить.' },
      {
        skill: POWER_OF_THE_STORM,
        when: 'Окно урона группы, когда босс атакуем и стоит на месте. С целителем — раньше его Возмездия природы: под её баффом Повелитель бурь не ложится.'
      },
      {
        skill: MARCHUTANS_WRATH,
        when: 'Окно Удара скалы на 3 с — когда Удар с вращением и Дробящий удар на откате, или первым ударом боя (Rank 1, aion2tierlist). Во время применения нельзя двигаться.'
      },
      {
        skill: RECUPERATION,
        when: 'Урон по группе или снимаемый дебафф. Вне связки у всех публичных билдов: время лечения решаете вы.'
      },
      { skill: RUSHING_SMASH, when: 'Сближение с боссом в начале боя и после его перемещений (GamerBlurb). Только вручную.' },
      { skill: DEFIANCE, key: 'Q', when: 'Когда оглушили, опрокинули или напугали.' },
      { skill: WAVE_BLOW, optional: true, when: 'Перед сильным ударом босса: с вариантом 4 он 10 с бьёт на 15% слабее.' },
      {
        skill: GUARDIAN_BLESSING,
        optional: true,
        when: 'Если надето вместо Заклятия ускорения — по откату. Rank 1 держит его в связке, но при высоком пинге это стоит 5–10% урона (aion2tierlist).'
      },
      { skill: OBLITERATE, optional: true, when: 'В фазу, когда нужно сбить шкалу оглушения босса.' },
      { skill: FOCUSED_DEFENSE, optional: true, when: 'Прямо перед блокируемым ударом по вам; против механик не работает (ExpCarry).' },
      { skill: IMPEDING_AUTHORITY, optional: true, when: 'Перед предсказуемым сильным ударом по группе — щит на 20 с.' },
      { skill: HEALING_TOUCH, optional: true, when: 'Без целителя: лечение группы, можно в движении.' },
      { skill: FRACTURING_BLOW, optional: true, when: 'В окно урона группы: −30% ЗЩТ цели на 5 с.' }
    ],
    opener: [
      { skill: UNDEFEATED_MANTRA, note: 'до пула, переключатель' },
      { skill: SPRINT_MANTRA, note: 'до пула, переключатель' },
      { skill: POWER_OF_THE_STORM, note: 'группа у босса' },
      { skill: RUSHING_SMASH, note: 'сближение' },
      { skill: SPINNING_STRIKE, note: 'окно 2 с' },
      { skill: DARK_CRUSH },
      { skill: IMPACTFUL_CRUSH, note: 'окно 2 с' },
      { skill: DARK_CRUSH },
      { skill: MARCHUTANS_WRATH, note: 'окно 3 с' },
      { skill: DARK_CRUSH },
      { skill: ONSLAUGHT, note: 'ОМ и перезарядка Удара с вращением' }
    ],
    openerNote:
      'Порядок ExpCarry (Повелитель бурь → Удар с вращением → Удар скалы → Разгром) с окнами Дробящего удара и Ярости Маркутана из GAMES.GG; Скачок к боссу — Grobs (aion2-guides, Vault). Rank 1 из aion2tierlist открывает бой Яростью Маркутана — разница небольшая. Дальше — связка и Разгром на ЛКМ.',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так советуют aion2-guides, Vault и Rank 1 из aion2tierlist), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Разгром. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для чародея отдельно не проверялось). В связке одна ячейка, так что миг, когда ПКМ отпущена, ей не мешает.'
    },
    notes:
      'Связка — на ПКМ, Разгром — на ЛКМ: так почти у всех. Остальные клавиши — на ваш вкус. Мантры, Повелитель бурь, Заклинание выздоровления и Скачок — не в связку (95–100% публичных билдов держат их отдельно). Шаг связки берёт ячейку целиком, а не одно умение (Vault).'
  },

  tips: [
    {
      title: 'Связка: одна ячейка',
      text: 'Удар скалы (ряд 0), Удар с вращением, Дробящий удар, Раскаленный удар — один шаг связки на ПКМ, задержка 10 мс; Разгром на ЛКМ — держать обе кнопки. Пока Удар скалы ниже 16 — без Дробящего удара: его и Ярость Маркутана жмите сами, когда Удар скалы готов. Мантры, Повелитель бурь и лечение — вручную. Подробно — на странице «Ротация».'
    },
    {
      title: 'Целитель в группе',
      text: "Песнь непобедимости и Свет спасения целителя не складываются: работает тот, что выше уровнем, при равных — Песнь (ExpCarry, GAMES.GG). Повелитель бурь и бафф Возмездия природы целителя (Earth's Blessing) на одного игрока вместе не ложатся (ExpCarry, Vault) — включайте Повелителя бурь первым: у него перезарядка намного дольше, а Возмездие природы целитель повторит (Vault, страница целителя). Призыв земли не складывается с Цепью боли целителя — поэтому эта пассивка не в начале списка."
    },
    {
      title: 'Порог урона',
      text: 'Главный рубеж — Удар скалы ур. 16: он теряет перезарядку и идёт в каждом окне подряд. До этого связка «спотыкается» на перезарядке, и окна приходится открывать вручную (aion2-guides). Удар скалы с комбинацией «Дробящее пробитие» (Piercing Strike) — около 40% урона (замер Arthars Gaming), поэтому на него — первые узлы досок, кольца и арканы. Правило уровней: важны только 12, 16 и 20 — там открываются варианты и слоты (aion2-guides).'
    },
    {
      title: 'Мантры — переключатели',
      text: 'Песнь непобедимости и Заклятие ускорения включаются один раз и держатся, пока их не выключить. Связка жмёт их повторно — и выключает, поэтому их нет в связках (все гайды; вне связки у 99% публичных билдов). .pruski держит обе в первых ячейках панели, чтобы видеть, что они включены.'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Четвёртая стигма: Заклятие ускорения (ExpCarry, Roonby, Grobs; у топ-игроков 87%), Благословение хранителя (Rank 1; 42%), Концентрация на защите (aion2-guides, GamerBlurb; 29%), Истребляющий огонь (GAMES.GG; 18%) или Разрушительный удар (notXeon; в публичных билдах 36%, у топа 14%). Удар с вращением на ур. 16–19: −5 с перезарядки (aion2-guides) или +20% урона (Grobs). Ярость Маркутана: в связке (aion2-guides, Grobs) или вручную (ExpCarry; в 85% публичных связок её нет).'
    },
    {
      title: 'Крит — не перекладывать',
      text: 'Удар с вращением с вариантом 5 и Удар скалы с вариантом 3 критуют всегда, а предел шанса крита — 50% (GamerBlurb, aion2tierlist, timesaver). Крит дают и свои бафы: Песнь непобедимости ур. 5 и Повелитель бурь ур. 15. Ценнее АТК, скорость боя, крит. урон и увелич. урона.'
    }
  ],

  checklist: [
    { id: 'macro', text: 'Настроить связку: Удар скалы (ряд 0), Удар с вращением, Дробящий удар, Раскаленный удар; на ПКМ, задержка 10 мс' },
    { id: 'binds', text: 'Разгром — на ЛКМ; Повелитель бурь, Ярость Маркутана, Заклинание выздоровления и Скачок — на отдельных клавишах' },
    { id: 'stigmas', text: 'Стигмы: Песнь непобедимости, Повелитель бурь, Заклятие ускорения, Ярость Маркутана' },
    { id: 'mantras', text: 'Перед боем включить Песнь непобедимости и Заклятие ускорения — это переключатели, в связку их не ставить' },
    { id: 'breakpoint', text: 'Удар скалы — ур. 16 (снимает перезарядку), затем 20; Повелитель бурь — сразу до ур. 5 (−30 с перезарядки)' },
    { id: 'weapon15', text: 'Посох — заточка +15 (так у большинства топ-чародеев)' },
    { id: 'arcana-vigor', text: 'Арканы: Грааль, Пергамент и Компас «жизни», Колокол «магии», Зеркало — любое' }
  ]
}
