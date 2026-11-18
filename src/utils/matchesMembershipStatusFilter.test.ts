import { describe, expect, test } from "vitest"
import { matchesMembershipStatusFilter } from "./matchesMembershipStatusFilter"

const activeMembershipPeriod = { startedAt: "2026-06-24", endedAt: null }
const graduatedMembershipPeriod = { startedAt: "2011-01-02", endedAt: "2025-07-08" }
const baseDate = new Date(2026, 8, 10)

describe("matchesMembershipStatusFilter", () => {
  test("すべてを指定した場合は、卒業日の有無に関係なく対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "all", baseDate)).toBe(true)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "all", baseDate)).toBe(true)
  })

  test("現役を指定した場合は、卒業日のない在籍期間だけを対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "active", baseDate)).toBe(true)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "active", baseDate)).toBe(false)
  })

  test("卒業済みを指定した場合は、卒業日のある在籍期間だけを対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "graduated", baseDate)).toBe(false)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "graduated", baseDate)).toBe(true)
  })

  describe("基準日時点の在籍状況で判定する", () => {
    test("基準日より後に卒業した在籍期間は現役とする", () => {
      const baseDate = new Date(2025, 6, 7)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "active", baseDate)).toBe(true)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "graduated", baseDate)).toBe(false)
    })

    test("卒業日当日はまだ在籍しているため現役とする", () => {
      const baseDate = new Date(2025, 6, 8)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "active", baseDate)).toBe(true)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "graduated", baseDate)).toBe(false)
    })

    test("卒業日の翌日から卒業済みとする", () => {
      const baseDate = new Date(2025, 6, 9)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "active", baseDate)).toBe(false)
      expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "graduated", baseDate)).toBe(true)
    })
  })
})
