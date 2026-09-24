import { describe, expect, test } from "vitest"
import { rankByMembershipDays } from "./rankByMembershipDays"

describe("rankByMembershipDays", () => {
  test("在籍日数の降順に並べ、元の情報に順位を付ける", () => {
    const entries = [
      { name: "A", membershipDays: 10 },
      { name: "B", membershipDays: 30 },
      { name: "C", membershipDays: 20 },
    ]

    expect(rankByMembershipDays(entries)).toEqual([
      { name: "B", membershipDays: 30, rank: 1 },
      { name: "C", membershipDays: 20, rank: 2 },
      { name: "A", membershipDays: 10, rank: 3 },
    ])
  })

  test("同じ日数は同順位とし、次の順位を人数分飛ばす", () => {
    const entries = [3, 3, 2, 2, 1].map((membershipDays) => ({ membershipDays }))

    expect(rankByMembershipDays(entries).map(({ rank }) => rank)).toEqual([1, 1, 3, 3, 5])
  })

  test("空の配列には空の配列を返す", () => {
    expect(rankByMembershipDays([])).toEqual([])
  })
})
