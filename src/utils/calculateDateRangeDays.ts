const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcTimestamp(date: string): number {
  const [year, month, day] = date.split("-").map(Number)

  // 月単位の日付は、保証できる最小日数を求めるため月末を境界にする。
  // 実際の加入日を月末と推定するものではない。
  return day === undefined ? Date.UTC(year, month, 0) : Date.UTC(year, month - 1, day)
}

export function calculateDateRangeDays(
  startDate: string,
  endDate: string | null,
  currentDate = new Date(),
): number {
  const startedAt = toUtcTimestamp(startDate)

  const endedAt = endDate
    ? toUtcTimestamp(endDate)
    : Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      )

  return Math.floor((endedAt - startedAt) / MILLISECONDS_PER_DAY) + 1
}
