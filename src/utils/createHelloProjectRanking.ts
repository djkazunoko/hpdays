import type { GroupMembership, Member, RankingEntry, TraineeMembership } from "../types/data"
import { calculateMembershipDays } from "./calculateMembershipDays"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"
import { isMinimumMembershipDays } from "./isMinimumMembershipDays"
import { rankByMembershipDays } from "./rankByMembershipDays"

export function createHelloProjectRanking(
  members: Member[],
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
  currentDate = new Date(),
): RankingEntry[] {
  const memberIds = [...new Set(groupMemberships.map((entry) => entry.memberId))]
  const entries = memberIds.map((memberId) => {
    const member = members.find((entry) => entry.id === memberId)
    if (!member) throw new Error(`Member not found: ${memberId}`)

    // memberIdsはグループ在籍データから取得しているため、在籍期間は必ず存在する。
    const membershipPeriod = getHelloProjectMembershipPeriod(memberId, groupMemberships, traineeMemberships)!
    return {
      member,
      membershipDays: calculateMembershipDays(membershipPeriod, currentDate),
      isMinimumMembershipDays: isMinimumMembershipDays(membershipPeriod),
    }
  })

  return rankByMembershipDays(entries)
}
