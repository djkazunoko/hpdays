import { useState } from 'react'
import { Route, Routes, useParams, useSearchParams } from 'react-router'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import groupMemberships from './data/group-memberships.json'
import groups from './data/groups.json'
import members from './data/members.json'
import traineeMemberships from './data/trainee-memberships.json'
import { NotFoundPage } from './pages/NotFoundPage'
import { RankingPage } from './pages/RankingPage'
import { createGroupRanking } from './utils/createGroupRanking'
import { createHelloProjectRanking } from './utils/createHelloProjectRanking'
import { parseMembershipStatusFilter } from './utils/parseMembershipStatusFilter'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

function useMembershipStatusFilter() {
  const [searchParams] = useSearchParams()
  return parseMembershipStatusFilter(searchParams.get('status'))
}

function HelloProjectRankingRoute() {
  const membershipStatusFilter = useMembershipStatusFilter()

  return (
    <RankingPage
      ranking={createHelloProjectRanking(members, groupMemberships, traineeMemberships, membershipStatusFilter)}
      membershipStatusFilter={membershipStatusFilter}
    />
  )
}

function GroupRankingRoute() {
  const { groupId } = useParams()
  const membershipStatusFilter = useMembershipStatusFilter()
  const group = groups.find((group) => group.id === groupId)
  if (!group) return <NotFoundPage />

  return (
    <RankingPage
      group={group}
      ranking={createGroupRanking(group.id, members, groupMemberships, membershipStatusFilter)}
      membershipStatusFilter={membershipStatusFilter}
    />
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rankings" element={<HelloProjectRankingRoute />} />
      <Route path="/rankings/:groupId" element={<GroupRankingRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
