// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, describe, expect, test, vi } from "vitest"
import App from "./App"
import groupMemberships from "./data/group-memberships.json"
import members from "./data/members.json"

// 順位や日数の正しさは計算処理と画面のテストで検証し、ここではデータの追加・修正の影響を受けないよう表示されるメンバーだけを確認する。
function getRowMemberNames() {
  return screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[1].textContent).sort()
}

function getMemberNames(memberIds: string[]) {
  return memberIds.map((memberId) => members.find((member) => member.id === memberId)?.name).sort()
}

// リダイレクト後のURLを確認するため、現在のURLを表示する。
function CurrentUrl() {
  const location = useLocation()
  return <output>{location.pathname + location.search}</output>
}

// 指定日時点のメンバー。卒業日当日はまだ在籍しているため含める。
function getGroupMemberIdsOnDate(groupId: string, date: string) {
  return groupMemberships
    .filter((membership) => membership.groupId === groupId && membership.startedAt <= date && (membership.endedAt === null || membership.endedAt >= date))
    .map((membership) => membership.memberId)
}

function getEarliestGroupStartedAt(groupId: string) {
  return groupMemberships
    .filter((membership) => membership.groupId === groupId)
    .map((membership) => membership.startedAt)
    .sort()[0]
}

afterEach(() => {
  cleanup()
  // テストで固定した日付を戻し、次のテストに影響させない。
  vi.useRealTimers()
})

describe("App", () => {
  test("/は/rankingsへリダイレクトし、Hello! Project在籍日数ランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe("/rankings")
    expect(screen.getByRole("heading", { name: "ハロプロ在籍日数ランキング" })).toBeDefined()
  })

  test("/のクエリパラメータは、リダイレクト先へ引き継がない", () => {
    render(
      <MemoryRouter initialEntries={["/?status=active"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe("/rankings")
    expect(screen.getByRole("link", { name: "すべて" }).getAttribute("aria-current")).toBe("page")
  })

  test("/rankingsでグループ在籍のある全メンバーのHello! Project在籍日数ランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings"]}>
        <App />
      </MemoryRouter>,
    )

    expect(getRowMemberNames()).toEqual(getMemberNames([...new Set(groupMemberships.map((membership) => membership.memberId))]))
  })

  test.each([
    { groupId: "morningmusume", groupName: "モーニング娘。" },
    { groupId: "rosychronicle", groupName: "ロージークロニクル" },
  ])("/rankings/$groupId でそのグループに在籍した全メンバーの在籍日数ランキングを表示する", ({ groupId, groupName }) => {
    render(
      <MemoryRouter initialEntries={[`/rankings/${groupId}`]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { name: `${groupName} 在籍日数ランキング` })).toBeDefined()
    expect(getRowMemberNames()).toEqual(getMemberNames(
      groupMemberships.filter((membership) => membership.groupId === groupId).map((membership) => membership.memberId),
    ))
  })

  test("/rankings?status=activeで現役メンバーだけのHello! Project在籍日数ランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings?status=active"]}>
        <App />
      </MemoryRouter>,
    )

    expect(getRowMemberNames()).toEqual(getMemberNames([...new Set(
      groupMemberships.filter((membership) => membership.endedAt === null).map((membership) => membership.memberId),
    )]))
  })

  test("/rankings/:groupId?status=graduatedでそのグループを卒業したメンバーだけのランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/morningmusume?status=graduated"]}>
        <App />
      </MemoryRouter>,
    )

    expect(getRowMemberNames()).toEqual(getMemberNames(
      groupMemberships
        .filter((membership) => membership.groupId === "morningmusume" && membership.endedAt !== null)
        .map((membership) => membership.memberId),
    ))
  })

  test("絞り込みのリンクを選ぶと、同じグループのランキングを絞り込んで表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/morningmusume"]}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: "現役" }))

    expect(screen.getByRole("heading", { name: "モーニング娘。 在籍日数ランキング" })).toBeDefined()
    expect(getRowMemberNames()).toEqual(getMemberNames(
      groupMemberships
        .filter((membership) => membership.groupId === "morningmusume" && membership.endedAt === null)
        .map((membership) => membership.memberId),
    ))
  })

  test("グループのリンクを選ぶと、絞り込みを保ったままそのグループのランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings?status=active"]}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: "モーニング娘。" }))

    expect(screen.getByRole("heading", { name: "モーニング娘。 在籍日数ランキング" })).toBeDefined()
    expect(screen.getByRole("link", { name: "現役" }).getAttribute("aria-current")).toBe("page")
    expect(getRowMemberNames()).toEqual(getMemberNames(
      groupMemberships
        .filter((membership) => membership.groupId === "morningmusume" && membership.endedAt === null)
        .map((membership) => membership.memberId),
    ))
  })

  test("/rankings/:groupId?status=active&date=YYYY-MM-DDでその日時点に在籍していたメンバーだけのランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/morningmusume?status=active&date=2015-01-02"]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText("2015年1月2日時点の現役メンバー")).toBeDefined()
    expect(getRowMemberNames()).toEqual(getMemberNames(getGroupMemberIdsOnDate("morningmusume", "2015-01-02")))
  })

  test.each([
    { path: "/rankings?date=2015-02-29", label: "存在しない日付" },
    { path: "/rankings?date=unknown", label: "形式が違う値" },
    { path: "/rankings?date=2026-11-19", label: "未来の日付" },
  ])("「$label」は、日付のクエリパラメータをなくして今日時点のランキングを表示する", ({ path }) => {
    // Dateだけを固定し、画面の更新に使われるタイマーは実際のものを使う。
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(2026, 10, 18, 12, 0))
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe("/rankings")
    expect(screen.getByText("2026年11月18日時点のメンバー")).toBeDefined()
  })

  test("対象の最も古い加入日より前の日付は、最も古い加入日に寄せる", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/rosychronicle?status=active&date=2010-01-01"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe(`/rankings/rosychronicle?status=active&date=${getEarliestGroupStartedAt("rosychronicle")}`)
  })

  test("定義していない絞り込みの値は、statusのクエリパラメータをなくしてすべてを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings?status=unknown&date=2015-01-02"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe("/rankings?date=2015-01-02")
    expect(screen.getByRole("link", { name: "すべて" }).getAttribute("aria-current")).toBe("page")
  })

  test("URLを書き換える場合も、ランキングの条件ではないパラメータは残す", () => {
    render(
      <MemoryRouter initialEntries={["/rankings?utm_source=x&status=unknown"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    expect(screen.getByRole("status").textContent).toBe("/rankings?utm_source=x")
  })

  test("対象を切り替えて日付がその対象の最も古い加入日より前になる場合は、最も古い加入日に寄せる", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/morningmusume?date=2015-01-02"]}>
        <App />
        <CurrentUrl />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: "ロージークロニクル" }))

    expect(screen.getByRole("heading", { name: "ロージークロニクル 在籍日数ランキング" })).toBeDefined()
    expect(screen.getByRole("status").textContent).toBe(`/rankings/rosychronicle?date=${getEarliestGroupStartedAt("rosychronicle")}`)
  })

  test("年・月・日を選ぶと、絞り込みを保ったままその日時点のランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings/morningmusume?status=active"]}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByRole("combobox", { name: "年" }), { target: { value: "2015" } })
    fireEvent.change(screen.getByRole("combobox", { name: "月" }), { target: { value: "1" } })
    fireEvent.change(screen.getByRole("combobox", { name: "日" }), { target: { value: "2" } })

    expect(screen.getByText("2015年1月2日時点の現役メンバー")).toBeDefined()
    expect(screen.getByRole("link", { name: "現役" }).getAttribute("aria-current")).toBe("page")
    expect(getRowMemberNames()).toEqual(getMemberNames(getGroupMemberIdsOnDate("morningmusume", "2015-01-02")))
  })

  test("/members/:memberId でそのメンバーの在籍記録を表示する", () => {
    render(
      <MemoryRouter initialEntries={["/members/oda-sakura"]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 1, name: "小田さくら" })).toBeDefined()
    expect(screen.getByRole("link", { name: "モーニング娘。" }).getAttribute("href")).toBe("/rankings/morningmusume")
  })

  test("ランキングのメンバー名を選ぶと、そのメンバーの詳細を表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings"]}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: "小田さくら" }))

    expect(screen.getByRole("heading", { level: 1, name: "小田さくら" })).toBeDefined()
  })

  test("メンバー詳細のランキングへのリンクを選ぶと、ランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/members/oda-sakura"]}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("link", { name: "ハロプロ在籍日数ランキング" }))

    expect(screen.getByRole("heading", { level: 1, name: "ハロプロ在籍日数ランキング" })).toBeDefined()
  })

  test.each(["/rankings/unknown-group", "/members", "/members/unknown-member", "/unknown-page"])(
    "%sは存在しないページを表示する",
    (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      )

      expect(screen.getByRole("heading", { name: "ページが見つかりません" })).toBeDefined()
    },
  )
})
