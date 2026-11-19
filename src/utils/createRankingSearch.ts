import type { MembershipStatusFilter } from "../types/data"
import { toIsoDateString } from "./toIsoDateString"

// 絞り込みと日付を、URLで共有できるようクエリパラメータにする。
// 「すべて」と今日時点（selectedDateがnull）はクエリパラメータなしとし、日付を指定しないURLは常にその日の今日時点を表すようにする。
export function createRankingSearch(membershipStatusFilter: MembershipStatusFilter, selectedDate: Date | null): string {
  const searchParams = new URLSearchParams()
  if (membershipStatusFilter !== "all") searchParams.set("status", membershipStatusFilter)
  if (selectedDate) searchParams.set("date", toIsoDateString(selectedDate))

  const search = searchParams.toString()
  return search ? `?${search}` : ""
}
