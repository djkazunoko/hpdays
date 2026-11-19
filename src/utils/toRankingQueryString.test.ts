import { describe, expect, test } from "vitest"
import { toRankingQueryString } from "./toRankingQueryString"

describe("toRankingQueryString", () => {
  test("すべて・今日時点の場合は、クエリパラメータを付けない", () => {
    expect(toRankingQueryString("all", null)).toBe("")
  })

  test.each(["active", "graduated"] as const)("絞り込みが%sの場合は、statusとして付ける", (membershipStatusFilter) => {
    expect(toRankingQueryString(membershipStatusFilter, null)).toBe(`?status=${membershipStatusFilter}`)
  })

  test("日付を指定している場合は、YYYY-MM-DD形式のdateとして付ける", () => {
    expect(toRankingQueryString("all", new Date(2015, 0, 2))).toBe("?date=2015-01-02")
  })

  test("絞り込みと日付の両方を付ける", () => {
    expect(toRankingQueryString("active", new Date(2015, 0, 2))).toBe("?status=active&date=2015-01-02")
  })
})
