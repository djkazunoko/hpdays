// 年・月・日の選択を変えたときの日付を求める。月は1始まりで受け取る。
// 1月31日のまま2月に変えた場合のように存在しない日になる場合は月の末日にする。
// 選べる範囲の外になる場合は、最も古い日付より前なら最も古い日付に、未来なら今日にする。
export function createDateFromSelection(year: number, month: number, day: number, minDate: Date, today: Date): Date {
  const lastDay = new Date(year, month, 0).getDate()
  const date = new Date(year, month - 1, Math.min(day, lastDay))
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (date < minDate) return minDate
  return date > todayDate ? todayDate : date
}
