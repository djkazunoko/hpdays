import { describe, expect, test } from "vitest"
import type { GroupMembership, Member, TraineeMembership } from "../types/data"
import { getEarliestMembershipStartDate } from "./getEarliestMembershipStartDate"

const members: Member[] = ["first-member", "second-member", "rosy-member"]
  .map((id) => ({ id, name: id, birthday: "2000-01-01" }))
const groupMemberships: GroupMembership[] = [
  { memberId: "first-member", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2023-11-29" },
  { memberId: "second-member", groupId: "morningmusume", startedAt: "2012-09-14", endedAt: null },
  { memberId: "rosy-member", groupId: "rosychronicle", startedAt: "2024-06-16", endedAt: null },
]

describe("getEarliestMembershipStartDate", () => {
  describe("Hello! Project全体", () => {
    test("最も古いH!P加入日を返す", () => {
      const traineeMemberships: TraineeMembership[] = [{ memberId: "first-member", startedAt: "2008-06-22" }]
      expect(getEarliestMembershipStartDate(null, members, groupMemberships, traineeMemberships)).toEqual(new Date(2008, 5, 22))
    })

    test("H!P加入日の明示値も含めて、最も古いH!P加入日を返す", () => {
      const membersWithExplicitDate = members.map((member) =>
        member.id === "second-member" ? { ...member, helloProjectStartedAt: "2010-01-01" } : member,
      )
      expect(getEarliestMembershipStartDate(null, membersWithExplicitDate, groupMemberships, [])).toEqual(new Date(2010, 0, 1))
    })

    test("グループ在籍のないメンバーは掲載対象ではないため含めない", () => {
      const membersWithUnlisted = [...members, { id: "unlisted-member", name: "unlisted-member", birthday: "2000-01-01" }]
      const traineeMemberships: TraineeMembership[] = [{ memberId: "unlisted-member", startedAt: "2000-01-01" }]
      expect(getEarliestMembershipStartDate(null, membersWithUnlisted, groupMemberships, traineeMemberships)).toEqual(new Date(2011, 0, 2))
    })

    test("月単位の加入日は、在籍日数の計算と同じく月末を開始境界とする", () => {
      const traineeMemberships: TraineeMembership[] = [{ memberId: "first-member", startedAt: "2008-06" }]
      expect(getEarliestMembershipStartDate(null, members, groupMemberships, traineeMemberships)).toEqual(new Date(2008, 5, 30))
    })
  })

  describe("グループ", () => {
    test("そのグループの最も古い加入日を返す", () => {
      expect(getEarliestMembershipStartDate("morningmusume", members, groupMemberships, [])).toEqual(new Date(2011, 0, 2))
      expect(getEarliestMembershipStartDate("rosychronicle", members, groupMemberships, [])).toEqual(new Date(2024, 5, 16))
    })

    test("研修生加入日はグループの在籍ではないため含めない", () => {
      const traineeMemberships: TraineeMembership[] = [{ memberId: "first-member", startedAt: "2008-06-22" }]
      expect(getEarliestMembershipStartDate("morningmusume", members, groupMemberships, traineeMemberships)).toEqual(new Date(2011, 0, 2))
    })
  })

  test("対象の在籍がない場合はエラーになる", () => {
    expect(() => getEarliestMembershipStartDate("unknown-group", members, groupMemberships, [])).toThrow("No memberships: unknown-group")
  })
})
