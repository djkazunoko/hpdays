import { describe, expect, test } from "vitest"
import groupMemberships from "../data/group-memberships.json"
import groups from "../data/groups.json"
import members from "../data/members.json"
import traineeMemberships from "../data/trainee-memberships.json"
import type { Data } from "./validateData"
import { validateData } from "./validateData"

const validData: Data = {
  members: [
    { id: "active-member", name: "現役メンバー", birthday: "1999-03-12" },
    { id: "graduated-member", name: "卒業メンバー", birthday: "1996-10-30" },
  ],
  groups: [{ id: "test-group", name: "テストグループ" }],
  groupMemberships: [
    { memberId: "active-member", groupId: "test-group", startedAt: "2012-09-14", endedAt: null },
    { memberId: "graduated-member", groupId: "test-group", startedAt: "2011-01-02", endedAt: "2023-11-29" },
  ],
  traineeMemberships: [
    { memberId: "active-member", startedAt: "2011-11" },
    { memberId: "graduated-member", startedAt: "2008-06" },
  ],
}

describe("validateData", () => {
  test("実際のJSONデータに不整合がない", () => {
    expect(validateData({ members, groups, groupMemberships, traineeMemberships })).toEqual([])
  })

  test("正しいデータではエラーを返さない", () => {
    expect(validateData(validData)).toEqual([])
  })

  describe("参照整合性", () => {
    test("グループ在籍のmemberIdがmembersに存在しなければエラーになる", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [
          ...validData.groupMemberships,
          { memberId: "unknown-member", groupId: "test-group", startedAt: "2011-01-02", endedAt: null },
        ],
      })).toEqual(["Member not found in group-memberships: unknown-member"])
    })

    test("グループ在籍のgroupIdがgroupsに存在しなければエラーになる", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [
          ...validData.groupMemberships,
          { memberId: "active-member", groupId: "unknown-group", startedAt: "2011-01-02", endedAt: null },
        ],
      })).toEqual(["Group not found in group-memberships: unknown-group"])
    })

    test("研修生歴のmemberIdがmembersに存在しなければエラーになる", () => {
      expect(validateData({
        ...validData,
        traineeMemberships: [
          ...validData.traineeMemberships,
          { memberId: "unknown-member", startedAt: "2010-01" },
        ],
      })).toContain("Member not found in trainee-memberships: unknown-member")
    })
  })

  describe("一意性", () => {
    test("メンバーIDが重複していればエラーになる", () => {
      expect(validateData({
        ...validData,
        members: [
          ...validData.members,
          { id: "active-member", name: "現役メンバー", birthday: "1999-03-12" },
        ],
      })).toEqual(["Duplicate member id: active-member"])
    })

    test("グループIDが重複していればエラーになる", () => {
      expect(validateData({
        ...validData,
        groups: [...validData.groups, { id: "test-group", name: "テストグループ" }],
      })).toEqual(["Duplicate group id: test-group"])
    })

    test("同じメンバーの研修生歴が複数あればエラーになる", () => {
      expect(validateData({
        ...validData,
        traineeMemberships: [
          ...validData.traineeMemberships,
          { memberId: "active-member", startedAt: "2012-01" },
        ],
      })).toEqual(["Duplicate trainee membership: active-member"])
    })

    test("完全に同一のグループ在籍が重複していればエラーになる", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [...validData.groupMemberships, { ...validData.groupMemberships[1] }],
      })).toEqual(["Duplicate group membership: graduated-member test-group 2011-01-02 2023-11-29"])
    })

    test("同じメンバーが同じグループに別の期間で在籍するのはエラーにならない", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [
          ...validData.groupMemberships,
          { memberId: "graduated-member", groupId: "test-group", startedAt: "2024-01-01", endedAt: null },
        ],
      })).toEqual([])
    })
  })

  describe("日付形式", () => {
    test.each(["1999-3-12", "1999-03", "19990312", "2026-13-01", "2026-02-30", "2025-02-29"])(
      "誕生日が存在するYYYY-MM-DDでなければエラーになる: %s",
      (birthday) => {
        expect(validateData({
          ...validData,
          members: [{ ...validData.members[0], birthday }, validData.members[1]],
        })).toEqual([`Invalid birthday: active-member ${birthday}`])
      },
    )

    test("うるう年の2月29日はエラーにならない", () => {
      expect(validateData({
        ...validData,
        members: [{ ...validData.members[0], birthday: "2024-02-29" }, validData.members[1]],
      })).toEqual([])
    })

    test.each(["2012-09", "2012-09-31"])("グループ加入日が存在するYYYY-MM-DDでなければエラーになる: %s", (startedAt) => {
      expect(validateData({
        ...validData,
        groupMemberships: [{ ...validData.groupMemberships[0], startedAt }, validData.groupMemberships[1]],
      })).toEqual([`Invalid group membership startedAt: active-member ${startedAt}`])
    })

    test.each(["2023-11", "2023-11-31"])("グループ卒業日が存在するYYYY-MM-DDでなければエラーになる: %s", (endedAt) => {
      expect(validateData({
        ...validData,
        groupMemberships: [validData.groupMemberships[0], { ...validData.groupMemberships[1], endedAt }],
      })).toEqual([`Invalid group membership endedAt: graduated-member ${endedAt}`])
    })

    test.each(["2011", "2011-13", "2011-11-31", "2011/11"])(
      "研修生加入日が存在するYYYY-MMまたはYYYY-MM-DDでなければエラーになる: %s",
      (startedAt) => {
        expect(validateData({
          ...validData,
          traineeMemberships: [{ ...validData.traineeMemberships[0], startedAt }, validData.traineeMemberships[1]],
        })).toEqual([`Invalid trainee membership startedAt: active-member ${startedAt}`])
      },
    )

    test.each(["2011", "2011-13", "2011-11-31", "2011/11"])(
      "H!P加入日の明示値が存在するYYYY-MMまたはYYYY-MM-DDでなければエラーになる: %s",
      (helloProjectStartedAt) => {
        expect(validateData({
          ...validData,
          members: [{ ...validData.members[0], helloProjectStartedAt }, validData.members[1]],
        })).toContain(`Invalid helloProjectStartedAt: active-member ${helloProjectStartedAt}`)
      },
    )

    test("研修生加入日はYYYY-MM-DDでもエラーにならない", () => {
      expect(validateData({
        ...validData,
        traineeMemberships: [{ ...validData.traineeMemberships[0], startedAt: "2011-11-01" }, validData.traineeMemberships[1]],
      })).toEqual([])
    })
  })

  describe("グループ在籍期間", () => {
    test("卒業日が加入日より前ならエラーになる", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [
          validData.groupMemberships[0],
          { ...validData.groupMemberships[1], endedAt: "2011-01-01" },
        ],
      })).toEqual(["Group membership ends before it starts: graduated-member 2011-01-02 2011-01-01"])
    })

    test("卒業日が加入日と同じ日ならエラーにならない", () => {
      expect(validateData({
        ...validData,
        groupMemberships: [
          validData.groupMemberships[0],
          { ...validData.groupMemberships[1], endedAt: "2011-01-02" },
        ],
      })).toEqual([])
    })
  })

  describe("H!P加入日の明示値", () => {
    test("導出したH!P加入日より前ならエラーにならない", () => {
      expect(validateData({
        ...validData,
        members: [{ ...validData.members[0], helloProjectStartedAt: "2011-10-31" }, validData.members[1]],
      })).toEqual([])
    })

    test.each(["2011-11", "2012-01-01"])(
      "研修生歴とグループ在籍から導出したH!P加入日より前でなければエラーになる: %s",
      (helloProjectStartedAt) => {
        expect(validateData({
          ...validData,
          members: [{ ...validData.members[0], helloProjectStartedAt }, validData.members[1]],
        })).toEqual([`Explicit helloProjectStartedAt is not before derived: active-member ${helloProjectStartedAt} 2011-11`])
      },
    )

    test("研修生歴がなければ最も古いグループ加入日と比較する", () => {
      expect(validateData({
        ...validData,
        members: [{ ...validData.members[0], helloProjectStartedAt: "2012-09-14" }, validData.members[1]],
        traineeMemberships: [validData.traineeMemberships[1]],
      })).toEqual(["Explicit helloProjectStartedAt is not before derived: active-member 2012-09-14 2012-09-14"])
    })
  })

  describe("研修生期間", () => {
    test("研修生歴のあるメンバーにグループ在籍がなければエラーになる", () => {
      expect(validateData({
        ...validData,
        members: [
          ...validData.members,
          { id: "trainee-only-member", name: "研修生のみのメンバー", birthday: "2010-01-01" },
        ],
        traineeMemberships: [
          ...validData.traineeMemberships,
          { memberId: "trainee-only-member", startedAt: "2020-01" },
        ],
      })).toEqual(["Group membership not found for trainee: trainee-only-member"])
    })
  })
})
