# AgentExchange Phase 2 — Earth-as-Search + Filters + Activity

**Date:** 2026-05-04
**Author:** Rovin (with Claude)
**Context:** Phase 2 of the consumer-first redesign. Phase 1 reframed four screens, built Live Auction, added a PM-view annotation layer. Phase 2 turns the globe into an interactive search surface, adds filters/comparison/activity feed, and ups overall interactivity for the PM interview demo.

---

## 1. Goal

Demonstrate range. Phase 1 showed product *thinking* (story, journey, PM annotations). Phase 2 shows product *craft* (real interactive features with depth, not just framing). The boss should leave the demo with three concrete things they could quote back: *"the globe is a real search surface,"* *"the filter drawer counts live as you adjust,"* *"the activity feed pulses on the globe in real time."*

## 2. Non-goals

- Replacing the globe with a map view
- Real geocoding (typed search uses local city data — V1 callout in PM-view)
- Real hotel inventory (curated local list of ~20 hotels — V1 callout in PM-view)
- Auth, accounts, payments, real notifications
- Multi-agent deploy (deliberately cut to preserve the Live win moment)

## 3. Scope (six additions)

### 3.1 Real Earth texture

Replace the current emissive dark mesh with a Blue Marble / Natural Earth texture. Atmosphere stays coral-tinted. Lower autorotate speed (the texture has more detail; rotation should feel calmer). Texture loads from a local `public/textures/earth.jpg` for offline reliability — we control the asset.

### 3.2 Earth-as-search

Three input modes wired to the same `selectedPoint` state:
- **Typed search** — input pinned over the globe (top-left of the hero), autocomplete from the existing `cities` list (extend to ~30 cities for variety). Selecting a result flies the globe to that point.
- **Click any city dot** — existing behavior, now triggers selection (not just info).
- **Drop a pin** — click anywhere on land, the globe drops a pin at that lat/lng. Land detection is approximate (we accept any click that hits the globe).

Once a point is selected, the headline collapses and a search panel slides in.

### 3.3 Coverage radius

The selected point gets a coverage circle rendered on the globe via `react-globe.gl` rings (or polygons computed in JS — see Data flow below).

Two interactions, both wired to the same `radiusMi` state:
- **Slider** — discrete steps: 50 / 100 / 250 / 500 mi. Lives in the search panel next to the selection.
- **Drag the circle edge** — pointer-down on the circle stroke, drag to resize, pointer-up to commit. Snaps to the nearest 25 mi.

Both update the visualized circle and the visible hotel list. Geodesic math via Haversine — radius in miles maps correctly across latitudes.

### 3.4 Filters drawer

Triggered automatically once a coverage area is set, OR explicitly via a *Filter* button on `/tonight`. Slides in from the right.

Filters:
- **Dates** — check-in + check-out (day picker, default to tonight + 1 night)
- **Stars** — pills: 3+ / 4+ / 5
- **Price range** — dual-thumb slider, $40–$500
- **Neighborhood** — chips (per-city; appears only when a city is selected)
- **Amenities** — checkboxes: pool, breakfast, late check-in, pet-friendly, parking, gym
- **Free cancellation** — toggle

Live result count in the drawer header: *"47 hotels match"*. Updates on every change.

Empty state: *"No hotels match. Widen the radius or relax the filters."*

### 3.5 Comparison drawer

A small tray at the bottom of the results list shows pinned hotels (max 3). Each hotel card has a pin icon — click to add/remove.

Clicking *Compare* slides a comparison drawer in from the right showing the pinned hotels side-by-side: price, stars, distance from selected point, agents bidding, amenities matrix, recent win-rate for each. *Deploy on this one* button per column (deploys agent for that specific hotel).

### 3.6 Live activity feed

Floating panel bottom-right, collapsed by default to a small *• 3 wins/min* pill. Click to expand a 5-card list of recent wins: *Maya · Owl · London Marriott · -54%* with a relative time stamp.

Each new win pulses the globe at its lat/lng — a coral ring expanding then fading. Pulses fire whether the panel is collapsed or expanded.

Data: simulated. A `useActivityStream` hook emits a new win every 4–9 seconds drawn from the cities data. PM-view annotation calls out that this is V1 simulation; V2 wires WebSocket to the matching engine.

## 4. Considered details

- **Curated hotel data** — ~20 hotels in `src/lib/hotels.js`, each with: id, name, city, lat, lng, stars, neighborhood, price, rackRate, amenities[], freeCancel, agentsBidding, distanceFromSelectedPoint (computed).
- **Haversine** — pure function in `src/lib/geo.js`, also used for filtering hotels by coverage radius.
- **Globe interactivity** — autorotate pauses while the user is interacting (mousedown / touchstart) and resumes after 4 seconds of idle.
- **Loading state** — Earth texture pre-warmed via `<link rel="preload">` in `index.html`. The lazy-globe fallback heartbeat stays for the 100–600ms before the texture lands.
- **Mobile fallback** — globe at <640px width hides the autorotate, drops dot density, and uses a single-touch tap-to-select interaction. Filter drawer becomes full-screen sheet.
- **Reduced motion** — pulses still appear but without the scaling animation; coverage circle drag is keyboard-accessible (focus the slider).
- **Empty / error states** — *"No hotels in this area match"* with a *Widen radius* button; *"Search didn't match a city — try a country?"* helper for typed search.
- **PM-view annotations** for every new surface (search input, coverage radius, filters drawer, comparison, activity feed, hotel data origin). Each chip uses Why / Tracking / Tradeoff / V2.

## 5. Visible PM tradeoffs (called out in PM view)

- Globe texture is local (offline-reliable). V2 ships dynamic terrain from a CDN.
- Typed search is a local cities list. V2 wires Mapbox Places.
- Hotel inventory is a curated 20-hotel set. V2 backs into a real supply API.
- Activity feed is simulated. V2 streams from the matching engine over WebSocket.

## 6. Information architecture changes

- `/` — Home now has a search bar + selectable globe. After a selection, a search panel slides up from below the headline.
- `/search` *(new)* — results list view. URL carries `?lat=&lng=&radius=&...` so a search is shareable.
- Comparison opens as a drawer over `/search` — no new route.
- Filters drawer opens over `/search` and `/tonight`.

## 7. Out of scope (explicitly cut)

- Multi-agent deploy
- Personal stats badge
- Smart suggestions as UI cards (repurposed as PM-view annotations)
- Saved searches as a return-visit feature
- Map ↔ Globe toggle
- Trip-planning wizard

## 8. Success criteria

A boss who walks the demo cold can:
1. Search a city by typing or clicking the globe.
2. Adjust coverage radius and watch the result count change live.
3. Pin 2 hotels to compare them.
4. Notice the live activity feed pulsing on the globe without anyone pointing it out.
5. Toggle PM view and read concrete reasoning behind each new surface.

## 9. Risks

- **Globe perf** — texture + ~30 dots + coverage circle + activity pulses all running at once is heavy. Mitigation: dot density caps, pulses use cheap CSS-on-canvas, autorotate disabled during interaction, lazy-load the globe module (already in place).
- **Drag-on-globe interaction** — dragging the coverage circle's edge directly on a 3D sphere is finicky. Mitigation: the slider is the canonical input; drag is enhancement. If drag is unreliable, slider still works.
- **Information density on Home** — globe + headline + search bar + activity feed pill could clutter. Mitigation: progressive disclosure — search bar visible by default, panels open on selection, activity feed defaults collapsed.

## 10. Build order (informs the plan)

1. Foundation: hotel data, geo helpers, activity stream hook
2. Real Earth texture + globe interactivity changes
3. Search input (typed + autocomplete)
4. Selection + coverage circle on globe
5. Coverage radius (slider + drag-edge)
6. /search route + results list
7. Filters drawer
8. Comparison drawer
9. Live activity feed + globe pulses
10. PM-view annotations
11. Polish: mobile, empty/loading states, accessibility
