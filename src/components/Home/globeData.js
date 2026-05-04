// Major cities with hotel activity
export const cities = [
  { name: 'Las Vegas', lat: 36.17, lng: -115.14, agents: 47, savings: 38, rooms: 234 },
  { name: 'New York', lat: 40.71, lng: -74.01, agents: 82, savings: 32, rooms: 412 },
  { name: 'Miami', lat: 25.76, lng: -80.19, agents: 35, savings: 41, rooms: 178 },
  { name: 'London', lat: 51.51, lng: -0.13, agents: 64, savings: 29, rooms: 356 },
  { name: 'Paris', lat: 48.86, lng: 2.35, agents: 51, savings: 35, rooms: 289 },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, agents: 73, savings: 27, rooms: 445 },
  { name: 'Dubai', lat: 25.20, lng: 55.27, agents: 42, savings: 44, rooms: 198 },
  { name: 'Barcelona', lat: 41.39, lng: 2.17, agents: 29, savings: 37, rooms: 156 },
  { name: 'Singapore', lat: 1.35, lng: 103.82, agents: 38, savings: 31, rooms: 201 },
  { name: 'Sydney', lat: -33.87, lng: 151.21, agents: 26, savings: 33, rooms: 142 },
  { name: 'Los Angeles', lat: 34.05, lng: -118.24, agents: 55, savings: 30, rooms: 287 },
  { name: 'Bangkok', lat: 13.76, lng: 100.50, agents: 31, savings: 48, rooms: 165 },
  { name: 'Rome', lat: 41.90, lng: 12.50, agents: 24, savings: 36, rooms: 134 },
  { name: 'San Francisco', lat: 37.77, lng: -122.42, agents: 44, savings: 28, rooms: 198 },
  { name: 'Amsterdam', lat: 52.37, lng: 4.90, agents: 33, savings: 34, rooms: 167 },
  { name: 'Cancun', lat: 21.16, lng: -86.85, agents: 22, savings: 45, rooms: 112 },
  { name: 'Bali', lat: -8.34, lng: 115.09, agents: 19, savings: 42, rooms: 89 },
  { name: 'Istanbul', lat: 41.01, lng: 28.98, agents: 27, savings: 39, rooms: 145 },
  { name: 'Berlin',       lat: 52.52, lng: 13.40,  agents: 31, savings: 33, rooms: 178 },
  { name: 'Prague',       lat: 50.07, lng: 14.43,  agents: 22, savings: 41, rooms: 134 },
  { name: 'Lisbon',       lat: 38.72, lng: -9.14,  agents: 26, savings: 38, rooms: 142 },
  { name: 'Mexico City',  lat: 19.43, lng: -99.13, agents: 35, savings: 44, rooms: 198 },
  { name: 'Cape Town',    lat: -33.92,lng: 18.42,  agents: 20, savings: 47, rooms: 105 },
  { name: 'Mumbai',       lat: 19.08, lng: 72.88,  agents: 41, savings: 36, rooms: 234 },
  { name: 'Seoul',        lat: 37.57, lng: 126.98, agents: 48, savings: 28, rooms: 267 },
  { name: 'Hong Kong',    lat: 22.32, lng: 114.17, agents: 53, savings: 26, rooms: 312 },
  { name: 'Buenos Aires', lat: -34.61,lng: -58.38, agents: 24, savings: 39, rooms: 145 },
  { name: 'Reykjavik',    lat: 64.13, lng: -21.94, agents: 12, savings: 49, rooms: 67  },
  { name: 'Marrakech',    lat: 31.63, lng: -7.99,  agents: 17, savings: 46, rooms: 89  },
  { name: 'Vancouver',    lat: 49.28, lng: -123.12,agents: 32, savings: 31, rooms: 167 },
]

// Generate random arcs (deal connections)
export function generateArcs(count = 10) {
  const arcs = []
  for (let i = 0; i < count; i++) {
    const from = cities[Math.floor(Math.random() * cities.length)]
    const to = cities[Math.floor(Math.random() * cities.length)]
    if (from !== to) {
      arcs.push({
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: Math.random() > 0.3 ? '#F97066' : '#FBBF24',
      })
    }
  }
  return arcs
}
