// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"
import type { HelloProjectRankingEntry } from "../types/data"
import { RankingPage } from "./RankingPage"

function createEntry(
  rank: number,
  name: string,
  membershipDays: number,
  startedAt: string,
): HelloProjectRankingEntry {
  return {
    rank,
    member: { id: name, name, birthday: "2000-01-01" },
    membershipDays,
    startedAt,
    endedAt: null,
  }
}

function getRowTexts() {
  return screen.getAllByRole("row").slice(1).map((row) =>
    within(row).getAllByRole("cell").map((cell) => cell.textContent),
  )
}

afterEach(cleanup)

describe("RankingPage", () => {
  test("順位・メンバー名・在籍日数を表示し、同じ在籍日数は同順位で表示する", () => {
    const ranking = [
      createEntry(1, "メンバーA", 5302, "2012-01-01"),
      createEntry(2, "メンバーB", 100, "2020-01-01"),
      createEntry(2, "メンバーC", 100, "2020-01-01"),
      createEntry(4, "メンバーD", 1, "2025-01-01"),
    ]
    render(<RankingPage ranking={ranking} />)

    expect(screen.getByRole("heading", { name: "在籍日数ランキング" })).toBeDefined()
    expect(getRowTexts()).toEqual([
      ["1", "メンバーA", "5302日"],
      ["2", "メンバーB", "100日"],
      ["2", "メンバーC", "100日"],
      ["4", "メンバーD", "1日"],
    ])
  })

  test("加入日が月までしか分からないメンバーは在籍日数を「日以上」と表示する", () => {
    render(<RankingPage ranking={[createEntry(1, "メンバーA", 5302, "2011-11")]} />)

    expect(getRowTexts()).toEqual([["1", "メンバーA", "5302日以上"]])
  })
})
