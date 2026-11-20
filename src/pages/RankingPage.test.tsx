// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import type { ComponentProps } from "react"
import { MemoryRouter, useLocation } from "react-router"
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

const today = new Date(2026, 10, 18)

// 日付の指定で移動した先のURLを確認するため、現在のURLを表示する。
function CurrentUrl() {
  const location = useLocation()
  return <output>{location.pathname + location.search}</output>
}

// 対象・絞り込みのリンクがルーターを必要とするため、MemoryRouterの中で表示する。
function renderRankingPage(props: Partial<ComponentProps<typeof RankingPage>>, path = "/rankings") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <RankingPage
        groups={[]}
        selectedGroup={null}
        ranking={[]}
        membershipStatusFilter="all"
        selectedDate={null}
        minDate={new Date(2011, 0, 2)}
        today={today}
        {...props}
      />
      <CurrentUrl />
    </MemoryRouter>,
  )
}

function getMembershipStatusFilterLinks() {
  return within(screen.getByRole("navigation", { name: "メンバーの絞り込み" })).getAllByRole("link")
}

function getDateSelect(name: "年" | "月" | "日") {
  return screen.getByRole("combobox", { name }) as HTMLSelectElement
}

function getSelectedDateParts() {
  return [getDateSelect("年").value, getDateSelect("月").value, getDateSelect("日").value]
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

  test("メンバー名を、メンバー詳細へのリンクとして表示する", () => {
    renderRankingPage({ ranking: [{ ...createEntry(1, "小田さくら", 100), member: { id: "oda-sakura", name: "小田さくら", birthday: "1999-03-12" } }] })

    expect(screen.getByRole("link", { name: "小田さくら" }).getAttribute("href")).toBe("/members/oda-sakura")
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

    const links = getMembershipStatusFilterLinks()
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

    const links = getMembershipStatusFilterLinks()
    expect(links.filter((link) => link.getAttribute("aria-current") === "page").map((link) => link.textContent)).toEqual([label])
  })

  test.each([
    { membershipStatusFilter: "all", heading: "2015年1月2日時点のメンバー" },
    { membershipStatusFilter: "active", heading: "2015年1月2日時点の現役メンバー" },
    { membershipStatusFilter: "graduated", heading: "2015年1月2日時点のOG" },
  ] as const)("絞り込みが「$membershipStatusFilter」の場合は、日付と合わせて「$heading」と表示する", ({ membershipStatusFilter, heading }) => {
    renderRankingPage({ ranking: [createEntry(1, "メンバーA", 100)], membershipStatusFilter, selectedDate: new Date(2015, 0, 2) })

    expect(screen.getByText(heading)).toBeDefined()
  })

  test.each([
    { membershipStatusFilter: "all", message: "2015年1月2日時点のメンバーはいません" },
    { membershipStatusFilter: "active", message: "2015年1月2日時点の現役メンバーはいません" },
    { membershipStatusFilter: "graduated", message: "2015年1月2日時点のOGはいません" },
  ] as const)("絞り込みが「$membershipStatusFilter」で対象のメンバーがいない場合は、表の代わりに「$message」と表示する", ({ membershipStatusFilter, message }) => {
    renderRankingPage({ ranking: [], membershipStatusFilter, selectedDate: new Date(2015, 0, 2) })

    expect(screen.getByText(message)).toBeDefined()
    expect(screen.queryByRole("table")).toBeNull()
    // 他の条件に切り替えられるよう、絞り込みのリンクは表示したままにする。
    expect(screen.getByRole("navigation", { name: "メンバーの絞り込み" })).toBeDefined()
  })

  describe("日付の指定", () => {
    test("日付を指定していない場合は、今日時点のランキングであることを表示し、今日を選択する", () => {
      renderRankingPage({ selectedDate: null })

      expect(screen.getByText("2026年11月18日時点のメンバー")).toBeDefined()
      expect(getSelectedDateParts()).toEqual(["2026", "11", "18"])
    })

    test("日付を指定している場合は、その日時点のランキングであることを表示し、その日を選択する", () => {
      renderRankingPage({ selectedDate: new Date(2015, 0, 2) }, "/rankings?date=2015-01-02")

      expect(screen.getByText("2015年1月2日時点のメンバー")).toBeDefined()
      expect(getSelectedDateParts()).toEqual(["2015", "1", "2"])
    })

    test("年は最も古い日付の年から今年まで、古い順に選べる", () => {
      renderRankingPage({ minDate: new Date(2024, 5, 16) })

      expect(within(getDateSelect("年")).getAllByRole("option").map((option) => option.textContent)).toEqual(["2024", "2025", "2026"])
    })

    test("未来の日付は選べないよう、今日を選択している場合は今月・今日までを選択肢にする", () => {
      renderRankingPage({})

      expect(within(getDateSelect("月")).getAllByRole("option")).toHaveLength(11)
      expect(within(getDateSelect("日")).getAllByRole("option")).toHaveLength(18)
    })

    test("年・月・日を選ぶと、絞り込みの状態を保ったままその日付をクエリパラメータにする", () => {
      renderRankingPage({ membershipStatusFilter: "active", selectedDate: new Date(2015, 0, 2) }, "/rankings/group-a?status=active&date=2015-01-02")

      fireEvent.change(getDateSelect("年"), { target: { value: "2012" } })

      expect(screen.getByRole("status").textContent).toBe("/rankings/group-a?status=active&date=2012-01-02")
    })

    test("月を変えて存在しない日付になる場合は、その月の末日にする", () => {
      renderRankingPage({ selectedDate: new Date(2015, 0, 31) }, "/rankings?date=2015-01-31")

      fireEvent.change(getDateSelect("月"), { target: { value: "2" } })

      expect(screen.getByRole("status").textContent).toBe("/rankings?date=2015-02-28")
    })

    test("最も古い日付の月を選択している場合は、その日からを選択肢にする", () => {
      renderRankingPage({ minDate: new Date(2008, 5, 22), selectedDate: new Date(2008, 5, 30) }, "/rankings?date=2008-06-30")

      expect(within(getDateSelect("月")).getAllByRole("option").map((option) => option.textContent)).toEqual(["6", "7", "8", "9", "10", "11", "12"])
      expect(within(getDateSelect("日")).getAllByRole("option")[0].textContent).toBe("22")
    })

    test("年を変えて最も古い日付より前になる場合は、最も古い日付にする", () => {
      renderRankingPage({ minDate: new Date(2008, 5, 22), selectedDate: new Date(2010, 0, 1) }, "/rankings?date=2010-01-01")

      fireEvent.change(getDateSelect("年"), { target: { value: "2008" } })

      expect(screen.getByRole("status").textContent).toBe("/rankings?date=2008-06-22")
    })

    test("年を変えて未来の日付になる場合は、今日にする", () => {
      renderRankingPage({ selectedDate: new Date(2015, 11, 1) }, "/rankings?date=2015-12-01")

      fireEvent.change(getDateSelect("年"), { target: { value: "2026" } })

      expect(screen.getByRole("status").textContent).toBe("/rankings?date=2026-11-18")
    })

    test("今日時点に戻すリンクは、絞り込みの状態を保ったまま日付のクエリパラメータをなくす", () => {
      renderRankingPage({ membershipStatusFilter: "graduated", selectedDate: new Date(2015, 0, 2) }, "/rankings?status=graduated&date=2015-01-02")

      expect(screen.getByRole("link", { name: "今日" }).getAttribute("href")).toBe("/rankings?status=graduated")
    })

    test("対象・絞り込みを切り替えるリンクは、指定した日付を引き継ぐ", () => {
      renderRankingPage(
        { groups: [groupA], membershipStatusFilter: "active", selectedDate: new Date(2015, 0, 2) },
        "/rankings?status=active&date=2015-01-02",
      )

      expect(getTargetLinks().map((link) => link.getAttribute("href"))).toEqual([
        "/rankings?status=active&date=2015-01-02",
        "/rankings/group-a?status=active&date=2015-01-02",
      ])
      expect(getMembershipStatusFilterLinks().map((link) => link.getAttribute("href"))).toEqual([
        "/rankings?date=2015-01-02",
        "/rankings?status=active&date=2015-01-02",
        "/rankings?status=graduated&date=2015-01-02",
      ])
    })
  })

  test("対象のメンバーがいる場合は、メッセージを表示しない", () => {
    renderRankingPage({ ranking: [createEntry(1, "メンバーA", 100)], membershipStatusFilter: "active" })

    expect(screen.queryByText("2026年11月18日時点の現役メンバーはいません")).toBeNull()
    expect(screen.getByRole("table")).toBeDefined()
  })
})
