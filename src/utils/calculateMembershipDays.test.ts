import { afterEach, describe, expect, test, vi } from "vitest"
import { calculateMembershipDays } from "./calculateMembershipDays"

// テストで変更した時計を戻し、次のテストに影響させない。
afterEach(() => vi.useRealTimers())

describe("calculateMembershipDays", () => {
  test("加入日を1日目として卒業日までの日数を計算する", () => {
    expect(calculateMembershipDays({
      startedAt: "2011-01-02",
      endedAt: "2025-07-08",
    })).toBe(5302)
  })

  test("現役メンバーは指定した現在日まで計算する", () => {
    expect(calculateMembershipDays(
      { startedAt: "2012-09-14", endedAt: null },
      new Date(2026, 8, 9),
    )).toBe(5109)
  })

  test("加入日と卒業日が同じ場合は1日とする", () => {
    expect(calculateMembershipDays({
      startedAt: "2020-01-01",
      endedAt: "2020-01-01",
    })).toBe(1)
  })

  test("月末が30日の月では、その日から最小在籍日数を計算する", () => {
    expect(calculateMembershipDays({
      startedAt: "2011-11",
      endedAt: "2011-12-01",
    })).toBe(2)
  })

  test("うるう年の2月は29日を開始境界にする", () => {
    expect(calculateMembershipDays({
      startedAt: "2020-02",
      endedAt: "2020-03-01",
    })).toBe(2)
  })

  test("平年の2月は28日を開始境界にする", () => {
    expect(calculateMembershipDays({
      startedAt: "2019-02",
      endedAt: "2019-03-01",
    })).toBe(2)
  })

  test("12月は31日を開始境界にし、翌年まで計算する", () => {
    expect(calculateMembershipDays({
      startedAt: "2020-12",
      endedAt: "2021-01-01",
    })).toBe(2)
  })

  test("月単位の加入日でも現役なら現在日までの最小在籍日数を計算する", () => {
    expect(calculateMembershipDays(
      { startedAt: "2019-12", endedAt: null },
      new Date(2020, 0, 12),
    )).toBe(13)
  })

  test("現在日を省略した場合は実行時の日付を使う", () => {
    // new Date()の結果を固定し、実行日に左右されないようにする。
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2020, 0, 12, 23, 59))

    expect(calculateMembershipDays({
      startedAt: "2020-01-01",
      endedAt: null,
    })).toBe(12)
  })
})
