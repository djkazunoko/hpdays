import { Link } from "react-router"
import type { MemberDetail, MembershipPeriod } from "../types/data"
import { formatDate } from "./formatDate"
import { formatMembershipDays } from "./formatMembershipDays"

type Props = {
  memberDetail: MemberDetail
}

function formatMembershipPeriod({ startedAt, endedAt }: MembershipPeriod): string {
  return `${formatDate(startedAt)} 〜 ${endedAt ? formatDate(endedAt) : "現在"}`
}

export function MemberDetailPage({ memberDetail }: Props) {
  const { member, helloProjectMembershipSummary, groupMembershipSummaries, traineeStartedAt } = memberDetail

  return (
    <main>
      <h1>{member.name}</h1>
      <section>
        <h2>ハロプロ在籍</h2>
        <dl>
          <dt>在籍期間</dt>
          <dd>{formatMembershipPeriod(helloProjectMembershipSummary)}</dd>
          <dt>在籍日数</dt>
          <dd>{formatMembershipDays(helloProjectMembershipSummary)}</dd>
          {traineeStartedAt && (
            <>
              <dt>研修生加入日</dt>
              <dd>{formatDate(traineeStartedAt)}</dd>
            </>
          )}
        </dl>
        <Link to="/rankings">ハロプロ在籍日数ランキング</Link>
      </section>
      <section>
        <h2>グループ在籍</h2>
        <table>
          <thead>
            <tr>
              <th>グループ</th>
              <th>在籍期間</th>
              <th>在籍日数</th>
            </tr>
          </thead>
          <tbody>
            {groupMembershipSummaries.map((groupMembershipSummary) => (
              <tr key={`${groupMembershipSummary.group.id}-${groupMembershipSummary.startedAt}`}>
                {/* グループ名から、そのグループのランキングへ戻れるようにする。 */}
                <td>
                  <Link to={`/rankings/${groupMembershipSummary.group.id}`}>{groupMembershipSummary.group.name}</Link>
                </td>
                <td>{formatMembershipPeriod(groupMembershipSummary)}</td>
                <td>{formatMembershipDays(groupMembershipSummary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
