import { describe, expect, test } from "vitest"
import type { GroupMembership, Member, MembershipStatusFilter } from "../types/data"
import { createGroupRanking } from "./createGroupRanking"

describe("createGroupRanking", () => {
  test("在籍日数の長い順にランキングを作成する", () => {
    const members: Member[] = [
      {
        id: "sugihara-meisa",
        name: "杉原明紗",
        birthday: "2011-12-20",
      },
      {
        id: "fukumura-mizuki",
        name: "譜久村聖",
        birthday: "1996-10-30",
      },
      {
        id: "ikuta-erina",
        name: "生田衣梨奈",
        birthday: "1997-07-07",
      },
    ]

    const memberships: GroupMembership[] = [
      {
        memberId: "sugihara-meisa",
        groupId: "morningmusume",
        startedAt: "2026-03-21",
        endedAt: null,
      },
      {
        memberId: "fukumura-mizuki",
        groupId: "morningmusume",
        startedAt: "2011-01-02",
        endedAt: "2023-11-29",
      },
      {
        memberId: "ikuta-erina",
        groupId: "morningmusume",
        startedAt: "2011-01-02",
        endedAt: "2025-07-08",
      },
    ]

    const currentDate = new Date(2026, 8, 10)

    const ranking = createGroupRanking("morningmusume", members, memberships, "all", currentDate)

    expect(ranking.map((entry) => entry.member.id)).toEqual([
      "ikuta-erina",
      "fukumura-mizuki",
      "sugihara-meisa",
    ])

    expect(ranking.map((entry) => entry.rank)).toEqual([1, 2, 3])
  })

  test("在籍日数が最小在籍日数かどうかを含める", () => {
    const member: Member = {
      id: "sugihara-meisa",
      name: "杉原明紗",
      birthday: "2011-12-20",
    }

    const memberships: GroupMembership[] = [
      {
        memberId: "sugihara-meisa",
        groupId: "morningmusume",
        startedAt: "2026-03-21",
        endedAt: null,
      },
    ]

    const ranking = createGroupRanking("morningmusume", [member], memberships, "all", new Date(2026, 2, 22))

    expect(ranking).toEqual([
      {
        rank: 1,
        member,
        membershipDays: 2,
        isMinimumMembershipDays: false,
      },
    ])
  })

  test("指定したグループの在籍データだけでランキングを作成する", () => {
    const members: Member[] = [
      {
        id: "sugihara-meisa",
        name: "杉原明紗",
        birthday: "2011-12-20",
      },
      {
        id: "other-group-member",
        name: "他グループのメンバー",
        birthday: "2000-01-01",
      },
    ]

    const memberships: GroupMembership[] = [
      {
        memberId: "sugihara-meisa",
        groupId: "morningmusume",
        startedAt: "2026-03-21",
        endedAt: null,
      },
      {
        memberId: "other-group-member",
        groupId: "other-group",
        startedAt: "2010-01-01",
        endedAt: null,
      },
    ]

    const ranking = createGroupRanking("morningmusume", members, memberships, "all")

    expect(ranking.map((entry) => entry.member.id)).toEqual(["sugihara-meisa"])
  })

  test("グループ在籍データに対応するメンバーが存在しない場合はエラーになる", () => {
    const members: Member[] = [
      {
        id: "oda-sakura",
        name: "小田さくら",
        birthday: "1999-03-12",
      },
    ]

    const memberships: GroupMembership[] = [
      {
        memberId: "ikuta-erina",
        groupId: "morningmusume",
        startedAt: "2011-01-02",
        endedAt: "2025-07-08",
      },
    ]

    expect(() => createGroupRanking("morningmusume", members, memberships, "all")).toThrow(
      "Member not found: ikuta-erina",
    )
  })

  describe("現役・卒業済みの絞り込み", () => {
    const members: Member[] = [
      { id: "fukumura-mizuki", name: "譜久村聖", birthday: "1996-10-30" },
      { id: "ikuta-erina", name: "生田衣梨奈", birthday: "1997-07-07" },
      { id: "sugihara-meisa", name: "杉原明紗", birthday: "2011-12-20" },
      { id: "yasuda-miyu", name: "安田美結", birthday: "2012-04-19" },
    ]
    const memberships: GroupMembership[] = [
      { memberId: "fukumura-mizuki", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2023-11-29" },
      { memberId: "ikuta-erina", groupId: "morningmusume", startedAt: "2011-01-02", endedAt: "2025-07-08" },
      { memberId: "sugihara-meisa", groupId: "morningmusume", startedAt: "2026-03-21", endedAt: null },
      { memberId: "yasuda-miyu", groupId: "morningmusume", startedAt: "2026-06-24", endedAt: null },
    ]
    const currentDate = new Date(2026, 8, 10)

    function createRanking(membershipStatusFilter: MembershipStatusFilter) {
      return createGroupRanking("morningmusume", members, memberships, membershipStatusFilter, currentDate)
        .map((entry) => [entry.member.id, entry.rank])
    }

    test("現役を指定すると卒業日のない在籍だけで順位を付ける", () => {
      expect(createRanking("active")).toEqual([["sugihara-meisa", 1], ["yasuda-miyu", 2]])
    })

    test("卒業済みを指定すると卒業日のある在籍だけで順位を付ける", () => {
      expect(createRanking("graduated")).toEqual([["ikuta-erina", 1], ["fukumura-mizuki", 2]])
    })
  })
})
