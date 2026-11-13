import type { GroupMembership, Member, MembershipStatusFilter, RankingEntry } from "../types/data"
import { calculateMembershipDays } from "./calculateMembershipDays"
import { isMinimumMembershipDays } from "./isMinimumMembershipDays"
import { matchesMembershipStatusFilter } from "./matchesMembershipStatusFilter"
import { rankByMembershipDays } from "./rankByMembershipDays"

export function createGroupRanking(
  groupId: string,
  members: Member[],
  groupMemberships: GroupMembership[],
  membershipStatusFilter: MembershipStatusFilter,
  currentDate = new Date(),
): RankingEntry[] {
  const memberships = groupMemberships.filter((membership) =>
    membership.groupId === groupId && matchesMembershipStatusFilter(membership, membershipStatusFilter),
  )
  const entries = memberships.map((membership) => {
    const member = members.find((entry) => entry.id === membership.memberId)
    if (!member) throw new Error(`Member not found: ${membership.memberId}`)

    return {
      member,
      membershipDays: calculateMembershipDays(membership, currentDate),
      isMinimumMembershipDays: isMinimumMembershipDays(membership),
    }
  })

  return rankByMembershipDays(entries)
}
