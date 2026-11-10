// Типы для keys.mjs — его использует тест словарей (src/shared/i18n/i18n.test.ts).
export interface KeyInfo {
  plural: boolean
  where: string[]
}
export const ROOT: string
export const LOCALES_DIR: string
export function placeholders(s: string): string[]
export function collectKeys(): { keys: Map<string, KeyInfo>; errors: string[] }
export function readLocales(): Record<string, Record<string, string | Record<string, string>>>
export function checkLocale(dict: Record<string, unknown>, keys: Map<string, KeyInfo>): { missing: string[]; stale: string[]; broken: string[] }
