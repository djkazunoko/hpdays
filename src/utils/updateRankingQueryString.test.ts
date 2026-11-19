import { describe, expect, test } from "vitest"
import { updateRankingQueryString } from "./updateRankingQueryString"

describe("updateRankingQueryString", () => {
  test("ランキングの条件が表示内容と一致している場合は、そのまま返す", () => {
    expect(updateRankingQueryString("?date=2015-01-02&status=active", "active", new Date(2015, 0, 2))).toBe("?date=2015-01-02&status=active")
  })

  test("条件がない場合は空文字を返す", () => {
    expect(updateRankingQueryString("", "all", null)).toBe("")
  })

  test("表示内容と異なるstatus・dateは、同じ位置のまま表示内容の値にする", () => {
    expect(updateRankingQueryString("?date=2007-05-19&status=active", "active", new Date(2008, 5, 22))).toBe("?date=2008-06-22&status=active")
  })

  test("表示内容にないstatus・dateはなくす", () => {
    expect(updateRankingQueryString("?status=unknown&date=2026-11-30", "all", null)).toBe("")
  })

  test("ランキングの条件ではないパラメータは、アクセス解析などで使われるためそのまま残す", () => {
    expect(updateRankingQueryString("?utm_source=x&status=unknown&utm_campaign=release", "all", null)).toBe("?utm_source=x&utm_campaign=release")
  })
})
