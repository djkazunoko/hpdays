import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import groupMemberships from './data/group-memberships.json'
import groups from './data/groups.json'
import members from './data/members.json'
import traineeMemberships from './data/trainee-memberships.json'
import { MemberDetailPage } from './pages/MemberDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RankingPage } from './pages/RankingPage'
import { createGroupRanking } from './utils/createGroupRanking'
import { createHelloProjectRanking } from './utils/createHelloProjectRanking'
import { createMemberDetail } from './utils/createMemberDetail'
import { parseMembershipStatusFilter } from './utils/parseMembershipStatusFilter'
import { parseRankingDate } from './utils/parseRankingDate'

function useRankingConditions() {
  const [searchParams] = useSearchParams()
  const today = new Date()
  const selectedDate = parseRankingDate(searchParams.get('date'), today)

  return {
    membershipStatusFilter: parseMembershipStatusFilter(searchParams.get('status')),
    selectedDate,
    today,
    // 日付を指定していない場合は、今日時点のランキングを計算する。
    baseDate: selectedDate ?? today,
  }
}

function HelloProjectRankingRoute() {
  const { membershipStatusFilter, selectedDate, today, baseDate } = useRankingConditions()

  return (
    <RankingPage
      groups={groups}
      selectedGroup={null}
      ranking={createHelloProjectRanking(members, groupMemberships, traineeMemberships, membershipStatusFilter, baseDate)}
      membershipStatusFilter={membershipStatusFilter}
      selectedDate={selectedDate}
      today={today}
    />
  )
}

function GroupRankingRoute() {
  const { groupId } = useParams()
  const { membershipStatusFilter, selectedDate, today, baseDate } = useRankingConditions()
  const group = groups.find((group) => group.id === groupId)
  if (!group) return <NotFoundPage />

  return (
    <RankingPage
      groups={groups}
      selectedGroup={group}
      ranking={createGroupRanking(group.id, members, groupMemberships, membershipStatusFilter, baseDate)}
      membershipStatusFilter={membershipStatusFilter}
      selectedDate={selectedDate}
      today={today}
    />
  )
}

function MemberDetailRoute() {
  const { memberId } = useParams()
  // :memberId にマッチしたルートなので、memberIdは必ず存在する。
  const memberDetail = createMemberDetail(memberId!, members, groups, groupMemberships, traineeMemberships)
  if (!memberDetail) return <NotFoundPage />

  return <MemberDetailPage memberDetail={memberDetail} />
}

function App() {
  return (
    <Routes>
      {/* / は特定機能の恒久的なURLにしないため、同じ画面を表示せずリダイレクトする。 */}
      <Route path="/" element={<Navigate to="/rankings" replace />} />
      <Route path="/rankings" element={<HelloProjectRankingRoute />} />
      <Route path="/rankings/:groupId" element={<GroupRankingRoute />} />
      <Route path="/members/:memberId" element={<MemberDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
