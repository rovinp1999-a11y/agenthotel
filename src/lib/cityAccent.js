export const CITY_ACCENT = {
  'Las Vegas': { bar: '#F97066', tag: 'rgba(249,112,102,0.15)' },
  'New York':  { bar: '#FBBF24', tag: 'rgba(251,191,36,0.15)' },
  'London':    { bar: '#34D399', tag: 'rgba(52,211,153,0.15)' },
  'Paris':     { bar: '#A78BFA', tag: 'rgba(167,139,250,0.15)' },
  'Tokyo':     { bar: '#F472B6', tag: 'rgba(244,114,182,0.15)' },
  'Dubai':     { bar: '#FACC15', tag: 'rgba(250,204,21,0.15)' },
  'Sydney':    { bar: '#22D3EE', tag: 'rgba(34,211,238,0.15)' },
  'Barcelona': { bar: '#FB923C', tag: 'rgba(251,146,60,0.15)' },
  'Miami':     { bar: '#22D3EE', tag: 'rgba(34,211,238,0.15)' },
}

export function cityAccent(city) {
  return CITY_ACCENT[city] || { bar: '#A8A29E', tag: 'rgba(168,162,158,0.15)' }
}
