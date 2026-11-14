import { describe, expect, test } from "vitest"
import { parseMembershipStatusFilter } from "./parseMembershipStatusFilter"

describe("parseMembershipStatusFilter", () => {
  test.each(["active", "graduated"])("%sはそのまま絞り込み条件にする", (value) => {
    expect(parseMembershipStatusFilter(value)).toBe(value)
  })

  test("クエリパラメータがない場合はすべてを対象にする", () => {
    expect(parseMembershipStatusFilter(null)).toBe("all")
  })

  test.each(["all", "unknown", ""])("絞り込み条件として定義していない値「%s」はすべてを対象にする", (value) => {
    expect(parseMembershipStatusFilter(value)).toBe("all")
  })
})
