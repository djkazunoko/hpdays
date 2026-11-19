import { describe, expect, test } from "vitest"
import { parseIsoDate } from "./parseIsoDate"

describe("parseIsoDate", () => {
  test("YYYY-MM-DD形式の日付を、その日の日付にする", () => {
    expect(parseIsoDate("2015-01-02")).toEqual(new Date(2015, 0, 2))
  })

  test("nullの場合はnullを返す", () => {
    expect(parseIsoDate(null)).toBeNull()
  })

  test.each(["2015-02-29", "2015-13-01", "2015-1-2", "2015-01", "20150102", "unknown", ""])(
    "存在しない日付や形式が違う値「%s」はnullを返す",
    (text) => {
      expect(parseIsoDate(text)).toBeNull()
    },
  )
})
