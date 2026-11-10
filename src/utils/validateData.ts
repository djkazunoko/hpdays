import type { Group, GroupMembership, Member, TraineeMembership } from "../types/data"
import { getHelloProjectMembershipPeriod } from "./getHelloProjectMembershipPeriod"

export type Data = {
  members: Member[]
  groups: Group[]
  groupMemberships: GroupMembership[]
  traineeMemberships: TraineeMembership[]
}

// 形式だけでなく、2026-02-30のような存在しない日付も不正とする。
function isValidDate(date: string, allowMonth = false): boolean {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(date)
  if (!match) return false

  const [, year, month, day] = match.map(Number)
  if (month < 1 || month > 12) return false
  if (Number.isNaN(day)) return allowMonth

  return day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function findDuplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
}

export function validateData({ members, groups, groupMemberships, traineeMemberships }: Data): string[] {
  const errors: string[] = []
  const memberIds = new Set(members.map((member) => member.id))
  const groupIds = new Set(groups.map((group) => group.id))

  for (const id of findDuplicates(members.map((member) => member.id))) {
    errors.push(`Duplicate member id: ${id}`)
  }

  for (const id of findDuplicates(groups.map((group) => group.id))) {
    errors.push(`Duplicate group id: ${id}`)
  }

  for (const member of members) {
    if (!isValidDate(member.birthday)) {
      errors.push(`Invalid birthday: ${member.id} ${member.birthday}`)
    }

    const { helloProjectStartedAt, helloProjectEndedAt } = member
    if (helloProjectStartedAt === undefined && helloProjectEndedAt === undefined) continue

    // 明示値は導出できない場合だけ持つ。導出値より外側でなければ、導出できるようになった値の消し忘れか入力ミスとみなす。
    const derivedPeriod = getHelloProjectMembershipPeriod(
      { ...member, helloProjectStartedAt: undefined, helloProjectEndedAt: undefined },
      groupMemberships,
      traineeMemberships,
    )

    if (helloProjectStartedAt !== undefined) {
      if (!isValidDate(helloProjectStartedAt, true)) {
        errors.push(`Invalid helloProjectStartedAt: ${member.id} ${helloProjectStartedAt}`)
      }
      if (derivedPeriod && helloProjectStartedAt >= derivedPeriod.startedAt) {
        errors.push(`Explicit helloProjectStartedAt is not before derived: ${member.id} ${helloProjectStartedAt} ${derivedPeriod.startedAt}`)
      }
    }

    if (helloProjectEndedAt !== undefined) {
      if (!isValidDate(helloProjectEndedAt)) {
        errors.push(`Invalid helloProjectEndedAt: ${member.id} ${helloProjectEndedAt}`)
      }
      // 現役のグループ在籍がある（導出値がnull）場合も、H!P卒業日を持つのは矛盾するためエラーとする。
      if (derivedPeriod && (derivedPeriod.endedAt === null || helloProjectEndedAt <= derivedPeriod.endedAt)) {
        errors.push(`Explicit helloProjectEndedAt is not after derived: ${member.id} ${helloProjectEndedAt} ${derivedPeriod.endedAt}`)
      }
    }
  }

  for (const membership of groupMemberships) {
    const { memberId, groupId, startedAt, endedAt } = membership

    if (!memberIds.has(memberId)) {
      errors.push(`Member not found in group-memberships: ${memberId}`)
    }
    if (!groupIds.has(groupId)) {
      errors.push(`Group not found in group-memberships: ${groupId}`)
    }
    if (!isValidDate(startedAt)) {
      errors.push(`Invalid group membership startedAt: ${memberId} ${startedAt}`)
    }
    if (endedAt !== null && !isValidDate(endedAt)) {
      errors.push(`Invalid group membership endedAt: ${memberId} ${endedAt}`)
    }
    if (endedAt !== null && endedAt < startedAt) {
      errors.push(`Group membership ends before it starts: ${memberId} ${startedAt} ${endedAt}`)
    }
  }

  const groupMembershipKeys = groupMemberships.map(({ memberId, groupId, startedAt, endedAt }) =>
    [memberId, groupId, startedAt, endedAt].join(" "),
  )
  for (const key of findDuplicates(groupMembershipKeys)) {
    errors.push(`Duplicate group membership: ${key}`)
  }

  for (const id of findDuplicates(traineeMemberships.map((trainee) => trainee.memberId))) {
    errors.push(`Duplicate trainee membership: ${id}`)
  }

  for (const { memberId, startedAt } of traineeMemberships) {
    if (!memberIds.has(memberId)) {
      errors.push(`Member not found in trainee-memberships: ${memberId}`)
    }
    if (!isValidDate(startedAt, true)) {
      errors.push(`Invalid trainee membership startedAt: ${memberId} ${startedAt}`)
    }
    // 研修生のみで活動を終了した人は掲載対象としないため、グループ在籍が必要。
    if (!groupMemberships.some((membership) => membership.memberId === memberId)) {
      errors.push(`Group membership not found for trainee: ${memberId}`)
    }
  }

  return errors
}
