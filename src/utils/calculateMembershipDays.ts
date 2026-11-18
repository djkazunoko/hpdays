import type { MembershipPeriod } from "../types/data"

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcTimestamp(date: string): number {
  const [year, month, day] = date.split("-").map(Number)

  // 月単位の日付は、保証できる最小日数を求めるため月末を境界にする。
  // 実際の加入日を月末と推定するものではない。
  return day === undefined ? Date.UTC(year, month, 0) : Date.UTC(year, month - 1, day)
}

// 基準日時点の在籍日数を求める。卒業日がないか、基準日より後に卒業する場合は基準日まで計算する。
// 基準日より後に加入した在籍は0以下になる。
export function calculateMembershipDays(
  membershipPeriod: MembershipPeriod,
  baseDate = new Date(),
): number {
  const startTimestamp = toUtcTimestamp(membershipPeriod.startedAt)
  const baseTimestamp = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())

  const endTimestamp = membershipPeriod.endedAt
    ? Math.min(toUtcTimestamp(membershipPeriod.endedAt), baseTimestamp)
    : baseTimestamp

  return Math.floor((endTimestamp - startTimestamp) / MILLISECONDS_PER_DAY) + 1
}
