import type { GroupMembership, HelloProjectRankingEntry, Member, TraineeMembership } from "../types/data"
import { calculateHelloProjectMembershipDays } from "./calculateHelloProjectMembershipDays"
import { getHelloProjectMembership } from "./getHelloProjectMembership"
import { rankByMembershipDays } from "./rankByMembershipDays"

export function createHelloProjectRanking(
  members: Member[],
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
  currentDate = new Date(),
): HelloProjectRankingEntry[] {
  const memberIds = [...new Set(groupMemberships.map((entry) => entry.memberId))]
  const entries = memberIds.map((memberId) => {
    const member = members.find((entry) => entry.id === memberId)
    if (!member) throw new Error(`Member not found: ${memberId}`)

    // memberIdsはグループ在籍データから取得しているため、在籍期間は必ず存在する。
    const membership = getHelloProjectMembership(memberId, groupMemberships, traineeMemberships)!
    return {
      member,
      ...membership,
      membershipDays: calculateHelloProjectMembershipDays(membership, currentDate),
    }
  })

  return rankByMembershipDays(entries)
}
