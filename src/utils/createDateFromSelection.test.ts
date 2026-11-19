import { describe, expect, test } from "vitest"
import { createDateFromSelection } from "./createDateFromSelection"

const minDate = new Date(2008, 5, 22)
const today = new Date(2026, 10, 18, 12, 0)

describe("createDateFromSelection", () => {
  test("選んだ年・月・日の日付にする", () => {
    expect(createDateFromSelection(2015, 1, 2, minDate, today)).toEqual(new Date(2015, 0, 2))
  })

  test("その月に存在しない日は、月の末日にする", () => {
    expect(createDateFromSelection(2015, 2, 31, minDate, today)).toEqual(new Date(2015, 1, 28))
    expect(createDateFromSelection(2016, 2, 31, minDate, today)).toEqual(new Date(2016, 1, 29))
  })

  test("未来の日付になる場合は、今日にする", () => {
    expect(createDateFromSelection(2026, 12, 1, minDate, today)).toEqual(new Date(2026, 10, 18))
    expect(createDateFromSelection(2026, 11, 19, minDate, today)).toEqual(new Date(2026, 10, 18))
  })

  test("今日は今日のまま選べる", () => {
    expect(createDateFromSelection(2026, 11, 18, minDate, today)).toEqual(new Date(2026, 10, 18))
  })

  test("最も古い日付より前になる場合は、最も古い日付にする", () => {
    expect(createDateFromSelection(2008, 1, 15, minDate, today)).toEqual(new Date(2008, 5, 22))
    expect(createDateFromSelection(2008, 6, 21, minDate, today)).toEqual(new Date(2008, 5, 22))
  })
})
