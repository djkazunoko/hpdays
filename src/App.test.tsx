// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
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

afterEach(cleanup)

describe("App", () => {
  test("/rankingsでグループ在籍のある全メンバーのHello! Project在籍日数ランキングを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/rankings"]}>
        <App />
      </MemoryRouter>,
    )

    expect(getRowMemberNames()).toEqual(getMemberNames([...new Set(groupMemberships.map((membership) => membership.memberId))]))
  })

  test.each([
    { groupId: "morning-musume", groupName: "モーニング娘。" },
    { groupId: "rosychronicle", groupName: "ロージークロニクル" },
  ])("/rankings/$groupIdでそのグループに在籍した全メンバーの在籍日数ランキングを表示する", ({ groupId, groupName }) => {
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
