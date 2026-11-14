import { describe, expect, test } from "vitest"
import type { GroupMembership, Member, MembershipStatusFilter } from "../types/data"
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
    const ranking = createHelloProjectRanking(members, memberships, trainees, "all", new Date(2020, 0, 12))
    expect(ranking.map(({ member, membershipDays, rank }) => [member.id, membershipDays, rank])).toEqual([
      ["multi-group-member", 13, 1], ["active-member", 11, 2], ["graduated-member", 11, 2], ["new-member", 1, 4],
    ])
    expect(ranking[0].isMinimumMembershipDays).toBe(true)
    expect(ranking[1].isMinimumMembershipDays).toBe(false)
  })

  test("研修生歴がない場合もグループ間の空白期間を含めて日数を計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, [], "all")

    expect(ranking[0].membershipDays).toBe(12)
  })

  test("日単位の研修生加入日から最後の卒業日まで計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01" }]
    const traineeMemberships = [{ memberId: "multi-group-member", startedAt: "2019-12-31" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, traineeMemberships, "all")

    expect(ranking[0].membershipDays).toBe(13)
  })

  test("H!P加入日の明示値から最後の卒業日まで計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01", helloProjectStartedAt: "2019-12-31" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, [], "all")

    expect(ranking[0].membershipDays).toBe(13)
  })

  test("最初のグループ加入日からH!P卒業日の明示値まで計算する", () => {
    const members = [{ id: "multi-group-member", name: "A", birthday: "2000-01-01", helloProjectEndedAt: "2020-01-13" }]
    const ranking = createHelloProjectRanking(members, groupMemberships, [], "all")

    expect(ranking[0].membershipDays).toBe(13)
  })

  test("空のデータでは空のランキングを返す", () => {
    expect(createHelloProjectRanking([], [], [], "all")).toEqual([])
  })

  test("在籍データに対応するメンバーがなければエラーになる", () => {
    expect(() => createHelloProjectRanking([], groupMemberships, [], "all")).toThrow("Member not found: multi-group-member")
  })

  describe("現役・卒業済みの絞り込み", () => {
    const members: Member[] = ["active-member", "transferred-member", "graduated-member", "explicitly-graduated-member"]
      .map((id) => ({ id, name: id, birthday: "2000-01-01" }))
      .map((member) => (member.id === "explicitly-graduated-member" ? { ...member, helloProjectEndedAt: "2020-01-05" } : member))
    const memberships: GroupMembership[] = [
      { memberId: "active-member", groupId: "first-group", startedAt: "2020-01-03", endedAt: null },
      // グループを卒業していても、別のグループに在籍中ならH!Pでは現役として扱う。
      { memberId: "transferred-member", groupId: "first-group", startedAt: "2020-01-01", endedAt: "2020-01-03" },
      { memberId: "transferred-member", groupId: "second-group", startedAt: "2020-01-10", endedAt: null },
      { memberId: "graduated-member", groupId: "first-group", startedAt: "2020-01-01", endedAt: "2020-01-04" },
      // グループ在籍はgraduated-memberより短いが、H!P卒業日の明示値（2020-01-05）までを含めると長くなる。
      { memberId: "explicitly-graduated-member", groupId: "first-group", startedAt: "2020-01-01", endedAt: "2020-01-03" },
    ]

    function createRanking(membershipStatusFilter: MembershipStatusFilter) {
      return createHelloProjectRanking(members, memberships, [], membershipStatusFilter, new Date(2020, 0, 12))
        .map((entry) => [entry.member.id, entry.rank])
    }

    test("現役を指定するとH!P在籍期間に卒業日のないメンバーだけで順位を付ける", () => {
      expect(createRanking("active")).toEqual([["transferred-member", 1], ["active-member", 2]])
    })

    test("卒業済みを指定するとH!P卒業日の明示値を含め、卒業日のあるメンバーだけで順位を付ける", () => {
      expect(createRanking("graduated")).toEqual([["explicitly-graduated-member", 1], ["graduated-member", 2]])
    })
  })
})
