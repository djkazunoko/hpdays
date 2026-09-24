import type {
  GroupMembership,
  Member,
  RankingEntry,
} from "../types/data"
import { calculateMembershipDays } from "./calculateMembershipDays"
import { rankByMembershipDays } from "./rankByMembershipDays"

export function createGroupRanking(
  members: Member[],
  memberships: GroupMembership[],
  currentDate = new Date(),
): RankingEntry[] {
  const entries = memberships.map((membership) => {
    const member = members.find(
      (member) => member.id === membership.memberId,
    )

    if (!member) {
      throw new Error(`Member not found: ${membership.memberId}`)
    }

    return {
      member,
      membershipDays: calculateMembershipDays(membership, currentDate),
    }
  })

  return rankByMembershipDays(entries)
}
