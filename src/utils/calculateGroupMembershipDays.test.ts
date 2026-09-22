import { describe, expect, test } from "vitest"
import type { GroupMembership } from "../types/data"
import { calculateGroupMembershipDays } from "./calculateGroupMembershipDays"

describe("calculateGroupMembershipDays", () => {
  test("加入日を1日目として、卒業済みメンバーの在籍日数を計算する", () => {
    const membership: GroupMembership = {
      memberId: "ikuta-erina",
      groupId: "morning-musume",
      startedAt: "2011-01-02",
      endedAt: "2025-07-08",
    }

    expect(calculateGroupMembershipDays(membership)).toBe(5302)
  })

  test("現役メンバーは現在日までの在籍日数を計算する", () => {
    const membership: GroupMembership = {
      memberId: "oda-sakura",
      groupId: "morning-musume",
      startedAt: "2012-09-14",
      endedAt: null,
    }

    const currentDate = new Date(2026, 8, 9)

    expect(calculateGroupMembershipDays(membership, currentDate)).toBe(5109)
  })

  test("加入日と終了日が同じ場合は1日とする", () => {
    const membership: GroupMembership = {
      memberId: "test-member",
      groupId: "test-group",
      startedAt: "2026-09-09",
      endedAt: "2026-09-09",
    }

    expect(calculateGroupMembershipDays(membership)).toBe(1)
  })
})
