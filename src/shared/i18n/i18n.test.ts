import { afterEach, describe, expect, it } from 'vitest'
import { checkLocale, collectKeys, readLocales } from '../../../scripts/i18n/keys.mjs'
import { getLocale, LOCALES, setLocale, systemLocale, t, tn } from './index'

afterEach(() => setLocale('ru'))

describe('t и tn', () => {
  it('по-русски ключ и есть текст, подстановки заполняются', () => {
    expect(getLocale()).toBe('ru')
    expect(t('Не хватает {n}', { n: 2 })).toBe('Не хватает 2')
    expect(t('{a} и {b}', { a: 1, b: undefined })).toBe('1 и ')
  })

  it('числительные по-русски', () => {
    const key = '{n} запись|{n} записи|{n} записей'
    expect([1, 2, 5, 11, 21, 104].map((n) => tn(n, key))).toEqual(['1 запись', '2 записи', '5 записей', '11 записей', '21 запись', '104 записи'])
    expect(tn(3, key, { n: '3,0' })).toBe('3,0 записи')
  })

  it('нет перевода — показывается русский', () => {
    setLocale('en')
    expect(t('Строка, которой нет в словарях')).toBe('Строка, которой нет в словарях')
  })

  it('язык системы: первый известный, иначе английский', () => {
    expect(systemLocale(['uk-UA', 'en-US'])).toBe('uk')
    expect(systemLocale(['pt-BR'])).toBe('pt')
    expect(systemLocale(['zh-CN', 'pl'])).toBe('en')
  })
})

describe('словари переводов', () => {
  const { keys, errors } = collectKeys()
  const locales = readLocales()

  it('все t() — со строкой: ключи можно собрать', () => {
    expect(errors).toEqual([])
    expect(keys.size).toBeGreaterThan(1000)
  })

  it('у каждого языка, кроме русского, есть словарь', () => {
    expect(Object.keys(locales).sort()).toEqual(
      LOCALES.filter((l) => l.id !== 'ru')
        .map((l) => l.id)
        .sort()
    )
  })

  for (const [lang, dict] of Object.entries(locales)) {
    it(`${lang}: переведено всё, подстановки и формы числительных на месте`, () => {
      const r = checkLocale(dict, keys)
      expect(r.broken).toEqual([])
      expect(r.missing).toEqual([])
      expect(r.stale).toEqual([])
    })
  }

  it('перевод действительно подставляется', () => {
    setLocale('en')
    expect(t('Обзор')).not.toBe('Обзор')
    expect(tn(1, '{n} запись|{n} записи|{n} записей')).toMatch(/^1 /)
  })
})
