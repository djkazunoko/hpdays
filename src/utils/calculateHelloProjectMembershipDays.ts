import type { HelloProjectMembership } from "../types/data"
import { calculateDateRangeDays } from "./calculateDateRangeDays"

export function calculateHelloProjectMembershipDays(
  membership: HelloProjectMembership,
  currentDate = new Date(),
): number {
  return calculateDateRangeDays(membership.startedAt, membership.endedAt, currentDate)
}
