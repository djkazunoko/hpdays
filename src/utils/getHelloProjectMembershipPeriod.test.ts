import { describe, expect, test } from "vitest"
import type { GroupMembership } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"

const groupMemberships: GroupMembership[] = [
  { memberId: "a", groupId: "second", startedAt: "2020-01-10", endedAt: "2020-01-12" },
  { memberId: "a", groupId: "first", startedAt: "2020-01-01", endedAt: "2020-01-03" },
]

describe("getHelloProjectMembershipPeriod", () => {
  test("最初の加入日から最後の卒業日までを導出する", () => {
    expect(getHelloProjectMembershipPeriod("a", groupMemberships, [])).toEqual({ startedAt: "2020-01-01", endedAt: "2020-01-12" })
  })

  test("研修生加入日の精度を保ち、他メンバーのデータを使わない", () => {
    expect(getHelloProjectMembershipPeriod("a", groupMemberships, [
      { memberId: "b", startedAt: "2010-01-01" },
      { memberId: "a", startedAt: "2011-11" },
    ])).toEqual({ startedAt: "2011-11", endedAt: "2020-01-12" })
  })

  test("現役のグループ在籍が一つでもあれば卒業日はnullになる", () => {
    expect(getHelloProjectMembershipPeriod("a", [{ ...groupMemberships[0], endedAt: null }, groupMemberships[1]], [])?.endedAt).toBeNull()
  })

  test("グループ在籍歴がなければ対象外にする", () => {
    expect(getHelloProjectMembershipPeriod("b", groupMemberships, [{ memberId: "b", startedAt: "2010-01" }])).toBeNull()
  })
})
