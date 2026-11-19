import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router'
import groupMemberships from './data/group-memberships.json'
import groups from './data/groups.json'
import members from './data/members.json'
import traineeMemberships from './data/trainee-memberships.json'
import { MemberDetailPage } from './pages/MemberDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RankingPage } from './pages/RankingPage'
import type { Group } from './types/data'
import { createGroupRanking } from './utils/createGroupRanking'
import { createHelloProjectRanking } from './utils/createHelloProjectRanking'
import { createMemberDetail } from './utils/createMemberDetail'
import { getEarliestMembershipStartDate } from './utils/getEarliestMembershipStartDate'
import { normalizeRankingDate } from './utils/normalizeRankingDate'
import { parseIsoDate } from './utils/parseIsoDate'
import { parseMembershipStatusFilter } from './utils/parseMembershipStatusFilter'
import { updateRankingQueryString } from './utils/updateRankingQueryString'

// Hello! Project全体とグループ別のランキングで共通の処理。selectedGroupがnullの場合はHello! Project全体を表す。
function RankingRoute({ selectedGroup }: { selectedGroup: Group | null }) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const today = new Date()
  const minDate = getEarliestMembershipStartDate(selectedGroup?.id ?? null, members, groupMemberships, traineeMemberships)
  const membershipStatusFilter = parseMembershipStatusFilter(searchParams.get('status'))
  // 解釈できない日付は、意図した日付が分からないため指定なし（今日）として扱う。
  const requestedDate = parseIsoDate(searchParams.get('date'))
  const selectedDate = requestedDate && normalizeRankingDate(requestedDate, minDate, today)

  // 解釈できない値や範囲外の日付が指定された場合は、表示内容と一致するURLに書き換える。
  // 「戻る」で書き換え前のURLに戻らないよう、履歴を置き換える。
  const updatedQueryString = updateRankingQueryString(location.search, membershipStatusFilter, selectedDate)
  if (updatedQueryString !== location.search) return <Navigate to={{ search: updatedQueryString }} replace />

  // 日付を指定していない場合は、今日時点のランキングを計算する。
  const baseDate = selectedDate ?? today
  const ranking = selectedGroup
    ? createGroupRanking(selectedGroup.id, members, groupMemberships, membershipStatusFilter, baseDate)
    : createHelloProjectRanking(members, groupMemberships, traineeMemberships, membershipStatusFilter, baseDate)

  return (
    <RankingPage
      groups={groups}
      selectedGroup={selectedGroup}
      ranking={ranking}
      membershipStatusFilter={membershipStatusFilter}
      selectedDate={selectedDate}
      minDate={minDate}
      today={today}
    />
  )
}

function GroupRankingRoute() {
  const { groupId } = useParams()
  const group = groups.find((group) => group.id === groupId)
  if (!group) return <NotFoundPage />

  return <RankingRoute selectedGroup={group} />
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
      <Route path="/rankings" element={<RankingRoute selectedGroup={null} />} />
      <Route path="/rankings/:groupId" element={<GroupRankingRoute />} />
      <Route path="/members/:memberId" element={<MemberDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
