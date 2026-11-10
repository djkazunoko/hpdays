import { describe, expect, test } from "vitest"
import type { GroupMembership, Member } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"

const member: Member = { id: "multi-group-member", name: "A", birthday: "2000-01-01" }

const groupMemberships: GroupMembership[] = [
  { memberId: "multi-group-member", groupId: "first-group", startedAt: "2020-01-01", endedAt: "2020-01-03" },
  { memberId: "multi-group-member", groupId: "second-group", startedAt: "2020-01-10", endedAt: "2020-01-12" },
]

describe("getHelloProjectMembershipPeriod", () => {
  test("在籍履歴の並び順に関係なく最初の加入日と最後の卒業日を返す", () => {
    const expectedMembership = {
      startedAt: "2020-01-01",
      endedAt: "2020-01-12",
    }

    expect(getHelloProjectMembershipPeriod(member, groupMemberships, [])).toEqual(expectedMembership)
    expect(getHelloProjectMembershipPeriod(member, [...groupMemberships].reverse(), [])).toEqual(expectedMembership)
  })

  test("研修生加入日の精度を保ち、他メンバーのデータを使わない", () => {
    expect(getHelloProjectMembershipPeriod(member, groupMemberships, [
      { memberId: "other-member", startedAt: "2010-01-01" },
      { memberId: "multi-group-member", startedAt: "2011-11" },
    ])).toEqual({ startedAt: "2011-11", endedAt: "2020-01-12" })
  })

  test("H!P加入日の明示値があれば研修生歴やグループ在籍より優先する", () => {
    expect(getHelloProjectMembershipPeriod(
      { ...member, helloProjectStartedAt: "2010-01-01" },
      groupMemberships,
      [{ memberId: "multi-group-member", startedAt: "2011-11" }],
    )).toEqual({ startedAt: "2010-01-01", endedAt: "2020-01-12" })
  })

  test("H!P卒業日の明示値があればグループ在籍より優先する", () => {
    expect(getHelloProjectMembershipPeriod(
      { ...member, helloProjectEndedAt: "2020-02-01" },
      groupMemberships,
      [],
    )).toEqual({ startedAt: "2020-01-01", endedAt: "2020-02-01" })
  })

  test("現役のグループ在籍が一つでもあれば卒業日はnullになる", () => {
    expect(getHelloProjectMembershipPeriod(member, [{ ...groupMemberships[0], endedAt: null }, groupMemberships[1]], [])?.endedAt).toBeNull()
  })

  test("対象メンバーのグループ在籍履歴がなければnullを返す", () => {
    const traineeOnlyMember = { id: "trainee-only-member", name: "B", birthday: "2000-01-01" }

    expect(getHelloProjectMembershipPeriod(traineeOnlyMember, groupMemberships, [{ memberId: "trainee-only-member", startedAt: "2010-01" }])).toBeNull()
  })
})
