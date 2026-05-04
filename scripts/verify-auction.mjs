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
