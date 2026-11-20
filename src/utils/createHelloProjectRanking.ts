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
  baseDate = new Date(),
): RankingEntry[] {
  const memberIds = [...new Set(groupMemberships.map((groupMembership) => groupMembership.memberId))]
  const unrankedEntries: Omit<RankingEntry, "rank">[] = []

  for (const memberId of memberIds) {
    const member = members.find((member) => member.id === memberId)
    if (!member) throw new Error(`Member not found: ${memberId}`)

    // memberIdsはグループ在籍データから取得しているため、在籍期間は必ず存在する。
    const membershipPeriod = getHelloProjectMembershipPeriod(member, groupMemberships, traineeMemberships)!
    // グループ在籍ではなくH!P在籍期間で判定するため、H!P卒業日の明示値も反映される。
    if (!matchesMembershipStatusFilter(membershipPeriod, membershipStatusFilter, baseDate)) continue

    const membershipDays = calculateMembershipDays(membershipPeriod, baseDate)
    // 基準日より後に加入したメンバーは含めない。
    // 月単位の加入日は月末を開始境界とするため、同じ月の途中を基準日にした場合は、基準日までに加入していたと確認できないものとして含めない。
    if (membershipDays < 1) continue

    unrankedEntries.push({
      member,
      membershipDays,
      isMinimumMembershipDays: isMinimumMembershipDays(membershipPeriod),
    })
  }

  return rankByMembershipDays(unrankedEntries)
}
