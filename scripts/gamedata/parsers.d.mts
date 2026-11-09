// Типы для parsers.mjs — чтобы проверка обновлений в приложении (TypeScript) знала форму данных.

export interface ParsedSkill {
  id: number
  slug: string
  en: string
  cls: string
  type: 'active' | 'passive' | 'stigma'
  unlock: number | null
  order: number
}
export interface ParsedSpec {
  n: number
  level: number | null
  en: string
}
export interface ParsedNode {
  id: number
  row: number
  col: number
  type: string
  grade?: string
  cost?: number
  skill?: number
  levels?: number
  stats?: unknown[]
}
export interface ParsedBoard {
  id: number
  en: string
  needLevel: number
  nodes: ParsedNode[]
}
export interface ParsedTitle {
  id: number
  en: string
}
export interface ParsedGodstone {
  id: number
  en: string
  effect: string
}

export const CLASSES: string[]
export function linesOf(html: string): string[]
export function parseSkills(html: string): ParsedSkill[]
export function parseSpecs(html: string): ParsedSpec[]
export function parseDaevanion(html: string): ParsedBoard[]
export function parseArcanaPools(html: string, skills: ParsedSkill[]): Record<string, Record<string, number[]>>
export function parseTitles(html: string, stats: { id: number; en: string; percent?: boolean }[]): ParsedTitle[]
export function parseGodstones(html: string): ParsedGodstone[]
export function parseTop(
  lines: string[],
  opts: { cls: string; skillByName: (name: string) => number | undefined; statByName: (name: string) => number | undefined }
): Record<string, unknown> & { unknown: string[] }
