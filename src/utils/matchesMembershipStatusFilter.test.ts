import { describe, expect, test } from "vitest"
import { matchesMembershipStatusFilter } from "./matchesMembershipStatusFilter"

const activeMembershipPeriod = { startedAt: "2026-06-24", endedAt: null }
const graduatedMembershipPeriod = { startedAt: "2011-01-02", endedAt: "2025-07-08" }

describe("matchesMembershipStatusFilter", () => {
  test("すべてを指定した場合は、卒業日の有無に関係なく対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "all")).toBe(true)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "all")).toBe(true)
  })

  test("現役を指定した場合は、卒業日のない在籍期間だけを対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "active")).toBe(true)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "active")).toBe(false)
  })

  test("卒業済みを指定した場合は、卒業日のある在籍期間だけを対象にする", () => {
    expect(matchesMembershipStatusFilter(activeMembershipPeriod, "graduated")).toBe(false)
    expect(matchesMembershipStatusFilter(graduatedMembershipPeriod, "graduated")).toBe(true)
  })
})
