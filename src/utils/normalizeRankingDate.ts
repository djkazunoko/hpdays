import { toIsoDateString } from "./toIsoDateString"

// 指定された日付を、ランキングで指定できる日付に正規化する。
// 未来の在籍データは持たないため、未来の日付はnullを返し、今日として扱う。
// 最も古い日付より前の日付は、指定した時代に近い時点を表示するため、最も古い日付に寄せる。
export function normalizeRankingDate(date: Date, minDate: Date, today: Date): Date | null {
  if (toIsoDateString(date) > toIsoDateString(today)) return null

  return date < minDate ? minDate : date
}
