import { Link, useNavigate } from "react-router"
import type { Group, MembershipStatusFilter, RankingEntry } from "../types/data"
import { createRankingSearch } from "../utils/createRankingSearch"
import { createSelectableDate } from "../utils/createSelectableDate"
import { getSelectableDateParts } from "../utils/getSelectableDateParts"
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
  // 日付の選択肢に出す最も古い日付。
  minDate: Date
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

export function RankingPage({ groups, selectedGroup, ranking, membershipStatusFilter, selectedDate, minDate, today }: Props) {
  const navigate = useNavigate()
  const selectedOption = membershipStatusFilterOptions.find(
    (option) => option.membershipStatusFilter === membershipStatusFilter,
  )
  const targetOptions: { group: Group | null; label: string; pathname: string }[] = [
    { group: null, label: "ハロプロ全体", pathname: "/rankings" },
    ...groups.map((group) => ({ group, label: group.name, pathname: `/rankings/${group.id}` })),
  ]
  const baseDate = selectedDate ?? today
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth() + 1
  const day = baseDate.getDate()
  const { years, months, days } = getSelectableDateParts(baseDate, minDate, today)

  // 選んだ時点で、その日付のURLへ移動する。選択中の日付はURLだけで持ち、画面側では状態を持たない。
  function selectDate(year: number, month: number, day: number) {
    navigate({ search: createRankingSearch(membershipStatusFilter, createSelectableDate(year, month, day, minDate, today)) })
  }

  const dateSelects = [
    { label: "年", value: year, options: years, onChange: (value: number) => selectDate(value, month, day) },
    { label: "月", value: month, options: months, onChange: (value: number) => selectDate(year, value, day) },
    { label: "日", value: day, options: days, onChange: (value: number) => selectDate(year, month, value) },
  ]

  return (
    <main>
      <h1>{selectedGroup ? `${selectedGroup.name} 在籍日数ランキング` : "ハロプロ在籍日数ランキング"}</h1>
      <p>{formatDate(toIsoDateString(baseDate))}時点</p>
      <fieldset>
        <legend>日付</legend>
        {dateSelects.map((dateSelect) => (
          <span key={dateSelect.label}>
            <select
              aria-label={dateSelect.label}
              value={dateSelect.value}
              onChange={(event) => dateSelect.onChange(Number(event.target.value))}
            >
              {dateSelect.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {dateSelect.label}
          </span>
        ))}
        <Link to={{ search: createRankingSearch(membershipStatusFilter, null) }}>今日</Link>
      </fieldset>
      <nav aria-label="ランキングの対象">
        <ul>
          {targetOptions.map((option) => (
            <li key={option.pathname}>
              {/* 対象を切り替えても、絞り込みと日付は引き継ぐ。 */}
              <Link
                to={{ pathname: option.pathname, search: createRankingSearch(membershipStatusFilter, selectedDate) }}
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
                to={{ search: createRankingSearch(option.membershipStatusFilter, selectedDate) }}
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
