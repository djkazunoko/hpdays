import { toIsoDateString } from "./toIsoDateString"

// クエリパラメータがない場合や、存在しない日付・形式が違う値の場合は、意図した日付が分からないためnullを返し、今日として扱う。
// 指定できる範囲の外の日付は、範囲の端に寄せる。
// 未来の在籍データは持たないため、未来の日付は今日（null）とし、最も古い日付より前の日付は最も古い日付にする。
export function parseRankingDate(value: string | null, minDate: Date, today: Date): Date | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  // 2015-02-29のような存在しない日付は、Dateが翌月へ繰り越すため元の値と一致しない。
  if (toIsoDateString(date) !== value) return null
  if (value > toIsoDateString(today)) return null

  return date < minDate ? minDate : date
}
