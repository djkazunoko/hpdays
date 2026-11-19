import { describe, expect, test } from "vitest"
import { normalizeRankingDate } from "./normalizeRankingDate"

const minDate = new Date(2008, 5, 22)
const today = new Date(2026, 10, 18, 12, 0)

describe("normalizeRankingDate", () => {
  test("範囲内の日付はそのまま返す", () => {
    expect(normalizeRankingDate(new Date(2015, 0, 2), minDate, today)).toEqual(new Date(2015, 0, 2))
  })

  test("今日の日付は指定できる", () => {
    expect(normalizeRankingDate(new Date(2026, 10, 18), minDate, today)).toEqual(new Date(2026, 10, 18))
  })

  test("最も古い日付は指定できる", () => {
    expect(normalizeRankingDate(new Date(2008, 5, 22), minDate, today)).toEqual(new Date(2008, 5, 22))
  })

  test("最も古い日付より前の日付は、最も古い日付に寄せる", () => {
    expect(normalizeRankingDate(new Date(2008, 5, 21), minDate, today)).toEqual(new Date(2008, 5, 22))
  })

  test("未来の在籍データは持たないため、未来の日付はnullを返し、今日として扱う", () => {
    expect(normalizeRankingDate(new Date(2026, 10, 19), minDate, today)).toBeNull()
  })
})
