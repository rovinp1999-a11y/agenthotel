const EARTH_RADIUS_MI = 3958.7613

// Convert degrees to radians.
export function toRad(d) { return (d * Math.PI) / 180 }

/**
 * Great-circle distance in miles between two lat/lng points (Haversine).
 */
export function distanceMi(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Convert a radius in miles to degrees of arc on the globe.
 * react-globe.gl rings use degrees as `maxR`. 1 deg = 69.17 mi at the equator;
 * we use this as the canonical conversion (the visualization is approximate).
 */
export function milesToGlobeDegrees(mi) {
  return mi / 69.17
}

/**
 * Filter a list of points to only those within `radiusMi` of `center`.
 */
export function withinRadius(points, center, radiusMi) {
  return points.filter(p => distanceMi({ lat: p.lat, lng: p.lng }, center) <= radiusMi)
}
