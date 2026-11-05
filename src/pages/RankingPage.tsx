import type { Group, RankingEntry } from "../types/data"

type Props = {
  group?: Group
  ranking: RankingEntry[]
}

function formatMembershipDays(entry: RankingEntry): string {
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
