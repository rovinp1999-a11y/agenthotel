import { useEffect, useState } from 'react'
import { HOTELS } from './hotels'
import { AGENT_LIST } from './agents'

const FIRST_NAMES = ['Maya', 'Diego', 'Sarah', 'Leo', 'Jules', 'Ana', 'Tomás', 'Riya', 'Amir', 'Eli', 'Hana', 'Noah']

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)] }

function makeWin(rng) {
  const hotel = pick(HOTELS, rng)
  const agent = pick(AGENT_LIST, rng)
  const savings = Math.round(((hotel.rackRate - hotel.price) / hotel.rackRate) * 100)
  return {
    id: `${Date.now()}-${Math.floor(rng() * 1e6)}`,
    who: pick(FIRST_NAMES, rng),
    agent: agent.name,
    agentColor: agent.color,
    hotel: hotel.name,
    city: hotel.city,
    lat: hotel.lat,
    lng: hotel.lng,
    saved: hotel.rackRate - hotel.price,
    savingsPct: savings,
    t: Date.now(),
  }
}

/**
 * Simulated live activity feed. Emits a new "win" every 4–9 seconds.
 *
 * Returns:
 *   wins:      most recent win-event ring buffer (newest first), capped at maxRecent
 *   pulse:     last-emitted win — consumers (e.g., GlobeView) can use this to
 *              animate a pulse at lat/lng. Stays referentially equal until the next emit.
 *   winsPerMin: rolling estimate displayed on the collapsed pill
 */
export function useActivityStream({ maxRecent = 5, rng = Math.random } = {}) {
  const [wins, setWins] = useState([])
  const [pulse, setPulse] = useState(null)

  useEffect(() => {
    let cancel = false
    function schedule() {
      const delay = 4000 + Math.floor(rng() * 5000)
      const id = setTimeout(() => {
        if (cancel) return
        const w = makeWin(rng)
        setPulse(w)
        setWins(prev => [w, ...prev].slice(0, maxRecent))
        schedule()
      }, delay)
      return id
    }
    const id = schedule()
    return () => { cancel = true; clearTimeout(id) }
  // rng is stable; maxRecent rarely changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Approximate "wins/min" from the visible buffer
  const winsPerMin = wins.length >= 2
    ? Math.round((60_000 / Math.max(1, (wins[0].t - wins[wins.length - 1].t))) * (wins.length - 1))
    : 6

  return { wins, pulse, winsPerMin }
}
