import { toIsoDateString } from "./toIsoDateString"

// YYYY-MM-DD形式の文字列を日付にする。nullの場合や、存在しない日付・形式が違う値の場合はnullを返す。
export function parseIsoDate(text: string | null): Date | null {
  if (text === null || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return null

  const [year, month, day] = text.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  // 2015-02-29のような存在しない日付は、Dateが翌月へ繰り越すため元の値と一致しない。
  return toIsoDateString(date) === text ? date : null
}
