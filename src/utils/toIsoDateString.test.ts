import { describe, expect, test } from "vitest"
import { toIsoDateString } from "./toIsoDateString"

describe("toIsoDateString", () => {
  test("在籍データの日付と同じYYYY-MM-DD形式にする", () => {
    expect(toIsoDateString(new Date(2020, 11, 31))).toBe("2020-12-31")
  })

  test("1桁の月・日は0で埋める", () => {
    expect(toIsoDateString(new Date(2020, 0, 2))).toBe("2020-01-02")
  })

  test("時刻は無視し、実行環境のタイムゾーンでの日付にする", () => {
    expect(toIsoDateString(new Date(2020, 0, 2, 23, 59))).toBe("2020-01-02")
  })
})
