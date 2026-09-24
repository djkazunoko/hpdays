import type { HelloProjectMembershipPeriod } from "../types/data"
import { calculateDateRangeDays } from "./calculateDateRangeDays"

export function calculateHelloProjectMembershipDays(
  membership: HelloProjectMembershipPeriod,
  currentDate = new Date(),
): number {
  return calculateDateRangeDays(membership.startedAt, membership.endedAt, currentDate)
}
