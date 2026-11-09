import { describe, expect, it } from 'vitest'
import { makeTemplar } from '../testing/fixtures'
import { sectionFreshness } from './freshness'
import { summarize, type Change, type HistoryEntry } from './history'

const char = makeTemplar({ updatedAt: 5_000 })

function entry(at: number, changes: Change[]): HistoryEntry {
  return { savedAt: at + 10, summary: { ...summarize(char), at }, changes }
}

describe('свежесть медленных разделов', () => {
  it('без истории — известно только, когда оверлей видел персонажа', () => {
    expect(sectionFreshness(char, [], 'genus')).toEqual({ seenAt: 5_000, changedAt: null, trackedSince: null })
  })

  it('берёт последнее изменение нужного раздела по времени оверлея', () => {
    const entries = [
      entry(1_000, []),
      entry(2_000, [{ kind: 'genus', genus: 'feral', slot: 1, from: 50, to: 101 }]),
      entry(3_000, [{ kind: 'daevanion', added: 4, removed: 4 }]),
      entry(4_000, [{ kind: 'cp', from: 1, to: 2 }])
    ]
    expect(sectionFreshness(char, entries, 'genus')).toEqual({ seenAt: 5_000, changedAt: 2_000, trackedSince: 1_000 })
    expect(sectionFreshness(char, entries, 'daevanion').changedAt).toBe(3_000)
  })

  it('снимки новее данных на экране не учитываются', () => {
    const entries = [entry(1_000, []), entry(9_000, [{ kind: 'genus', genus: 'feral', slot: 1, from: 50, to: 101 }])]
    expect(sectionFreshness(char, entries, 'genus')).toEqual({ seenAt: 5_000, changedAt: null, trackedSince: 1_000 })
  })

  it('раздел не менялся, пока ведётся история', () => {
    const entries = [entry(4_000, [{ kind: 'cp', from: 1, to: 2 }]), entry(1_500, [])]
    expect(sectionFreshness(char, entries, 'genus')).toEqual({ seenAt: 5_000, changedAt: null, trackedSince: 1_500 })
  })
})
