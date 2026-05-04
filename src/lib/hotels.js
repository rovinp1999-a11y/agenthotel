/**
 * Curated hotel inventory for the demo. ~20 hotels across the major cities.
 * Each hotel: { id, name, city, lat, lng, stars, neighborhood, price,
 *               rackRate, amenities[], freeCancel, agentsBidding }
 *
 * `lat`/`lng` are the hotel's actual coordinates so the coverage-radius
 * filter on /search works.
 *
 * `price` is the typical winning auction price; `rackRate` is the official
 * published rate. `agentsBidding` is the current bid pressure (used in
 * Tonight cards and comparison view).
 */
export const HOTELS = [
  { id: 'aria',      name: 'Aria Resort & Casino',  city: 'Las Vegas', lat: 36.107, lng: -115.176, stars: 5, neighborhood: 'Strip',         price: 142, rackRate: 289, amenities: ['pool','breakfast','late-checkin','gym','parking'], freeCancel: true,  agentsBidding: 8  },
  { id: 'venetian',  name: 'The Venetian',          city: 'Las Vegas', lat: 36.121, lng: -115.169, stars: 5, neighborhood: 'Center Strip',  price: 189, rackRate: 399, amenities: ['pool','breakfast','gym','parking'],                freeCancel: true,  agentsBidding: 14 },
  { id: 'mgm',       name: 'MGM Grand',             city: 'Las Vegas', lat: 36.103, lng: -115.169, stars: 4, neighborhood: 'South Strip',   price: 105, rackRate: 219, amenities: ['pool','gym','parking','pet-friendly'],              freeCancel: false, agentsBidding: 6  },
  { id: 'wynn',      name: 'Wynn Las Vegas',        city: 'Las Vegas', lat: 36.128, lng: -115.166, stars: 5, neighborhood: 'North Strip',   price: 168, rackRate: 349, amenities: ['pool','breakfast','gym','parking','late-checkin'], freeCancel: true,  agentsBidding: 4  },
  { id: 'linq',      name: 'LINQ Hotel',            city: 'Las Vegas', lat: 36.118, lng: -115.171, stars: 3, neighborhood: 'Center Strip',  price: 68,  rackRate: 149, amenities: ['pool','parking'],                                   freeCancel: true,  agentsBidding: 3  },
  { id: 'nomad-lv',  name: 'NoMad Las Vegas',       city: 'Las Vegas', lat: 36.110, lng: -115.174, stars: 5, neighborhood: 'Park MGM',      price: 125, rackRate: 259, amenities: ['breakfast','gym','late-checkin'],                  freeCancel: true,  agentsBidding: 7  },

  { id: 'standard',  name: 'The Standard',          city: 'New York',  lat: 40.741, lng: -74.008,  stars: 4, neighborhood: 'Meatpacking',  price: 119, rackRate: 259, amenities: ['breakfast','gym','late-checkin'],                  freeCancel: true,  agentsBidding: 11 },
  { id: 'soho',      name: 'Boutique Soho',         city: 'New York',  lat: 40.724, lng: -74.001,  stars: 4, neighborhood: 'SoHo',         price: 89,  rackRate: 199, amenities: ['breakfast','gym'],                                  freeCancel: false, agentsBidding: 5  },
  { id: 'plaza',     name: 'The Plaza',             city: 'New York',  lat: 40.764, lng: -73.974,  stars: 5, neighborhood: 'Midtown',      price: 245, rackRate: 525, amenities: ['breakfast','gym','parking','late-checkin','pet-friendly'], freeCancel: true, agentsBidding: 9 },
  { id: 'pod-times', name: 'Pod Times Square',      city: 'New York',  lat: 40.760, lng: -73.989,  stars: 3, neighborhood: 'Times Square', price: 79,  rackRate: 169, amenities: ['gym'],                                              freeCancel: false, agentsBidding: 4  },

  { id: 'ace',       name: 'Ace Hotel',             city: 'London',    lat: 51.523, lng: -0.078,   stars: 4, neighborhood: 'Shoreditch',   price: 98,  rackRate: 219, amenities: ['breakfast','gym','pet-friendly'],                  freeCancel: true,  agentsBidding: 5  },
  { id: 'savoy',     name: 'The Savoy',             city: 'London',    lat: 51.510, lng: -0.121,   stars: 5, neighborhood: 'Strand',       price: 215, rackRate: 459, amenities: ['breakfast','pool','gym','late-checkin'],          freeCancel: true,  agentsBidding: 7  },
  { id: 'shoreditch',name: 'The Hoxton',            city: 'London',    lat: 51.524, lng: -0.080,   stars: 4, neighborhood: 'Shoreditch',   price: 112, rackRate: 245, amenities: ['breakfast','gym'],                                 freeCancel: true,  agentsBidding: 6  },

  { id: 'park-paris',name: 'Park Hyatt Paris',      city: 'Paris',     lat: 48.870, lng: 2.330,    stars: 5, neighborhood: 'Vendôme',      price: 215, rackRate: 489, amenities: ['breakfast','pool','gym','late-checkin'],          freeCancel: true,  agentsBidding: 8  },
  { id: 'le-marais', name: 'Le Marais Boutique',    city: 'Paris',     lat: 48.857, lng: 2.359,    stars: 4, neighborhood: 'Le Marais',    price: 125, rackRate: 269, amenities: ['breakfast','pet-friendly'],                       freeCancel: true,  agentsBidding: 3  },

  { id: 'park-tokyo',name: 'Park Hyatt Tokyo',      city: 'Tokyo',     lat: 35.685, lng: 139.691,  stars: 5, neighborhood: 'Shinjuku',     price: 245, rackRate: 519, amenities: ['breakfast','pool','gym','late-checkin','parking'],freeCancel: true,  agentsBidding: 12 },
  { id: 'hotel-okura',name:'Hotel Okura Tokyo',     city: 'Tokyo',     lat: 35.668, lng: 139.745,  stars: 5, neighborhood: 'Toranomon',    price: 198, rackRate: 419, amenities: ['breakfast','gym','parking'],                      freeCancel: true,  agentsBidding: 6  },

  { id: 'burj',      name: 'Burj Al Arab',          city: 'Dubai',     lat: 25.141, lng: 55.185,   stars: 5, neighborhood: 'Jumeirah',     price: 489, rackRate: 1199,amenities: ['pool','breakfast','gym','parking','late-checkin'], freeCancel: true, agentsBidding: 14 },
  { id: 'rove',      name: 'Rove Downtown',         city: 'Dubai',     lat: 25.197, lng: 55.275,   stars: 3, neighborhood: 'Downtown',     price: 79,  rackRate: 159, amenities: ['pool','gym','pet-friendly'],                       freeCancel: true,  agentsBidding: 4  },

  { id: 'fasano',    name: 'Hotel Fasano',          city: 'Sydney',    lat: -33.875,lng: 151.213,  stars: 5, neighborhood: 'CBD',          price: 198, rackRate: 419, amenities: ['breakfast','pool','gym','late-checkin'],          freeCancel: true,  agentsBidding: 5  },

  { id: 'ace-bcn',   name: 'Ace Barcelona',         city: 'Barcelona', lat: 41.385, lng: 2.173,    stars: 4, neighborhood: 'El Born',      price: 105, rackRate: 229, amenities: ['breakfast','gym'],                                 freeCancel: false, agentsBidding: 4  },
]

export const ALL_AMENITIES = [
  { id: 'pool',         label: 'Pool' },
  { id: 'breakfast',    label: 'Breakfast' },
  { id: 'late-checkin', label: 'Late check-in' },
  { id: 'pet-friendly', label: 'Pet-friendly' },
  { id: 'parking',      label: 'Parking' },
  { id: 'gym',          label: 'Gym' },
]

export const STAR_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5'  },
]

export function getHotel(id) {
  return HOTELS.find(h => h.id === id) || null
}

/**
 * Apply filters and return the matching hotels.
 *
 * filters: {
 *   center?: { lat, lng } | null,
 *   radiusMi?: number,                 // ignored when center is null
 *   stars?: number,                    // 0 = any, 3/4/5 = "3+/4+/5"
 *   minPrice?: number, maxPrice?: number,
 *   neighborhoods?: string[] | null,   // null = any
 *   amenities?: string[],              // hotel must include all of these
 *   freeCancelOnly?: boolean,
 * }
 *
 * Pure — also exported for tests.
 */
export function filterHotels(hotels, filters, distanceFn) {
  return hotels.filter(h => {
    if (filters.center && filters.radiusMi != null) {
      const d = distanceFn({ lat: h.lat, lng: h.lng }, filters.center)
      if (d > filters.radiusMi) return false
    }
    if (filters.stars && filters.stars > 0 && h.stars < filters.stars) return false
    if (filters.minPrice != null && h.price < filters.minPrice) return false
    if (filters.maxPrice != null && h.price > filters.maxPrice) return false
    if (filters.neighborhoods && filters.neighborhoods.length && !filters.neighborhoods.includes(h.neighborhood)) return false
    if (filters.amenities && filters.amenities.length) {
      for (const a of filters.amenities) {
        if (!h.amenities.includes(a)) return false
      }
    }
    if (filters.freeCancelOnly && !h.freeCancel) return false
    return true
  })
}
