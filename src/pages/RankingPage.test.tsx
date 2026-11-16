// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import type { ComponentProps } from "react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, test } from "vitest"
import type { RankingEntry } from "../types/data"
import { RankingPage } from "./RankingPage"

function createEntry(
  rank: number,
  name: string,
  membershipDays: number,
  isMinimumMembershipDays = false,
): RankingEntry {
  return {
    rank,
    member: { id: name, name, birthday: "2000-01-01" },
    membershipDays,
    isMinimumMembershipDays,
  }
}

const groupA = { id: "group-a", name: "グループA" }
const groupB = { id: "group-b", name: "グループB" }

// 対象・絞り込みのリンクがルーターを必要とするため、MemoryRouterの中で表示する。
function renderRankingPage(props: Partial<ComponentProps<typeof RankingPage>>, path = "/rankings") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <RankingPage groups={[]} selectedGroup={null} ranking={[]} membershipStatusFilter="all" {...props} />
    </MemoryRouter>,
  )
}

function getTargetLinks() {
  return within(screen.getByRole("navigation", { name: "ランキングの対象" })).getAllByRole("link")
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
      createEntry(1, "メンバーA", 5302),
      createEntry(2, "メンバーB", 100),
      createEntry(2, "メンバーC", 100),
      createEntry(4, "メンバーD", 1),
    ]
    renderRankingPage({ ranking })

    expect(getRowTexts()).toEqual([
      ["1", "メンバーA", "5302日"],
      ["2", "メンバーB", "100日"],
      ["2", "メンバーC", "100日"],
      ["4", "メンバーD", "1日"],
    ])
  })

  test("確認できる最小在籍日数は「日以上」と表示する", () => {
    renderRankingPage({ ranking: [createEntry(1, "メンバーA", 5302, true)] })

    expect(getRowTexts()).toEqual([["1", "メンバーA", "5302日以上"]])
  })

  test("グループを選択していない場合は、Hello! Project全体のランキングであることを見出しに表示する", () => {
    renderRankingPage({ selectedGroup: null })

    expect(screen.getByRole("heading", { name: "ハロプロ在籍日数ランキング" })).toBeDefined()
  })

  test("グループを選択している場合はグループ名を見出しに表示する", () => {
    renderRankingPage({ groups: [groupA], selectedGroup: groupA })

    expect(screen.getByRole("heading", { name: "グループA 在籍日数ランキング" })).toBeDefined()
  })

  test("Hello! Project全体と各グループのランキングへのリンクを、グループの並び順のまま表示する", () => {
    renderRankingPage({ groups: [groupA, groupB] })

    expect(getTargetLinks().map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["ハロプロ全体", "/rankings"],
      ["グループA", "/rankings/group-a"],
      ["グループB", "/rankings/group-b"],
    ])
  })

  test("対象を切り替えるリンクは、絞り込みの状態を引き継ぐ", () => {
    renderRankingPage({ groups: [groupA], membershipStatusFilter: "active" }, "/rankings?status=active")

    expect(getTargetLinks().map((link) => link.getAttribute("href"))).toEqual([
      "/rankings?status=active",
      "/rankings/group-a?status=active",
    ])
  })

  test.each([
    { selectedGroup: null, label: "ハロプロ全体" },
    { selectedGroup: groupB, label: "グループB" },
  ])("「$label」を表示している場合は「$label」だけを選択中として示す", ({ selectedGroup, label }) => {
    renderRankingPage({ groups: [groupA, groupB], selectedGroup })

    expect(getTargetLinks().filter((link) => link.getAttribute("aria-current") === "page").map((link) => link.textContent)).toEqual([label])
  })

  test("すべて・現役・OGを切り替えるリンクを、現在のパスのクエリパラメータとして表示する", () => {
    renderRankingPage({}, "/rankings/group-a")

    const links = within(screen.getByRole("navigation", { name: "メンバーの絞り込み" })).getAllByRole("link")
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["すべて", "/rankings/group-a"],
      ["現役", "/rankings/group-a?status=active"],
      ["OG", "/rankings/group-a?status=graduated"],
    ])
  })

  test.each([
    { membershipStatusFilter: "all", label: "すべて" },
    { membershipStatusFilter: "active", label: "現役" },
    { membershipStatusFilter: "graduated", label: "OG" },
  ] as const)("絞り込みが「$membershipStatusFilter」の場合は「$label」だけを選択中として示す", ({ membershipStatusFilter, label }) => {
    renderRankingPage({ membershipStatusFilter })

    const links = within(screen.getByRole("navigation", { name: "メンバーの絞り込み" })).getAllByRole("link")
    expect(links.filter((link) => link.getAttribute("aria-current") === "page").map((link) => link.textContent)).toEqual([label])
  })

  test.each([
    { membershipStatusFilter: "all", message: "メンバーはいません" },
    { membershipStatusFilter: "active", message: "現役メンバーはいません" },
    { membershipStatusFilter: "graduated", message: "OGはいません" },
  ] as const)("絞り込みが「$membershipStatusFilter」で対象のメンバーがいない場合は、表の代わりに「$message」と表示する", ({ membershipStatusFilter, message }) => {
    renderRankingPage({ ranking: [], membershipStatusFilter })

    expect(screen.getByText(message)).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
    // 他の条件に切り替えられるよう、絞り込みのリンクは表示したままにする。
    expect(screen.getByRole("navigation", { name: "メンバーの絞り込み" })).toBeDefined()
  })

  test("対象のメンバーがいる場合は、メッセージを表示しない", () => {
    renderRankingPage({ ranking: [createEntry(1, "メンバーA", 100)], membershipStatusFilter: "active" })

    expect(screen.queryByText("現役メンバーはいません")).toBeNull()
    expect(screen.getByRole("table")).toBeDefined()
  })
})
