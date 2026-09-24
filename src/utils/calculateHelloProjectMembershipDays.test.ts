import { describe, expect, test, vi, afterEach } from "vitest"
import type { GroupMembership } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"
import { calculateHelloProjectMembershipDays } from "./calculateHelloProjectMembershipDays"

const groupMemberships: GroupMembership[] = [
  { memberId: "a", groupId: "second", startedAt: "2020-01-10", endedAt: "2020-01-12" },
  { memberId: "a", groupId: "first", startedAt: "2020-01-01", endedAt: "2020-01-03" },
]

afterEach(() => vi.useRealTimers())

describe("calculateHelloProjectMembershipDays", () => {
  test("活動の空白期間を含め、加入日を1日目として計算する", () => {
    expect(calculateHelloProjectMembershipDays(getHelloProjectMembershipPeriod("a", groupMemberships, [])!)).toBe(12)
  })

  test("研修生加入日から卒業日まで計算する", () => {
    const membership = getHelloProjectMembershipPeriod("a", groupMemberships, [{ memberId: "a", startedAt: "2019-12-31" }])!
    expect(calculateHelloProjectMembershipDays(membership)).toBe(13)
  })

  test.each([
    ["2011-11", "2011-12-01", 2],
    ["2020-02", "2020-03-01", 2],
    ["2019-02", "2019-03-01", 2],
    ["2020-12", "2021-01-01", 2],
    ["2020-01-01", "2020-01-01", 1],
  ])("%sから%sまでの最小在籍日数は%i日", (startedAt, endedAt, days) => {
    expect(calculateHelloProjectMembershipDays({ startedAt, endedAt })).toBe(days)
  })

  test("現役メンバーは現在日まで計算する", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2020, 0, 12, 23, 59))
    expect(calculateHelloProjectMembershipDays({ startedAt: "2019-12", endedAt: null })).toBe(13)
  })
})
