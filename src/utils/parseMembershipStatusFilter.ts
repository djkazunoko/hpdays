import type { MembershipStatusFilter } from "../types/data"

// クエリパラメータがない場合や、定義していない値の場合は「すべて」として扱う。
export function parseMembershipStatusFilter(value: string | null): MembershipStatusFilter {
  return value === "active" || value === "graduated" ? value : "all"
}
