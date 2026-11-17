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

// 在籍期間と、その期間から求めた在籍日数。
export type MembershipSummary = MembershipPeriod & {
  membershipDays: number
  isMinimumMembershipDays: boolean
}

export type GroupMembershipSummary = MembershipSummary & {
  group: Group
}

export type MemberDetail = {
  member: Member
  helloProjectMembershipSummary: MembershipSummary
  groupMembershipSummaries: GroupMembershipSummary[]
  // 研修生歴がない場合はnull。
  traineeStartedAt: string | null
}

export type MembershipStatusFilter = "all" | "active" | "graduated"
