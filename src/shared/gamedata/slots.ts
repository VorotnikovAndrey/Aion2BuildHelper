import { t } from '../i18n'
// Слоты экипировки. Номера — как в данных игры (их же использует оверлей Questlog).

export type SlotGroup = 'weapon' | 'armor' | 'accessory' | 'arcana'

export interface SlotDef {
  slot: number
  key: string
  ru: string
  en: string
  group: SlotGroup
}

export const SLOTS: SlotDef[] = [
  { slot: 1, key: 'weapon', ru: 'Оружие', en: 'Weapon', group: 'weapon' },
  { slot: 2, key: 'guarder', ru: 'Наручи', en: 'Guard', group: 'weapon' },
  { slot: 3, key: 'helmet', ru: 'Шлем', en: 'Helmet', group: 'armor' },
  { slot: 4, key: 'shoulder', ru: 'Наплечники', en: 'Pauldrons', group: 'armor' },
  { slot: 5, key: 'torso', ru: 'Нагрудник', en: 'Top', group: 'armor' },
  { slot: 6, key: 'pants', ru: 'Набедренники', en: 'Legs', group: 'armor' },
  { slot: 7, key: 'gloves', ru: 'Перчатки', en: 'Gloves', group: 'armor' },
  { slot: 8, key: 'boots', ru: 'Сапоги', en: 'Shoes', group: 'armor' },
  { slot: 19, key: 'cape', ru: 'Плащ', en: 'Cloak', group: 'armor' },
  { slot: 9, key: 'pendant', ru: 'Подвеска', en: 'Pendant', group: 'accessory' },
  { slot: 10, key: 'necklace', ru: 'Ожерелье', en: 'Necklace', group: 'accessory' },
  { slot: 11, key: 'leftEarring', ru: 'Серьга 1', en: 'Earring 1', group: 'accessory' },
  { slot: 12, key: 'rightEarring', ru: 'Серьга 2', en: 'Earring 2', group: 'accessory' },
  { slot: 13, key: 'leftRing', ru: 'Кольцо 1', en: 'Ring 1', group: 'accessory' },
  { slot: 14, key: 'rightRing', ru: 'Кольцо 2', en: 'Ring 2', group: 'accessory' },
  { slot: 15, key: 'leftBracelet', ru: 'Браслет 1', en: 'Bracelet 1', group: 'accessory' },
  { slot: 16, key: 'rightBracelet', ru: 'Браслет 2', en: 'Bracelet 2', group: 'accessory' },
  { slot: 17, key: 'belt', ru: 'Пояс', en: 'Belt', group: 'accessory' },
  { slot: 18, key: 'leftBrooch', ru: 'Брошь 1', en: 'Brooch 1', group: 'accessory' },
  { slot: 20, key: 'rightBrooch', ru: 'Брошь 2', en: 'Brooch 2', group: 'accessory' },
  { slot: 22, key: 'amulet', ru: 'Амулет', en: 'Amulet', group: 'accessory' },
  { slot: 23, key: 'leftRune', ru: 'Руна 1', en: 'Rune 1', group: 'accessory' },
  { slot: 24, key: 'rightRune', ru: 'Руна 2', en: 'Rune 2', group: 'accessory' },
  { slot: 25, key: 'leftSeal', ru: 'Печать 1', en: 'Seal 1', group: 'accessory' },
  { slot: 26, key: 'rightSeal', ru: 'Печать 2', en: 'Seal 2', group: 'accessory' },
  { slot: 41, key: 'grail', ru: 'Грааль', en: 'Chalice', group: 'arcana' },
  { slot: 42, key: 'parchment', ru: 'Пергамент', en: 'Parchment', group: 'arcana' },
  { slot: 43, key: 'compass', ru: 'Компас', en: 'Compass', group: 'arcana' },
  { slot: 44, key: 'bell', ru: 'Колокол', en: 'Bell', group: 'arcana' },
  { slot: 45, key: 'mirror', ru: 'Зеркало', en: 'Mirror', group: 'arcana' },
  { slot: 46, key: 'libra', ru: 'Весы', en: 'Libra', group: 'arcana' },
  { slot: 47, key: 'key', ru: 'Ключ', en: 'Key', group: 'arcana' },
  { slot: 48, key: 'hourglass', ru: 'Песочные часы', en: 'Hourglass', group: 'arcana' },
  { slot: 49, key: 'dice', ru: 'Кости', en: 'Dice', group: 'arcana' },
  { slot: 50, key: 'lantern', ru: 'Фонарь', en: 'Lantern', group: 'arcana' }
]

const bySlot = new Map(SLOTS.map((s) => [s.slot, s]))
export const slotDef = (slot: number): SlotDef => bySlot.get(slot) ?? { slot, key: `slot${slot}`, ru: `Слот ${slot}`, en: `Slot ${slot}`, group: 'accessory' }

export const SLOT_GROUPS: { id: SlotGroup; ru: string }[] = [
  { id: 'weapon', ru: t('Оружие') },
  { id: 'armor', ru: t('Броня') },
  { id: 'accessory', ru: t('Аксессуары') },
  { id: 'arcana', ru: t('Арканы') }
]

/** Порядок слотов на экране «Шмот»: как в окне персонажа. */
export const SLOT_ORDER = SLOTS.map((s) => s.slot)

/**
 * Грейд предмета. Ключи — как во внутренних данных игры (так же названы рамки иконок):
 * Common серый, Rare зелёный, Legend синий, Unique золотой, Epic оранжевый, Mythic красный, Special бирюзовый.
 * В ID экипировки пятая цифра — грейд: 210330053 → «3» (уникальный). Чем меньше цифра, тем выше грейд.
 */
export type ItemGrade = 'mythic' | 'epic' | 'unique' | 'legend' | 'rare' | 'common' | 'special' | 'unknown'

export const GRADES: Record<ItemGrade, { ru: string; en: string }> = {
  mythic: { ru: 'Мифический', en: 'Mythic' },
  epic: { ru: 'Эпический', en: 'Epic' },
  unique: { ru: 'Уникальный', en: 'Unique' },
  legend: { ru: 'Легендарный', en: 'Legend' },
  rare: { ru: 'Редкий', en: 'Rare' },
  common: { ru: 'Обычный', en: 'Common' },
  special: { ru: 'Особый', en: 'Special' },
  unknown: { ru: '—', en: '—' }
}

export function gradeOfItem(itemId: number): ItemGrade {
  const digit = Math.floor(itemId / 10000) % 10
  return ({ 1: 'mythic', 2: 'epic', 3: 'unique', 4: 'legend', 5: 'rare', 6: 'common' } as Record<number, ItemGrade>)[digit] ?? 'unknown'
}
