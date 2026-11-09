import { describe, expect, it } from 'vitest'
import { pageSizeOrDefault, pageWindow, paginate } from './paging'

const list = Array.from({ length: 57 }, (_, i) => i + 1)

describe('страницы', () => {
  it('срез страницы и номера записей', () => {
    expect(paginate(list, 1, 10)).toMatchObject({ page: 1, pages: 6, total: 57, from: 1, to: 10 })
    expect(paginate(list, 6, 10)).toMatchObject({ page: 6, from: 51, to: 57, items: [51, 52, 53, 54, 55, 56, 57] })
    expect(paginate(list, 2, 25).items[0]).toBe(26)
  })

  it('страница за пределами — поправляется; пустой список — одна пустая страница', () => {
    expect(paginate(list, 99, 10).page).toBe(6)
    expect(paginate(list, 0, 10).page).toBe(1)
    expect(paginate([], 3, 10)).toMatchObject({ page: 1, pages: 1, total: 0, from: 0, to: 0, items: [] })
  })

  it('размер страницы — только из списка', () => {
    expect(pageSizeOrDefault(25)).toBe(25)
    expect(pageSizeOrDefault(7)).toBe(10)
    expect(pageSizeOrDefault(undefined)).toBe(10)
  })

  it('номера для переключателя: края, соседи текущей и «…»', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4])
    expect(pageWindow(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12])
    expect(pageWindow(1, 12)).toEqual([1, 2, '…', 12])
    expect(pageWindow(3, 12)).toEqual([1, 2, 3, 4, '…', 12])
  })
})
