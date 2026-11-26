import type { GroupMembership, Member, MembershipPeriod, TraineeMembership } from "../types/data"
import { parseMembershipDate } from "./parseMembershipDate"

export function getHelloProjectMembershipPeriod(
  member: Member,
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): MembershipPeriod | null {
  const groupMembershipsOfMember = groupMemberships.filter((groupMembership) => groupMembership.memberId === member.id)
  if (groupMembershipsOfMember.length === 0) return null

  const traineeMembership = traineeMemberships.find((traineeMembership) => traineeMembership.memberId === member.id)
  // 月単位の研修生加入日は、在籍日数の計算と同じく月末を境界として比べる。
  const startedAt = member.helloProjectStartedAt ?? [
    ...(traineeMembership ? [traineeMembership.startedAt] : []),
    ...groupMembershipsOfMember.map((groupMembership) => groupMembership.startedAt),
  ].reduce((earliestStartedAt, date) => (
    parseMembershipDate(date) < parseMembershipDate(earliestStartedAt) ? date : earliestStartedAt
  ))

  const endedAts = groupMembershipsOfMember.map((groupMembership) => groupMembership.endedAt)
  const endedAt = member.helloProjectEndedAt ?? (endedAts.every((date) => date !== null)
    ? endedAts.reduce((latestEndedAt, date) => (date > latestEndedAt ? date : latestEndedAt))
    : null)

  return { startedAt, endedAt }
}
