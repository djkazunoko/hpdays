import type { GroupMembership, HelloProjectMembership, TraineeMembership } from "../types/data"

export function getHelloProjectMembership(
  memberId: string,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): HelloProjectMembership | null {
  const memberships = groupMemberships.filter((entry) => entry.memberId === memberId)
  if (memberships.length === 0) return null

  const trainee = traineeMemberships.find((entry) => entry.memberId === memberId)
  const startedAt = trainee?.startedAt ?? memberships.reduce(
    (earliest, entry) => entry.startedAt < earliest ? entry.startedAt : earliest,
    memberships[0].startedAt,
  )
  const endedAt = memberships.some((entry) => entry.endedAt === null)
    ? null
    : memberships.reduce(
        (latest, entry) => entry.endedAt! > latest ? entry.endedAt! : latest,
        memberships[0].endedAt!,
      )

  return { startedAt, endedAt }
}
