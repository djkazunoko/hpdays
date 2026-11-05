// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, test, vi } from "vitest"
import App from "./App"

function getRowTexts() {
  return screen.getAllByRole("row").slice(1).map((row) =>
    within(row).getAllByRole("cell").map((cell) => cell.textContent),
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("App", () => {
  test("/rankingsで登録データから生成したHello! Project在籍日数ランキングを表示する", () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 3), toFake: ["Date"] })
    render(
      <MemoryRouter initialEntries={["/rankings"]}>
        <App />
      </MemoryRouter>,
    )

    expect(getRowTexts()).toEqual([
      ["1", "譜久村聖", "5631日以上"],
      ["2", "小田さくら", "5453日以上"],
      ["3", "生田衣梨奈", "5302日"],
      ["4", "山﨑愛生", "3748日以上"],
      ["5", "櫻井梨央", "1589日"],
    ])
  })

  test("/rankings/:groupIdで登録データから生成したグループの在籍日数ランキングを表示する", () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 3), toFake: ["Date"] })
    render(
      <MemoryRouter initialEntries={["/rankings/morning-musume"]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { name: "モーニング娘。 在籍日数ランキング" })).toBeDefined()
    expect(getRowTexts()).toEqual([
      ["1", "生田衣梨奈", "5302日"],
      ["2", "小田さくら", "5164日"],
      ["3", "譜久村聖", "4715日"],
      ["4", "山﨑愛生", "2692日"],
      ["5", "櫻井梨央", "1589日"],
    ])
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
