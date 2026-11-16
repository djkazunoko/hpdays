// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, describe, expect, test } from "vitest"
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

afterEach(cleanup)

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

  test.each(["/rankings/unknown-group", "/unknown-page"])(
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
