import type { GroupMembership, Member, MembershipPeriod, TraineeMembership } from "../types/data"

export function getHelloProjectMembershipPeriod(
  member: Member,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): MembershipPeriod | null {
  const memberships = groupMemberships.filter((entry) => entry.memberId === member.id)
  if (memberships.length === 0) return null

  const trainee = traineeMemberships.find((entry) => entry.memberId === member.id)
  const startedAt = member.helloProjectStartedAt ?? trainee?.startedAt ?? memberships
    .map((entry) => entry.startedAt)
    .reduce((earliestStartedAt, date) => (date < earliestStartedAt ? date : earliestStartedAt))

  const endedAts = memberships.map((entry) => entry.endedAt)
  const endedAt = member.helloProjectEndedAt ?? (endedAts.every((date) => date !== null)
    ? endedAts.reduce((latestEndedAt, date) => (date > latestEndedAt ? date : latestEndedAt))
    : null)

  return { startedAt, endedAt }
}
