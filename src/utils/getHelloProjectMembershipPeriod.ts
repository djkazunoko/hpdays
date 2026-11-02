import type { GroupMembership, MembershipPeriod, TraineeMembership } from "../types/data"

export function getHelloProjectMembershipPeriod(
  memberId: string,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): MembershipPeriod | null {
  const memberships = groupMemberships.filter((entry) => entry.memberId === memberId)
  if (memberships.length === 0) return null

  const trainee = traineeMemberships.find((entry) => entry.memberId === memberId)
  const startedAt = trainee?.startedAt ?? memberships
    .map((entry) => entry.startedAt)
    .reduce((earliestStartedAt, date) => (date < earliestStartedAt ? date : earliestStartedAt))

  const endedAts = memberships.map((entry) => entry.endedAt)
  const endedAt = endedAts.every((date) => date !== null)
    ? endedAts.reduce((latestEndedAt, date) => (date > latestEndedAt ? date : latestEndedAt))
    : null

  return { startedAt, endedAt }
}
