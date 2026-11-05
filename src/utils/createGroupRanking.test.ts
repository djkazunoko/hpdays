import { describe, expect, test } from "vitest"
import type { GroupMembership, Member } from "../types/data"
import { createGroupRanking } from "./createGroupRanking"

describe("createGroupRanking", () => {
  test("在籍日数の長い順にランキングを作成する", () => {
    const members: Member[] = [
      {
        id: "oda-sakura",
        name: "小田さくら",
        birthday: "1999-03-12",
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
        memberId: "oda-sakura",
        groupId: "morning-musume",
        startedAt: "2012-09-14",
        endedAt: null,
      },
      {
        memberId: "fukumura-mizuki",
        groupId: "morning-musume",
        startedAt: "2011-01-02",
        endedAt: "2023-11-29",
      },
      {
        memberId: "ikuta-erina",
        groupId: "morning-musume",
        startedAt: "2011-01-02",
        endedAt: "2025-07-08",
      },
    ]

    const currentDate = new Date(2026, 8, 10)

    const ranking = createGroupRanking("morning-musume", members, memberships, currentDate)

    expect(ranking.map((entry) => entry.member.id)).toEqual([
      "ikuta-erina",
      "oda-sakura",
      "fukumura-mizuki",
    ])

    expect(ranking.map((entry) => entry.rank)).toEqual([1, 2, 3])
  })

  test("在籍日数が最小在籍日数かどうかを含める", () => {
    const member: Member = {
      id: "oda-sakura",
      name: "小田さくら",
      birthday: "1999-03-12",
    }

    const memberships: GroupMembership[] = [
      {
        memberId: "oda-sakura",
        groupId: "morning-musume",
        startedAt: "2012-09-14",
        endedAt: null,
      },
    ]

    const ranking = createGroupRanking("morning-musume", [member], memberships, new Date(2012, 8, 15))

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
        id: "oda-sakura",
        name: "小田さくら",
        birthday: "1999-03-12",
      },
      {
        id: "other-group-member",
        name: "他グループのメンバー",
        birthday: "2000-01-01",
      },
    ]

    const memberships: GroupMembership[] = [
      {
        memberId: "oda-sakura",
        groupId: "morning-musume",
        startedAt: "2012-09-14",
        endedAt: null,
      },
      {
        memberId: "other-group-member",
        groupId: "other-group",
        startedAt: "2010-01-01",
        endedAt: null,
      },
    ]

    const ranking = createGroupRanking("morning-musume", members, memberships)

    expect(ranking.map((entry) => entry.member.id)).toEqual(["oda-sakura"])
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
        groupId: "morning-musume",
        startedAt: "2011-01-02",
        endedAt: "2025-07-08",
      },
    ]

    expect(() => createGroupRanking("morning-musume", members, memberships)).toThrow(
      "Member not found: ikuta-erina",
    )
  })
})
