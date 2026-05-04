import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Globe from 'react-globe.gl'
import { cities } from './globeData'
import { distanceMi } from '../../lib/geo'

const EARTH_TEXTURE = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const BUMP_TEXTURE  = '//unpkg.com/three-globe/example/img/earth-topology.png'

const IDLE_RESUME_MS = 4000

function geodesicCirclePolygon(centerLat, centerLng, radiusDeg, segments = 96) {
  const lat0 = (centerLat * Math.PI) / 180
  const lng0 = (centerLng * Math.PI) / 180
  const radR = (radiusDeg * Math.PI) / 180
  const coords = []
  for (let i = 0; i <= segments; i++) {
    const bearing = (i / segments) * 2 * Math.PI
    const lat = Math.asin(
      Math.sin(lat0) * Math.cos(radR) +
      Math.cos(lat0) * Math.sin(radR) * Math.cos(bearing)
    )
    const lng = lng0 + Math.atan2(
      Math.sin(bearing) * Math.sin(radR) * Math.cos(lat0),
      Math.cos(radR) - Math.sin(lat0) * Math.sin(lat)
    )
    coords.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI])
  }
  return coords
}

export default function GlobeView({ onCityClick, selectedPoint = null, coverageDeg = 0, pulse = null, onRadiusChange = null }) {
  const globeRef = useRef()
  const containerRef = useRef()
  const idleTimerRef = useRef(null)

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Resize observer
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Initial camera + autorotate
  useEffect(() => {
    if (!globeRef.current) return
    const c = globeRef.current.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.18
    c.enableZoom = true
    c.minDistance = 150
    c.maxDistance = 380
    globeRef.current.pointOfView({ lat: 25, lng: -30, altitude: 2.1 }, 1000)
  }, [])

  // Pause autorotate while user is interacting; resume after IDLE_RESUME_MS of idle
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const pause = () => {
      if (!globeRef.current) return
      const c = globeRef.current.controls()
      c.autoRotate = false
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (globeRef.current) globeRef.current.controls().autoRotate = true
      }, IDLE_RESUME_MS)
    }

    node.addEventListener('pointerdown', pause)
    node.addEventListener('wheel', pause, { passive: true })
    node.addEventListener('touchstart', pause, { passive: true })
    return () => {
      node.removeEventListener('pointerdown', pause)
      node.removeEventListener('wheel', pause)
      node.removeEventListener('touchstart', pause)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Shift-drag on the globe to resize coverage radius. Active only when a
  // selection exists AND the consumer wired onRadiusChange.
  useEffect(() => {
    if (!selectedPoint || !onRadiusChange) return
    const node = containerRef.current
    if (!node) return

    let dragging = false

    function geoFromEvent(e) {
      if (!globeRef.current || typeof globeRef.current.toGeoCoords !== 'function') return null
      const rect = node.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      try {
        return globeRef.current.toGeoCoords({ x, y })
      } catch {
        return null
      }
    }

    function commitFromEvent(e) {
      const geo = geoFromEvent(e)
      if (!geo) return
      const distRaw = distanceMi(selectedPoint, { lat: geo.lat, lng: geo.lng })
      const clamped = Math.max(25, Math.min(1000, distRaw))
      const snapped = Math.round(clamped / 25) * 25
      onRadiusChange(snapped)
    }

    function onDown(e) {
      if (!e.shiftKey) return
      e.preventDefault()
      dragging = true
      const c = globeRef.current && globeRef.current.controls()
      if (c) c.enabled = false
      commitFromEvent(e)
    }
    function onMove(e) {
      if (!dragging) return
      commitFromEvent(e)
    }
    function onUp() {
      if (!dragging) return
      dragging = false
      const c = globeRef.current && globeRef.current.controls()
      if (c) c.enabled = true
    }

    node.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointerleave', onUp)

    return () => {
      node.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointerleave', onUp)
      // Make sure controls aren't left disabled if effect tears down mid-drag
      const c = globeRef.current && globeRef.current.controls()
      if (c) c.enabled = true
    }
  }, [selectedPoint?.lat, selectedPoint?.lng, onRadiusChange])

  // Fly to selectedPoint when it changes
  useEffect(() => {
    if (!selectedPoint || !globeRef.current) return
    globeRef.current.pointOfView({ lat: selectedPoint.lat, lng: selectedPoint.lng, altitude: 1.6 }, 800)
  }, [selectedPoint?.lat, selectedPoint?.lng])

  const handleClick = useCallback((point) => {
    if (onCityClick) onCityClick(point)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 800)
    }
  }, [onCityClick])

  const points = useMemo(() => cities.map(c => ({
    lat: c.lat, lng: c.lng,
    size: Math.max(0.4, c.agents / 50),
    color: c.agents > 40 ? '#F97066' : '#FFFFFF',
    name: c.name, agents: c.agents, savings: c.savings, rooms: c.rooms,
  })), [])

  const ringsData = useMemo(() => {
    const base = cities.filter(c => c.agents > 40).map(c => ({
      lat: c.lat, lng: c.lng, maxR: 3, propagationSpeed: 2, repeatPeriod: 1400,
      color: 'rgba(249, 112, 102, 0.4)',
    }))

    if (pulse) {
      base.push({
        lat: pulse.lat,
        lng: pulse.lng,
        maxR: 2.5,
        propagationSpeed: 4,
        repeatPeriod: 0,
        color: 'rgba(249, 112, 102, 0.65)',
      })
    }

    return base
  }, [pulse?.id])

  // Coverage circle as a geodesic polygon — accurate at all latitudes,
  // always rendered at full radius (no propagationSpeed weirdness).
  const polygonsData = useMemo(() => {
    if (!selectedPoint || !coverageDeg || coverageDeg <= 0) return []
    const ring = geodesicCirclePolygon(selectedPoint.lat, selectedPoint.lng, coverageDeg)
    return [{
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    }]
  }, [selectedPoint?.lat, selectedPoint?.lng, coverageDeg])

  const labelData = useMemo(() => cities.filter(c => c.agents > 40), [])

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={true}
        showAtmosphere={true}
        atmosphereColor="#F97066"
        atmosphereAltitude={0.18}
        globeImageUrl={EARTH_TEXTURE}
        bumpImageUrl={BUMP_TEXTURE}
        pointsData={points}
        pointAltitude={0.012}
        pointRadius="size"
        pointColor="color"
        pointsMerge={false}
        onPointClick={handleClick}
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        polygonsData={polygonsData}
        polygonCapColor={() => 'rgba(249, 112, 102, 0.15)'}
        polygonSideColor={() => 'rgba(249, 112, 102, 0)'}
        polygonStrokeColor={() => 'rgba(249, 112, 102, 0.9)'}
        polygonAltitude={0.005}
        labelsData={labelData}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => d.name}
        labelSize={0.7}
        labelColor={() => 'rgba(255, 255, 255, 0.85)'}
        labelDotRadius={0.3}
        labelAltitude={0.02}
      />
    </div>
  )
}
