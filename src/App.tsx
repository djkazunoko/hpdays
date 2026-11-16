import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import groupMemberships from './data/group-memberships.json'
import groups from './data/groups.json'
import members from './data/members.json'
import traineeMemberships from './data/trainee-memberships.json'
import { NotFoundPage } from './pages/NotFoundPage'
import { RankingPage } from './pages/RankingPage'
import { createGroupRanking } from './utils/createGroupRanking'
import { createHelloProjectRanking } from './utils/createHelloProjectRanking'
import { parseMembershipStatusFilter } from './utils/parseMembershipStatusFilter'

function useMembershipStatusFilter() {
  const [searchParams] = useSearchParams()
  return parseMembershipStatusFilter(searchParams.get('status'))
}

function HelloProjectRankingRoute() {
  const membershipStatusFilter = useMembershipStatusFilter()

  return (
    <RankingPage
      groups={groups}
      selectedGroup={null}
      ranking={createHelloProjectRanking(members, groupMemberships, traineeMemberships, membershipStatusFilter)}
      membershipStatusFilter={membershipStatusFilter}
    />
  )
}

function GroupRankingRoute() {
  const { groupId } = useParams()
  const membershipStatusFilter = useMembershipStatusFilter()
  const group = groups.find((group) => group.id === groupId)
  if (!group) return <NotFoundPage />

  return (
    <RankingPage
      groups={groups}
      selectedGroup={group}
      ranking={createGroupRanking(group.id, members, groupMemberships, membershipStatusFilter)}
      membershipStatusFilter={membershipStatusFilter}
    />
  )
}

function App() {
  return (
    <Routes>
      {/* / は特定機能の恒久的なURLにしないため、同じ画面を表示せずリダイレクトする。 */}
      <Route path="/" element={<Navigate to="/rankings" replace />} />
      <Route path="/rankings" element={<HelloProjectRankingRoute />} />
      <Route path="/rankings/:groupId" element={<GroupRankingRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
