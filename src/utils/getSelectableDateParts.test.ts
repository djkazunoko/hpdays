import { describe, expect, test } from "vitest"
import { getSelectableDateParts } from "./getSelectableDateParts"

const minDate = new Date(2008, 5, 22)
const today = new Date(2026, 10, 18, 12, 0)

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

describe("getSelectableDateParts", () => {
  test("年は今年から最も古い日付の年まで、新しい順に並べる", () => {
    expect(getSelectableDateParts(new Date(2015, 0, 2), new Date(2011, 0, 2), today).years).toEqual(range(2011, 2026).reverse())
  })

  test("今年・最も古い年以外では、月は1月から12月まで、日はその月の末日まで選べる", () => {
    const { months, days } = getSelectableDateParts(new Date(2015, 0, 2), minDate, today)
    expect(months).toEqual(range(1, 12))
    expect(days).toEqual(range(1, 31))
  })

  test.each([
    { date: new Date(2015, 1, 1), lastDay: 28, label: "平年の2月" },
    { date: new Date(2016, 1, 1), lastDay: 29, label: "うるう年の2月" },
    { date: new Date(2015, 3, 1), lastDay: 30, label: "4月" },
  ])("$labelは$lastDay日まで選べる", ({ date, lastDay }) => {
    expect(getSelectableDateParts(date, minDate, today).days).toEqual(range(1, lastDay))
  })

  test("未来の日付は選べないよう、今年は今月まで、今月は今日までにする", () => {
    const { months, days } = getSelectableDateParts(new Date(2026, 10, 1), minDate, today)
    expect(months).toEqual(range(1, 11))
    expect(days).toEqual(range(1, 18))
  })

  test("今年でも今月以外は、その月の末日まで選べる", () => {
    expect(getSelectableDateParts(new Date(2026, 9, 1), minDate, today).days).toEqual(range(1, 31))
  })

  test("最も古い日付より前は選べないよう、最も古い年はその月から、その月はその日からにする", () => {
    const { months, days } = getSelectableDateParts(new Date(2008, 5, 30), minDate, today)
    expect(months).toEqual(range(6, 12))
    expect(days).toEqual(range(22, 30))
  })

  test("最も古い年でもその月以外は、1日から選べる", () => {
    expect(getSelectableDateParts(new Date(2008, 6, 1), minDate, today).days).toEqual(range(1, 31))
  })

  test("最も古い日付と今日が同じ年・月の場合は、両方の範囲に収める", () => {
    const { years, months, days } = getSelectableDateParts(new Date(2026, 10, 15), new Date(2026, 10, 10), today)
    expect(years).toEqual([2026])
    expect(months).toEqual([11])
    expect(days).toEqual(range(10, 18))
  })
})
