import { describe, expect, test } from "vitest"
import { parseMembershipStatusFilter } from "./parseMembershipStatusFilter"

describe("parseMembershipStatusFilter", () => {
  test.each(["active", "graduated"])("%sはそのまま絞り込み条件にする", (text) => {
    expect(parseMembershipStatusFilter(text)).toBe(text)
  })

  test("クエリパラメータがない場合はすべてを対象にする", () => {
    expect(parseMembershipStatusFilter(null)).toBe("all")
  })

  test.each(["all", "unknown", ""])("絞り込み条件として定義していない値「%s」はすべてを対象にする", (text) => {
    expect(parseMembershipStatusFilter(text)).toBe("all")
  })
})
