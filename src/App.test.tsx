// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, test, vi } from "vitest"
import App from "./App"

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

    const rows = screen.getAllByRole("row").slice(1).map((row) =>
      within(row).getAllByRole("cell").map((cell) => cell.textContent),
    )
    expect(rows).toEqual([
      ["1", "譜久村聖", "5631日以上"],
      ["2", "小田さくら", "5453日以上"],
      ["3", "生田衣梨奈", "5302日"],
      ["4", "山﨑愛生", "3748日以上"],
      ["5", "櫻井梨央", "1589日"],
    ])
  })
})
