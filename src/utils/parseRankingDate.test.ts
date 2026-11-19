import { describe, expect, test } from "vitest"
import { parseRankingDate } from "./parseRankingDate"

const minDate = new Date(2008, 5, 22)
const today = new Date(2026, 10, 18, 12, 0)

describe("parseRankingDate", () => {
  test("YYYY-MM-DD形式の日付を、その日の日付にする", () => {
    expect(parseRankingDate("2015-01-02", minDate, today)).toEqual(new Date(2015, 0, 2))
  })

  test("今日の日付は指定できる", () => {
    expect(parseRankingDate("2026-11-18", minDate, today)).toEqual(new Date(2026, 10, 18))
  })

  test("最も古い日付は指定できる", () => {
    expect(parseRankingDate("2008-06-22", minDate, today)).toEqual(new Date(2008, 5, 22))
  })

  test("最も古い日付より前の日付は、最も古い日付に寄せる", () => {
    expect(parseRankingDate("2008-06-21", minDate, today)).toEqual(new Date(2008, 5, 22))
  })

  test("クエリパラメータがない場合はnullを返し、今日として扱う", () => {
    expect(parseRankingDate(null, minDate, today)).toBeNull()
  })

  test("未来の在籍データは持たないため、未来の日付はnullを返し、今日として扱う", () => {
    expect(parseRankingDate("2026-11-19", minDate, today)).toBeNull()
  })

  test.each(["2015-02-29", "2015-13-01", "2015-1-2", "2015-01", "20150102", "unknown", ""])(
    "存在しない日付や形式が違う値「%s」はnullを返し、今日として扱う",
    (value) => {
      expect(parseRankingDate(value, minDate, today)).toBeNull()
    },
  )
})
