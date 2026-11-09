// Встроенный гайд: Заклинатель, PvE — сводный. Собран из 8 гайдов для глобальной версии и статистики
// 1 137 топ-заклинателей глобальных серверов (metabot.gg, данные на 8 ноября 2026). Разбор источников,
// таблицы согласия и что взято откуда — docs/research/spiritmaster-pve-2026-11.md.
// В заметках: «N из M» — сколько гайдов, где это вообще сказано, советуют то же; «топ: X%» — доля топ-игроков.
// MetaRoad и aion2-guides построены на гайде Evripides — их совпадения считаем одним мнением.

import type { Guide } from '../types'

// Умения заклинателя (ID игры)
const COLD_SHOCK = 16010000
const COMBUSTION = 16040000
const FIRE_SPIRIT = 16100000
const WATER_SPIRIT = 16110000
const CURSE = 16140000
const RAPID_SCATTERSHOT = 16340000
const EARTH_SPIRIT = 16130000
const DIMENSIONAL_CONTROL = 16330000
const WIND_SPIRIT = 16120000
const SOULS_CRY = 16070000
const ELEMENTAL_FUSION = 16300000
const DEFIANCE = 16200000
const SPIRIT_STRIKE = 16710000
const SPIRIT_PROTECTION = 16720000
const SPIRITS_DESCENT = 16730000
const CORRODE_PASSIVE = 16740000
const SPIRIT_REVITALIZATION = 16750000
const MENTAL_FOCUS = 16760000
const SPIRIT_COMMUNION = 16770000
const ELEMENT_UNIFICATION = 16780000
const REVITALIZATION_CONTRACT = 16790000
const CONSECUTIVE_COUNTERCURRENT = 16800000
const ANCIENT_SPIRIT = 16250000
const SPIRITS_BENEDICTION = 16190000
const JOINTSTRIKE_CORRODE = 16150000
const FLAME_BLESSING = 16370000
const DESTRUCTIVE_ATTACK = 16240000
const SIPHON = 16060000
const COMMAND_PROXY = 16170000
const CURSED_CLOUD = 16220000

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
  throughHellAndBack: 12010061,
  emptyCloset: 13050009,
  encounteringZikelsCore: 23010010,
  encounteringKaisinelsCore: 13010010
} as const

export const spiritmasterPveConsensus: Guide = {
  schema: 1,
  id: 'builtin-spiritmaster-pve-consensus',
  name: 'Заклинатель PvE — сводный (8 гайдов + топ-игроки)',
  cls: 'spiritmaster',
  mode: 'pve',
  builtin: true,
  description:
    'Только PvE: PvP-статы, стигмы и специализации не учитываются. Не один гайд, а то, в чём сходятся восемь гайдов для глобальной версии и что реально носят 1 137 топ-заклинателей глобальных серверов. Весь урон заклинателя — Синтез элементов: каждое умение духа даёт элемент, четыре элемента открывают Синтез (самый сильный удар), а Призыв: Древний дух даёт их все сразу. Духи копируют ваши статы и баффы в момент призыва — поэтому сначала заряды Дрожи земли (Шоковая заморозка) и баффы (Благословение пламени, Усиление: Благословение духа), потом Древний дух. Между Синтезами — Кооперация: Разложение, Кооперация: Проклятие, Повелитель пространства и Воспламенение, Шоковая заморозка — на ЛКМ. Цель: Синтез элементов, Воспламенение и Призыв: Дух огня — ур. 20; Шоковая заморозка и Призыв: Дух воды — 16; Кооперация: Проклятие, Повелитель пространства и Призыв: Дух земли — 14. Где источники расходятся, в заметке сказано, кто за что.',
  source: { author: 'Aion2 Build Helper — сводка 8 гайдов и данных топ-игроков', date: '2026-11-09' },
  sources: [
    {
      title: 'MetaBot.gg — что носят топ-заклинатели (1 137 игроков, все регионы)',
      url: 'https://metabot.gg/en/aion-2/classes/spiritmaster/build',
      date: '2026-11-08',
      region: 'global',
      kind: 'data',
      note: 'Умения, стигмы и шмот — по 1 064 игрокам, статы и титулы — по 1 137, доски — по 1 133, камни — по 520. Клиент 0.0.4387.0, после патча 4 ноября.'
    },
    {
      title: 'MetaRoad — Spiritmaster PvE Build',
      url: 'https://metaroad.gg/aion2/build-guides/spiritmaster-pve-build',
      author: 'Riesa',
      date: '2026-10-21',
      region: 'global',
      note: 'Основан на гайде Evripides, выбор — по игрокам Тайваня. Самый подробный по строкам шмота, камням, роду, доскам и связке.'
    },
    {
      title: 'ExpCarry — AION 2 Spiritmaster Guide',
      url: 'https://expcarry.com/aion-2-spiritmaster-guide',
      date: '2026-10-29',
      region: 'global',
      note: 'Стигмы — по выборке 200 заклинателей от 28.10. Номеров специализаций нет.'
    },
    {
      title: 'AION2 Vault — Spiritmaster PvE Build',
      url: 'https://aion2vault.com/builds/spiritmaster/pve/',
      author: 'AION2 Vault Team',
      date: '2026-11-02',
      region: 'global',
      note: 'Сводка авторов (init.rb, Grobs, aLuckyRO, Hemi, Tsuruf, OneTimeACraft) и доли стигм в публичных билдах. Сами авторы сайта сборку не проверяли.'
    },
    {
      title: 'AION2 Vault — Spiritmaster Macro',
      url: 'https://aion2vault.com/builds/spiritmaster/macro/',
      date: '2026-11-02',
      region: 'global',
      note: 'Связки восьми авторов и подсчёт 463 публичных связок (задержка, что держат вне связки).'
    },
    {
      title: 'AION2 Vault — Spiritmaster Gear',
      url: 'https://aion2vault.com/builds/spiritmaster/gear/',
      date: '2026-10-25',
      region: 'global',
      note: 'Строки души по слотам (init.rb, Grobs) и арканы 195 игроков.'
    },
    {
      title: 'AION 2 Global Guides — Spiritmaster (aLuckyRO, Evripides, DankRNG, Grobs)',
      url: 'https://aion2-guides.info/en/elementalist/',
      date: '2026-11-07',
      region: 'global',
      note: 'Номера специализаций, связки aLuckyRO, Evripides и Grobs по рядам, маршрут досок и Ариэль. По словам страницы — адаптация с тайваньской и корейской версий.'
    },
    {
      title: 'Evripides — Elementalist (Spirit Master) Guide · Global',
      url: 'https://aion2-elementalist-guide.netlify.app/global/',
      author: 'Evripides',
      date: '2026-10-03',
      region: 'mixed',
      note: 'Первоисточник для MetaRoad и aion2-guides: адаптация гайда с TW/KR под глобальную версию. Уровни, арканы по картам, камни, связка; специализации — только картинками.'
    },
    {
      title: 'Skycoach — AION 2 Spiritmaster Guide',
      url: 'https://skycoach.gg/blog/aion-2/articles/spiritmaster-guide',
      author: 'Wayne Halkett',
      date: '2026-10-15',
      region: 'mixed',
      note: 'Версия не указана. Специализации текстом (сверены со справочником), приоритеты статов и пассивок.'
    },
    {
      title: 'GAMES.GG — Aion 2 Spiritmaster Guide',
      url: 'https://games.gg/aion-2/guides/aion-2-spiritmaster-guide/',
      author: 'Abdalla',
      date: '2026-10-04',
      region: 'global',
      note: 'Самый ранний, первые дни сезона: наборы для боссов, фарма и защиты.'
    },
    {
      title: 'GamerBlurb — Spiritmaster Build Guide (Global)',
      url: 'https://gamerblurb.com/guides/aion-2-spiritmaster-build-guide-pve-pvp-leveling-global',
      date: '2026-10-06',
      region: 'global',
      note: 'Приоритеты без чисел и порядок начала боя.'
    },
    {
      title: 'Aion 2 Meta — Spiritmaster (корейский топ + 35 глобальных игроков)',
      url: 'https://aion2-meta.com/guides/spiritmaster/',
      date: '2026-11-03',
      region: 'korea',
      kind: 'data',
      note: 'Срез 3 627 топ-игроков Кореи (там на одну стигму больше и другие арканы) и 35 лучших глобальных. Взят для сравнения, не как цель.'
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
      skill: ELEMENTAL_FUSION,
      role: 'core',
      level: 20,
      specs: [5, 3, 2],
      note: 'Главный урон: самый сильный удар, без перезарядки, но только при «Четырёх элементах» — их дают умения духов (каждое — один элемент), а Призыв: Древний дух — все сразу. Варианты 2 (доп. урон через 3 с), 3 (+10% всех стихий) и 5 (ур. 16 — 25% шанс вернуть «Четыре элемента», то есть ещё один Синтез) — у всех гайдов с номерами (MetaRoad, aion2-guides, Skycoach, Vault); в публичных связках вариант 3 — 88%, 5 — 58% (Vault). Вариант 4 (заряд, до +200%) — только вручную: связка отпускает заряд сразу (aLuckyRO). Ур. 20 — все гайды; топ: ур. 16,1 — выше всех активных.'
    },
    {
      skill: COMBUSTION,
      role: 'core',
      level: 20,
      specs: [5, 4, 2],
      note: 'Урон между Синтезами и заполнитель связки. +12% по малому числу целей (6 из 6) и на ур. 12 — +20% скорости умения (6 из 6), на ур. 16 — цепочка «Зов пепла» (MetaRoad, aion2-guides, Skycoach). В первые дни, пока не хватает ОМ, — вариант 1, −20% расхода ОМ (aLuckyRO, GAMES.GG). Ур. 20 — 6 гайдов; топ: 16,1; узел +1 на Неджакане берут 98%.'
    },
    {
      skill: FIRE_SPIRIT,
      role: 'core',
      level: 20,
      specs: [5, 3, 2],
      note: 'Сильнейший из обычных духов (MetaRoad, Evripides, Skycoach): призывайте его последним — дольше останется. 10% шанс умения духа при атаке — больше элементов (6 из 6), +20% крит. урона духа (4 гайда), на ур. 16 — +20% статов духа (MetaRoad, aion2-guides, Vault). Ур. 20 — MetaRoad, aion2-guides, Evripides, Grobs; топ: 15,2.'
    },
    {
      skill: COLD_SHOCK,
      role: 'core',
      level: 16,
      specs: [4, 3, 1],
      note: 'Базовая атака на ЛКМ, восполняет ОМ. Вариант 4 (ур. 12) — +2% АТК за заряд Дрожи земли, до 5 (4 из 4): пять зарядов держите всегда — духи копируют их при призыве (Evripides, MetaRoad). Вторым — +50% мульти-удара (MetaRoad, aion2-guides, Skycoach, init.rb); пока не хватает ОМ — +20% ОМ (вариант 1: GAMES.GG, aLuckyRO, Grobs), он же третьим на ур. 20. Ур. 16 — aion2-guides, Evripides («14 — нормально»); MetaRoad — 14; топ: 14,5.'
    },
    {
      skill: WATER_SPIRIT,
      role: 'support',
      level: 16,
      specs: [5, 2, 3],
      note: 'Восполняет ОМ при атаке и даёт элементы; лучший дух для прокачки (aion2-guides). +10% АТК духа (4 гайда), до ур. 16 — 10% шанс умения духа (MetaRoad, Skycoach, Vault), на ур. 16 — +20% статов вместо него (MetaRoad, aion2-guides, aion2-meta). Ур. 16 — aion2-guides, Evripides, aion2-meta; MetaRoad — 14; топ: 14.'
    },
    {
      skill: EARTH_SPIRIT,
      role: 'support',
      level: 14,
      specs: [3, 2, 5],
      note: 'Третий дух для элементов; притягивает агро на себя — полезен соло. 10% шанс умения духа и +20% стойкости духа к урону в PvE (по 4 гайда), +20% статов на ур. 16 — aion2-guides, Vault. Ур. 14 — MetaRoad (aion2-guides и Evripides — 16); топ: 13,4. Если босса держите вы сами, Evripides призывает Духа земли последним вместо Духа огня.'
    },
    {
      skill: CURSE,
      role: 'support',
      level: 14,
      specs: [1, 4, 3],
      note: 'Урон по перезарядке — в ячейке урона связки. Все три варианта популярны: +2 с действия (5 источников), на ур. 12 — −2 с перезарядки (4) и «на ходу» (4; Skycoach — «без него почти неиграбельно»); к ур. 20 берутся все три. Ур. 14 — MetaRoad (aion2-guides и Evripides — 16); топ: 14,3.'
    },
    {
      skill: DIMENSIONAL_CONTROL,
      role: 'support',
      level: 14,
      specs: [2, 3],
      note: 'Становится доступен после умения духа — жмите сразу: заодно восполняет ОМ (MetaRoad, GAMES.GG). Доп. урон через 3 с и +50% мульти-удара — у всех 6 гайдов с номерами; притяжение и замедление не брать. Ур. 14 — MetaRoad (aion2-guides и Evripides — 16); топ: 14,4.'
    },
    {
      skill: RAPID_SCATTERSHOT,
      role: 'situational',
      specs: [5, 4, 3],
      note: 'Работает только по цели со сбитой шкалой оглушения (MetaRoad, aion2-guides, aion2-meta) — вручную, вне связки (так у 327 из 331 публичной связки). На ур. 16 — мульти-удар и −1 с всех перезарядок за попадание (MetaRoad, aion2-guides, init.rb, Skycoach), до 16 — вариант 3 «на ходу». Гайды ведут к 14–16, но у топ-игроков в среднем ур. 9,7, а Evripides не берёт его узлы досок — качать после главного.'
    },
    {
      skill: DEFIANCE,
      role: 'situational',
      level: 12,
      specs: [3, 5, 4],
      note: 'Снимает оглушение, опрокидывание и страх. +20% ОЗ при применении (4 из 4), до ур. 16 — +2 с Непреклонности (MetaRoad, Skycoach), на ур. 16 — +50% стойкости к урону в PvE на время Непреклонности (MetaRoad, aion2-guides). Ур. 12 — Skycoach; MetaRoad — 14, aion2-guides — 16. В данных топа его нет.'
    },
    {
      skill: WIND_SPIRIT,
      role: 'situational',
      note: 'Спорно. Большинство глобальных гайдов в эндгейме не берут: слабейший урон и отнимает время у других духов (MetaRoad, Evripides, aion2-guides, GamerBlurb, OneTimeACraft). Но корейский топ с сентября держит всех четырёх духов ради элементов (aion2-meta), Grobs ставит его в связку, aLuckyRO — на первую неделю. Узлы досок и арканы — не тратить. Топ: на панели у 83%, ур. 9,3.'
    },
    {
      skill: SOULS_CRY,
      role: 'situational',
      note: 'Страх — боссы к нему невосприимчивы: в PvE не качать (все гайды). Узлы досок и арканы — не тратить. Топ: на панели у 92%, ур. 7,1.'
    },

    {
      skill: SPIRIT_STRIKE,
      role: 'passive',
      level: 20,
      note: '+6% урона в PvE и Совершенный удар вам и духу — первая пассивка почти у всех гайдов; Усиление: Благословение духа с ур. 10 усиливает её в 1,5 раза. Evripides со строками шмота ведёт к 28–30; топ: 16,3 — выше всех; узел на Неджакане берут 96%.'
    },
    {
      skill: MENTAL_FOCUS,
      role: 'passive',
      level: 20,
      note: 'Даёт Сокрушающий удар (и шанс ментальных эффектов). Evripides — «максимум», ~32 со строками шмота; aion2-guides и Skycoach — первая. aLuckyRO считает её скорее PvP-пассивкой. Топ: 15,6; на шмоте у корейского топа — 79%.'
    },
    {
      skill: ELEMENT_UNIFICATION,
      role: 'passive',
      level: 16,
      note: 'Крит. урон на 10 с за каждое умение духа, до 5 стопок. Третья у Evripides и aion2-guides, «высокая» — Skycoach; GAMES.GG — когда шмот сильный. Топ: 15,4.'
    },
    {
      skill: CORRODE_PASSIVE,
      role: 'passive',
      level: 14,
      note: 'Крит и доп. урон при крите. Skycoach — высокий приоритет, aLuckyRO — с ~800–1 000 крита, GAMES.GG — когда шмот сильный. Топ: 14,6.'
    },
    {
      skill: SPIRIT_REVITALIZATION,
      role: 'passive',
      level: 14,
      note: 'Шанс при попадании сократить перезарядку духов, в том числе Древнего, — больше Синтезов (Evripides, GAMES.GG). Топ: 14,1.'
    },
    {
      skill: SPIRITS_DESCENT,
      role: 'passive',
      level: 14,
      note: 'Доп. урон 10 с после призыва духа, после Древнего духа — 30 с (Призыв: Древний дух ур. 10 — ×1,5). GAMES.GG и aLuckyRO — высокий приоритет в начале. Топ: 14.'
    },
    {
      skill: CONSECUTIVE_COUNTERCURRENT,
      role: 'passive',
      note: '50% шанс доп. урона по цели с уроном со временем, а Разложение висит весь бой. GAMES.GG — высокий приоритет, остальные — по остатку очков. Топ: 13,1.'
    },
    { skill: SPIRIT_PROTECTION, role: 'passive', note: 'ЗЩТ вам и духу — для защиты; строки на шмоте не стоит (aion2-guides, GamerBlurb). Топ: 13,2.' },
    { skill: SPIRIT_COMMUNION, role: 'passive', note: 'Лечение — по остатку очков; строки на шмоте не стоит (aion2-guides). Топ: 10,8.' },
    { skill: REVITALIZATION_CONTRACT, role: 'passive', note: 'Только PvP (aLuckyRO). Топ: 9,1.' },

    {
      skill: ANCIENT_SPIRIT,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Главная стигма: дух на 30 с, каждое его умение даёт «Четыре элемента» сразу — лишние Синтезы. Ур. 10 — Пришествие духа ×1,5 на 30 с, ур. 15 — умение после 5 обычных атак вместо 7 (первая цель: aLuckyRO, GAMES.GG, ExpCarry), ур. 20 — +20% статов духа. Призывать только после баффов. 8 из 8; топ: 97%, ср. ур. 15,4 — выше всех стигм.'
    },
    {
      skill: SPIRITS_BENEDICTION,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '+20% урона и стойкости к урону в PvE вам и духу. Ур. 10 — Удар элемента ×1,5, ур. 15 — Духовное единство ×1,5 (урона не даёт — init.rb оставляет напоследок), ур. 20 — +25% вместо +20%. Включать до призыва духов. 8 из 8; топ: 95%, ур. 12,9.'
    },
    {
      skill: JOINTSTRIKE_CORRODE,
      role: 'stigma',
      equip: true,
      level: 20,
      note: 'Бьёт до 4 целей и вешает Разложение: урон со временем и больше урона от духа. Ур. 5 — +15% урона от духа по цели (Tsuruf берёт ур. 5 сразу), ур. 20 — +10 с действия: с ~33% сокращения перезарядки висит весь бой (Evripides, aion2-guides). Ур. 10 и 15 — замедление врага и −70% лечения (для PvE почти пусто). 8 из 8 (ур. 20 — MetaRoad, Evripides, aion2-guides); топ: 91%, ур. 9,5.'
    },
    {
      skill: FLAME_BLESSING,
      role: 'stigma',
      equip: true,
      level: 20,
      note: '50% шанс доп. урона при попадании на 10 с (на ур. 20 — 20 с); действует только на вас, не на духов (Vault). Ур. 5 — +100 меткости, 10 — +100 крита, 15 — +10% крит. урона, 20 — перезарядка доп. урона −50%. 8 из 8, ExpCarry — «начинать с неё»; топ: 82%, ур. 11,7.'
    },
    {
      skill: DESTRUCTIVE_ATTACK,
      role: 'stigma',
      equip: false,
      level: 5,
      note: 'Замена Благословению пламени на боссах со шкалой оглушения: 50 урона по шкале, с ур. 5 — заряд до +200% урона (только вручную — в связку нельзя), ур. 20 — первый удар сбрасывает перезарядку обеих Коопераций (Проклятия и Разложения). ExpCarry, Vault (init.rb), GAMES.GG, GamerBlurb; MetaRoad — «не проверял». Топ: 32%, ур. 4,9.'
    },
    {
      skill: SIPHON,
      role: 'stigma',
      equip: false,
      level: 15,
      note: 'Соло и прокачка вместо Благословения пламени: поглощение ОЗ, на ур. 15 — щит 30% ОЗ на 30 с (MetaRoad, GAMES.GG). Топ: 16%.'
    },
    {
      skill: COMMAND_PROXY,
      role: 'stigma',
      equip: false,
      note: 'Защитная: делит получаемый урон с духом — для тяжёлых механик, пока учите босса (GAMES.GG, aion2-guides). Топ: 11%.'
    },
    {
      skill: CURSED_CLOUD,
      role: 'stigma',
      equip: false,
      note: 'Урон со временем по толпе — для фарма (GAMES.GG). MetaRoad и aion2-guides: сильная, но в четырёх слотах ей нет места. Топ: 1,9%.'
    }
  ],

  stats: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Сводка 8 гайдов: чаще всего называют меткость до порога и АТК (по 7 из 8), увелич. урона, крит. урон, СКР боя, Сокрушающий удар и сокращение перезарядки (по 6). Духи копируют ваши статы при призыве — атакующие статы усиливают и их'
    },
    { stat: S.damageBoost, weight: 5 },
    { stat: S.pveDamageBoost, weight: 5 },
    { stat: S.critDamageBoost, weight: 5, note: 'Его же дают Слияние стихий и Благословение пламени ур. 15' },
    {
      stat: S.double,
      weight: 5,
      note: 'Сокрушающий удар — «самый сильный атакующий стат» (Evripides), цель сезона 1 — 25% (MetaRoad, Evripides). Его дают Чистый разум и строки души на броне'
    },
    { stat: S.combatSpeed, weight: 5, note: 'Связке Evripides и MetaRoad нужно ~65% СКР боя' },
    { stat: S.cooldown, weight: 5, note: 'Духи, Древний дух и Разложение — по откату: от 20%, для Разложения без перерыва — ~33% (MetaRoad, Evripides)' },
    { stat: S.attackBonus, weight: 5 },
    {
      stat: S.accuracy,
      weight: 4,
      note: 'Нужна до порога контента (≈800 Трансцендентность 4, ≈1 200 Лудра; MetaRoad и Evripides целятся в 1 500), дальше — меньше'
    },
    { stat: S.accuracyBonus, weight: 4 },
    { stat: S.pveAccuracy, weight: 4 },
    { stat: S.perfect, weight: 4 },
    { stat: S.attackIncrease, weight: 4 },
    { stat: S.weaponDamageBoost, weight: 4, note: 'На сфере и наручах (MetaRoad, Vault)' },
    { stat: S.maxAttack, weight: 4 },
    { stat: S.might, weight: 4, note: 'Мощь и Точность — строки сферы, наручей и украшений (MetaRoad, Vault, Skycoach)' },
    { stat: S.precision, weight: 4 },
    { stat: S.bossDamageBoost, weight: 4 },
    {
      stat: S.critical,
      weight: 4,
      note: 'Skycoach ставит крит в высший приоритет, ExpCarry — после урона. Предел шанса — 50% (≈1 700 крита против Лудры)'
    },
    { stat: S.multiHit, weight: 3, note: 'Шоковая заморозка и Повелитель пространства с вариантом 3 — тоже мульти-удар' },
    { stat: S.criticalAttack, weight: 3 },
    { stat: S.penetration, weight: 3 },
    { stat: S.pveAttack, weight: 3 },
    { stat: S.bossAttack, weight: 3 },
    { stat: S.damageTolerance, weight: 3 },
    { stat: S.pveDamageTolerance, weight: 3 },
    { stat: S.hpIncrease, weight: 3 },
    { stat: S.hp, weight: 3 },
    { stat: S.moveSpeed, weight: 3, note: 'Строка ожерелья и серёг вместо СКР боя (MetaRoad, Vault)' },
    { stat: S.mp, weight: 2, note: 'Заклинателю часто не хватает ОМ (Skycoach, GAMES.GG)' },
    {
      stat: S.frontAttackDamageBoost,
      weight: 2,
      note: 'MetaRoad и Evripides кладут камни на урон спереди, но сами оговаривают: если бьёте сбоку или со спины, лучше АТК. Оценка помощника — заклинатель бьёт издалека, сторона зависит от боя'
    },
    { stat: S.backAttackDamageBoost, weight: 2 },
    { stat: S.constitution, weight: 2 },
    { stat: S.dexterity, weight: 2 },
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
      { skill: ELEMENTAL_FUSION, weight: 5 },
      { skill: COMBUSTION, weight: 5 },
      { skill: FIRE_SPIRIT, weight: 5 },
      { skill: SPIRIT_STRIKE, weight: 5 },
      { skill: MENTAL_FOCUS, weight: 5 },
      { skill: ELEMENT_UNIFICATION, weight: 4 },
      { skill: COLD_SHOCK, weight: 4 },
      { skill: WATER_SPIRIT, weight: 3 },
      { skill: SPIRIT_REVITALIZATION, weight: 3 },
      { skill: CURSE, weight: 3 },
      { skill: DIMENSIONAL_CONTROL, weight: 3 },
      { skill: CORRODE_PASSIVE, weight: 2 },
      { skill: SPIRITS_DESCENT, weight: 2 },
      { skill: EARTH_SPIRIT, weight: 2 },
      { skill: CONSECUTIVE_COUNTERCURRENT, weight: 2 },
      { skill: RAPID_SCATTERSHOT, weight: 1 },
      { skill: DEFIANCE, weight: 1 },
      { skill: SPIRIT_PROTECTION, weight: 1 }
    ],
    notes:
      'Что носят топ-заклинатели: Орб разъяренной Кромед (29%, в среднем +14), Сфера Аулламуса (21%), Сфера духовного начала (14%); Наручи Нуакума (36%, +14); броня Нуакума (49–51%); украшения разъяренной Кромед (51–55%); Благородный пояс (88%), Амулет откровения (90%), Руна столкновения (98%). Сфера +15 у 51%, наручи +15 у 42%, броня и украшения чаще +10. Строки души (MetaRoad, Vault — init.rb и Grobs): сфера и наручи — СКР боя, увелич. урона оружия, увелич. урона, Мощь, Точность; вся броня — Удар элемента и Чистый разум плюс Сокрушающий удар, увеличение АТК, Совершенный удар или крит. урон (Grobs — ещё Слияние стихий); ожерелье и серьги — Удар элемента, Чистый разум, Мощь, СКР боя или скорость движения; кольца — Синтез элементов, Воспламенение, Призыв: Дух огня и Мощь.'
  },

  manastones: [
    {
      stat: S.attack,
      weight: 5,
      note: 'Пул камней глобальной версии (по камням 520 топ-заклинателей): крит, ОЗ, ОМ, АТК, доп. меткость, сопр. криту, ЗЩТ, блок, УКЛ; увелич. урона — у 25%'
    },
    { stat: S.damageBoost, weight: 5, note: 'MetaRoad и Evripides — первым' },
    { stat: S.accuracyBonus, weight: 4, note: 'Хотя бы один камень меткости — всегда (MetaRoad, Evripides)' },
    { stat: S.critical, weight: 4, note: 'Skycoach: оставлять камни с АТК, меткостью или критом' },
    {
      stat: S.critDamageBoost,
      weight: 3,
      note: 'MetaRoad и Evripides советуют вторым, но у топ-заклинателей таких камней не видно — возможно, только на оружии'
    },
    { stat: S.hp, weight: 3 },
    { stat: S.mp, weight: 2 },
    { stat: S.defense, weight: 2 },
    { stat: S.block, weight: 1 },
    { stat: S.evasionBonus, weight: 1 },
    { stat: S.criticalResist, weight: 1 }
  ],

  arcana: {
    attack: [ELEMENTAL_FUSION, COMBUSTION, FIRE_SPIRIT, COLD_SHOCK, WATER_SPIRIT, CURSE, DIMENSIONAL_CONTROL, RAPID_SCATTERSHOT, EARTH_SPIRIT, DEFIANCE],
    passive: [
      SPIRIT_STRIKE,
      MENTAL_FOCUS,
      ELEMENT_UNIFICATION,
      SPIRIT_REVITALIZATION,
      CORRODE_PASSIVE,
      SPIRITS_DESCENT,
      CONSECUTIVE_COUNTERCURRENT,
      SPIRIT_PROTECTION
    ],
    useless: [SOULS_CRY, WIND_SPIRIT, REVITALIZATION_CONTRACT, SPIRIT_COMMUNION],
    preferredSet: 'vigor',
    notes:
      'Топ-заклинатели: Грааль «жизни» (50%), Пергамент «жизни» (35%, «магии» — 12%), Компас «жизни» (27%, «магии» — 19%), Колокол «магии» (36%), Зеркало — почти поровну («жизни» 26%, «магии» 21%); у Vault (195 игроков) так же — четыре «жизни» и Колокол «магии». Гайды (MetaRoad, Evripides, aion2-guides) советуют три «жизни» (Грааль, Пергамент, Компас) и две «магии» (Колокол и Зеркало — бонус ОМ), а Зеркало «жизни» (Видение — перезарядка) дают как вариант. Корейские арканы почти все «магии» — не переносятся. Главное — карты, которые доводят Синтез, Воспламенение и Духа огня до 20, и Удар элемента с Чистым разумом (Skycoach, GamerBlurb): Пергамент — Дух огня, Синтез, Шоковая заморозка; Компас — Воспламенение, Дух воды; Грааль — Синтез, Воспламенение, Чистый разум, Удар элемента; Колокол — Удар элемента, Слияние стихий; Зеркало — Чистый разум, Обратный поток (MetaRoad, Evripides, init.rb).'
  },

  daevanion: {
    goals: [
      {
        id: 'core-skills',
        name: 'Главные умения +4',
        description:
          '+1 к Синтезу элементов, Воспламенению, Призыву: Дух огня и Шоковой заморозке на каждой из четырёх досок. Воспламенение и Синтез +1 на Неджакане и Джикеле берут 96–98% топ-игроков, Духа огня — 94–95%; MetaRoad, Vault и aion2-guides начинают с этих узлов.',
        skills: [ELEMENTAL_FUSION, COMBUSTION, FIRE_SPIRIT, COLD_SHOCK],
        boards: [51, 52, 53, 54]
      },
      {
        id: 'damage-passives',
        name: 'Удар элемента и Чистый разум',
        description: 'Главные пассивки — +4 каждой (MetaRoad, aion2-guides). Удар элемента +1 на Неджакане берут 96% топ-игроков.',
        skills: [SPIRIT_STRIKE, MENTAL_FOCUS],
        boards: [51, 52, 53, 54]
      },
      {
        id: 'spirits-support',
        name: 'Дух воды и умения поддержки',
        description:
          '+1 к Призыву: Дух воды (MetaRoad — на всех четырёх досках), затем Призыв: Дух земли, Кооперация: Проклятие, Повелитель пространства (Vault), Слияние стихий и Оживление духа (aion2-guides).',
        skills: [WATER_SPIRIT, EARTH_SPIRIT, CURSE, DIMENSIONAL_CONTROL, ELEMENT_UNIFICATION, SPIRIT_REVITALIZATION],
        boards: [51, 52, 53, 54]
      },
      {
        id: 'big-stats',
        name: 'Крупные статы досок',
        description:
          'Оранжевые узлы по 1,5%: СКР боя и сокращение перезарядки (Неджакан), урон и стойкость к урону (Джикел), крит. урон (Байзел), мульти-удар (Триниэль). Стойкость к крит. урону и сопротивление мульти-удару — пропустить (MetaRoad).',
        boards: [51, 52, 53, 54],
        nodes: [510033, 510193, 510043, 510183, 520043, 520183, 520033, 520193, 530033, 530193, 540023, 540197, 540209]
      },
      {
        id: 'ariel-pve',
        name: 'Ариэль: урон в PvE и по боссам',
        description:
          'Доска PvE (кристаллы Ариэль — со сложных экспедиций): четыре «Увелич. урона в PvE +1,5%», четыре «Увелич. урона по боссам +1%», четыре «Стойкость к урону в PvE +1,5%» и два «Крит. удар +10» — маршрут aion2-guides; два узла крита — ближайшие к центру (оценка помощника). У большинства топ-заклинателей доска пока пустая. Асфель — только PvP.',
        boards: [55],
        nodes: [550001, 550008, 550218, 550225, 550032, 550074, 550152, 550194, 550015, 550106, 550120, 550211, 550081, 550145]
      }
    ],
    notes:
      'Не тратить очки на узлы Призыва: Дух воздуха и Вопля души (MetaRoad), Беспорядочного огня (Evripides — +0), Контракта оживления и Духовного единства (если очки не лишние). У топ-игроков в среднем занято 67 из 88 узлов Неджакана, 61 — Джикела, 66 — Байзела, 70 из 116 — Триниэля. Четыре первые доски стоят 570 кристаллов — все не заполнить (MetaRoad, aion2-guides).'
  },

  genus: {
    stats: [
      { stat: S.pveDamageBoost, weight: 5, note: 'Ячейка 4 у Разума, Диких, Природы и Мутантов — увелич. урона в PvE (MetaRoad)' },
      { stat: S.double, weight: 5, note: 'Ячейка 4 у Особого — Сокрушающий удар (MetaRoad); Evripides — «самый сильный атакующий стат»' },
      { stat: S.maxAttack, weight: 5, note: 'Ячейки 1 и 5 — доп. АТК или макс. АТК; качать род до 10 перед запиранием (MetaRoad)' },
      { stat: S.attackBonus, weight: 5 },
      { stat: S.pveDamageTolerance, weight: 4, note: 'Ячейка 7 — стойкость к урону в PvE (у Особого — стойкость к урону; MetaRoad)' },
      { stat: S.damageTolerance, weight: 4 },
      { stat: S.hpIncrease, weight: 4, note: 'Ячейки 2 и 8 — увеличение ОЗ (MetaRoad)' },
      { stat: S.accuracyBonus, weight: 4, note: 'Ячейки 3, 6, 9 — доп. меткость до 1 500 меткости, потом доп. урон от камней силы (MetaRoad)' },
      { stat: S.pveAccuracy, weight: 4 },
      { stat: S.perfect, weight: 4, note: 'Evripides: Совершенный удар тоже важен' },
      { stat: S.critDamageBoost, weight: 4 },
      { stat: S.weaponDamageBoost, weight: 4 },
      { stat: S.damageBoost, weight: 4 },
      { stat: S.powerShardDamage, weight: 3 },
      { stat: S.critical, weight: 3 },
      { stat: S.attack, weight: 3 },
      { stat: S.accuracy, weight: 3 },
      { stat: S.pveAttack, weight: 3 },
      { stat: S.bossAttack, weight: 3 },
      { stat: S.criticalAttack, weight: 3 },
      { stat: S.penetration, weight: 3 },
      { stat: S.endurance, weight: 2 },
      { stat: S.hp, weight: 2 },
      { stat: S.backAttack, weight: 2 },
      { stat: S.backAttackDamageBoost, weight: 2 },
      { stat: S.frontAttack, weight: 2 },
      { stat: S.frontAttackDamageBoost, weight: 2 },
      { stat: S.defenseBonus, weight: 2 },
      { stat: S.pveDefense, weight: 2 },
      { stat: S.mp, weight: 2 },
      { stat: S.block, weight: 1 },
      { stat: S.criticalDamageTolerance, weight: 1 },
      { stat: S.bossDefense, weight: 1 },
      { stat: S.frontDefense, weight: 1 }
    ],
    notes:
      'Запирайте только высокие уникальные значения, род перед запиранием — до ур. 10 (MetaRoad). Раскладка по ячейкам — MetaRoad: 1 и 5 — доп. или макс. АТК, 2 и 8 — увеличение ОЗ, 3/6/9 — доп. меткость (после 1 500 меткости — доп. урон от камней силы), 4 — увелич. урона в PvE или Сокрушающий удар у Особого, 7 — стойкость к урону в PvE. Skycoach: PvE-бонусы и мульти-удар.'
  },

  titles: {
    attack: [T.unboundByGenus, T.guardianOfVerteron, T.guardianOfAltgard],
    defense: [T.saintOfVerteron, T.saintOfAltgard, T.ruleAllCreation],
    utility: [T.throughHellAndBack, T.emptyCloset, T.encounteringZikelsCore, T.encounteringKaisinelsCore],
    notes:
      "Что носят топ-заклинатели: атака — Unbound by Genus (43% в сумме двух версий), затем Защитник Альтгарда (13%; для Элийцев — Защитник Бертрона); защита — Святой Альтгарда / Бертрона (76%), Rule All Creation (9%); другое — Прошедший огонь и воду (54%), Encountering Zikel's Core (12%). MetaRoad советует Unbound by Genus, Rule All Creation (нужно 200 видов питомцев) и Empty Closet (СКР боя и перезарядка); в Корее Empty Closet носят 68% (aion2-meta). Если надетого титула нет в списке, а из списка ничего не собрано — приложение ничего не меняет и показывает цель."
  },

  statTargets: [
    {
      id: 'accuracy',
      name: 'Меткость в PvE',
      kind: 'content',
      stats: [S.accuracy, S.accuracyBonus, S.pveAccuracy],
      goals: [
        { value: 800, label: 'Трансцендентность 4' },
        { value: 1200, label: 'Лудра, обычная и сложная' },
        { value: 1500, label: 'цель MetaRoad и Evripides (с запасом)' }
      ],
      raise: [S.accuracyBonus, S.pveAccuracy, S.accuracy],
      note: 'Меткость + доп. меткость + меткость в PvE, без бафов. Порог — блок босса, от класса не зависит: меткость сверх него не нужна. 800 и 1 200 — отчёты игроков глобальной версии (timesaver.gg, 8.11.2026; для сложной Лудры — возможно, до 1 400); 1 500 — цель MetaRoad и Evripides для заклинателя. Официальных цифр нет. Благословение пламени ур. 5 даёт ещё +100 на время баффа.'
    },
    {
      id: 'critical',
      name: 'Крит. удар',
      kind: 'content',
      stats: [S.critical],
      goals: [{ value: 1700, label: 'предел 50% шанса против Лудры' }],
      note: 'Шанс крита в глобальной версии упирается в 50% за вычетом сопротивления босса; для Лудры это ~1 700 (отчёты игроков, timesaver.gg). Благословение пламени ур. 10 даёт +100 крита на время баффа, Кооперация: Проклятие с вариантом 5 критует всегда.'
    },
    {
      id: 'cooldown',
      name: 'Сокращение перезарядки',
      kind: 'content',
      stats: [S.cooldown],
      goals: [
        { value: 2000, label: 'минимум (MetaRoad, Evripides)' },
        { value: 3300, label: 'Разложение висит весь бой' }
      ],
      note: 'Кооперация: Разложение на ур. 20 действует 30 с, и с ~33% сокращения перезарядки висит без перерыва (Evripides, MetaRoad, aion2-guides). Камнями не поднять — только строки души, арканы, доски, крылья и пантеон (ExpCarry).'
    },
    ...(
      [
        [S.might, 'Мощь', 45],
        [S.precision, 'Точность', 26.8],
        [S.dexterity, 'Ловкость', 24.1],
        [S.constitution, 'Здоровье', 18.2],
        [6, 'Воля', 9.5]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-заклинателей' }],
      note: 'Средний уровень у 1 137 топ-заклинателей глобальной версии (metabot.gg, данные на 8.11.2026) — ориентир, а не требование.'
    })),
    ...(
      [
        [11, '[Сиэль] Время', 58.2],
        [7, '[Неджакан] Справедливость', 49.5],
        [14, '[Триниэль] Смерть', 44.8],
        [8, '[Байзел] Свобода', 39.6],
        [13, '[Джикел] Разрушение', 36.3],
        [17, '[Израфель] Пространство', 32.9],
        [10, '[Юстиэль] Жизнь', 30],
        [15, '[Румиэль] Мудрость', 27.7],
        [9, '[Кайсинель] Видение', 25.3],
        [16, '[Маркутан] Судьба', 24.2]
      ] as const
    ).map(([stat, name, value]) => ({
      id: `top-${stat}`,
      name,
      kind: 'top' as const,
      stats: [stat],
      goals: [{ value, label: 'в среднем у топ-заклинателей' }],
      note: 'Стат бога: средний у 1 137 топ-заклинателей глобальной версии (metabot.gg, данные на 8.11.2026). Растёт от досок, аркан и пантеона.'
    }))
  ],

  rotation: [
    'До пула: Шоковая заморозка на ЛКМ, пока не наберётся 5 зарядов Дрожи земли (+2% АТК каждый, специализация 4) — духи копируют ваши статы в момент призыва (Tsuruf, Evripides). «Отозвать всех духов» — на удобную клавишу (MetaRoad, Evripides).',
    'Баффы — до духов: Благословение пламени, Усиление: Благословение духа, затем Призыв: Древний дух. Дух, призванный до баффов, их уже не получит (все гайды).',
    'Кооперация: Разложение на цель — и дальше по откату весь бой: под Разложением дух бьёт сильнее.',
    'Синтез элементов — как только есть «Четыре элемента»: каждое умение духа даёт элемент, Древний дух — все четыре сразу. Не держите их: пока «Четыре элемента» активны, новые элементы не копятся (GAMES.GG, GamerBlurb). Придержать стоит, только если босс вот-вот станет неуязвим или уйдёт (ExpCarry, GamerBlurb).',
    'Обычные духи по кругу: Призыв: Дух воды, Призыв: Дух земли, последним — Призыв: Дух огня (сильнейший — дольше останется). Призыв: Дух воздуха в эндгейме большинство гайдов не берёт.',
    'Между Синтезами — Кооперация: Проклятие по откату, Повелитель пространства, как только стал доступен (восполняет ОМ), и Воспламенение как заполнитель. Шоковая заморозка на ЛКМ — ОМ и заряды Дрожи земли.',
    'Беспорядочный огонь — только по цели со сбитой шкалой оглушения. Баффы и Древний дух — снова, как только готовы, и снова в порядке «сначала баффы». Вопль души (страх) против боссов бесполезен.'
  ],

  combat: {
    macroKey: 'ПКМ',
    macros: [
      {
        id: 'spirits',
        name: 'Ячейка духов',
        skills: [ELEMENTAL_FUSION, WATER_SPIRIT, EARTH_SPIRIT, FIRE_SPIRIT],
        note: 'Синтез элементов — в ряду 0: перезарядки у него нет, но доступен он только при «Четырёх элементах», и ячейка применит его, как только они появятся (MetaRoad, Evripides, Skycoach, Hemi, Grobs; Синтез стоит в 451 из 463 публичных связок — Vault). Дальше духи: Дух воды, Дух земли, последним — Дух огня: он сильнейший и, призванный последним, дольше остаётся (MetaRoad, Evripides, Skycoach, aLuckyRO). init.rb (его связку копируют 52% публичных) кладёт сюда вместо Синтеза Разложение, а Синтез — в ячейку урона; Grobs добавляет Дух воздуха. Если взяли специализацию 4 Синтеза (заряд до +200%) — уберите его из связки и жмите вручную: связка отпускает заряд сразу (aLuckyRO).'
      },
      {
        id: 'damage',
        name: 'Ячейка урона',
        skills: [JOINTSTRIKE_CORRODE, CURSE, DIMENSIONAL_CONTROL, COMBUSTION],
        note: 'Кооперация: Разложение — в ряду 0: по откату, чтобы дебафф висел весь бой (в связке у 70% публичных билдов с ним — Vault). Затем Кооперация: Проклятие (перезарядка), Повелитель пространства (когда доступен) и Воспламенение — заполнитель в ряду 3: ячейка всегда готова, поэтому шаг последний. Ровно так у Evripides, Hemi и корейского топа (aion2-meta); MetaRoad держит Разложение отдельным шагом связки, init.rb — Проклятие, Синтез, Повелитель, Воспламенение.'
      }
    ],
    delayMs: 10,
    delayNote:
      'Связка работает, пока её клавиша зажата: идёт по шагам сверху вниз и по кругу, пропуская то, что на откате. 10 мс — почти у всех публичных связок заклинателей, где задержка задана (194 из 207 шагов; Vault), и у MetaRoad, Evripides, aLuckyRO; при пинге 70–100 мс — 30–50 мс (aLuckyRO, aion2-guides; Hemi держит 50 мс). Правило порядка: ячейка с заполнителем (Воспламенение) — последней. Связка Evripides и MetaRoad рассчитана на СКР боя от ~65% и пинг до ~60 мс.',
    manual: [
      {
        skill: COLD_SHOCK,
        key: 'ЛКМ',
        when: 'Держать зажатой вместе со связкой: восполняет ОМ и держит 5 зарядов Дрожи земли (+2% АТК каждый, специализация 4). Лишняя базовая атака ради пятого заряда важнее следующего призыва (Evripides, MetaRoad). Так у MetaRoad, Evripides, aLuckyRO и Grobs; в 56% публичных связок её кладут прямо в связку (Vault).'
      },
      {
        skill: FLAME_BLESSING,
        key: '5',
        when: 'Перед Древним духом и дальше по откату. Действует только на вас, не на духов.'
      },
      {
        skill: SPIRITS_BENEDICTION,
        key: '6',
        when: 'Перед Древним духом и обычными духами, дальше по откату: духи получают бафф только в момент призыва.'
      },
      {
        skill: ANCIENT_SPIRIT,
        key: '7',
        when: 'Только после баффов и когда цель можно бить (ExpCarry); корейский топ — когда Слияние стихий набрало 5 стопок (aion2-meta). Вне связки — у 92% публичных связок (Vault).'
      },
      {
        skill: RAPID_SCATTERSHOT,
        key: '2',
        when: 'Только по цели со сбитой шкалой оглушения — иначе не работает (MetaRoad, aion2-guides).'
      },
      {
        skill: DEFIANCE,
        key: '3',
        when: 'Когда оглушили, опрокинули или напугали. На ур. 16 со специализацией 5 — ещё +50% стойкости к урону в PvE.'
      },
      {
        skill: DESTRUCTIVE_ATTACK,
        optional: true,
        when: 'Если надета вместо Благословения пламени: в сбитую шкалу оглушения, заряд — только вручную (GAMES.GG, Vault).'
      },
      { skill: SIPHON, optional: true, when: 'Соло: щит и поглощение ОЗ, когда урон по вам мешает фармить.' },
      { skill: COMMAND_PROXY, optional: true, when: 'Перед тяжёлым ударом босса, если стоит вместо другой стигмы.' },
      {
        skill: WIND_SPIRIT,
        optional: true,
        when: 'Прокачка и первая неделя: лишний источник элементов — быстрее к Синтезу (aLuckyRO; корейский топ и Grobs держат и в эндгейме).'
      }
    ],
    opener: [
      { skill: COLD_SHOCK, note: 'ЛКМ — 5 зарядов Дрожи земли' },
      { skill: FLAME_BLESSING, note: 'до духов' },
      { skill: SPIRITS_BENEDICTION, note: 'до духов' },
      { skill: ANCIENT_SPIRIT, note: 'копирует баффы' },
      { skill: JOINTSTRIKE_CORRODE, note: 'дебафф на весь бой' },
      { skill: ELEMENTAL_FUSION, note: '«Четыре элемента» от Древнего духа' },
      { skill: WATER_SPIRIT },
      { skill: EARTH_SPIRIT },
      { skill: FIRE_SPIRIT, note: 'последним — дольше останется' },
      { skill: CURSE },
      { skill: COMBUSTION, note: 'дальше — связка' }
    ],
    openerNote:
      'Порядок MetaRoad, Evripides, Skycoach и GamerBlurb (Благословение пламени → Благословение духа → Древний дух → Разложение), заряды Дрожи земли до баффов — Tsuruf и Evripides. kraybex призывает Духа огня заранее, без цели, battlelitany — двух духов до Древнего: так тоже играют, но эти духи баффов не получат. Дальше — связка, Синтез — как только есть «Четыре элемента».',
    oneButton: {
      events: [
        { key: 'ПКМ', down: true, waitMs: 10 },
        { key: 'ЛКМ', down: true, waitMs: 20 },
        { key: 'ЛКМ', down: false, waitMs: 35 },
        { key: 'ПКМ', down: false, waitMs: 0 }
      ],
      repeatMs: 10,
      note: 'То же, что держать обе кнопки (так играют MetaRoad, Evripides, aLuckyRO), но на одной боковой кнопке: макрос в ПО мыши (SteelSeries GG, Razer Synapse, G Hub) с автоповтором, пока она зажата. ПКМ — клавиша связки, ЛКМ — Шоковая заморозка; Evripides сам записывает ПКМ + ЛКМ в Razer Synapse. Клик 20 мс и пауза 35 мс — из разбора корейских стражей с включённым резервом умений: это про ввод игры, а не про класс (оценка помощника — для заклинателя отдельно не проверялось). ПКМ на миг отпускается в конце прогона — поэтому ячейка с всегда готовым Воспламенением в связке последняя. Учтите: aion2-meta.com пишет, что NCSOFT запрещает макросы мыши и сторонних программ, — решайте сами.'
    },
    notes:
      'Клавиши — подсказка, а не правило (раскладка MetaRoad и Evripides). Включите резерв умений (Skill Queue) и проверьте его сами (ExpCarry). aLuckyRO советует сначала неделю поиграть без связки, чтобы понять класс. В режиме с прицелом (экшен) Шоковая заморозка нужна на ЛКМ или в связке ради ОМ; в классическом режиме персонаж при высокой скорости атаки бьёт ею сам между умениями (Vault).'
  },

  tips: [
    {
      title: 'Связка: две ячейки',
      text: 'Шаг 1 — ячейка духов: Синтез элементов (ряд 0), Дух воды, Дух земли, Дух огня. Шаг 2 — ячейка урона: Кооперация: Разложение (ряд 0), Кооперация: Проклятие, Повелитель пространства, Воспламенение. Связка — на ПКМ, задержка 10 мс; Шоковая заморозка на ЛКМ — держать обе кнопки. Благословение пламени, Благословение духа, Древний дух, Беспорядочный огонь и Снятие шока — вручную. Подробно — на странице «Ротация».'
    },
    {
      title: 'Сначала баффы, потом духи',
      text: 'Дух копирует ваши статы и баффы в момент призыва (MetaRoad, Evripides, GamerBlurb, OneTimeACraft): бафф, включённый после призыва, на уже вызванного духа не действует. Поэтому перед Древним духом — 5 зарядов Дрожи земли (Шоковая заморозка), Благословение пламени и Благословение духа. Древний дух без баффов — главная ошибка класса (Evripides).'
    },
    {
      title: 'Где гайды расходятся',
      text: 'Заряд Синтеза (вариант 4): у aLuckyRO удар ~21 000 вместо ~7 000, но тогда Синтез только вручную — почти все держат его в связке без заряда (451 из 463 публичных связок). Дух воздуха: корейский топ и Grobs держат всех четырёх духов, большинство глобальных гайдов — нет. Четвёртая стигма: Благословение пламени (топ: 82%) или Кооперация: Наступление погибели на боссах со шкалой оглушения (32%). Зеркало аркан: «магии» (гайды) или «жизни» (игроки).'
    },
    {
      title: 'Цели по статам',
      text: 'MetaRoad и Evripides (это одна линия гайдов) ставят цели сезона 1: Сокрушающий удар 25%, сокращение перезарядки от 20% (для Разложения без перерыва — ~33%), меткость 1 500, СКР боя от ~65%. До Сокрушающего удара 25% далеко почти всем: в примерах самого Evripides — 6–9%. Его дают Чистый разум и строки души на броне.'
    },
    {
      title: 'ОМ',
      text: 'Заклинателю часто не хватает ОМ (Skycoach, GAMES.GG). Восполняют Шоковая заморозка, Повелитель пространства и Дух воды. В первые дни — вариант 1 у Воспламенения (−20% расхода) и у Шоковой заморозки (+20% ОМ), позже — меняйте на урон (aLuckyRO, GAMES.GG). Skycoach берёт с собой зелья ОМ.'
    },
    {
      title: 'Корея и глобальная версия',
      text: 'В глобальной версии 4 слота стигм — на один меньше, чем в Корее, поэтому корейские наборы с Поглощением и Приказом: Жертва духа не переносятся. Корейский топ носит арканы почти все «магии», глобальный — в основном «жизни». Гайд Evripides (основа MetaRoad и aion2-guides) — адаптация с тайваньского клиента.'
    },
    {
      title: 'Крылья и пантеон',
      text: 'Крылья: Talisra (−4% перезарядки, меткость, АТК) — цель MetaRoad; у топ-заклинателей чаще Ultimate Daeva (38%) и Dark Veil (19%). Пантеон: MetaRoad — сначала Видение (перезарядка), затем Мудрость (Сокрушающий удар); статуи — Свобода, Смерть, Пространство; Skycoach — АТК, меткость, крит, перезарядка. У топ-заклинателей больше всего Времени и Справедливости, а Видения и Мудрости — почти меньше всех.'
    }
  ],

  checklist: [
    {
      id: 'macro',
      text: 'Настроить связку: ячейка духов (Синтез элементов в ряду 0, Дух огня — в ряду 3), затем ячейка урона (Воспламенение последним); на ПКМ, задержка 10 мс'
    },
    {
      id: 'binds',
      text: 'Шоковая заморозка — на ЛКМ; баффы, Древний дух, Беспорядочный огонь и Снятие шока — на отдельных клавишах; «отозвать всех духов» — на удобной клавише'
    },
    {
      id: 'stigmas',
      text: 'Стигмы: Призыв: Древний дух, Усиление: Благословение духа, Кооперация: Разложение, Благословение пламени'
    },
    {
      id: 'breakpoint',
      text: 'Призыв: Древний дух — ур. 15 (умение после 5 атак вместо 7); Шоковая заморозка — специализация 4 (заряды Дрожи земли, +2% АТК каждый)'
    },
    { id: 'buff-first', text: 'Перед каждым Древним духом — сначала баффы: дух копирует их в момент призыва' },
    { id: 'weapon15', text: 'Сфера и наручи — заточка +15 (так у половины топ-заклинателей)' },
    { id: 'arcana-vigor', text: 'Арканы: Грааль, Пергамент и Компас «жизни», Колокол «магии», Зеркало — любое' }
  ]
}
