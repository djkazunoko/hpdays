export type Member = {
  id: string
  name: string
  birthday: string
  // 研修生歴とグループ在籍から導出できない人だけが持つ。H!P在籍期間は getHelloProjectMembershipPeriod で求める。
  helloProjectStartedAt?: string
  helloProjectEndedAt?: string
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
  isMinimumMembershipDays: boolean
}

export type MembershipPeriod = {
  startedAt: string
  endedAt: string | null
}

export type MembershipStatusFilter = "all" | "active" | "graduated"
