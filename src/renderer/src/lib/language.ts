// Язык интерфейса в окне. Язык выбирается при загрузке страницы (?lang= — см. shared/i18n): так переводятся
// и тексты, посчитанные заранее (константы модулей, встроенные гайды). Поэтому смена языка — перезагрузка окна.

import { getLocale, setLocale, type Locale } from '@shared/i18n'
import { setGameNames } from '@shared/names'
import { useApp } from './store'

function reloadWith(lang: Locale): void {
  setLocale(lang)
  const url = new URL(window.location.href)
  url.searchParams.set('lang', lang)
  // ?static пишется без значения — URLSearchParams превратил бы его в «static=».
  window.location.replace(url.toString().replace(/([?&]static)=(?=&|#|$)/, '$1'))
}

/** Сохранить язык и перезагрузить окно на нём. */
export async function changeLanguage(lang: Locale): Promise<void> {
  if (lang === getLocale()) return
  await useApp.getState().updateUi({ lang })
  reloadWith(lang)
}

/**
 * После загрузки настроек: если окно открылось не на том языке (браузерный режим, старая вкладка) — перезагрузить.
 * true — перезагрузка уже идёт, рисовать интерфейс не нужно.
 */
export function syncLanguage(): boolean {
  document.documentElement.lang = getLocale()
  const { ui, nameMode } = useApp.getState().settings
  setGameNames(nameMode)
  const lang = ui.lang
  if (lang === getLocale()) return false
  reloadWith(lang)
  return true
}
