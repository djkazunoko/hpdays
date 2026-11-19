import type { GroupMembership, Member, TraineeMembership } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"

// 加入日を、在籍日数を数え始める日にする。
// 月単位の加入日は、在籍日数の計算と同じく月末を開始境界とする。
function toStartDate(startedAt: string): Date {
  const [year, month, day] = startedAt.split("-").map(Number)
  return day === undefined ? new Date(year, month, 0) : new Date(year, month - 1, day)
}

// 対象の中で最も古い加入日を求める。
// groupIdがnullの場合はHello! Project全体を対象とし、H!P加入日で求める。
export function getEarliestMembershipStartDate(
  groupId: string | null,
  members: Member[],
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
): Date {
  const startedAts = groupId === null
    ? members.flatMap((member) => {
        // グループ在籍のないメンバーは掲載対象ではないため、在籍期間がnullになり含まれない。
        const membershipPeriod = getHelloProjectMembershipPeriod(member, groupMemberships, traineeMemberships)
        return membershipPeriod ? [membershipPeriod.startedAt] : []
      })
    : groupMemberships
        .filter((groupMembership) => groupMembership.groupId === groupId)
        .map((groupMembership) => groupMembership.startedAt)
  if (startedAts.length === 0) throw new Error(`No memberships: ${groupId}`)

  return startedAts
    .map(toStartDate)
    .reduce((earliestDate, date) => (date < earliestDate ? date : earliestDate))
}
