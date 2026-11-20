import type { MembershipPeriod } from "../types/data"
import { parseMembershipDate } from "./parseMembershipDate"

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

// サマータイムなどで1日の長さが変わっても日数がずれないよう、UTCの同じ年月日で比べる。
function toUtcTimestamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

// 基準日時点の在籍日数を求める。卒業日がないか、基準日より後に卒業する場合は基準日まで計算する。
// 基準日より後に加入した在籍は0以下になる。
export function calculateMembershipDays(
  membershipPeriod: MembershipPeriod,
  baseDate = new Date(),
): number {
  const startTimestamp = toUtcTimestamp(parseMembershipDate(membershipPeriod.startedAt))
  const baseTimestamp = toUtcTimestamp(baseDate)

  const endTimestamp = membershipPeriod.endedAt
    ? Math.min(toUtcTimestamp(parseMembershipDate(membershipPeriod.endedAt)), baseTimestamp)
    : baseTimestamp

  return Math.floor((endTimestamp - startTimestamp) / MILLISECONDS_PER_DAY) + 1
}
