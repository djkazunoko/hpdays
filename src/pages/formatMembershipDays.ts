// 確認できる最小在籍日数は「○○日以上」と表示する。ランキングとメンバー詳細で同じ表示にする。
export function formatMembershipDays({ membershipDays, isMinimumMembershipDays }: {
  membershipDays: number
  isMinimumMembershipDays: boolean
}): string {
  return `${membershipDays}日${isMinimumMembershipDays ? "以上" : ""}`
}
