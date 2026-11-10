// Священные камни (Theostone): гнездо в оружии и наручах. Справочник — npm run gamedata (metabot.gg),
// иконки — public/icons/godstones/<ID>.webp. Русских названий в доступных данных нет — показываем
// английские, а эффект переводим по шаблонам (их в клиенте немного).

import type { ItemGrade } from './slots'
import godstonesJson from './generated/godstones.json'
import { t } from '../i18n'

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
  Stun: t('оглушение'),
  Paralyze: t('паралич'),
  Root: t('обездвиживание'),
  Seal: t('печать'),
  Blind: t('ослепление')
}
const ELEMENT_RU: Record<string, string> = { Fire: t('огнём'), Water: t('водой'), Wind: t('ветром'), Earth: t('землёй') }
const DOT_RU: Record<string, string> = { Bleed: t('кровотечения'), Poison: t('яда') }

/** Эффект по-русски; если шаблон незнакомый — английский текст как есть. */
export function godstoneEffectRu(effect: string): string {
  const [main, cd] = effect.split('·').map((x) => x.trim())
  const cool = cd?.match(/Cooldown: (\d+)s/)?.[1]
  const tail = cool ? t(' Перезарядка эффекта — {cool} с.', { cool }) : ''
  let m = main.match(/^Has a (\d+)% chance to inflict \[(\w+)\] for (\d+)s on attack$/)
  if (m && STATUS_RU[m[2]]) return t('При атаке с шансом {m}% — {STATUS_RU} на {m2} с.{tail}', { m: m[1], STATUS_RU: STATUS_RU[m[2]], m2: m[3], tail })
  m = main.match(/^Has a (\d+)% chance to inflict -(\d+)% (Combat|Move) Speed for (\d+)s on attack$/)
  if (m)
    return t('При атаке с шансом {m}% — −{m2}% {p} цели на {m3} с.{tail}', {
      m: m[1],
      m2: m[2],
      p: m[3] === 'Combat' ? t('скорости боя') : t('скорости движения'),
      m3: m[4],
      tail
    })
  m = main.match(/^Has a (\d+)% chance to deal ([\d,]+) (AoE )?(\w+) damage (?:to a single target|to up to (\d+) targets) on attack$/)
  if (m && ELEMENT_RU[m[4]])
    return t('При атаке с шансом {m}% — {replace} урона {ELEMENT_RU} {p}.{tail}', {
      m: m[1],
      replace: m[2].replace(',', ' '),
      ELEMENT_RU: ELEMENT_RU[m[4]],
      p: m[3] ? t('по площади (до {m} целей)', { m: m[5] }) : t('по одной цели'),
      tail
    })
  m = main.match(/^Has a (\d+)% chance to deal ([\d,]+) (\w+) damage every (\d+)s for (\d+)s on attack$/)
  if (m && DOT_RU[m[3]])
    return t('При атаке с шансом {m}% — {replace} урона {DOT_RU} каждые {m2} с в течение {m3} с.{tail}', {
      m: m[1],
      replace: m[2].replace(',', ' '),
      DOT_RU: DOT_RU[m[3]],
      m2: m[4],
      m3: m[5],
      tail
    })
  return effect
}
