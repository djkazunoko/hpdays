import { describe, expect, test } from "vitest"
import type { GroupMembership } from "../types/data"
import { createHelloProjectRanking } from "./createHelloProjectRanking"

const groupMemberships: GroupMembership[] = [
  { memberId: "multi-group-member", groupId: "first-group", startedAt: "2020-01-01", endedAt: "2020-01-03" },
  { memberId: "multi-group-member", groupId: "second-group", startedAt: "2020-01-10", endedAt: "2020-01-12" },
]

describe("createHelloProjectRanking", () => {
  test("メンバー単位で最小在籍日数の降順に並べ、同順位の次を飛ばす", () => {
    const members = ["new-member", "active-member", "multi-group-member", "graduated-member", "trainee-only-member"]
      .map((id) => ({ id, name: id, birthday: "2000-01-01" }))
    const memberships = [
      ...groupMemberships,
      { memberId: "active-member", groupId: "third-group", startedAt: "2020-01-02", endedAt: null },
      { memberId: "graduated-member", groupId: "third-group", startedAt: "2020-01-02", endedAt: "2020-01-12" },
      { memberId: "new-member", groupId: "third-group", startedAt: "2020-01-12", endedAt: null },
    ]
    const trainees = [
      { memberId: "multi-group-member", startedAt: "2019-12" },
      { memberId: "trainee-only-member", startedAt: "2010-01" },
    ]
    const ranking = createHelloProjectRanking(members, memberships, trainees, new Date(2020, 0, 12))
    expect(ranking.map(({ member, membershipDays, rank }) => [member.id, membershipDays, rank])).toEqual([
      ["multi-group-member", 13, 1], ["active-member", 11, 2], ["graduated-member", 11, 2], ["new-member", 1, 4],
    ])
    expect(ranking[0].startedAt).toBe("2019-12")
    expect(ranking[0].isMinimumMembershipDays).toBe(true)
    expect(ranking[1].isMinimumMembershipDays).toBe(false)
  })

  test("研修生歴がない場合もグループ間の空白期間を含めて日数を計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, [])

    expect(ranking[0].membershipDays).toBe(12)
  })

  test("日単位の研修生加入日から最後の卒業日まで計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01" }]
    const traineeMemberships = [{ memberId: "multi-group-member", startedAt: "2019-12-31" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, traineeMemberships)

    expect(ranking[0].startedAt).toBe("2019-12-31")
    expect(ranking[0].membershipDays).toBe(13)
  })

  test("空のデータでは空のランキングを返す", () => {
    expect(createHelloProjectRanking([], [], [])).toEqual([])
  })

  test("在籍データに対応するメンバーがなければエラーになる", () => {
    expect(() => createHelloProjectRanking([], groupMemberships, [])).toThrow("Member not found: multi-group-member")
  })
})
