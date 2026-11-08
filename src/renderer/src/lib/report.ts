// Хуки «персонаж + гайд → разбор». Разбор пересчитывается, только когда меняются входные данные.

import { useMemo } from 'react'
import { analyzeBuild, type BuildReport } from '@shared/analysis/build'
import { learnGearOptions } from '@shared/gamedata/gearOptions'
import { createNamer, type Namer } from '@shared/names'
import type { Guide } from '@shared/guide/types'
import type { Character } from '@shared/types'
import { useActiveGuide, useApp, useCharacter, useCharacterPrefs } from './store'

export function useNamer(): Namer {
  const mode = useApp((s) => s.settings.nameMode)
  const names = useApp((s) => s.settings.names)
  return useMemo(() => createNamer(mode, names), [mode, names])
}

export interface CharacterContext {
  char: Character
  guide: Guide | null
  report: BuildReport
  namer: Namer
}

/** Всё, что нужно странице про текущего персонажа. null — данных ещё нет. */
export function useCharacterContext(): CharacterContext | null {
  const char = useCharacter()
  const guide = useActiveGuide(char)
  const namer = useNamer()
  const prefs = useCharacterPrefs(char?.key)
  const all = useApp((s) => s.source?.data?.characters)
  const known = useMemo(() => learnGearOptions(all ?? []), [all])
  const manualSpecs = prefs.manualSpecs
  const report = useMemo(() => {
    if (!char) return null
    const specs = Object.fromEntries(Object.entries(manualSpecs ?? {}).map(([k, v]) => [Number(k), v]))
    return analyzeBuild(char, guide, namer, { manualSpecs: specs, knownOptions: known })
  }, [char, guide, namer, manualSpecs, known])
  if (!char || !report) return null
  return { char, guide, report, namer }
}
