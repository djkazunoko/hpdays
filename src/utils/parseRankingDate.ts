import { toIsoDateString } from "./toIsoDateString"

// クエリパラメータがない場合や、存在しない日付・形式が違う値の場合はnullを返し、今日として扱う。
// 未来の在籍データは持たないため、未来の日付も指定できないものとして同じく扱う。
export function parseRankingDate(value: string | null, today: Date): Date | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  // 2015-02-29のような存在しない日付は、Dateが翌月へ繰り越すため元の値と一致しない。
  if (toIsoDateString(date) !== value || value > toIsoDateString(today)) return null

  return date
}
