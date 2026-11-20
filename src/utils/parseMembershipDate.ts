// 在籍データの日付（YYYY-MM-DDまたはYYYY-MM）を、在籍日数を数える境界の日にする。
// 月単位の日付は、保証できる最小日数を求めるため月末を境界にする。実際の日付を月末と推定するものではない。
// 在籍日数の計算と、ランキングで選べる最も古い日付で同じ境界を使い、選べる日付のランキングに、在籍日数が1日以上のメンバーがいるようにする。
export function parseMembershipDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  // 翌月の0日目は、その月の末日になる。
  return day === undefined ? new Date(year, month, 0) : new Date(year, month - 1, day)
}
