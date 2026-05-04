import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { KEYS, readBool, writeBool, writeJSON } from './storage'
import { HOTELS } from './hotels'

// Lightweight tour event bus. Components fire signals when the user performs
// the action a tour step is waiting for; the Tour subscribes and advances.
const signalBus = new EventTarget()

export function emitTourSignal(name) {
  signalBus.dispatchEvent(new Event(name))
}

export function onTourSignal(name, handler) {
  signalBus.addEventListener(name, handler)
  return () => signalBus.removeEventListener(name, handler)
}

const Ctx = createContext({
  open: false,
  step: 0,
  start: () => {},
  next: () => {},
  prev: () => {},
  skip: () => {},
  finish: () => {},
})

export const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AgentExchange.',
    body: 'AI agents that find and book hotel deals on autopilot. Set a price cap, pick a personality, and your agent does the rest. Let me show you around in 60 seconds.',
    target: null,
    route: '/',
    setup: null,
    advanceOn: null,    // welcome has no action — Next only
    actionPrompt: null,
  },
  {
    id: 'search',
    title: 'Search from the Earth.',
    body: 'Type a city in this search bar — try Las Vegas — or click any dot on the globe.',
    target: '[data-tour="search-bar"]',
    route: '/',
    setup: null,
    advanceOn: 'tour:selected',
    actionPrompt: '↑ Pick any city to continue',
  },
  {
    id: 'coverage',
    title: 'Set your coverage radius.',
    body: 'Click any radius pill (50, 100, 250, or 500 mi). Or hold Shift and drag the coverage circle on the globe to resize it freely.',
    target: '[data-tour="radius-selector"]',
    route: '/?selected=lasvegas',
    setup: null,
    advanceOn: 'tour:radius-changed',
    actionPrompt: '↑ Click a radius to continue',
  },
  {
    id: 'find',
    title: 'Continue when ready.',
    body: 'This loads all the hotels in your coverage area, ready to filter and compare.',
    target: '[data-tour="find-hotels"]',
    route: '/?selected=lasvegas',
    setup: null,
    advanceOn: 'tour:find-hotels-clicked',
    actionPrompt: '↑ Click "Find hotels" to continue',
  },
  {
    id: 'filters',
    title: 'Sort and filter.',
    body: 'Sort the list by price, distance, savings, or stars. Open Filters for stars, amenities, neighborhoods, free cancellation.',
    target: '[data-tour="filters-button"]',
    route: '/search?lat=36.17&lng=-115.14&name=Las%20Vegas&radius=100',
    setup: null,
    advanceOn: 'tour:filters-opened',
    actionPrompt: '↑ Click "Filters" to continue',
  },
  {
    id: 'pin',
    title: 'Pin to compare.',
    body: 'Pin up to 3 hotels — they show up in a tray at the bottom and you can compare them side by side.',
    target: '[data-tour="hotel-card"]',
    route: '/search?lat=36.17&lng=-115.14&name=Las%20Vegas&radius=100',
    setup: null,
    advanceOn: 'tour:pinned',
    actionPrompt: '↑ Pin any hotel to continue',
  },
  {
    id: 'deploy',
    title: 'Pick your agent.',
    body: 'Hawk bids fast and wins more. Sage balances. Owl waits for the best deal. Each has a different personality.',
    target: '[data-tour="personality-picker"]',
    route: '/deploy',
    setup: 'select-aria',
    advanceOn: 'tour:agent-picked',
    actionPrompt: '↑ Pick a personality to continue',
  },
  {
    id: 'watch',
    title: 'Watch the auction.',
    body: 'Click Done and your agent starts bidding. About 28 seconds in real time. You will see a live bid ladder, agent thoughts, and a win or graceful loss at the end.',
    target: null,
    route: '/live',
    setup: 'deploy-hawk',
    advanceOn: null,    // last step
    actionPrompt: null,
  },
]

function runSetup(name) {
  if (name === 'select-vegas') {
    // No-op at the data layer — Home reads URL params; tour will set selection via URL on the next nav.
    // The tour auto-navigates to /search?lat=...&lng=...&name=Las+Vegas in step 4.
  } else if (name === 'select-aria') {
    const aria = HOTELS.find(h => h.id === 'aria')
    if (aria) {
      writeJSON(KEYS.selectedHotel, {
        id: aria.id, name: aria.name, city: aria.city,
        lat: aria.lat, lng: aria.lng,
        rackRate: aria.rackRate, price: aria.price, left: 3,
      })
    }
  } else if (name === 'deploy-hawk') {
    writeJSON(KEYS.yourAgent, { agentId: 'hawk', cap: 200, deployedAt: Date.now() })
  }
}

export function TourProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Auto-open on first visit
  useEffect(() => {
    const seen = readBool(KEYS.tourSeen, false)
    if (!seen) {
      // Slight delay so the page paints first
      const id = setTimeout(() => setOpen(true), 700)
      return () => clearTimeout(id)
    }
  }, [])

  const start = useCallback(() => {
    setStep(0)
    setOpen(true)
  }, [])

  const next = useCallback(() => {
    setStep(s => Math.min(STEPS.length - 1, s + 1))
  }, [])

  const prev = useCallback(() => {
    setStep(s => Math.max(0, s - 1))
  }, [])

  const finish = useCallback(() => {
    setOpen(false)
    setStep(0)
    writeBool(KEYS.tourSeen, true)
  }, [])

  const skip = finish

  return (
    <Ctx.Provider value={{ open, step, start, next, prev, skip, finish, runSetup }}>
      {children}
    </Ctx.Provider>
  )
}

export { runSetup }

export function useTour() {
  return useContext(Ctx)
}
