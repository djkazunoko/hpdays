import type { GroupMembership, Member, MembershipPeriod, TraineeMembership } from "../types/data"

export function getHelloProjectMembershipPeriod(
  member: Member,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): MembershipPeriod | null {
  const groupMembershipsOfMember = groupMemberships.filter((groupMembership) => groupMembership.memberId === member.id)
  if (groupMembershipsOfMember.length === 0) return null

  const traineeMembership = traineeMemberships.find((traineeMembership) => traineeMembership.memberId === member.id)
  const startedAt = member.helloProjectStartedAt ?? traineeMembership?.startedAt ?? groupMembershipsOfMember
    .map((groupMembership) => groupMembership.startedAt)
    .reduce((earliestStartedAt, date) => (date < earliestStartedAt ? date : earliestStartedAt))

  const endedAts = groupMembershipsOfMember.map((groupMembership) => groupMembership.endedAt)
  const endedAt = member.helloProjectEndedAt ?? (endedAts.every((date) => date !== null)
    ? endedAts.reduce((latestEndedAt, date) => (date > latestEndedAt ? date : latestEndedAt))
    : null)

  return { startedAt, endedAt }
}
