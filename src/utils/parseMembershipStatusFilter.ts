import type { MembershipStatusFilter } from "../types/data"

// クエリパラメータがない場合や、定義していない値の場合は「すべて」として扱う。
export function parseMembershipStatusFilter(text: string | null): MembershipStatusFilter {
  return text === "active" || text === "graduated" ? text : "all"
}
