import type { MembershipPeriod, MembershipStatusFilter } from "../types/data"

// 現役・卒業済みは保存せず、在籍期間の卒業日がないかどうかで判定する。
export function matchesMembershipStatusFilter(
  membershipPeriod: MembershipPeriod,
  membershipStatusFilter: MembershipStatusFilter,
): boolean {
  if (membershipStatusFilter === "all") return true

  const isActive = membershipPeriod.endedAt === null
  return membershipStatusFilter === "active" ? isActive : !isActive
}
