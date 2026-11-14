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
  const targetGroupMemberships = groupMemberships.filter((groupMembership) =>
    groupMembership.groupId === groupId && matchesMembershipStatusFilter(groupMembership, membershipStatusFilter),
  )
  const unrankedEntries = targetGroupMemberships.map((groupMembership) => {
    const member = members.find((member) => member.id === groupMembership.memberId)
    if (!member) throw new Error(`Member not found: ${groupMembership.memberId}`)

    return {
      member,
      membershipDays: calculateMembershipDays(groupMembership, currentDate),
      isMinimumMembershipDays: isMinimumMembershipDays(groupMembership),
    }
  })

  return rankByMembershipDays(unrankedEntries)
}
