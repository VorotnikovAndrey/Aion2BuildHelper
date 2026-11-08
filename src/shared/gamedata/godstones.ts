// Священные камни (Theostone): гнездо в оружии и наручах. Справочник — npm run gamedata (metabot.gg),
// иконки — public/icons/godstones/<ID>.webp. Русских названий в доступных данных нет — показываем
// английские, а эффект переводим по шаблонам (их в клиенте немного).

import type { ItemGrade } from './slots'
import godstonesJson from './generated/godstones.json'

export interface GodstoneDef {
  id: number
  en: string
  grade: ItemGrade
  /** Эффект как в клиенте (английский). */
  effect: string
  icon: string | null
}

export const GODSTONES = godstonesJson as GodstoneDef[]
const byId = new Map(GODSTONES.map((g) => [g.id, g]))

export const godstoneDef = (id: number): GodstoneDef | undefined => byId.get(id)
export const godstoneIconSrc = (id: number): string => `./icons/godstones/${id}.webp`

/** Сколько гнёзд под священный камень у слота: по одному в оружии и наручах (окно вещи на странице билда Questlog). */
export function godstoneSlots(slot: number): number {
  return slot === 1 || slot === 2 ? 1 : 0
}

const STATUS_RU: Record<string, string> = {
  Stun: 'оглушение',
  Paralyze: 'паралич',
  Root: 'обездвиживание',
  Seal: 'печать',
  Blind: 'ослепление'
}
const ELEMENT_RU: Record<string, string> = { Fire: 'огнём', Water: 'водой', Wind: 'ветром', Earth: 'землёй' }
const DOT_RU: Record<string, string> = { Bleed: 'кровотечения', Poison: 'яда' }

/** Эффект по-русски; если шаблон незнакомый — английский текст как есть. */
export function godstoneEffectRu(effect: string): string {
  const [main, cd] = effect.split('·').map((x) => x.trim())
  const cool = cd?.match(/Cooldown: (\d+)s/)?.[1]
  const tail = cool ? ` Перезарядка эффекта — ${cool} с.` : ''
  let m = main.match(/^Has a (\d+)% chance to inflict \[(\w+)\] for (\d+)s on attack$/)
  if (m && STATUS_RU[m[2]]) return `При атаке с шансом ${m[1]}% — ${STATUS_RU[m[2]]} на ${m[3]} с.${tail}`
  m = main.match(/^Has a (\d+)% chance to inflict -(\d+)% (Combat|Move) Speed for (\d+)s on attack$/)
  if (m) return `При атаке с шансом ${m[1]}% — −${m[2]}% ${m[3] === 'Combat' ? 'скорости боя' : 'скорости движения'} цели на ${m[4]} с.${tail}`
  m = main.match(/^Has a (\d+)% chance to deal ([\d,]+) (AoE )?(\w+) damage (?:to a single target|to up to (\d+) targets) on attack$/)
  if (m && ELEMENT_RU[m[4]])
    return `При атаке с шансом ${m[1]}% — ${m[2].replace(',', ' ')} урона ${ELEMENT_RU[m[4]]} ${m[3] ? `по площади (до ${m[5]} целей)` : 'по одной цели'}.${tail}`
  m = main.match(/^Has a (\d+)% chance to deal ([\d,]+) (\w+) damage every (\d+)s for (\d+)s on attack$/)
  if (m && DOT_RU[m[3]]) return `При атаке с шансом ${m[1]}% — ${m[2].replace(',', ' ')} урона ${DOT_RU[m[3]]} каждые ${m[4]} с в течение ${m[5]} с.${tail}`
  return effect
}
