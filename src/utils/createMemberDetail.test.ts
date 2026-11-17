import { describe, expect, test } from "vitest"
import type { Group, GroupMembership, Member, TraineeMembership } from "../types/data"
import { createMemberDetail } from "./createMemberDetail"

const morningmusume: Group = { id: "morningmusume", name: "モーニング娘。" }
const groups: Group[] = [morningmusume]

describe("createMemberDetail", () => {
  test("卒業済みメンバーのH!P在籍・グループ在籍・研修生加入日を求める", () => {
    const member: Member = { id: "fukumura-mizuki", name: "譜久村聖", birthday: "1996-10-30" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "fukumura-mizuki", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2023-11-29" },
    ]
    const traineeMemberships: TraineeMembership[] = [{ memberId: "fukumura-mizuki", startedAt: "2008-06-22" }]

    expect(createMemberDetail("fukumura-mizuki", [member], groups, groupMemberships, traineeMemberships)).toEqual({
      member,
      helloProjectMembershipSummary: {
        startedAt: "2008-06-22",
        endedAt: "2023-11-29",
        membershipDays: 5639,
        isMinimumMembershipDays: false,
      },
      groupMembershipSummaries: [
        {
          group: morningmusume,
          startedAt: "2011-01-02",
          endedAt: "2023-11-29",
          membershipDays: 4715,
          isMinimumMembershipDays: false,
        },
      ],
      traineeStartedAt: "2008-06-22",
    })
  })

  test("現役メンバーの在籍日数は現在日までで求める", () => {
    const member: Member = { id: "suzuki-moa", name: "鈴木もあ", birthday: "2013-04-12" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "suzuki-moa", groupId: "morningmusume", startedAt: "2026-06-24", endedAt: null },
    ]
    const traineeMemberships: TraineeMembership[] = [{ memberId: "suzuki-moa", startedAt: "2025-02-05" }]

    const memberDetail = createMemberDetail(
      "suzuki-moa",
      [member],
      groups,
      groupMemberships,
      traineeMemberships,
      new Date(2026, 8, 10),
    )

    expect(memberDetail?.helloProjectMembershipSummary).toEqual({
      startedAt: "2025-02-05",
      endedAt: null,
      membershipDays: 583,
      isMinimumMembershipDays: false,
    })
    expect(memberDetail?.groupMembershipSummaries.map((groupMembershipSummary) => groupMembershipSummary.membershipDays)).toEqual([79])
  })

  test("研修生歴がない場合は、研修生加入日をnullとする", () => {
    const member: Member = { id: "ikuta-erina", name: "生田衣梨奈", birthday: "1997-07-07" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "ikuta-erina", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2025-07-08" },
    ]

    expect(createMemberDetail("ikuta-erina", [member], groups, groupMemberships, [])?.traineeStartedAt).toBeNull()
  })

  test("H!P在籍期間には、H!P加入日・卒業日の明示値を反映する", () => {
    const members: Member[] = [
      { id: "sayashi-riho", name: "鞘師里保", birthday: "1998-05-28", helloProjectEndedAt: "2018-11-30" },
      { id: "morito-chisaki", name: "森戸知沙希", birthday: "2000-02-19", helloProjectStartedAt: "2014-11-05" },
    ]
    const groupMemberships: GroupMembership[] = [
      { memberId: "sayashi-riho", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2015-12-31" },
      { memberId: "morito-chisaki", groupId: "morningmusume", startedAt: "2017-06-26", endedAt: "2022-06-20" },
    ]

    expect(createMemberDetail("sayashi-riho", members, groups, groupMemberships, [])?.helloProjectMembershipSummary).toEqual({
      startedAt: "2011-01-02",
      endedAt: "2018-11-30",
      membershipDays: 2890,
      isMinimumMembershipDays: false,
    })
    expect(createMemberDetail("morito-chisaki", members, groups, groupMemberships, [])?.helloProjectMembershipSummary).toEqual({
      startedAt: "2014-11-05",
      endedAt: "2022-06-20",
      membershipDays: 2785,
      isMinimumMembershipDays: false,
    })
  })

  test("加入日が月までしか分からない場合は、最小在籍日数であることを含める", () => {
    const member: Member = { id: "member-a", name: "メンバーA", birthday: "2000-01-01" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "member-a", groupId: "morningmusume", startedAt: "2020-02-05", endedAt: "2020-02-09" },
    ]
    const traineeMemberships: TraineeMembership[] = [{ memberId: "member-a", startedAt: "2020-01" }]

    const memberDetail = createMemberDetail("member-a", [member], groups, groupMemberships, traineeMemberships)

    expect(memberDetail?.helloProjectMembershipSummary).toEqual({
      startedAt: "2020-01",
      endedAt: "2020-02-09",
      membershipDays: 10,
      isMinimumMembershipDays: true,
    })
    expect(memberDetail?.groupMembershipSummaries[0].isMinimumMembershipDays).toBe(false)
    expect(memberDetail?.traineeStartedAt).toBe("2020-01")
  })

  test("グループ在籍は、他のメンバーの在籍を含めず加入日の古い順に並べる", () => {
    const groupA: Group = { id: "group-a", name: "グループA" }
    const groupB: Group = { id: "group-b", name: "グループB" }
    const members: Member[] = [
      { id: "member-a", name: "メンバーA", birthday: "2000-01-01" },
      { id: "member-b", name: "メンバーB", birthday: "2000-01-01" },
    ]
    const groupMemberships: GroupMembership[] = [
      { memberId: "member-a", groupId: "group-b", startedAt: "2021-01-01", endedAt: null },
      { memberId: "member-b", groupId: "group-a", startedAt: "2019-01-01", endedAt: null },
      { memberId: "member-a", groupId: "group-a", startedAt: "2020-01-01", endedAt: "2020-12-31" },
    ]

    const memberDetail = createMemberDetail("member-a", members, [groupA, groupB], groupMemberships, [])

    expect(memberDetail?.groupMembershipSummaries.map((groupMembershipSummary) => [groupMembershipSummary.group, groupMembershipSummary.startedAt])).toEqual([
      [groupA, "2020-01-01"],
      [groupB, "2021-01-01"],
    ])
  })

  test("存在しないメンバーIDの場合はnullを返す", () => {
    const member: Member = { id: "suzuki-moa", name: "鈴木もあ", birthday: "2013-04-12" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "suzuki-moa", groupId: "morningmusume", startedAt: "2026-06-24", endedAt: null },
    ]

    expect(createMemberDetail("unknown-member", [member], groups, groupMemberships, [])).toBeNull()
  })

  test("グループ在籍データに対応するグループが存在しない場合はエラーになる", () => {
    const member: Member = { id: "suzuki-moa", name: "鈴木もあ", birthday: "2013-04-12" }
    const groupMemberships: GroupMembership[] = [
      { memberId: "suzuki-moa", groupId: "unknown-group", startedAt: "2026-06-24", endedAt: null },
    ]

    expect(() => createMemberDetail("suzuki-moa", [member], groups, groupMemberships, [])).toThrow(
      "Group not found: unknown-group",
    )
  })
})
