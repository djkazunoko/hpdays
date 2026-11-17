import type {
  Group,
  GroupMembership,
  Member,
  MemberDetail,
  MembershipPeriod,
  MembershipSummary,
  TraineeMembership,
} from "../types/data"
import { calculateMembershipDays } from "./calculateMembershipDays"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"
import { isMinimumMembershipDays } from "./isMinimumMembershipDays"

function createMembershipSummary({ startedAt, endedAt }: MembershipPeriod, currentDate: Date): MembershipSummary {
  return {
    startedAt,
    endedAt,
    membershipDays: calculateMembershipDays({ startedAt, endedAt }, currentDate),
    isMinimumMembershipDays: isMinimumMembershipDays({ startedAt, endedAt }),
  }
}

// 存在しないメンバーIDの場合はnullを返す。
export function createMemberDetail(
  memberId: string,
  members: Member[],
  groups: Group[],
  groupMemberships: GroupMembership[],
  traineeMemberships: TraineeMembership[],
  currentDate = new Date(),
): MemberDetail | null {
  const member = members.find((member) => member.id === memberId)
  if (!member) return null

  // グループ在籍のない人物は掲載対象ではないため、存在しないメンバーとして扱う。
  const helloProjectMembershipPeriod = getHelloProjectMembershipPeriod(member, groupMemberships, traineeMemberships)
  if (!helloProjectMembershipPeriod) return null

  const groupMembershipsOfMember = groupMemberships
    .filter((groupMembership) => groupMembership.memberId === member.id)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  const traineeMembership = traineeMemberships.find((traineeMembership) => traineeMembership.memberId === member.id)

  return {
    member,
    helloProjectMembershipSummary: createMembershipSummary(helloProjectMembershipPeriod, currentDate),
    groupMembershipSummaries: groupMembershipsOfMember.map((groupMembership) => {
      const group = groups.find((group) => group.id === groupMembership.groupId)
      if (!group) throw new Error(`Group not found: ${groupMembership.groupId}`)

      return { group, ...createMembershipSummary(groupMembership, currentDate) }
    }),
    traineeStartedAt: traineeMembership?.startedAt ?? null,
  }
}
