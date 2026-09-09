import type { GroupMembership } from "../types/data"

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcTimestamp(date: string): number {
  const [year, month, day] = date.split("-").map(Number)

  return Date.UTC(year, month - 1, day)
}

export function calculateMembershipDays(
  membership: GroupMembership,
  currentDate = new Date(),
): number {
  const startedAt = toUtcTimestamp(membership.startedAt)

  const endedAt = membership.endedAt
    ? toUtcTimestamp(membership.endedAt)
    : Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      )

  return Math.floor((endedAt - startedAt) / MILLISECONDS_PER_DAY) + 1
}
