export const TONIGHT_DEALS = [
  { id: 'aria',     hotel: 'Aria Resort & Casino', city: 'Las Vegas', original: 289, price: 142, savings: 51, left: 3, agentsBidding: 8 },
  { id: 'venetian', hotel: 'The Venetian',         city: 'Las Vegas', original: 399, price: 189, savings: 53, left: 1, agentsBidding: 14 },
  { id: 'mgm',      hotel: 'MGM Grand',            city: 'Las Vegas', original: 219, price: 105, savings: 52, left: 5, agentsBidding: 6 },
  { id: 'wynn',     hotel: 'Wynn Las Vegas',       city: 'Las Vegas', original: 349, price: 168, savings: 52, left: 7, agentsBidding: 4 },
  { id: 'linq',     hotel: 'LINQ Hotel',           city: 'Las Vegas', original: 149, price: 68,  savings: 54, left: 9, agentsBidding: 3 },
  { id: 'soho',     hotel: 'The Standard',         city: 'New York',  original: 259, price: 119, savings: 54, left: 4, agentsBidding: 11 },
  { id: 'ace',      hotel: 'Ace Hotel',            city: 'London',    original: 219, price: 98,  savings: 55, left: 6, agentsBidding: 5 },
]

export function getDeal(id) {
  return TONIGHT_DEALS.find(d => d.id === id) || null
}

// Convert a Tonight deal into the hotel shape Live's auction expects
export function dealToHotel(deal) {
  return {
    name: deal.hotel,
    location: deal.city,
    rackRate: deal.original,
    startPrice: Math.max(60, Math.round(deal.price * 0.6)),
    left: deal.left,
  }
}
