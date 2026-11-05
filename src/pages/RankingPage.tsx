import type { Group, RankingEntry } from "../types/data"

// グループ在籍は日単位の日付だけを持つため、グループ別ランキングでは最小在籍日数の判定を持たない。
type Entry = RankingEntry & {
  isMinimumMembershipDays?: boolean
}

type Props = {
  group?: Group
  ranking: Entry[]
}

function formatMembershipDays(entry: Entry): string {
  return `${entry.membershipDays}日${entry.isMinimumMembershipDays ? "以上" : ""}`
}

export function RankingPage({ group, ranking }: Props) {
  return (
    <main>
      <h1>{group ? `${group.name} 在籍日数ランキング` : "在籍日数ランキング"}</h1>
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
    </main>
  )
}
