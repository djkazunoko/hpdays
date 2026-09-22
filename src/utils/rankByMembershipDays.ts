export function rankByMembershipDays<T extends { membershipDays: number }>(
  entries: T[],
): (T & { rank: number })[] {
  const sortedEntries = [...entries].sort((a, b) => b.membershipDays - a.membershipDays)
  let rank = 0

  return sortedEntries.map((entry, index) => {
    if (index === 0 || entry.membershipDays !== sortedEntries[index - 1].membershipDays) {
      rank = index + 1
    }
    return { ...entry, rank }
  })
}
