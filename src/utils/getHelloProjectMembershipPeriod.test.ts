import { describe, expect, test } from "vitest"
import type { GroupMembership } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"

const groupMemberships: GroupMembership[] = [
  { memberId: "a", groupId: "first", startedAt: "2020-01-01", endedAt: "2020-01-03" },
  { memberId: "a", groupId: "second", startedAt: "2020-01-10", endedAt: "2020-01-12" },
]

describe("getHelloProjectMembershipPeriod", () => {
  test("在籍履歴の並び順に関係なく最初の加入日と最後の卒業日を返す", () => {
    const expectedMembership = {
      startedAt: "2020-01-01",
      endedAt: "2020-01-12",
    }

    expect(getHelloProjectMembershipPeriod("a", groupMemberships, [])).toEqual(expectedMembership)
    expect(getHelloProjectMembershipPeriod("a", [...groupMemberships].reverse(), [])).toEqual(expectedMembership)
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

  test("対象メンバーのグループ在籍履歴がなければnullを返す", () => {
    expect(getHelloProjectMembershipPeriod("b", groupMemberships, [{ memberId: "b", startedAt: "2010-01" }])).toBeNull()
  })
})
