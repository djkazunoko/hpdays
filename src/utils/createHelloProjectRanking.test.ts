import { describe, expect, test } from "vitest"
import type { GroupMembership } from "../types/data"
import { createHelloProjectRanking } from "./createHelloProjectRanking"

const groupMemberships: GroupMembership[] = [
  { memberId: "a", groupId: "second", startedAt: "2020-01-10", endedAt: "2020-01-12" },
  { memberId: "a", groupId: "first", startedAt: "2020-01-01", endedAt: "2020-01-03" },
]

describe("createHelloProjectRanking", () => {
  test("メンバー単位で最小在籍日数の降順に並べ、同順位の次を飛ばす", () => {
    const members = ["d", "b", "a", "c", "trainee"].map((id) => ({ id, name: id, birthday: "2000-01-01" }))
    const memberships = [
      ...groupMemberships,
      { memberId: "b", groupId: "group", startedAt: "2020-01-02", endedAt: null },
      { memberId: "c", groupId: "group", startedAt: "2020-01-02", endedAt: "2020-01-12" },
      { memberId: "d", groupId: "group", startedAt: "2020-01-12", endedAt: null },
    ]
    const trainees = [{ memberId: "a", startedAt: "2019-12" }, { memberId: "trainee", startedAt: "2010-01" }]
    const original = structuredClone({ members, memberships, trainees })
    const ranking = createHelloProjectRanking(members, memberships, trainees, new Date(2020, 0, 12))
    expect(ranking.map(({ member, membershipDays, rank }) => [member.id, membershipDays, rank])).toEqual([
      ["a", 13, 1], ["b", 11, 2], ["c", 11, 2], ["d", 1, 4],
    ])
    expect(ranking[0].startedAt).toBe("2019-12")
    expect({ members, memberships, trainees }).toEqual(original)
  })

  test("空のデータでは空のランキングを返す", () => {
    expect(createHelloProjectRanking([], [], [])).toEqual([])
  })

  test("在籍データに対応するメンバーがなければエラーになる", () => {
    expect(() => createHelloProjectRanking([], groupMemberships, [])).toThrow("Member not found: a")
  })
})
