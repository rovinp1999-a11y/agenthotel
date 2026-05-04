// Verify geo + hotel filter logic. Run: node scripts/verify-geo.mjs

import { distanceMi, milesToGlobeDegrees, withinRadius } from '../src/lib/geo.js'
import { HOTELS, filterHotels } from '../src/lib/hotels.js'

let pass = 0, fail = 0
function check(label, cond) {
  if (cond) { pass++; console.log('  ok  ' + label) }
  else      { fail++; console.log('  FAIL ' + label) }
}
function approxEq(a, b, tol = 1) { return Math.abs(a - b) <= tol }

// New York (40.71, -74.01) ↔ London (51.51, -0.13) ≈ 3470 mi
const NY = { lat: 40.71, lng: -74.01 }
const LDN= { lat: 51.51, lng: -0.13  }
check('Haversine NY → LDN ≈ 3470 mi', approxEq(distanceMi(NY, LDN), 3470, 30))
check('Same point distance is 0',     approxEq(distanceMi(NY, NY), 0, 0.001))
check('100 mi → ≈ 1.45 deg',          approxEq(milesToGlobeDegrees(100), 100/69.17, 0.0001))

const lvCenter = { lat: 36.10, lng: -115.17 }
const lvOnly = withinRadius(HOTELS, lvCenter, 50)
check('withinRadius LV 50mi includes Aria',     lvOnly.some(h => h.id === 'aria'))
check('withinRadius LV 50mi excludes Plaza NYC',!lvOnly.some(h => h.id === 'plaza'))

const filtered = filterHotels(HOTELS, {
  center: lvCenter, radiusMi: 50,
  stars: 5,
  minPrice: 100, maxPrice: 250,
  amenities: ['pool', 'breakfast'],
  freeCancelOnly: true,
}, distanceMi)
check('Composite filter returns at least 1 hotel', filtered.length >= 1)
check('Composite filter excludes 3-star LINQ',     !filtered.some(h => h.id === 'linq'))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
