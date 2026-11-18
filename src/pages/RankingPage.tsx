import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import type { Group, MembershipStatusFilter, RankingEntry } from "../types/data"
import { toIsoDateString } from "../utils/toIsoDateString"
import { formatDate } from "./formatDate"
import { formatMembershipDays } from "./formatMembershipDays"

type Props = {
  groups: Group[]
  // nullはHello! Project全体のランキングを表す。
  selectedGroup: Group | null
  ranking: RankingEntry[]
  membershipStatusFilter: MembershipStatusFilter
  // nullは日付を指定していない（今日時点）ことを表す。
  selectedDate: Date | null
  today: Date
}

// 対象のメンバーがいない場合は、どの条件で絞り込んでいるかが分かるメッセージを表示する。
const membershipStatusFilterOptions: {
  membershipStatusFilter: MembershipStatusFilter
  label: string
  emptyMessage: string
}[] = [
  { membershipStatusFilter: "all", label: "すべて", emptyMessage: "メンバーはいません" },
  { membershipStatusFilter: "active", label: "現役", emptyMessage: "現役メンバーはいません" },
  { membershipStatusFilter: "graduated", label: "OG", emptyMessage: "OGはいません" },
]

// 絞り込みと日付はURLで共有できるようクエリパラメータで表す。
// 「すべて」と今日時点はクエリパラメータなしとし、日付を指定しないURLは常にその日の今日時点を表すようにする。
function createSearch(membershipStatusFilter: MembershipStatusFilter, dateString: string | null): string {
  const searchParams = new URLSearchParams()
  if (membershipStatusFilter !== "all") searchParams.set("status", membershipStatusFilter)
  if (dateString) searchParams.set("date", dateString)

  const search = searchParams.toString()
  return search ? `?${search}` : ""
}

export function RankingPage({ groups, selectedGroup, ranking, membershipStatusFilter, selectedDate, today }: Props) {
  const navigate = useNavigate()
  const selectedOption = membershipStatusFilterOptions.find(
    (option) => option.membershipStatusFilter === membershipStatusFilter,
  )
  const targetOptions: { group: Group | null; label: string; pathname: string }[] = [
    { group: null, label: "ハロプロ全体", pathname: "/rankings" },
    ...groups.map((group) => ({ group, label: group.name, pathname: `/rankings/${group.id}` })),
  ]
  const selectedDateString = selectedDate && toIsoDateString(selectedDate)
  const baseDateString = selectedDateString ?? toIsoDateString(today)

  function handleDateSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get("date")
    navigate({ search: createSearch(membershipStatusFilter, typeof value === "string" && value ? value : null) })
  }

  return (
    <main>
      <h1>{selectedGroup ? `${selectedGroup.name} 在籍日数ランキング` : "ハロプロ在籍日数ランキング"}</h1>
      <p>{formatDate(baseDateString)}時点</p>
      <form onSubmit={handleDateSubmit}>
        <label>
          日付
          {/* URLの日付が変わったときに入力欄を作り直し、表示中の日付に合わせる。 */}
          <input key={baseDateString} type="date" name="date" defaultValue={baseDateString} max={toIsoDateString(today)} />
        </label>
        <button type="submit">表示</button>
        <Link to={{ search: createSearch(membershipStatusFilter, null) }}>今日</Link>
      </form>
      <nav aria-label="ランキングの対象">
        <ul>
          {targetOptions.map((option) => (
            <li key={option.pathname}>
              {/* 対象を切り替えても、絞り込みと日付は引き継ぐ。 */}
              <Link
                to={{ pathname: option.pathname, search: createSearch(membershipStatusFilter, selectedDateString) }}
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
                to={{ search: createSearch(option.membershipStatusFilter, selectedDateString) }}
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
                <td>
                  <Link to={`/members/${entry.member.id}`}>{entry.member.name}</Link>
                </td>
                <td>{formatMembershipDays(entry)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
