# AgentExchange Consumer-First Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape AgentExchange around the traveler journey, build a Live Auction centerpiece, add a PM-view annotation layer, and ship a polished consumer demo for a Product Manager interview portfolio.

**Architecture:** React 19 + Vite SPA, migrated from state-based screen switching to `react-router-dom` (already in dependencies). Pure logic (auction simulation, PM-view state) lives in `src/lib/`; presentation lives in `src/components/`. Each feature surface is its own folder. State persists in `localStorage` (PM-view flag, "your agent" memory, wake-me opt-in).

**Tech Stack:** React 19, Vite 8, Tailwind v4, framer-motion, react-router-dom 7, react-globe.gl, recharts, lucide-react.

**Verification approach:** This project has no test framework. Pure logic in `src/lib/` is verified with a small assertion script run via `node`. UI tasks are verified by the live preview server (`http://localhost:62785` — port may differ; check the URL printed by `npm run dev`). Each UI task ends with a *Verify* step listing exactly what the engineer should see.

**Skipped — and why:**
- Git commits: project is not a git repository.
- Unit tests for UI: no test framework configured. Visual verification is the appropriate replacement for a portfolio piece. If desired later, add Vitest + React Testing Library as a follow-up.

**Spec reference:** `docs/superpowers/specs/2026-05-04-agentexchange-consumer-first-design.md`

---

## File map

**New files**
- `src/lib/pmView.js` — PM-view context, hook, localStorage persistence
- `src/lib/agents.js` — agent personality definitions (Hawk, Sage, Owl) + helpers
- `src/lib/auction.js` — pure auction simulation engine
- `src/lib/storage.js` — localStorage helpers (your-agent memory, wake-me)
- `src/components/shared/Footer.jsx` — footer with For hotels → link
- `src/components/shared/PmViewToggle.jsx` — toggle pill in nav
- `src/components/shared/PmAnnotation.jsx` — annotation chip component
- `src/components/shared/AgentAvatar.jsx` — geometric SVG avatar (Hawk/Sage/Owl)
- `src/components/Home/Home.jsx` — page (replaces Exchange wrapper usage)
- `src/components/Home/StoryActs.jsx` — 3-act embedded story
- `src/components/Home/SocialProof.jsx` — counters + recent wins
- `src/components/Live/Live.jsx` — auction page
- `src/components/Live/HotelTarget.jsx` — target hotel card with countdown
- `src/components/Live/BidLadder.jsx` — bid ladder visualization
- `src/components/Live/AgentThoughts.jsx` — streaming thoughts list
- `src/components/Live/BidTicker.jsx` — mono ticker of events
- `src/components/Live/WinMoment.jsx` — win climax overlay
- `src/components/Live/LossPath.jsx` — loss state overlay
- `src/components/Tonight/Tonight.jsx` — renamed/rebuilt from Midnight
- `src/components/Deploy/PersonalityPicker.jsx` — Hawk/Sage/Owl picker
- `src/components/Deploy/TrustBlock.jsx` — guarantee block
- `src/components/shared/DemoBanner.jsx` — first-visit "watch a 30s demo" banner
- `scripts/verify-auction.mjs` — node script asserting auction-engine invariants
- `scripts/verify-pmview.mjs` — node script asserting PM-view storage helpers

**Modified files**
- `src/main.jsx` — wrap App in BrowserRouter
- `src/App.jsx` — Routes instead of state switching, Footer, PM-view provider
- `src/index.css` — Instrument Serif import, new CSS vars, focus-ring rules
- `src/components/shared/Navigation.jsx` — NavLink, demote Hotels, mount PmViewToggle
- `src/components/Exchange/Exchange.jsx` — replaced by `src/components/Home/Home.jsx` import shim (delete after Task 11)
- `src/components/Deploy/Deploy.jsx` — reframe + integrate sub-components
- `src/components/Midnight/Midnight.jsx` — replaced by `src/components/Tonight/Tonight.jsx`
- `src/components/Supplier/Supplier.jsx` — kept as-is (still reachable via /hotels), only the route + footer link change

---

## Task 1: Migrate to react-router

**Why:** URLs make the demo shareable (`/live`, `/tonight`), enable browser back-button, and make the site feel like a real product instead of a slide carousel.

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/shared/Navigation.jsx`

- [ ] **Step 1: Wrap the root in BrowserRouter.**

Replace the contents of `src/main.jsx` with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Convert App.jsx to use Routes.**

Replace `src/App.jsx` with:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/shared/Navigation'
import Exchange from './components/Exchange/Exchange'
import Deploy from './components/Deploy/Deploy'
import Supplier from './components/Supplier/Supplier'
import Midnight from './components/Midnight/Midnight'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Exchange />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/tonight" element={<Midnight />} />
          <Route path="/hotels" element={<Supplier />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
```

(Note: `framer-motion` page transitions are removed here — they will be re-introduced in the polish task with route-aware AnimatePresence. Removing now keeps this task focused.)

- [ ] **Step 3: Update Navigation to use NavLink.**

Replace `src/components/shared/Navigation.jsx` with:

```jsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/deploy', label: 'Deploy' },
  { to: '/tonight', label: 'Tonight' },
]

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
    isActive
      ? 'text-[var(--text)] bg-[var(--bg-2)]'
      : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
  }`

export default function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="max-w-[1120px] mx-auto px-6 h-12 flex items-center justify-between">
        <NavLink to="/" className="text-sm font-semibold tracking-tight">AgentExchange</NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-[12px] text-[var(--text-3)] font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            1,247 live
          </div>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-[var(--text-2)] cursor-pointer" aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-6 py-3 space-y-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer ${
                  isActive ? 'text-[var(--text)] bg-[var(--bg-2)]' : 'text-[var(--text-3)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
```

Notice: *Hotels* is removed from primary nav. The route still resolves at `/hotels`; the footer link added in Task 3 keeps it discoverable. The PM-view toggle pill is added in Task 4. The `Live` link is added in Task 8.

- [ ] **Step 4: Verify in the browser.**

The dev server should hot-reload. Visit:
- `/` — Exchange screen renders (current globe + ticker + matches grid)
- `/deploy` — Deploy form renders
- `/tonight` — Midnight screen renders (still labeled correctly internally)
- `/hotels` — Supplier screen renders
- `/anything-else` — redirects to `/`

Click the nav links — the URL changes and the active style applies to the correct link.

---

## Task 2: Brand foundation in CSS

**Why:** Adds the editorial serif used for Home story headlines, defines accent variants used by Live, and standardizes focus-ring + motion timing tokens used throughout the redesign. Doing this once up front means later tasks reference tokens, not hex values.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` with the expanded foundation.**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
@import "tailwindcss";

@layer base {
  :root {
    /* surfaces */
    --bg: #0C0A09;
    --bg-2: #171412;
    --bg-3: #1C1917;

    /* text */
    --text: #FAFAF9;
    --text-2: #A8A29E;
    --text-3: #78716C;

    /* lines */
    --border: rgba(255, 255, 255, 0.06);
    --border-2: rgba(255, 255, 255, 0.10);

    /* accent system */
    --accent: #F97066;
    --accent-soft: rgba(249, 112, 102, 0.12);
    --accent-glow: rgba(249, 112, 102, 0.35);
    --success: #34D399;
    --warn: #FBBF24;

    /* fonts */
    --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-serif: 'Instrument Serif', Georgia, serif;

    /* motion */
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
    --d-fast: 120ms;
    --d-base: 200ms;
    --d-slow: 360ms;
  }

  html { background: var(--bg); }
  body {
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
    min-height: 100dvh;
  }
  #root { min-height: 100dvh; }

  /* Visible focus ring for keyboard users only */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* Honor reduced motion at the platform level */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
}

@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes heartbeat {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
  50%      { box-shadow: 0 0 0 14px rgba(249, 112, 102, 0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.serif { font-family: var(--font-serif); font-weight: 400; letter-spacing: -0.01em; }
.heartbeat { animation: heartbeat 1.6s var(--ease) infinite; }
.slide-up  { animation: slideUp var(--d-base) var(--ease) both; }
```

- [ ] **Step 2: Verify.**

Hard-refresh the page. Open DevTools → Network → Fonts. Confirm both `Inter` and `Instrument Serif` load (200 status). Add a temporary `<p className="serif text-3xl">Test</p>` on the home screen to confirm the serif renders, then remove it.

---

## Task 3: Footer with "For hotels →" link

**Why:** Demotes the supplier surface from primary nav while keeping it reachable. Visible signal to the boss that the candidate respects the supply side without diluting consumer focus.

**Files:**
- Create: `src/components/shared/Footer.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create Footer.**

Create `src/components/shared/Footer.jsx`:

```jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-[1120px] mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-[var(--text-3)]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--text-2)]">AgentExchange</span>
          <span>·</span>
          <span>NASDAQ for hotel rooms</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/hotels" className="hover:text-[var(--text-2)] transition-colors">For hotels →</Link>
          <a href="#" className="hover:text-[var(--text-2)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--text-2)] transition-colors">Terms</a>
          <span className="font-mono">v0.1 · demo</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Mount Footer in App.jsx.**

Edit `src/App.jsx` — add the Footer import and render it after `<main>`:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/shared/Navigation'
import Footer from './components/shared/Footer'
import Exchange from './components/Exchange/Exchange'
import Deploy from './components/Deploy/Deploy'
import Supplier from './components/Supplier/Supplier'
import Midnight from './components/Midnight/Midnight'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Exchange />} />
          <Route path="/deploy" element={<Deploy />} />
          <Route path="/tonight" element={<Midnight />} />
          <Route path="/hotels" element={<Supplier />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Verify.**

Footer appears on every screen. Click *For hotels →* — navigates to the existing Supplier page. Confirm `/hotels` still works.

---

## Task 4: PM-view infrastructure

**Why:** The PM-view layer is the demo's signature creative move. The infrastructure (state + toggle + chip component) needs to exist before any screen can annotate.

**Files:**
- Create: `src/lib/pmView.js`
- Create: `src/lib/storage.js`
- Create: `src/components/shared/PmViewToggle.jsx`
- Create: `src/components/shared/PmAnnotation.jsx`
- Create: `scripts/verify-pmview.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/shared/Navigation.jsx`

- [ ] **Step 1: Create localStorage helper.**

Create `src/lib/storage.js`:

```js
export function readBool(key, fallback = false) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key)
    if (v === null) return fallback
    return v === 'true'
  } catch { return fallback }
}

export function writeBool(key, value) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, String(value)) } catch {}
}

export function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key)
    if (v === null) return fallback
    return JSON.parse(v)
  } catch { return fallback }
}

export function writeJSON(key, value) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const KEYS = {
  pmView: 'ax.pmView',
  yourAgent: 'ax.yourAgent',
  wakeMe: 'ax.wakeMe',
  audioOn: 'ax.audioOn',
  demoSeen: 'ax.demoSeen',
}
```

- [ ] **Step 2: Create PM-view context + hook.**

Create `src/lib/pmView.js`:

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { KEYS, readBool, writeBool } from './storage'

const Ctx = createContext({ on: false, toggle: () => {}, set: () => {} })

export function PmViewProvider({ children }) {
  const [on, setOn] = useState(() => readBool(KEYS.pmView, false))

  const set = useCallback((value) => {
    setOn(value)
    writeBool(KEYS.pmView, value)
  }, [])

  const toggle = useCallback(() => set(!on), [on, set])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target && e.target.tagName) || ''
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        set(!on)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [on, set])

  return <Ctx.Provider value={{ on, toggle, set }}>{children}</Ctx.Provider>
}

export function usePmView() { return useContext(Ctx) }
```

- [ ] **Step 3: Create the toggle pill.**

Create `src/components/shared/PmViewToggle.jsx`:

```jsx
import { usePmView } from '../../lib/pmView'

export default function PmViewToggle() {
  const { on, toggle } = usePmView()
  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      title="Toggle PM view (?)"
      className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-colors cursor-pointer ${
        on
          ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--border-2)] text-[var(--text-3)] hover:text-[var(--text-2)]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-[var(--accent)]' : 'bg-[var(--text-3)]'}`} />
      PM view
    </button>
  )
}
```

- [ ] **Step 4: Create the annotation chip.**

Create `src/components/shared/PmAnnotation.jsx`:

```jsx
import { usePmView } from '../../lib/pmView'

/**
 * Inline annotation chip. Renders nothing when PM view is off.
 *
 * Props:
 * - why: string — the user job this exists to serve
 * - tracking: string — the metric this is measured by
 * - tradeoff: string — what was cut and why
 * - v2: string — the next bet on this surface
 * - className: optional positioning override
 */
export default function PmAnnotation({ why, tracking, tradeoff, v2, className = '' }) {
  const { on } = usePmView()
  if (!on) return null

  const rows = [
    ['Why', why],
    ['Tracking', tracking],
    ['Tradeoff', tradeoff],
    ['V2', v2],
  ].filter(([, v]) => Boolean(v))

  return (
    <div className={`slide-up rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-[12px] leading-snug ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">PM</span>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="text-[var(--text-3)] font-mono text-[10px] uppercase tracking-wider w-16 shrink-0 pt-0.5">{k}</dt>
            <dd className="text-[var(--text-2)]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
```

- [ ] **Step 5: Wire the provider into App.jsx.**

Edit `src/App.jsx` — wrap the layout in `PmViewProvider`:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { PmViewProvider } from './lib/pmView'
import Navigation from './components/shared/Navigation'
import Footer from './components/shared/Footer'
import Exchange from './components/Exchange/Exchange'
import Deploy from './components/Deploy/Deploy'
import Supplier from './components/Supplier/Supplier'
import Midnight from './components/Midnight/Midnight'

export default function App() {
  return (
    <PmViewProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Exchange />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/tonight" element={<Midnight />} />
            <Route path="/hotels" element={<Supplier />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </PmViewProvider>
  )
}
```

- [ ] **Step 6: Mount the toggle in the nav.**

Edit `src/components/shared/Navigation.jsx` — import the toggle and render it inside the right-side cluster (replace the current right-side block):

```jsx
import PmViewToggle from './PmViewToggle'
```

Replace the live-counter block in Navigation.jsx with:

```jsx
        <div className="hidden md:flex items-center gap-3">
          <div className="text-[12px] text-[var(--text-3)] font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            1,247 live
          </div>
          <PmViewToggle />
        </div>
```

- [ ] **Step 7: Write a verification script for storage helpers.**

Create `scripts/verify-pmview.mjs`:

```js
// Lightweight assertion harness. Run with: node scripts/verify-pmview.mjs

// Mock window.localStorage
const store = new Map()
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
}

const { readBool, writeBool, readJSON, writeJSON, KEYS } = await import('../src/lib/storage.js')

let pass = 0, fail = 0
function check(label, cond) {
  if (cond) { pass++; console.log('  ok  ' + label) }
  else      { fail++; console.log('  FAIL ' + label) }
}

check('readBool default', readBool('missing', false) === false)
writeBool('a', true)
check('readBool roundtrip', readBool('a', false) === true)
writeJSON('b', { x: 1 })
check('readJSON roundtrip', readJSON('b', null).x === 1)
check('KEYS exposed', typeof KEYS.pmView === 'string')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
```

- [ ] **Step 8: Run the verification script.**

```bash
node scripts/verify-pmview.mjs
```

Expected output: `4 passed, 0 failed`.

- [ ] **Step 9: Verify in the browser.**

Reload. The "PM view" pill is visible on desktop in the header (top-right of the nav cluster). Click it — the pill turns coral and `localStorage.getItem('ax.pmView')` returns `"true"` in DevTools. Press `?` (Shift+/) anywhere outside an input — the pill toggles. Refresh the page — the toggle state persists.

(No annotations appear yet because no screen mounts `<PmAnnotation>` — that's added in Task 12.)

---

## Task 5: Agent personalities + avatars

**Why:** The three named agents (Hawk / Sage / Owl) are referenced everywhere downstream — Deploy picker, Live Auction, copy throughout. Defining them once makes the rest mechanical.

**Files:**
- Create: `src/lib/agents.js`
- Create: `src/components/shared/AgentAvatar.jsx`

- [ ] **Step 1: Create the agent data.**

Create `src/lib/agents.js`:

```js
export const AGENTS = {
  hawk: {
    id: 'hawk',
    name: 'Hawk',
    tagline: 'Bids fast, wins more, pays slightly higher.',
    blurb: 'Aggressive. First to the table, last to leave.',
    winRate: 0.82,
    avgPremiumPct: 6,    // ~6% above the floor
    bidIntervalMs: 1200, // average ms between bids
    color: '#F97066',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    tagline: 'Optimizes price vs. speed.',
    blurb: 'Balanced. Reads the room, then strikes.',
    winRate: 0.71,
    avgPremiumPct: 2,
    bidIntervalMs: 2000,
    color: '#A8A29E',
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    tagline: 'Waits for the floor. Smaller win rate, deepest savings.',
    blurb: 'Patient. Will let three rooms go to take the fourth.',
    winRate: 0.54,
    avgPremiumPct: -1, // can land below floor on great nights
    bidIntervalMs: 3200,
    color: '#34D399',
  },
}

export const AGENT_LIST = [AGENTS.hawk, AGENTS.sage, AGENTS.owl]

export function getAgent(id) {
  return AGENTS[id] || AGENTS.sage
}

export const RIVAL_NAMES = ['7x3k', '4f8r', '9k2v', '1b6w', '3d5m', '8j2k', 'a2c4']

export function makeRival(i) {
  return {
    id: RIVAL_NAMES[i % RIVAL_NAMES.length],
    name: RIVAL_NAMES[i % RIVAL_NAMES.length],
    tagline: 'Anonymous rival agent',
    color: '#A8A29E',
    isRival: true,
  }
}
```

- [ ] **Step 2: Create the avatar component.**

Create `src/components/shared/AgentAvatar.jsx`:

```jsx
/**
 * Geometric SVG mark for an agent. No AI-generated faces — just shapes.
 *
 * Props:
 * - id: 'hawk' | 'sage' | 'owl' | rival id (anything else)
 * - color: hex (overrides default)
 * - size: px (default 40)
 */
export default function AgentAvatar({ id, color, size = 40 }) {
  const stroke = color || '#A8A29E'
  const props = { width: size, height: size, viewBox: '0 0 40 40', fill: 'none' }

  if (id === 'hawk') {
    // Sharp triangular dive
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <path d="M10 14 L20 26 L30 14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="1.5" fill={stroke} />
      </svg>
    )
  }
  if (id === 'sage') {
    // Balanced horizontal — two stacked lines
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="10" y1="17" x2="30" y2="17" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="23" x2="26" y2="23" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'owl') {
    // Patient — concentric arcs
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <circle cx="20" cy="20" r="10" stroke={stroke} strokeWidth="1.5" />
        <circle cx="20" cy="20" r="4"  stroke={stroke} strokeWidth="1.5" />
      </svg>
    )
  }
  // Rival default — single dot in a ring
  return (
    <svg {...props} aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
      <circle cx="20" cy="20" r="3" fill={stroke} opacity="0.7" />
    </svg>
  )
}
```

- [ ] **Step 3: Verify.**

Add a temporary `<AgentAvatar id="hawk" />` `<AgentAvatar id="sage" />` `<AgentAvatar id="owl" />` `<AgentAvatar id="rival" />` strip somewhere on the home screen, confirm all four render distinctly at 40px and shrink correctly at 24px. Remove the strip after confirming.

---

## Task 6: Auction simulation engine

**Why:** Pure logic for the Live Auction — separated from React so it's testable, reusable, and composable. The component layer just subscribes to events and re-renders.

**Files:**
- Create: `src/lib/auction.js`
- Create: `scripts/verify-auction.mjs`

- [ ] **Step 1: Create the auction engine.**

Create `src/lib/auction.js`:

```js
/**
 * Pure auction simulation. Emits a deterministic-with-randomness event stream
 * over `durationMs`. Consumers subscribe with `onEvent` and call `start()`.
 *
 * Events emitted:
 *   { type: 'bid', t, agentId, amount, agentName, color }
 *   { type: 'thought', t, agentId, agentName, text }
 *   { type: 'tick', t, msLeft }
 *   { type: 'end', t, status: 'won' | 'lost', winningAgentId, winningAmount, savings }
 *
 * Contract:
 *   - Total runtime is `durationMs` (default 28_000).
 *   - Your agent's id is `yourAgentId`. Cap is `capPrice`.
 *   - At least 8 bids fire across the run, including at least one from your agent.
 *   - Status is 'won' iff your agent's last bid is the highest at end-of-run AND <= capPrice.
 *   - 'lost' is emitted if a rival's highest bid exceeds your cap, or if rivals outbid you and you can't legally raise.
 */

const DEFAULT_DURATION = 28_000
const TICK_INTERVAL    = 250

export function createAuction({
  hotel,
  yourAgent,        // { id, name, color, bidIntervalMs, avgPremiumPct }
  rivals,           // [{ id, name, color }]
  startPrice,
  capPrice,
  durationMs = DEFAULT_DURATION,
  rackRate,         // for savings %
  rng = Math.random,
}) {
  let running = false
  let listeners = []
  let timeouts = []
  let startTime = 0
  let bids = []     // { agentId, amount, t }
  let ended = false

  function emit(ev) {
    listeners.forEach(fn => fn(ev))
  }

  function highestBid() {
    return bids.reduce((acc, b) => (b.amount > acc.amount ? b : acc), { amount: -Infinity, agentId: null })
  }

  function scheduleBid(agent, atMs, amount) {
    const id = setTimeout(() => {
      if (!running || ended) return
      bids.push({ agentId: agent.id, amount, t: atMs })
      emit({ type: 'bid', t: atMs, agentId: agent.id, agentName: agent.name, amount, color: agent.color })
    }, atMs)
    timeouts.push(id)
  }

  function scheduleThought(agent, atMs, text) {
    const id = setTimeout(() => {
      if (!running || ended) return
      emit({ type: 'thought', t: atMs, agentId: agent.id, agentName: agent.name, text })
    }, atMs)
    timeouts.push(id)
  }

  function plan() {
    // Build a bid timeline that climbs from startPrice toward (but mostly below) capPrice.
    // Your agent and rivals interleave. Last bid is your agent for a 'won' outcome,
    // unless a rival's bid forces a 'lost' path (chosen randomly per run).
    const willWin = rng() > 0.18 // 82% wins, dramatic enough but not always
    const all = [yourAgent, ...rivals]
    let priceFloor = startPrice
    let lastBidder = null
    const timeline = []

    let t = 800
    while (t < durationMs - 1500) {
      const bidder = all[Math.floor(rng() * all.length)]
      if (bidder.id === lastBidder) { t += 600; continue }
      const bump = Math.round(2 + rng() * 6) // $2-$8 jumps
      priceFloor += bump
      if (priceFloor > capPrice + 25) break // safety
      timeline.push({ agent: bidder, t, amount: priceFloor })
      lastBidder = bidder.id
      t += 1100 + Math.floor(rng() * 1700)
    }

    // Force the final bid to fit the chosen outcome
    const finalT = durationMs - 600
    const finalAgent = willWin ? yourAgent : rivals[Math.floor(rng() * rivals.length)]
    const finalAmount = willWin
      ? Math.min(capPrice, priceFloor + 1)
      : capPrice + 4 + Math.floor(rng() * 8)
    timeline.push({ agent: finalAgent, t: finalT, amount: finalAmount })

    timeline.forEach(b => scheduleBid(b.agent, b.t, b.amount))

    // Sprinkle thoughts, biased toward your agent
    const thoughts = [
      { agentId: yourAgent.id, when: 1500, text: `${yourAgent.name}: scanning rivals · ${rivals.length} active.` },
      { agentId: yourAgent.id, when: 6500, text: `${yourAgent.name}: rival just blinked, holding firm.` },
      { agentId: rivals[0].id,  when: 4200, text: `${rivals[0].name}: pushing harder.` },
      { agentId: rivals[1] ? rivals[1].id : rivals[0].id, when: 9000, text: `${rivals[1] ? rivals[1].name : rivals[0].name}: dropped out (cap reached).` },
      { agentId: yourAgent.id, when: durationMs - 4000, text: `${yourAgent.name}: closing window — final move incoming.` },
    ]
    thoughts.forEach(th => {
      const speaker = [yourAgent, ...rivals].find(a => a.id === th.agentId) || yourAgent
      scheduleThought(speaker, th.when, th.text)
    })

    return { willWin, finalAmount, finalAgent }
  }

  function startTicks() {
    let elapsed = 0
    const id = setInterval(() => {
      elapsed += TICK_INTERVAL
      const left = Math.max(0, durationMs - elapsed)
      emit({ type: 'tick', t: elapsed, msLeft: left })
      if (left <= 0) { clearInterval(id) }
    }, TICK_INTERVAL)
    timeouts.push(id)
  }

  function scheduleEnd(planResult) {
    const id = setTimeout(() => {
      if (!running || ended) return
      ended = true
      const { finalAgent, finalAmount, willWin } = planResult
      const status = willWin ? 'won' : 'lost'
      const savings = rackRate ? Math.max(0, Math.round(((rackRate - finalAmount) / rackRate) * 100)) : 0
      emit({
        type: 'end',
        t: durationMs,
        status,
        winningAgentId: finalAgent.id,
        winningAgentName: finalAgent.name,
        winningAmount: finalAmount,
        savings,
      })
    }, durationMs)
    timeouts.push(id)
  }

  return {
    onEvent(fn) {
      listeners.push(fn)
      return () => { listeners = listeners.filter(l => l !== fn) }
    },
    start() {
      if (running) return
      running = true
      startTime = Date.now()
      const planResult = plan()
      startTicks()
      scheduleEnd(planResult)
    },
    stop() {
      running = false
      timeouts.forEach(id => { clearTimeout(id); clearInterval(id) })
      timeouts = []
    },
    state() {
      return { running, ended, bids: [...bids], highest: highestBid() }
    },
  }
}
```

- [ ] **Step 2: Create the verification script.**

Create `scripts/verify-auction.mjs`:

```js
// Verify the auction engine emits the documented contract under varied seeds.
// Run with: node scripts/verify-auction.mjs

import { createAuction } from '../src/lib/auction.js'

let pass = 0, fail = 0
function check(label, cond) {
  if (cond) { pass++; console.log('  ok  ' + label) }
  else      { fail++; console.log('  FAIL ' + label) }
}

function makeRng(seed) {
  // Deterministic LCG
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF }
}

async function run(seed, durationMs = 1500) {
  // Compress time so the test runs quickly
  const events = []
  const a = createAuction({
    hotel: { name: 'Test' },
    yourAgent: { id: 'hawk', name: 'Hawk', color: '#F97066', bidIntervalMs: 80, avgPremiumPct: 6 },
    rivals: [
      { id: '7x3k', name: '7x3k', color: '#A8A29E' },
      { id: '4f8r', name: '4f8r', color: '#A8A29E' },
    ],
    startPrice: 100,
    capPrice: 180,
    rackRate: 220,
    durationMs,
    rng: makeRng(seed),
  })
  await new Promise(resolve => {
    a.onEvent(ev => {
      events.push(ev)
      if (ev.type === 'end') resolve()
    })
    a.start()
    setTimeout(() => resolve(), durationMs + 600)
  })
  a.stop()
  return events
}

const events = await run(42, 1500)
const bidCount    = events.filter(e => e.type === 'bid').length
const thoughtCount= events.filter(e => e.type === 'thought').length
const endEvents   = events.filter(e => e.type === 'end')
const yourBids    = events.filter(e => e.type === 'bid' && e.agentId === 'hawk')

check('emits at least 1 bid',         bidCount >= 1)
check('emits at least 1 thought',     thoughtCount >= 1)
check('emits exactly one end event',  endEvents.length === 1)
check('your agent appears as bidder', yourBids.length >= 1)
check('end status is won or lost',    ['won', 'lost'].includes(endEvents[0]?.status))
check('savings is a finite number',   Number.isFinite(endEvents[0]?.savings))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
```

- [ ] **Step 3: Run verification.**

```bash
node scripts/verify-auction.mjs
```

Expected: `6 passed, 0 failed`. If a check fails, fix the engine before proceeding — the Live screen depends on this contract.

---

## Task 7: Reframe Deploy

**Why:** Deploy is the conversion step. The reframe — *commission* not *configure*, named agents, explicit price-cap guarantee, transition into Live — directly serves activation and trust, which are PM-instructive moves.

**Files:**
- Create: `src/components/Deploy/PersonalityPicker.jsx`
- Create: `src/components/Deploy/TrustBlock.jsx`
- Modify: `src/components/Deploy/Deploy.jsx`

- [ ] **Step 1: Create PersonalityPicker.**

Create `src/components/Deploy/PersonalityPicker.jsx`:

```jsx
import { AGENT_LIST } from '../../lib/agents'
import AgentAvatar from '../shared/AgentAvatar'

export default function PersonalityPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {AGENT_LIST.map(a => {
        const active = value === a.id
        return (
          <button
            key={a.id}
            onClick={() => onChange(a.id)}
            className={`text-left p-4 rounded-lg border transition-colors cursor-pointer ${
              active
                ? 'border-[var(--accent)] bg-[var(--bg-2)]'
                : 'border-[var(--border)] hover:border-[var(--border-2)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <AgentAvatar id={a.id} color={a.color} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-[11px] font-mono text-[var(--text-3)] mt-0.5">win rate · {Math.round(a.winRate * 100)}%</div>
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-2)] mt-3 leading-snug">{a.tagline}</p>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create TrustBlock.**

Create `src/components/Deploy/TrustBlock.jsx`:

```jsx
import { ShieldCheck } from 'lucide-react'

export default function TrustBlock({ cap }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="text-[var(--success)] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm">
            <span className="text-[var(--text)]">Hard cap.</span>{' '}
            <span className="text-[var(--text-2)]">Your agent will never bid above ${cap}. If it overpays by $1, we eat the difference.</span>
          </p>
          <p className="text-[12px] text-[var(--text-3)] mt-1.5">Cancel free up to 24h before check-in. Receipts in your email within 60 seconds of a win.</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite Deploy.jsx.**

Replace `src/components/Deploy/Deploy.jsx` with:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PersonalityPicker from './PersonalityPicker'
import TrustBlock from './TrustBlock'
import AgentAvatar from '../shared/AgentAvatar'
import { AGENTS, getAgent } from '../../lib/agents'
import { writeJSON, KEYS } from '../../lib/storage'

export default function Deploy() {
  const [agentId, setAgentId] = useState('sage')
  const [cap, setCap] = useState(180)
  const navigate = useNavigate()
  const agent = getAgent(agentId)

  function deploy() {
    writeJSON(KEYS.yourAgent, { agentId, cap, deployedAt: Date.now() })
    navigate('/live')
  }

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-1">
        <AgentAvatar id={agentId} color={agent.color} size={28} />
        <h1 className="text-2xl font-semibold tracking-tight">Commission your agent</h1>
      </div>
      <p className="text-sm text-[var(--text-3)] mb-10">
        {agent.name} is awake. {agent.blurb}
      </p>

      <div className="space-y-6">
        {/* Destination */}
        <div>
          <label className="text-sm text-[var(--text-2)] mb-2 block">Destination</label>
          <div className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm">
            Las Vegas, NV
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm text-[var(--text-2)] mb-2 block">Check-in</label>
          <div className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm">
            Tonight · May 4, 2026
          </div>
        </div>

        {/* Cap (with simple slider) */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="cap" className="text-sm text-[var(--text-2)]">Price cap</label>
            <span className="text-sm font-mono">${cap} <span className="text-[var(--text-3)]">/ night</span></span>
          </div>
          <input
            id="cap"
            type="range"
            min="80"
            max="320"
            step="5"
            value={cap}
            onChange={e => setCap(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        {/* Trust block — directly under cap, on purpose */}
        <TrustBlock cap={cap} />

        {/* Personality */}
        <div>
          <label className="text-sm text-[var(--text-2)] mb-3 block">Pick a personality</label>
          <PersonalityPicker value={agentId} onChange={setAgentId} />
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-[var(--border)] space-y-1 text-sm">
          <Row label="Competing agents" value="47" />
          <Row label="Available rooms"  value="23" />
          <Row label="Est. savings"     value={`${Math.max(0, agent.avgPremiumPct < 0 ? 30 + Math.abs(agent.avgPremiumPct) : 30 - agent.avgPremiumPct)}–${Math.max(20, 50 - agent.avgPremiumPct)}%`} accent />
          <Row label="Win probability"  value={`${Math.round(agent.winRate * 100)}%`} />
        </div>

        {/* Deploy */}
        <motion.button
          onClick={deploy}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg text-sm font-medium cursor-pointer bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Deploy {agent.name} · $2.00
        </motion.button>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-2)]">{label}</span>
      <span className={`font-mono ${accent ? 'text-[var(--accent)]' : ''}`}>{value}</span>
    </div>
  )
}
```

- [ ] **Step 4: Verify.**

Visit `/deploy`. Confirm:
- The header avatar matches the selected personality
- Sliding the cap updates both the displayed value and the trust block ("never bid above $X")
- Picking Hawk / Sage / Owl changes the blurb under the title and updates the win-probability row
- Clicking *Deploy* navigates to `/live` (will 404 to `/` until Task 8 — that's expected). Re-open DevTools → Application → Local Storage and confirm the `ax.yourAgent` key exists with the chosen agentId + cap.

---

## Task 8: Build Live — base layout & wiring

**Why:** The Live Auction is the single most product-defining feature of the redesign. This task wires the engine from Task 6 into a 3-pane layout (target / ladder / thoughts).

**Files:**
- Create: `src/components/Live/Live.jsx`
- Create: `src/components/Live/HotelTarget.jsx`
- Create: `src/components/Live/BidLadder.jsx`
- Create: `src/components/Live/AgentThoughts.jsx`
- Create: `src/components/Live/BidTicker.jsx`
- Modify: `src/App.jsx` (add `/live` route)
- Modify: `src/components/shared/Navigation.jsx` (add Live nav item)

- [ ] **Step 1: Create HotelTarget.**

Create `src/components/Live/HotelTarget.jsx`:

```jsx
export default function HotelTarget({ hotel, msLeft }) {
  const sec = Math.max(0, Math.floor(msLeft / 1000))
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-[var(--text-3)]">TARGET</div>
          <h2 className="text-lg font-medium truncate">{hotel.name}</h2>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">{hotel.location} · {hotel.left} rooms left</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] font-mono text-[var(--text-3)]">CLOSES IN</div>
          <div className={`font-mono text-2xl tabular-nums ${msLeft < 6000 ? 'text-[var(--accent)]' : ''}`}>{m}:{s}</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create BidLadder.**

Create `src/components/Live/BidLadder.jsx`:

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import AgentAvatar from '../shared/AgentAvatar'

export default function BidLadder({ bids, yourAgentId }) {
  // Last 7 bids, newest first
  const visible = [...bids].slice(-7).reverse()

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-mono text-[var(--text-3)]">BID LADDER</div>
        <div className="text-[11px] font-mono text-[var(--text-3)]">{bids.length} bids</div>
      </div>

      {visible.length === 0 && (
        <div className="text-[12px] text-[var(--text-3)] py-8 text-center">Waiting for first bid…</div>
      )}

      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {visible.map((b, idx) => {
            const isYou = b.agentId === yourAgentId
            return (
              <motion.li
                key={b.t + ':' + b.agentId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: idx === 0 ? 1 : Math.max(0.35, 1 - idx * 0.13), y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${isYou ? 'bg-[var(--accent-soft)] border border-[var(--accent)]' : 'border border-transparent'}`}
              >
                <AgentAvatar id={b.agentId} color={b.color} size={22} />
                <span className={`text-sm ${isYou ? 'text-[var(--text)]' : 'text-[var(--text-2)]'}`}>
                  {b.agentName} {isYou && <span className="text-[11px] font-mono text-[var(--accent)]">(you)</span>}
                </span>
                <span className="ml-auto font-mono tabular-nums text-sm">${b.amount}</span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Create AgentThoughts.**

Create `src/components/Live/AgentThoughts.jsx`:

```jsx
import { motion, AnimatePresence } from 'framer-motion'

export default function AgentThoughts({ thoughts }) {
  // Last 5
  const visible = thoughts.slice(-5)
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="text-[11px] font-mono text-[var(--text-3)] mb-3">AGENT THOUGHTS</div>
      {visible.length === 0 && (
        <div className="text-[12px] text-[var(--text-3)] py-8 text-center">Quiet so far…</div>
      )}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map(t => (
            <motion.li
              key={t.t + ':' + t.agentId}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-[12px] leading-snug text-[var(--text-2)]"
            >
              {t.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Create BidTicker.**

Create `src/components/Live/BidTicker.jsx`:

```jsx
export default function BidTicker({ bids }) {
  const last = [...bids].slice(-3).reverse()
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-2 font-mono text-[11px] text-[var(--text-3)] overflow-hidden">
      {last.length === 0 ? (
        <span>… awaiting bids …</span>
      ) : (
        last.map((b, i) => (
          <span key={b.t + b.agentId} className="mr-4">
            {formatT(b.t)} · {b.agentName} → ${b.amount} {i === 0 && <span className="text-[var(--accent)]">·</span>}
          </span>
        ))
      )}
    </div>
  )
}

function formatT(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
```

- [ ] **Step 5: Create Live page (base only — outcome overlays added in Task 9).**

Create `src/components/Live/Live.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAuction } from '../../lib/auction'
import { AGENTS, getAgent, makeRival } from '../../lib/agents'
import { readJSON, KEYS } from '../../lib/storage'
import HotelTarget from './HotelTarget'
import BidLadder from './BidLadder'
import AgentThoughts from './AgentThoughts'
import BidTicker from './BidTicker'

const DEFAULT_HOTEL = {
  name: 'Marriott Downtown',
  location: 'Las Vegas Strip',
  rackRate: 220,
  startPrice: 102,
  left: 3,
}

export default function Live() {
  const [bids, setBids] = useState([])
  const [thoughts, setThoughts] = useState([])
  const [msLeft, setMsLeft] = useState(28000)
  const [outcome, setOutcome] = useState(null)
  const auctionRef = useRef(null)

  // Load chosen agent (or default to Sage if visited cold — boss-friendly)
  const stored = readJSON(KEYS.yourAgent, null)
  const agentId = stored?.agentId || 'sage'
  const cap     = stored?.cap     || 180
  const yourAgent = getAgent(agentId)
  const rivals = [makeRival(0), makeRival(1), makeRival(2)]

  useEffect(() => {
    const auction = createAuction({
      hotel: DEFAULT_HOTEL,
      yourAgent,
      rivals,
      startPrice: DEFAULT_HOTEL.startPrice,
      capPrice: cap,
      rackRate: DEFAULT_HOTEL.rackRate,
      durationMs: 28000,
    })
    auctionRef.current = auction
    const off = auction.onEvent(ev => {
      if (ev.type === 'bid')     setBids(prev => [...prev, ev])
      if (ev.type === 'thought') setThoughts(prev => [...prev, ev])
      if (ev.type === 'tick')    setMsLeft(ev.msLeft)
      if (ev.type === 'end')     setOutcome(ev)
    })
    auction.start()
    return () => { off(); auction.stop() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live auction</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            <span className="text-[var(--text-2)]">{yourAgent.name}</span> is bidding for you · cap ${cap}
          </p>
        </div>
        <Link to="/deploy" className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)]">Reconfigure →</Link>
      </div>

      <div className={`heartbeat rounded-lg ${outcome ? '' : 'p-px'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <HotelTarget hotel={DEFAULT_HOTEL} msLeft={msLeft} />
            <BidLadder bids={bids} yourAgentId={agentId} />
          </div>
          <div className="space-y-4">
            <AgentThoughts thoughts={thoughts} />
            <BidTicker bids={bids} />
          </div>
        </div>
      </div>

      {/* Win/Loss overlays added in Task 9 */}
    </div>
  )
}
```

- [ ] **Step 6: Add the route + nav item.**

Edit `src/App.jsx` to import and route Live:

```jsx
import Live from './components/Live/Live'
// …inside <Routes>
          <Route path="/live" element={<Live />} />
```

Edit `src/components/shared/Navigation.jsx` — extend `navItems`:

```jsx
const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/deploy', label: 'Deploy' },
  { to: '/live', label: 'Live' },
  { to: '/tonight', label: 'Tonight' },
]
```

- [ ] **Step 7: Verify.**

Visit `/live`:
- Header shows your agent name + cap (Sage / $180 if cold-visited; whatever you set on Deploy if you came through the funnel)
- After ~1 second, bids start sliding in. The ladder shows up to 7 with the newest at top, your agent's bids highlighted coral.
- Thoughts appear in the right column.
- Countdown ticks down from 00:28; when <6 sec, the timer turns coral.
- After 28 seconds, bidding stops (the page is frozen — that's expected; outcome overlay arrives in Task 9).
- Reload the page — the auction restarts (events are not persisted between page loads, intentional).
- Hard-refresh with PM view ON; nothing breaks.

---

## Task 9: Live — win moment & loss path

**Why:** The auction without a climax is a tease. The win moment is the demo's emotional payoff; the loss path proves the candidate thought about graceful failure.

**Files:**
- Create: `src/components/Live/WinMoment.jsx`
- Create: `src/components/Live/LossPath.jsx`
- Modify: `src/components/Live/Live.jsx`

- [ ] **Step 1: Create WinMoment.**

Create `src/components/Live/WinMoment.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Share2, Gift } from 'lucide-react'

export default function WinMoment({ outcome, hotel, capPrice }) {
  const savedDollars = Math.max(0, hotel.rackRate - outcome.winningAmount)
  const [shown, setShown] = useState(0)

  // Count up the savings number
  useEffect(() => {
    let raf, start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 900)
      setShown(Math.round(savedDollars * easeOut(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [savedDollars])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-6"
    >
      <Confetti />
      <div className="text-[11px] font-mono text-[var(--accent)] mb-1">WON</div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">{outcome.winningAgentName} closed the room.</h2>
      <p className="text-sm text-[var(--text-2)] mb-5">
        {hotel.name} · ${outcome.winningAmount} (was ${hotel.rackRate})
      </p>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-[11px] font-mono text-[var(--text-3)]">YOU SAVED</span>
        <span className="font-mono text-4xl text-[var(--accent)] tabular-nums">${shown}</span>
        <span className="text-[12px] font-mono text-[var(--text-3)]">· {outcome.savings}% off rack</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium cursor-pointer hover:opacity-90">
          <Share2 size={14} /> Share this win
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border-2)] text-sm cursor-pointer hover:bg-[var(--bg-2)]">
          <Gift size={14} /> Refer a friend · both get $10
        </button>
        <Link to="/tonight" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm text-[var(--text-3)] hover:text-[var(--text-2)]">
          Try Tonight's drops →
        </Link>
      </div>
    </motion.div>
  )
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

function Confetti() {
  // CSS-only confetti — 24 small dots, pseudo-random positions.
  const dots = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map(i => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            top: `${(i * 41) % 100}%`,
            left: `${(i * 73) % 100}%`,
            background: i % 3 === 0 ? '#F97066' : i % 3 === 1 ? '#FBBF24' : '#34D399',
            animation: `slideUp 0.9s var(--ease) ${i * 30}ms both`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}
```

Note: WinMoment is positioned `relative` by parent. The Confetti uses `position:absolute` against its container — make sure the wrapping element has `relative`. Adjust the `motion.div` to add `relative overflow-hidden`:

Replace the outer `motion.div` opening tag with:

```jsx
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden mt-6 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-6"
    >
```

- [ ] **Step 2: Create LossPath.**

Create `src/components/Live/LossPath.jsx`:

```jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function LossPath({ outcome, hotel, capPrice, agentName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-lg border border-[var(--border-2)] bg-[var(--bg-2)] p-6"
    >
      <div className="text-[11px] font-mono text-[var(--text-3)] mb-1">CAP REACHED</div>
      <h2 className="text-xl font-medium tracking-tight mb-1">{agentName} held the line.</h2>
      <p className="text-sm text-[var(--text-2)] mb-5">
        Room sold for ${outcome.winningAmount}, ${outcome.winningAmount - capPrice} above your cap.
        We don't break the cap, ever.
      </p>

      <p className="text-[13px] text-[var(--text-3)] mb-5">
        Want me to try Tonight's drops instead? Last-minute releases are usually 40–55% off.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link to="/tonight" className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">
          Try Tonight →
        </Link>
        <Link to="/deploy" className="inline-flex items-center px-4 py-2 rounded-md border border-[var(--border-2)] text-sm hover:bg-[var(--bg-3)]">
          Raise the cap and retry
        </Link>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Wire overlays into Live.jsx.**

Edit `src/components/Live/Live.jsx` — add imports at the top:

```jsx
import WinMoment from './WinMoment'
import LossPath from './LossPath'
```

And replace the closing `{/* Win/Loss overlays added in Task 9 */}` comment with:

```jsx
      {outcome?.status === 'won' && (
        <WinMoment outcome={outcome} hotel={DEFAULT_HOTEL} capPrice={cap} />
      )}
      {outcome?.status === 'lost' && (
        <LossPath outcome={outcome} hotel={DEFAULT_HOTEL} capPrice={cap} agentName={yourAgent.name} />
      )}
```

Also, when `outcome` is set, stop the heartbeat by removing `heartbeat` class — change the wrapper:

```jsx
      <div className={`${outcome ? '' : 'heartbeat'} rounded-lg ${outcome ? '' : 'p-px'}`}>
```

- [ ] **Step 4: Verify.**

- Visit `/live`. Wait for the auction to end (~28 seconds).
- ~82% of runs end in a win — confetti, savings number animates up, three CTAs render. Hit the *Try Tonight's drops* link → navigates to `/tonight`.
- Reload until you get a loss outcome (status='lost'). The graceful loss state appears with the cap-overshoot copy and a *Try Tonight* primary CTA.
- The heartbeat pulse around the ladder/thoughts stops once the outcome lands.

---

## Task 10: Reshape Tonight (was Midnight)

**Why:** Tonight is the retention-loop surface. Tightening the urgency, adding a filter and the *Wake me* opt-in, and routing deal clicks into Live makes the surface feel like part of a continuous product instead of a dead-end grid.

**Files:**
- Create: `src/components/Tonight/Tonight.jsx`
- Modify: `src/App.jsx` (swap Midnight → Tonight)
- Delete: `src/components/Midnight/Midnight.jsx` (after route swaps cleanly)

- [ ] **Step 1: Create the new Tonight component.**

Create `src/components/Tonight/Tonight.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { readBool, writeBool, KEYS } from '../../lib/storage'
import PmAnnotation from '../shared/PmAnnotation'

const DEALS = [
  { id: 'aria',     hotel: 'Aria Resort & Casino', city: 'Las Vegas', original: 289, price: 142, savings: 51, left: 3, agentsBidding: 8 },
  { id: 'venetian', hotel: 'The Venetian',         city: 'Las Vegas', original: 399, price: 189, savings: 53, left: 1, agentsBidding: 14 },
  { id: 'mgm',      hotel: 'MGM Grand',            city: 'Las Vegas', original: 219, price: 105, savings: 52, left: 5, agentsBidding: 6 },
  { id: 'wynn',     hotel: 'Wynn Las Vegas',       city: 'Las Vegas', original: 349, price: 168, savings: 52, left: 7, agentsBidding: 4 },
  { id: 'linq',     hotel: 'LINQ Hotel',           city: 'Las Vegas', original: 149, price: 68,  savings: 54, left: 9, agentsBidding: 3 },
  { id: 'soho',     hotel: 'The Standard',         city: 'New York',  original: 259, price: 119, savings: 54, left: 4, agentsBidding: 11 },
  { id: 'ace',      hotel: 'Ace Hotel',            city: 'London',    original: 219, price: 98,  savings: 55, left: 6, agentsBidding: 5 },
]

const CITIES = ['All', 'Las Vegas', 'New York', 'London']

export default function Tonight() {
  const [time, setTime] = useState('')
  const [filter, setFilter] = useState('All')
  const [wakeMe, setWakeMe] = useState(() => readBool(KEYS.wakeMe, false))
  const navigate = useNavigate()

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const target = new Date()
      target.setHours(22, 0, 0, 0)
      if (now > target) target.setDate(target.getDate() + 1)
      const d = target - now
      const h = String(Math.floor(d / 3600000)).padStart(2, '0')
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((d % 60000) / 1000)).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  const visible = filter === 'All' ? DEALS : DEALS.filter(d => d.city === filter)

  function toggleWake() {
    const next = !wakeMe
    setWakeMe(next)
    writeBool(KEYS.wakeMe, next)
  }

  function openDeal(deal) {
    navigate(`/live?deal=${deal.id}`)
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-12">
      {/* Countdown */}
      <div className="text-center mb-12">
        <p className="text-xs text-[var(--text-3)] mb-3 font-mono">Deals drop at 10:00 PM · agents already deployed: 247</p>
        <div className="font-mono text-5xl md:text-7xl font-semibold tracking-tighter text-[var(--accent)]">{time}</div>
        <p className="text-sm text-[var(--text-3)] mt-4">Half-price hotels · Check-in after 10pm</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate('/deploy')}
            className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
          >
            Deploy agent for tonight
          </button>
          <button
            onClick={toggleWake}
            aria-pressed={wakeMe}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm ${
              wakeMe
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border-2)] text-[var(--text-2)] hover:bg-[var(--bg-2)]'
            }`}
          >
            <Bell size={14} />
            {wakeMe ? 'I’ll wake you at 10pm' : 'Wake me at 10pm'}
          </button>
        </div>
      </div>

      <PmAnnotation
        why="Retention loop — push permission is the cheapest re-acquisition channel"
        tracking="Push opt-in rate · D1 return-via-push"
        tradeoff="No real backend in this demo — localStorage flag stands in"
        v2="Geo + budget-aware push: 'a deal you'd like is dropping in 2h'"
        className="mb-6"
      />

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {CITIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-[12px] border whitespace-nowrap cursor-pointer ${
              filter === c
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-2)] text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Deals */}
      <h2 className="text-sm font-medium text-[var(--text-2)] mb-3">Tonight's hotels</h2>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] p-8 text-center text-[13px] text-[var(--text-3)]">
          No drops in {filter} tonight. Try All.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
          {visible.map(d => (
            <button
              key={d.id}
              onClick={() => openDeal(d)}
              className="text-left bg-[var(--bg)] p-5 hover:bg-[var(--bg-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-mono text-xl font-semibold">${d.price}</span>
                <span className="text-xs font-mono text-[var(--accent)]">-{d.savings}%</span>
              </div>
              <span className="text-xs text-[var(--text-3)] line-through font-mono">${d.original}</span>
              <p className="text-sm text-[var(--text)] mt-3">{d.hotel}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{d.city} · {d.left} left</p>
              <div className="mt-3 text-[11px] text-[var(--text-3)] font-mono">{d.agentsBidding} agents bidding</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Swap the route.**

Edit `src/App.jsx` — replace the Midnight import and route:

```jsx
import Tonight from './components/Tonight/Tonight'
// …inside <Routes>
          <Route path="/tonight" element={<Tonight />} />
```

Remove the now-unused Midnight import.

- [ ] **Step 3: Delete the old Midnight component.**

```bash
rm /c/Users/User/Desktop/website/src/components/Midnight/Midnight.jsx
rmdir /c/Users/User/Desktop/website/src/components/Midnight
```

(Or via your IDE.)

- [ ] **Step 4: Verify.**

Visit `/tonight`:
- Countdown still ticks
- Three filter pills (All, Las Vegas, New York, London) — clicking *London* shows the Ace Hotel only; *New York* shows The Standard only; *All* shows everything
- *Wake me at 10pm* button toggles label and persists across reload (`localStorage.getItem('ax.wakeMe')` flips)
- Clicking any deal navigates to `/live?deal=aria` (or whichever id) — the auction starts (Live currently ignores the query param; that's fine for now)
- With PM view ON, the annotation chip about retention loops appears between the countdown and the filter row

---

## Task 11: Reshape Home (rename Exchange → Home)

**Why:** Home is the boss's first impression. The reframe — sharper headline, single CTA, embedded 3-act story, social proof — turns the page from a feature dump into a narrative that lands the wedge in 10 seconds.

**Files:**
- Create: `src/components/Home/Home.jsx`
- Create: `src/components/Home/StoryActs.jsx`
- Create: `src/components/Home/SocialProof.jsx`
- Modify: `src/App.jsx` (swap Exchange → Home)
- Delete: `src/components/Exchange/Exchange.jsx` (after swap)
- Move: `src/components/Exchange/GlobeView.jsx` → `src/components/Home/GlobeView.jsx`
- Move: `src/components/Exchange/globeData.js` → `src/components/Home/globeData.js`

- [ ] **Step 1: Move the globe files.**

```bash
mv /c/Users/User/Desktop/website/src/components/Exchange/GlobeView.jsx /c/Users/User/Desktop/website/src/components/Home/GlobeView.jsx
mv /c/Users/User/Desktop/website/src/components/Exchange/globeData.js /c/Users/User/Desktop/website/src/components/Home/globeData.js
```

If the Home directory doesn't exist yet, create it: `mkdir -p /c/Users/User/Desktop/website/src/components/Home`.

The two moved files do not need internal edits — their relative imports (`./globeData`) still resolve.

- [ ] **Step 2: Create StoryActs.**

Create `src/components/Home/StoryActs.jsx`:

```jsx
const ACTS = [
  {
    label: 'The waste',
    head: '30% of hotel rooms go unsold each night.',
    body: 'Hotels would rather discount than leave a room empty. They just won\'t admit it in public — yield desks quietly drop rates after 6pm and only locals know which knobs to push.',
    stat: '~30%',
    sub: 'rooms unsold past 6pm · industry avg',
  },
  {
    label: 'The bet',
    head: 'Hotels run revenue bots. Travelers don\'t. We give travelers a bot.',
    body: 'AgentExchange deploys an AI agent that bids against the hotel\'s revenue management system in real time, with a hard price cap and a personality you choose.',
    stat: '34%',
    sub: 'avg savings vs. rack · last 30 days',
  },
  {
    label: 'The proof',
    head: 'Sarah\'s agent saved $312 in 4 minutes.',
    body: 'Sarah picked Hawk, set $180, and went to dinner. Her agent won the room for $142 — receipt in her inbox before dessert.',
    stat: '$2.3M',
    sub: 'saved by AgentExchange travelers this month',
  },
]

export default function StoryActs() {
  return (
    <div className="space-y-12">
      {ACTS.map((a, i) => (
        <article key={a.label} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          <div className="md:col-span-2">
            <div className="text-[11px] font-mono text-[var(--text-3)]">ACT {i + 1}</div>
            <div className="text-[12px] text-[var(--text-2)] mt-1">{a.label}</div>
          </div>
          <div className="md:col-span-7">
            <h3 className="serif text-3xl md:text-4xl text-[var(--text)] leading-tight">{a.head}</h3>
            <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-[58ch]">{a.body}</p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <div className="font-mono text-3xl text-[var(--accent)] tabular-nums">{a.stat}</div>
            <div className="text-[11px] text-[var(--text-3)] mt-1">{a.sub}</div>
          </div>
        </article>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create SocialProof.**

Create `src/components/Home/SocialProof.jsx`:

```jsx
const WINS = [
  { who: 'Sarah K.', city: 'Las Vegas', agent: 'Hawk', saved: 312, ago: '4m' },
  { who: 'Diego R.', city: 'New York',  agent: 'Sage', saved: 184, ago: '11m' },
  { who: 'Maya T.',  city: 'London',    agent: 'Owl',  saved: 219, ago: '17m' },
  { who: 'Jules P.', city: 'Tokyo',     agent: 'Hawk', saved: 96,  ago: '24m' },
  { who: 'Ana S.',   city: 'Miami',     agent: 'Sage', saved: 158, ago: '31m' },
  { who: 'Leo M.',   city: 'Paris',     agent: 'Owl',  saved: 273, ago: '42m' },
]

export default function SocialProof() {
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--text-2)] mb-3">Recent wins</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
        {WINS.map((w, i) => (
          <div key={i} className="bg-[var(--bg)] p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xl text-[var(--accent)]">${w.saved}</span>
              <span className="text-[11px] font-mono text-[var(--text-3)]">{w.ago} ago</span>
            </div>
            <p className="text-sm text-[var(--text)] mt-3">{w.who} · {w.city}</p>
            <p className="text-[11px] text-[var(--text-3)] mt-0.5">won by {w.agent}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create Home.jsx.**

Create `src/components/Home/Home.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GlobeView from './GlobeView'
import StoryActs from './StoryActs'
import SocialProof from './SocialProof'

export default function Home() {
  const [agents, setAgents] = useState(1247)

  useEffect(() => {
    const i = setInterval(() => setAgents(p => p + Math.floor(Math.random() * 3) - 1), 4000)
    return () => clearInterval(i)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <GlobeView />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />

        <div className="absolute bottom-12 left-6 md:left-12 z-10 max-w-[640px]">
          <p className="text-[var(--text-3)] text-[12px] mb-3 font-mono">
            {agents.toLocaleString()} agents bidding right now · 34% avg savings · 47 markets
          </p>
          <h1 className="serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[var(--text)]">
            AI agents that fight hotels for your bedtime.
          </h1>
          <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-[42ch]">
            Set a cap. Pick a personality. Your agent does the rest — including the awkward part.
          </p>
          <Link
            to="/deploy"
            className="inline-flex items-center mt-6 px-5 py-2.5 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
          >
            Deploy your first agent →
          </Link>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-[1120px] mx-auto px-6 py-20">
        <StoryActs />
      </section>

      {/* Proof */}
      <section className="max-w-[1120px] mx-auto px-6 pb-20">
        <SocialProof />
      </section>
    </div>
  )
}
```

(Note: GlobeView is invoked without `onCityClick` — that prop becomes optional. Confirm by glancing at `GlobeView.jsx` line 6: it already destructures the prop with no default, and uses it inside a callback gated by `if (onCityClick)`. No edit needed.)

- [ ] **Step 5: Swap the route.**

Edit `src/App.jsx`:

```jsx
import Home from './components/Home/Home'
// …inside <Routes>
          <Route path="/" element={<Home />} />
```

Remove the now-unused Exchange import.

- [ ] **Step 6: Delete the old Exchange component.**

```bash
rm /c/Users/User/Desktop/website/src/components/Exchange/Exchange.jsx
rmdir /c/Users/User/Desktop/website/src/components/Exchange
```

- [ ] **Step 7: Verify.**

Visit `/`:
- Globe still rotates and renders city points/labels.
- Headline reads "AI agents that fight hotels for your bedtime." in Instrument Serif.
- Single CTA *Deploy your first agent →* navigates to `/deploy`.
- Below the fold, three story acts (Waste / Bet / Proof) render in a 3-column responsive layout. Stat numbers on the right.
- Below acts, "Recent wins" 6-card grid renders.
- Old ticker and *Recent matches* grid are gone (replaced).
- Footer still shows.

---

## Task 12: PM-view annotations across all surfaces

**Why:** This is the demo's signature creative move. With the infrastructure built (Task 4) and screens reshaped (Tasks 7–11), every surface now needs context-specific annotation content.

**Files:**
- Modify: `src/components/Home/Home.jsx`
- Modify: `src/components/Deploy/Deploy.jsx`
- Modify: `src/components/Live/Live.jsx`
- (Tonight already has one annotation from Task 10)

- [ ] **Step 1: Annotate Home.**

Edit `src/components/Home/Home.jsx` — import the annotation:

```jsx
import PmAnnotation from '../shared/PmAnnotation'
```

Place an annotation just below the headline copy block, *inside* the absolute-positioned overlay container — it should sit under the CTA so it doesn't visually compete with the hero. Add this after the `<Link>`:

```jsx
            <PmAnnotation
              why="First-impression test — does the wedge land in 10 seconds?"
              tracking="% visitors who scroll past Act 1 (target: 60%)"
              tradeoff="Replaced a live ticker — high motion, low comprehension"
              v2="A/B test framing: job-to-be-done vs. savings-led headline"
              className="mt-4 max-w-[42ch]"
            />
```

Add a second annotation between the *StoryActs* section and *SocialProof*:

```jsx
      {/* Between sections */}
      <section className="max-w-[1120px] mx-auto px-6 pb-6">
        <PmAnnotation
          why="Social proof closes the loop on a cold visit — we are not the first person who tried this."
          tracking="Win-card click-through · scroll depth past acts"
          tradeoff="Anonymized snippets. Real testimonials require legal review and we are pre-launch."
          v2="Replace with verified shareable win-cards (OG-style images) that travelers post themselves"
        />
      </section>
```

- [ ] **Step 2: Annotate Deploy.**

Edit `src/components/Deploy/Deploy.jsx` — import and place an annotation directly *under* the TrustBlock and another *under* the personality picker.

Add the import:

```jsx
import PmAnnotation from '../shared/PmAnnotation'
```

After `<TrustBlock cap={cap} />`:

```jsx
        <PmAnnotation
          why="Trust is the #1 abandonment driver in money-flow products. Cap + guarantee removes the 'what if it overpays' fear."
          tracking="Conversion rate through this step · % users who hover the trust block"
          tradeoff="We could ship without underwriting the guarantee — but ARPU lift won't matter if nobody clicks Deploy."
          v2="Underwrite via an insurance partner; surface the badge throughout the funnel"
        />
```

After the personality `<PersonalityPicker />` block (the wrapping `<div>` with the label):

```jsx
        <PmAnnotation
          why="Naming and personifying the agent makes it a delegate, not a feature. Travelers refer to 'Hawk' by name to friends."
          tracking="Personality selection rate (uniform = bad — means people don't differentiate). Target: 50% non-default picks."
          tradeoff="Three is a deliberate cap — more options reduce conversion. Add a fourth only if usage data demands it."
          v2="Personality affects post-win share-card style (Hawk = bold, Sage = clean, Owl = quiet) — turns choice into identity."
        />
```

- [ ] **Step 3: Annotate Live.**

Edit `src/components/Live/Live.jsx` — import:

```jsx
import PmAnnotation from '../shared/PmAnnotation'
```

Place a *general* annotation at the top of the page, just under the title row (before the heartbeat wrapper):

```jsx
      <PmAnnotation
        why="The product magic is invisible without a viewer. Travelers don't believe what they can't watch."
        tracking="Activation = first auction watched to completion. Target: 70% completion on first visit."
        tradeoff="Auction is scripted/simulated for this demo. V1 would back this with a real matching engine + WebSocket stream."
        v2="Live overlays of rivals' personality types so travelers can see the meta-game forming."
        className="mb-4"
      />
```

Place a second annotation *inside* the WinMoment when an outcome is a win — but to avoid mutating WinMoment's API, place it in Live.jsx right after the WinMoment render:

```jsx
      {outcome?.status === 'won' && (
        <>
          <WinMoment outcome={outcome} hotel={DEFAULT_HOTEL} capPrice={cap} />
          <PmAnnotation
            why="The win moment drives sharing. A great win without a clear share path is wasted virality."
            tracking="Share rate post-win (target: 18%) · D7 retention conditional on first win"
            tradeoff="Confetti is a cliché but earned here — sound + motion encode the emotional payoff."
            v2="Generate a shareable OG image card per win instead of a generic share dialog. Auto-posts to user's chosen channel."
            className="mt-4"
          />
        </>
      )}
```

Similarly, after the LossPath render:

```jsx
      {outcome?.status === 'lost' && (
        <>
          <LossPath outcome={outcome} hotel={DEFAULT_HOTEL} capPrice={cap} agentName={yourAgent.name} />
          <PmAnnotation
            why="A loss is a fork in the funnel — we either re-engage them on Tonight or they bounce."
            tracking="Loss-to-Tonight conversion · cap-raise retry rate"
            tradeoff="Never break the cap, ever. Losing some bookings now buys lifetime trust."
            v2="Auto-suggest a smarter cap ('rooms like this typically clear at $190 — raise cap?') based on real data."
            className="mt-4"
          />
        </>
      )}
```

- [ ] **Step 4: Verify.**

Toggle PM view ON (click the pill or press `?`). Walk every screen:
- `/` — annotation under the hero CTA + annotation between sections
- `/deploy` — annotation under TrustBlock + annotation under PersonalityPicker
- `/live` — annotation under the title; after the auction ends, a second annotation appears appropriate to outcome
- `/tonight` — retention-loop annotation between countdown and filter row (already added in Task 10)

Toggle PM view OFF — every annotation disappears with no layout collapse glitches. The pill state persists across reload.

---

## Task 13: Polish pass

**Why:** Empty states with personality, mobile layouts, focus-visible states, the demo banner, the audio toggle, and the perf deferrals are the *considered details* the spec called out. They turn the redesign from "good idea" into "shipped".

**Files:**
- Create: `src/components/shared/DemoBanner.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Home/Home.jsx` (perf — defer globe)
- Modify: `src/components/Live/Live.jsx` (audio toggle)
- Modify: `src/components/Deploy/Deploy.jsx` (empty-state copy on personality picker container — reuse blurb)

### 13a. Demo banner

- [ ] **Step 1: Create the banner.**

Create `src/components/shared/DemoBanner.jsx`:

```jsx
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { readBool, writeBool, KEYS } from '../../lib/storage'

export default function DemoBanner() {
  const [seen, setSeen] = useState(true) // assume seen on SSR; correct on mount

  useEffect(() => {
    setSeen(readBool(KEYS.demoSeen, false))
  }, [])

  function dismiss() {
    setSeen(true)
    writeBool(KEYS.demoSeen, true)
  }

  if (seen) return null

  return (
    <div className="border-b border-[var(--accent)] bg-[var(--accent-soft)]">
      <div className="max-w-[1120px] mx-auto px-6 h-9 flex items-center justify-between gap-4 text-[12px]">
        <Link to="/live" onClick={dismiss} className="text-[var(--accent)] hover:opacity-80">
          Watch a 30-second demo →
        </Link>
        <button onClick={dismiss} aria-label="Dismiss" className="text-[var(--text-3)] hover:text-[var(--text-2)]">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount it above Navigation.**

Edit `src/App.jsx` — add the import and place `<DemoBanner />` *above* `<Navigation />`:

```jsx
import DemoBanner from './components/shared/DemoBanner'
// …
      <DemoBanner />
      <Navigation />
```

- [ ] **Step 3: Verify.**

First visit: banner shows at the very top with *Watch a 30-second demo →* link and an `X`. Click the link — navigates to `/live`, banner disappears, and stays gone across reloads. Clear the `ax.demoSeen` key from localStorage to re-test.

### 13b. Audio toggle on Live

- [ ] **Step 1: Add an audio toggle button to Live.**

Edit `src/components/Live/Live.jsx` — at the top of the component body, add audio state:

```jsx
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { readBool, writeBool, KEYS } from '../../lib/storage'
// (existing imports)

// inside the component:
  const [audioOn, setAudioOn] = useState(() => readBool(KEYS.audioOn, false))

  function toggleAudio() {
    const next = !audioOn
    setAudioOn(next)
    writeBool(KEYS.audioOn, next)
  }
```

In the title row, replace the right-side `<Link to="/deploy">Reconfigure →</Link>` with:

```jsx
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleAudio}
            aria-pressed={audioOn}
            className="text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer"
            title="Toggle heartbeat audio"
          >
            {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <Link to="/deploy" className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)]">Reconfigure →</Link>
        </div>
```

Add an audio element + heartbeat playback effect (uses a tiny WebAudio click — no asset required):

```jsx
  useEffect(() => {
    if (!audioOn || outcome) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    let cancel = false
    function beat() {
      if (cancel) return
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 80
      g.gain.value = 0.0
      o.connect(g); g.connect(ctx.destination)
      o.start()
      const t = ctx.currentTime
      g.gain.linearRampToValueAtTime(0.04, t + 0.02)
      g.gain.linearRampToValueAtTime(0.0, t + 0.18)
      o.stop(t + 0.2)
      setTimeout(beat, 1600)
    }
    beat()
    return () => { cancel = true; ctx.close() }
  }, [audioOn, outcome])
```

- [ ] **Step 2: Verify.**

On `/live`, click the speaker icon — a faint thump plays roughly every 1.6 s. Click again to mute. Reload — preference persists. When the auction ends, the heartbeat stops automatically.

### 13c. Perf — defer globe

- [ ] **Step 1: Lazy-load GlobeView.**

Edit `src/components/Home/Home.jsx` — replace the static import with `lazy`:

```jsx
import { useState, useEffect, lazy, Suspense } from 'react'
// remove: import GlobeView from './GlobeView'
const GlobeView = lazy(() => import('./GlobeView'))
```

Wrap the GlobeView usage:

```jsx
        <div className="absolute inset-0">
          <Suspense fallback={<GlobeFallback />}>
            <GlobeView />
          </Suspense>
        </div>
```

Add a small fallback above the component:

```jsx
function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-[var(--accent)] heartbeat" />
    </div>
  )
}
```

- [ ] **Step 2: Verify.**

DevTools → Network → reload `/`. The `react-globe` chunk now loads as a *separate* JS file after the initial bundle. Initial paint shows the heartbeat dot; the globe replaces it within ~200–600ms on a typical machine. The headline text is visible immediately (it isn't blocked by globe loading).

### 13d. Mobile audit

- [ ] **Step 1: Walk every screen at 375px width.**

DevTools → Toggle device toolbar → 375 × 812.

For each screen, confirm:
- `/` — globe still renders (smaller); headline wraps, CTA is full-width-feeling, story acts collapse to single column with stat numbers below the text.
- `/deploy` — every input is touchable. Personality cards stack one-per-row on narrow widths (already handled by the `sm:grid-cols-3` breakpoint). Slider is wide.
- `/live` — three panels stack vertically (already handled by `lg:grid-cols-3`). The bid ladder stays readable.
- `/tonight` — countdown shrinks proportionally; deal grid becomes one-column; filter pills horizontally scroll.
- `/hotels` — kept as-is per spec.

Fix only what is broken. Common fixes:
- Add `overflow-x-auto` to filter pill rows (already in Task 10)
- Ensure CTAs have `min-h-[44px]` if any feel short

- [ ] **Step 2: Keyboard-only audit.**

Tab through `/`, `/deploy`, `/live`, `/tonight`. Every interactive element must show the coral focus ring. The PM-view toggle, the audio button, the deploy button, the personality cards, the deal cards, the filter pills, the *Wake me* button — all keyboard-reachable, all visibly focused.

If any element doesn't show the focus ring, give it `tabIndex={0}` (only if it's not already a button) and confirm it's a real interactive element.

### 13e. Empty states & copy polish

- [ ] **Step 1: Personality empty state hint.**

The Deploy header line *"Hawk is awake. Where are you sending him?"* — already covered by the dynamic blurb under the title (Task 7 implementation: `{agent.blurb}` renders below the H1). No additional change needed; verify it reads well for all three agents.

- [ ] **Step 2: Live cold-visit hint.**

Edit `src/components/Live/Live.jsx` — when there is no `stored` agent (cold visit), render a small banner under the title row directing the user to Deploy:

```jsx
  // inside the component, after destructuring stored:
  const isColdVisit = !stored
```

Add this just above the `heartbeat`-wrapped grid:

```jsx
      {isColdVisit && (
        <p className="text-[12px] text-[var(--text-3)] mb-3">
          You haven't commissioned an agent yet — this is a demo run with Sage. <Link to="/deploy" className="text-[var(--accent)] hover:opacity-80">Pick your own →</Link>
        </p>
      )}
```

- [ ] **Step 3: Tonight zero-state copy.**

Already handled in Task 10 (the *No drops in {filter} tonight. Try All.* fallback).

- [ ] **Step 4: Final verification pass.**

Run through the full demo flow as the boss would:
1. Land on `/` cold (clear localStorage in DevTools first).
2. See the demo banner, story acts, recent wins.
3. Click *Deploy your first agent →* → arrives on `/deploy`.
4. Pick Hawk, set $200 cap.
5. Click *Deploy Hawk · $2.00* → transitions to `/live`.
6. Watch the auction (~28s). Win or lose, the outcome panel renders with appropriate CTAs.
7. From a win, click *Try Tonight's drops →*. From a loss, *Try Tonight →*.
8. On `/tonight`, click any deal card → returns to `/live` (new auction).
9. Toggle PM view ON. Walk every screen again. Annotations are present, specific, non-repeating. Toggle OFF.
10. Refresh once on every screen. No errors in DevTools console.

If anything in steps 1–10 surprises you, fix it before declaring done.

---

## Self-review summary (against the spec)

Spec sections vs. plan tasks:

| Spec section                             | Covered in task(s)              |
|-----------------------------------------|----------------------------------|
| §5 Information architecture            | 1, 3                             |
| §6.1 Home reshape                       | 11                               |
| §6.2 Deploy reframe                     | 5, 7                             |
| §6.3 Live (centerpiece)                 | 6, 8, 9                          |
| §6.4 Tonight                            | 10                               |
| §6.5 Hotels demoted                     | 1, 3                             |
| §7  PM-view toggle + annotations        | 4, 12                            |
| §8  Considered details (mobile, focus, audio, banner, perf) | 13          |
| §9  Visual / brand direction            | 2                                |
| §10 Tradeoffs visible to the boss       | 12 (annotations call out scripted data, no auth, demoted Hotels) |
| §11 Risks                               | Mitigated via scope + verification steps |
| §12 Out of scope                        | Not built (per spec)             |

No placeholders. No "TBD". Identifiers used in later tasks (`createAuction`, `getAgent`, `AGENTS.hawk`, `KEYS.pmView`, `usePmView`, `PmAnnotation`) all match the names defined in earlier tasks.

---

## Execution

Plan complete and saved to `docs/superpowers/plans/2026-05-04-agentexchange-consumer-first.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session with checkpoints.

Which approach?
