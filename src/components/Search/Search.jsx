import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Filter } from 'lucide-react'
import { HOTELS, filterHotels } from '../../lib/hotels'
import { distanceMi } from '../../lib/geo'
import { writeJSON, KEYS } from '../../lib/storage'
import HotelCard from './HotelCard'
import FiltersDrawer from './FiltersDrawer'
import ActiveFiltersBar from './ActiveFiltersBar'
import ComparisonTray from './ComparisonTray'
import ComparisonDrawer from './ComparisonDrawer'
import { emitTourSignal } from '../../lib/tour'

export default function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const lat       = parseFloat(searchParams.get('lat') || '0')
  const lng       = parseFloat(searchParams.get('lng') || '0')
  const name      = searchParams.get('name') || 'this area'
  const radiusMi  = parseInt(searchParams.get('radius') || '100', 10)

  const center = (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0))
    ? { lat, lng }
    : null

  // Filters drawer state lives here so HotelCard count + filter UI agree.
  const [filters, setFilters] = useState({
    stars: 0,
    minPrice: 40,
    maxPrice: 500,
    amenities: [],
    neighborhoods: null,
    freeCancelOnly: false,
    checkIn: '',
    checkOut: '',
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pinnedIds, setPinnedIds] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [sortBy, setSortBy] = useState('distance') // distance | price | savings | stars
  const [density, setDensity] = useState('comfortable') // comfortable | compact

  function togglePin(id) {
    let willPin = false
    setPinnedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      willPin = true
      return [...prev, id]
    })
    if (willPin) emitTourSignal('tour:pinned')
  }

  const decorated = useMemo(() => {
    if (!center) return []
    return HOTELS.map(h => ({
      ...h,
      distance: distanceMi({ lat: h.lat, lng: h.lng }, center),
    }))
  }, [center?.lat, center?.lng])

  // Hotels in radius (regardless of other filters) — used to derive the
  // neighborhood pill list and to keep the filter drawer's universe stable.
  const inRadius = useMemo(() => {
    if (!center) return []
    return decorated.filter(h => h.distance <= radiusMi)
  }, [decorated, radiusMi, center?.lat, center?.lng])

  const neighborhoods = useMemo(() => {
    return Array.from(new Set(inRadius.map(h => h.neighborhood))).sort()
  }, [inRadius])

  const visible = useMemo(() => {
    const list = filterHotels(decorated, { center, radiusMi, ...filters }, distanceMi)
    const cmp = {
      distance: (a, b) => a.distance - b.distance,
      price:    (a, b) => a.price - b.price,
      savings:  (a, b) => (b.rackRate - b.price) / b.rackRate - (a.rackRate - a.price) / a.rackRate,
      stars:    (a, b) => b.stars - a.stars || a.distance - b.distance,
    }[sortBy] || ((a, b) => a.distance - b.distance)
    return [...list].sort(cmp)
  }, [decorated, center?.lat, center?.lng, radiusMi, filters, sortBy])

  // Resolve pinned hotel objects (with distance) — order = pin order.
  const pinnedHotels = pinnedIds
    .map(id => decorated.find(h => h.id === id))
    .filter(Boolean)

  function deploy(hotel) {
    writeJSON(KEYS.selectedHotel, {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      lat: hotel.lat,
      lng: hotel.lng,
      rackRate: hotel.rackRate,
      price: hotel.price,
      left: 3,
    })
    navigate('/deploy')
  }

  if (!center) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] mb-2">
            <ArrowLeft size={12} /> Back to map
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Hotels near {name}</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            <span className="font-mono">{visible.length}</span> of <span className="font-mono">{inRadius.length}</span> hotels within <span className="font-mono">{radiusMi} mi</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort by"
            className="text-[12px] font-mono px-2.5 py-2 rounded-md border border-[var(--border-2)] bg-[var(--bg-2)] text-[var(--text-2)] cursor-pointer hover:text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="distance">Sort: distance</option>
            <option value="price">Sort: price (low→high)</option>
            <option value="savings">Sort: best savings</option>
            <option value="stars">Sort: stars</option>
          </select>
          <div className="inline-flex items-center rounded-md border border-[var(--border-2)] overflow-hidden">
            <button
              onClick={() => setDensity('comfortable')}
              aria-pressed={density === 'comfortable'}
              className={`text-[11px] font-mono px-2 py-2 cursor-pointer ${density === 'comfortable' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
              title="Comfortable density"
            >
              ▣
            </button>
            <button
              onClick={() => setDensity('compact')}
              aria-pressed={density === 'compact'}
              className={`text-[11px] font-mono px-2 py-2 cursor-pointer border-l border-[var(--border-2)] ${density === 'compact' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]'}`}
              title="Compact density"
            >
              ☰
            </button>
          </div>
          <button
            data-tour="filters-button"
            onClick={() => { setDrawerOpen(true); emitTourSignal('tour:filters-opened') }}
            className="inline-flex items-center gap-1.5 text-[12px] font-mono px-3 py-2 rounded-md border border-[var(--border-2)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--text)] cursor-pointer transition-colors"
          >
            <Filter size={12} />
            Filters
          </button>
        </div>
      </div>

      <ActiveFiltersBar filters={filters} onChange={setFilters} />

      {/* Results */}
      {visible.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] p-10 text-center">
          <p className="text-sm text-[var(--text-2)] mb-4">No hotels in this area.</p>
          <p className="text-[12px] text-[var(--text-3)]">Widen the radius or try another city.</p>
          <Link to="/" className="inline-flex items-center mt-6 px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">
            Back to map
          </Link>
        </div>
      ) : (
        <div className={`grid gap-px bg-[var(--border)] rounded-lg overflow-hidden ${
          density === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {visible.map((h, i) => (
            <HotelCard
              key={h.id}
              hotel={h}
              distanceMi={h.distance}
              onDeploy={() => deploy(h)}
              pinned={pinnedIds.includes(h.id)}
              onTogglePin={() => togglePin(h.id)}
              pinDisabled={pinnedIds.length >= 3}
              density={density}
              dataTour={i === 0 ? 'hotel-card' : undefined}
            />
          ))}
        </div>
      )}

      <ComparisonTray
        pinnedHotels={pinnedHotels}
        onUnpin={togglePin}
        onClear={() => setPinnedIds([])}
        onCompare={() => setCompareOpen(true)}
      />
      <ComparisonDrawer
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        pinnedHotels={pinnedHotels}
        onDeploy={(h) => { setCompareOpen(false); deploy(h) }}
      />
      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        neighborhoods={neighborhoods}
        matchCount={visible.length}
      />
    </div>
  )
}
