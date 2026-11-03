import type { HelloProjectRankingEntry } from "../types/data"

type Props = {
  ranking: HelloProjectRankingEntry[]
}

function formatMembershipDays(entry: HelloProjectRankingEntry): string {
  // 加入日が月までの場合、在籍日数は確認できる最小日数になる。
  const isMonthPrecision = entry.startedAt.split("-").length === 2
  return `${entry.membershipDays}日${isMonthPrecision ? "以上" : ""}`
}

export function RankingPage({ ranking }: Props) {
  return (
    <main>
      <h1>在籍日数ランキング</h1>
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
