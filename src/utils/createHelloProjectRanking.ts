import type { GroupMembership, Member, MembershipStatusFilter, RankingEntry, TraineeMembership } from "../types/data"
import { calculateMembershipDays } from "./calculateMembershipDays"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"
import { isMinimumMembershipDays } from "./isMinimumMembershipDays"
import { matchesMembershipStatusFilter } from "./matchesMembershipStatusFilter"
import { rankByMembershipDays } from "./rankByMembershipDays"

export function createHelloProjectRanking(
  members: Member[],
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
  membershipStatusFilter: MembershipStatusFilter,
  currentDate = new Date(),
): RankingEntry[] {
  const memberIds = [...new Set(groupMemberships.map((entry) => entry.memberId))]
  const entries: Omit<RankingEntry, "rank">[] = []

  for (const memberId of memberIds) {
    const member = members.find((entry) => entry.id === memberId)
    if (!member) throw new Error(`Member not found: ${memberId}`)

    // memberIdsはグループ在籍データから取得しているため、在籍期間は必ず存在する。
    const membershipPeriod = getHelloProjectMembershipPeriod(member, groupMemberships, traineeMemberships)!
    // グループ在籍ではなくH!P在籍期間で判定するため、H!P卒業日の明示値も反映される。
    if (!matchesMembershipStatusFilter(membershipPeriod, membershipStatusFilter)) continue

    entries.push({
      member,
      membershipDays: calculateMembershipDays(membershipPeriod, currentDate),
      isMinimumMembershipDays: isMinimumMembershipDays(membershipPeriod),
    })
  }

  return rankByMembershipDays(entries)
}
