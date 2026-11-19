import { describe, expect, test } from "vitest"
import { createRankingSearch } from "./createRankingSearch"

describe("createRankingSearch", () => {
  test("すべて・今日時点の場合は、クエリパラメータを付けない", () => {
    expect(createRankingSearch("all", null)).toBe("")
  })

  test.each(["active", "graduated"] as const)("絞り込みが%sの場合は、statusとして付ける", (membershipStatusFilter) => {
    expect(createRankingSearch(membershipStatusFilter, null)).toBe(`?status=${membershipStatusFilter}`)
  })

  test("日付を指定している場合は、YYYY-MM-DD形式のdateとして付ける", () => {
    expect(createRankingSearch("all", new Date(2015, 0, 2))).toBe("?date=2015-01-02")
  })

  test("絞り込みと日付の両方を付ける", () => {
    expect(createRankingSearch("active", new Date(2015, 0, 2))).toBe("?status=active&date=2015-01-02")
  })
})
