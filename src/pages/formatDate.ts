// 日付は「2008年6月22日」の形式で表示し、月までしか分からない日付は日を補わず月まで表示する。
// ランキングとメンバー詳細で同じ表示にする。
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  return `${year}年${month}月${day === undefined ? "" : `${day}日`}`
}
