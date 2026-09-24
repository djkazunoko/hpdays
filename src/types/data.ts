export type Member = {
  id: string
  name: string
  birthday: string
}

export type Group = {
  id: string
  name: string
}

export type GroupMembership = {
  memberId: string
  groupId: string
  startedAt: string
  endedAt: string | null
}

export type TraineeMembership = {
  memberId: string
  startedAt: string
}

export type RankingEntry = {
  rank: number
  member: Member
  membershipDays: number
}

export type MembershipPeriod = {
  startedAt: string
  endedAt: string | null
}

export type HelloProjectMembershipPeriod = MembershipPeriod

export type HelloProjectRankingEntry = RankingEntry & HelloProjectMembershipPeriod
