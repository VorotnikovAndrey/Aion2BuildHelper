import { describe, expect, it } from 'vitest'
import { classifyUpdateError, releaseNotesText, shouldCheck, UPDATE_CHECK_INTERVAL_MS } from './updates'

describe('shouldCheck', () => {
  const now = Date.parse('2026-10-23T12:00:00Z')
  it('ни разу не проверяли — пора', () => expect(shouldCheck(undefined, now)).toBe(true))
  it('проверяли только что — рано', () => expect(shouldCheck('2026-10-23T11:30:00Z', now)).toBe(false))
  it('прошёл интервал — пора', () => expect(shouldCheck(new Date(now - UPDATE_CHECK_INTERVAL_MS).toISOString(), now)).toBe(true))
  it('мусор в дате — проверяем', () => expect(shouldCheck('вчера', now)).toBe(true))
})

describe('classifyUpdateError', () => {
  it('нет сети', () => {
    expect(classifyUpdateError('net::ERR_INTERNET_DISCONNECTED')).toBe('offline')
    expect(classifyUpdateError('getaddrinfo ENOTFOUND github.com')).toBe('offline')
  })
  it('выпусков ещё нет', () => {
    expect(classifyUpdateError('No published versions on GitHub')).toBe('noRelease')
    expect(classifyUpdateError('Cannot find latest.yml in the latest release artifacts')).toBe('noRelease')
    expect(classifyUpdateError('HttpError: 404 \n"method: GET url: https://github.com/x/y/releases.atom"')).toBe('noRelease')
  })
  it('ключ не принят', () => {
    expect(
      classifyUpdateError(
        'Unable to find latest version on GitHub (https://api.github.com/repos/x/y/releases/latest), please ensure a production release exists: HttpError: 401 \n"message": "Bad credentials"'
      )
    ).toBe('auth')
    expect(classifyUpdateError('HttpError: 403 Forbidden')).toBe('auth')
  })
  it('прочее', () => expect(classifyUpdateError('sha512 checksum mismatch')).toBe('other'))
})

describe('releaseNotesText', () => {
  it('HTML выпуска GitHub → пункты', () => {
    const html = '<ul>\n<li><strong>Обновления</strong> — сами, в фоне.</li>\n<li>Исправлено: Bluesky &amp; почта, &lt;кнопка&gt;.</li>\n</ul>'
    expect(releaseNotesText(html)).toEqual(['Обновления — сами, в фоне.', 'Исправлено: Bluesky & почта, <кнопка>.'])
  })
  it('Markdown → пункты без маркеров', () => {
    expect(releaseNotesText('## 0.6.0\n\n- **Жирно** и дальше\n* второй\n1. третий')).toEqual(['0.6.0', 'Жирно и дальше', 'второй', 'третий'])
  })
  it('список версий (несколько выпусков сразу)', () => {
    expect(
      releaseNotesText([
        { version: '0.6.1', note: '<p>один</p>' },
        { version: '0.6.0', note: null },
        { version: '0.5.9', note: '- два' }
      ])
    ).toEqual(['один', 'два'])
  })
  it('пусто', () => {
    expect(releaseNotesText(null)).toEqual([])
    expect(releaseNotesText('')).toEqual([])
  })
  it('числовые сущности', () => expect(releaseNotesText('a&#39;b &#x2014; c')).toEqual(["a'b — c"]))
})
