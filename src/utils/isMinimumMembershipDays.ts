import type { MembershipPeriod } from "../types/data"

// 加入日が月までしか分からない場合、在籍日数は確認できる最小日数になる。
export function isMinimumMembershipDays(membershipPeriod: MembershipPeriod): boolean {
  return membershipPeriod.startedAt.split("-").length === 2
}
