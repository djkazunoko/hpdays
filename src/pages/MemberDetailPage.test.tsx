// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, test } from "vitest"
import type { MemberDetail } from "../types/data"
import { MemberDetailPage } from "./MemberDetailPage"

function createMemberDetail(memberDetail: Partial<MemberDetail> = {}): MemberDetail {
  return {
    member: { id: "member-a", name: "メンバーA", birthday: "2000-01-01" },
    helloProjectMembershipSummary: {
      startedAt: "2008-06-22",
      endedAt: "2023-11-29",
      membershipDays: 5639,
      isMinimumMembershipDays: false,
    },
    groupMembershipSummaries: [],
    traineeStartedAt: null,
    ...memberDetail,
  }
}

// ランキングへのリンクがルーターを必要とするため、MemoryRouterの中で表示する。
function renderMemberDetailPage(memberDetail: MemberDetail) {
  render(
    <MemoryRouter>
      <MemberDetailPage memberDetail={memberDetail} />
    </MemoryRouter>,
  )
}

// 項目名に対応する値を取得する。
function getDescription(term: string) {
  return screen.getByText(term, { selector: "dt" }).nextElementSibling?.textContent
}

function getRowTexts() {
  return screen.getAllByRole("row").slice(1).map((row) =>
    within(row).getAllByRole("cell").map((cell) => cell.textContent),
  )
}

afterEach(cleanup)

describe("MemberDetailPage", () => {
  test("メンバー名を見出しに表示する", () => {
    renderMemberDetailPage(createMemberDetail())

    expect(screen.getByRole("heading", { level: 1, name: "メンバーA" })).toBeDefined()
  })

  test("H!P在籍期間と在籍日数を表示する", () => {
    renderMemberDetailPage(createMemberDetail())

    expect(getDescription("在籍期間")).toBe("2008年6月22日 〜 2023年11月29日")
    expect(getDescription("在籍日数")).toBe("5639日")
  })

  test("現役メンバーの在籍期間は、卒業日の代わりに「現在」と表示する", () => {
    renderMemberDetailPage(createMemberDetail({
      helloProjectMembershipSummary: {
        startedAt: "2011-10-01",
        endedAt: null,
        membershipDays: 5459,
        isMinimumMembershipDays: false,
      },
    }))

    expect(getDescription("在籍期間")).toBe("2011年10月1日 〜 現在")
  })

  test("月までしか分からない加入日は月まで表示し、最小在籍日数は「日以上」と表示する", () => {
    renderMemberDetailPage(createMemberDetail({
      helloProjectMembershipSummary: {
        startedAt: "2020-01",
        endedAt: "2020-02-09",
        membershipDays: 10,
        isMinimumMembershipDays: true,
      },
      traineeStartedAt: "2020-01",
    }))

    expect(getDescription("在籍期間")).toBe("2020年1月 〜 2020年2月9日")
    expect(getDescription("在籍日数")).toBe("10日以上")
    expect(getDescription("研修生加入日")).toBe("2020年1月")
  })

  test("研修生歴がある場合は研修生加入日を表示する", () => {
    renderMemberDetailPage(createMemberDetail({ traineeStartedAt: "2008-06-22" }))

    expect(getDescription("研修生加入日")).toBe("2008年6月22日")
  })

  test("研修生歴がない場合は研修生加入日を表示しない", () => {
    renderMemberDetailPage(createMemberDetail({ traineeStartedAt: null }))

    expect(screen.queryByText("研修生加入日")).toBeNull()
  })

  test("グループごとの在籍期間と在籍日数を表示する", () => {
    renderMemberDetailPage(createMemberDetail({
      groupMembershipSummaries: [
        {
          group: { id: "group-a", name: "グループA" },
          startedAt: "2011-01-02",
          endedAt: "2023-11-29",
          membershipDays: 4715,
          isMinimumMembershipDays: false,
        },
        {
          group: { id: "group-b", name: "グループB" },
          startedAt: "2023-11-30",
          endedAt: null,
          membershipDays: 100,
          isMinimumMembershipDays: false,
        },
      ],
    }))

    expect(getRowTexts()).toEqual([
      ["グループA", "2011年1月2日 〜 2023年11月29日", "4715日"],
      ["グループB", "2023年11月30日 〜 現在", "100日"],
    ])
  })

  test("Hello! Project全体と在籍したグループのランキングへのリンクを表示する", () => {
    renderMemberDetailPage(createMemberDetail({
      groupMembershipSummaries: [
        {
          group: { id: "group-a", name: "グループA" },
          startedAt: "2011-01-02",
          endedAt: null,
          membershipDays: 100,
          isMinimumMembershipDays: false,
        },
      ],
    }))

    expect(screen.getByRole("link", { name: "ハロプロ在籍日数ランキング" }).getAttribute("href")).toBe("/rankings")
    expect(screen.getByRole("link", { name: "グループA" }).getAttribute("href")).toBe("/rankings/group-a")
  })
})
