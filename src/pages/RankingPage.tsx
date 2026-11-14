import { Link } from "react-router"
import type { Group, MembershipStatusFilter, RankingEntry } from "../types/data"

type Props = {
  group?: Group
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

export function RankingPage({ group, ranking, membershipStatusFilter }: Props) {
  const selectedOption = membershipStatusFilterOptions.find(
    (option) => option.membershipStatusFilter === membershipStatusFilter,
  )

  return (
    <main>
      <h1>{group ? `${group.name} 在籍日数ランキング` : "在籍日数ランキング"}</h1>
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
