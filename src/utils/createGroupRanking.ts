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
  baseDate = new Date(),
): RankingEntry[] {
  const unrankedEntries: Omit<RankingEntry, "rank">[] = []

  for (const groupMembership of groupMemberships) {
    if (groupMembership.groupId !== groupId) continue
    if (!matchesMembershipStatusFilter(groupMembership, membershipStatusFilter, baseDate)) continue

    const membershipDays = calculateMembershipDays(groupMembership, baseDate)
    // 基準日より後に加入した在籍は、基準日時点では在籍していないため含めない。
    if (membershipDays < 1) continue

    const member = members.find((member) => member.id === groupMembership.memberId)
    if (!member) throw new Error(`Member not found: ${groupMembership.memberId}`)

    unrankedEntries.push({
      member,
      membershipDays,
      isMinimumMembershipDays: isMinimumMembershipDays(groupMembership),
    })
  }

  return rankByMembershipDays(unrankedEntries)
}
