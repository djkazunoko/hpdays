import type { MembershipStatusFilter } from "../types/data"
import { toRankingQueryString } from "./toRankingQueryString"

const rankingSearchParamNames = ["status", "date"]

// 今のURLのクエリパラメータのうち、ランキングの条件（status・date）だけを表示内容に合わせた値にする。
// utm_sourceなど、それ以外のパラメータはアクセス解析などで使われるため、そのまま残す。
export function updateRankingQueryString(
  queryString: string,
  membershipStatusFilter: MembershipStatusFilter,
  selectedDate: Date | null,
): string {
  const searchParams = new URLSearchParams(queryString)
  const rankingSearchParams = new URLSearchParams(toRankingQueryString(membershipStatusFilter, selectedDate))

  for (const name of rankingSearchParamNames) {
    const value = rankingSearchParams.get(name)
    if (value === null) {
      searchParams.delete(name)
    } else {
      searchParams.set(name, value)
    }
  }

  const updatedQueryString = searchParams.toString()
  return updatedQueryString ? `?${updatedQueryString}` : ""
}
