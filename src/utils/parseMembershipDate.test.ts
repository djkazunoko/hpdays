import { describe, expect, test } from "vitest"
import { parseMembershipDate } from "./parseMembershipDate"

describe("parseMembershipDate", () => {
  test("YYYY-MM-DD形式の日付は、その日にする", () => {
    expect(parseMembershipDate("2011-01-02")).toEqual(new Date(2011, 0, 2))
  })

  test.each([
    { date: "2011-11", expected: new Date(2011, 10, 30), label: "30日の月" },
    { date: "2020-02", expected: new Date(2020, 1, 29), label: "うるう年の2月" },
    { date: "2019-02", expected: new Date(2019, 1, 28), label: "平年の2月" },
    { date: "2020-12", expected: new Date(2020, 11, 31), label: "12月" },
  ])("月単位の日付は月末にする（$label）", ({ date, expected }) => {
    expect(parseMembershipDate(date)).toEqual(expected)
  })
})
