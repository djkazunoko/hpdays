import type { GroupMembership, HelloProjectMembershipPeriod, TraineeMembership } from "../types/data"

export function getHelloProjectMembershipPeriod(
  memberId: string,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): HelloProjectMembershipPeriod | null {
  const memberships = groupMemberships.filter((entry) => entry.memberId === memberId)
  if (memberships.length === 0) return null

  const trainee = traineeMemberships.find((entry) => entry.memberId === memberId)
  const startedAt = trainee?.startedAt ?? memberships.reduce(
    (earliestStartedAt, entry) => entry.startedAt < earliestStartedAt ? entry.startedAt : earliestStartedAt,
    memberships[0].startedAt,
  )
  const endedAt = memberships.some((entry) => entry.endedAt === null)
    ? null
    : memberships.reduce(
        (latestEndedAt, entry) => entry.endedAt! > latestEndedAt ? entry.endedAt! : latestEndedAt,
        memberships[0].endedAt!,
      )

  return { startedAt, endedAt }
}
