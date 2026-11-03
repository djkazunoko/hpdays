import { describe, expect, test } from "vitest"
import { isMinimumMembershipDays } from "./isMinimumMembershipDays"

describe("isMinimumMembershipDays", () => {
  test("加入日が月までの場合は確認できる最小在籍日数として扱う", () => {
    expect(isMinimumMembershipDays({ startedAt: "2011-11", endedAt: null })).toBe(true)
  })

  test("加入日が日までの場合は最小在籍日数として扱わない", () => {
    expect(isMinimumMembershipDays({ startedAt: "2012-09-14", endedAt: null })).toBe(false)
  })
})
