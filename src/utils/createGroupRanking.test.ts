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

    const ranking = createGroupRanking(members, memberships, currentDate)

    expect(ranking.map((entry) => entry.member.id)).toEqual([
      "ikuta-erina",
      "oda-sakura",
      "fukumura-mizuki",
    ])

    expect(ranking.map((entry) => entry.rank)).toEqual([1, 2, 3])
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

    expect(() => createGroupRanking(members, memberships)).toThrow(
      "Member not found: ikuta-erina",
    )
  })
})
