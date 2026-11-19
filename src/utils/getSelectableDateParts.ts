function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

// 日付を年・月・日で選ぶときの選択肢を求める。年は新しい順に並べる。
// 最も古い日付より前と、未来の在籍データは持たないため今日より後は選べないようにする。
export function getSelectableDateParts(
  date: Date,
  minDate: Date,
  today: Date,
): { years: number[]; months: number[]; days: number[] } {
  const isMinYear = date.getFullYear() === minDate.getFullYear()
  const isMinMonth = isMinYear && date.getMonth() === minDate.getMonth()
  const isCurrentYear = date.getFullYear() === today.getFullYear()
  const isCurrentMonth = isCurrentYear && date.getMonth() === today.getMonth()
  // 翌月の0日目は、その月の末日になる。
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  return {
    years: range(minDate.getFullYear(), today.getFullYear()).reverse(),
    months: range(isMinYear ? minDate.getMonth() + 1 : 1, isCurrentYear ? today.getMonth() + 1 : 12),
    days: range(isMinMonth ? minDate.getDate() : 1, isCurrentMonth ? today.getDate() : lastDay),
  }
}
