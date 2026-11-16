import { Link } from "react-router"
import type { Group, MembershipStatusFilter, RankingEntry } from "../types/data"

type Props = {
  groups: Group[]
  // nullはHello! Project全体のランキングを表す。
  selectedGroup: Group | null
  ranking: RankingEntry[]
  membershipStatusFilter: MembershipStatusFilter
}

// 絞り込みはURLで共有できるようクエリパラメータで表す。「すべて」はクエリパラメータなしとする。
// 対象のメンバーがいない場合は、どの条件で絞り込んでいるかが分かるメッセージを表示する。
const membershipStatusFilterOptions: {
  membershipStatusFilter: MembershipStatusFilter
  label: string
  search: string
  emptyMessage: string
}[] = [
  { membershipStatusFilter: "all", label: "すべて", search: "", emptyMessage: "メンバーはいません" },
  { membershipStatusFilter: "active", label: "現役", search: "?status=active", emptyMessage: "現役メンバーはいません" },
  { membershipStatusFilter: "graduated", label: "OG", search: "?status=graduated", emptyMessage: "OGはいません" },
]

function formatMembershipDays(entry: RankingEntry): string {
  return `${entry.membershipDays}日${entry.isMinimumMembershipDays ? "以上" : ""}`
}

export function RankingPage({ groups, selectedGroup, ranking, membershipStatusFilter }: Props) {
  const selectedOption = membershipStatusFilterOptions.find(
    (option) => option.membershipStatusFilter === membershipStatusFilter,
  )
  const targetOptions: { group: Group | null; label: string; pathname: string }[] = [
    { group: null, label: "ハロプロ全体", pathname: "/rankings" },
    ...groups.map((group) => ({ group, label: group.name, pathname: `/rankings/${group.id}` })),
  ]

  return (
    <main>
      <h1>{selectedGroup ? `${selectedGroup.name} 在籍日数ランキング` : "ハロプロ在籍日数ランキング"}</h1>
      <nav aria-label="ランキングの対象">
        <ul>
          {targetOptions.map((option) => (
            <li key={option.pathname}>
              {/* 対象を切り替えても、絞り込みの状態は引き継ぐ。 */}
              <Link
                to={{ pathname: option.pathname, search: selectedOption?.search }}
                aria-current={option.group?.id === selectedGroup?.id ? "page" : undefined}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="メンバーの絞り込み">
        <ul>
          {membershipStatusFilterOptions.map((option) => (
            <li key={option.membershipStatusFilter}>
              <Link
                to={{ search: option.search }}
                aria-current={option === selectedOption ? "page" : undefined}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {ranking.length === 0 ? (
        <p>{selectedOption?.emptyMessage}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>順位</th>
              <th>メンバー</th>
              <th>在籍日数</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry) => (
              <tr key={entry.member.id}>
                <td>{entry.rank}</td>
                <td>{entry.member.name}</td>
                <td>{formatMembershipDays(entry)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
