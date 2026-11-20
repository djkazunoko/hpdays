import type { MembershipPeriod, MembershipStatusFilter } from "../types/data"
import { toIsoDateString } from "./toIsoDateString"

// 現役・卒業済みは保存せず、基準日時点で在籍期間の卒業日を迎えたかどうかで判定する。
// 卒業日当日はまだ在籍しているため現役とし、翌日から卒業済みとする。
export function matchesMembershipStatusFilter(
  membershipPeriod: MembershipPeriod,
  membershipStatusFilter: MembershipStatusFilter,
  baseDate: Date,
): boolean {
  if (membershipStatusFilter === "all") return true

  const isActive = membershipPeriod.endedAt === null || membershipPeriod.endedAt >= toIsoDateString(baseDate)
  return membershipStatusFilter === "active" ? isActive : !isActive
}
