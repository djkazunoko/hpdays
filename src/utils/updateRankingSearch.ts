import type { MembershipStatusFilter } from "../types/data"
import { createRankingSearch } from "./createRankingSearch"

const rankingSearchParamNames = ["status", "date"]

// 今のURLのクエリパラメータのうち、ランキングの条件（status・date）だけを表示内容に合わせた値にする。
// utm_sourceなど、それ以外のパラメータはアクセス解析などで使われるため、そのまま残す。
export function updateRankingSearch(
  search: string,
  membershipStatusFilter: MembershipStatusFilter,
  selectedDate: Date | null,
): string {
  const searchParams = new URLSearchParams(search)
  const rankingSearchParams = new URLSearchParams(createRankingSearch(membershipStatusFilter, selectedDate))

  for (const name of rankingSearchParamNames) {
    const value = rankingSearchParams.get(name)
    if (value === null) {
      searchParams.delete(name)
    } else {
      searchParams.set(name, value)
    }
  }

  const updatedSearch = searchParams.toString()
  return updatedSearch ? `?${updatedSearch}` : ""
}
