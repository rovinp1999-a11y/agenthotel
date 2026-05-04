import { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import StoryActs from './StoryActs'
import SocialProof from './SocialProof'
import SearchBar from './SearchBar'
import RadiusSelector from './RadiusSelector'
import ActivityFeed from './ActivityFeed'
import { cities } from './globeData'
import { milesToGlobeDegrees } from '../../lib/geo'
import { useActivityStream } from '../../lib/activityStream'
import { emitTourSignal } from '../../lib/tour'

const GlobeView = lazy(() => import('./GlobeView'))

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-[var(--accent)] heartbeat" />
    </div>
  )
}

export default function Home() {
  const [agents, setAgents] = useState(1247)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [radiusMi, setRadiusMi] = useState(100)
  const coverageDeg = selectedPoint ? milesToGlobeDegrees(radiusMi) : 0
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // If the URL says ?selected=<cityKey>, set that city as the selection.
  // Used by the tour to demo the search-from-globe interaction.
  useEffect(() => {
    const sel = searchParams.get('selected')
    if (!sel) return
    const SEL_MAP = {
      lasvegas: { lat: 36.17, lng: -115.14, name: 'Las Vegas' },
      newyork:  { lat: 40.71, lng: -74.01, name: 'New York' },
      london:   { lat: 51.51, lng: -0.13,  name: 'London' },
    }
    const target = SEL_MAP[sel]
    if (target) {
      setSelectedPoint(target)
      emitTourSignal('tour:selected')
      // Strip the param so subsequent navigation doesn't re-trigger.
      const sp = new URLSearchParams(searchParams)
      sp.delete('selected')
      setSearchParams(sp, { replace: true })
    }
  }, [searchParams])

  useEffect(() => {
    const i = setInterval(() => setAgents(p => p + Math.floor(Math.random() * 3) - 1), 4000)
    return () => clearInterval(i)
  }, [])

  const { wins, pulse, winsPerMin } = useActivityStream({ maxRecent: 5 })

  function handleSelect(city) {
    setSelectedPoint({ lat: city.lat, lng: city.lng, name: city.name })
    emitTourSignal('tour:selected')
  }

  function searchHere() {
    if (!selectedPoint) return
    emitTourSignal('tour:find-hotels-clicked')
    const params = new URLSearchParams({
      lat: String(selectedPoint.lat.toFixed(4)),
      lng: String(selectedPoint.lng.toFixed(4)),
      name: selectedPoint.name || '',
      radius: String(radiusMi),
    })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[560px]">
        <div className="absolute inset-0">
          <Suspense fallback={<GlobeFallback />}>
            <GlobeView
              selectedPoint={selectedPoint}
              coverageDeg={coverageDeg}
              onCityClick={handleSelect}
              onRadiusChange={setRadiusMi}
              pulse={pulse}
            />
          </Suspense>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />

        {/* Search — top-left */}
        <div className="absolute top-6 left-6 right-6 md:right-auto md:left-12 z-10 md:w-auto space-y-2">
          <SearchBar cities={cities} onSelect={handleSelect} selectedName={selectedPoint?.name} />
          {selectedPoint && (
            <div className="flex">
              <RadiusSelector value={radiusMi} onChange={setRadiusMi} />
            </div>
          )}
        </div>

        {/* Hero copy + CTA — bottom-left */}
        <div className="absolute bottom-12 left-6 md:left-12 z-10 max-w-[640px]">
          <p className="text-[var(--text-3)] text-[12px] mb-3 font-mono">
            {agents.toLocaleString()} agents bidding right now · 34% avg savings · 47 markets
          </p>
          <div className={`transition-opacity duration-300 ${selectedPoint ? 'opacity-50' : 'opacity-100'}`}>
            <h1 className="serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[var(--text)]">
              AI agents that fight hotels for your bedtime.
            </h1>
            <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-[42ch]">
              Set a cap. Pick a personality. Your agent does the rest — including the awkward part.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 items-center">
            {selectedPoint ? (
              <button
                data-tour="find-hotels"
                onClick={searchHere}
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                Find hotels near {selectedPoint.name || 'this point'} →
              </button>
            ) : (
              <Link
                to="/deploy"
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
              >
                Deploy your first agent →
              </Link>
            )}
            {selectedPoint && (
              <button
                onClick={() => { setSelectedPoint(null); setRadiusMi(100) }}
                className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer"
              >
                Clear selection
              </button>
            )}
          </div>

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

      <ActivityFeed wins={wins} winsPerMin={winsPerMin} />
    </div>
  )
}
