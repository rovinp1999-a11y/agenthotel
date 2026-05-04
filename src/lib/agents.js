export const AGENTS = {
  hawk: {
    id: 'hawk',
    name: 'Hawk',
    tagline: 'Bids fast, wins more, pays slightly higher.',
    blurb: 'Aggressive. First to the table, last to leave.',
    winRate: 0.82,
    avgPremiumPct: 6,    // ~6% above the floor
    bidIntervalMs: 1200, // average ms between bids
    color: '#F97066',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    tagline: 'Optimizes price vs. speed.',
    blurb: 'Balanced. Reads the room, then strikes.',
    winRate: 0.71,
    avgPremiumPct: 2,
    bidIntervalMs: 2000,
    color: '#A8A29E',
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    tagline: 'Waits for the floor. Smaller win rate, deepest savings.',
    blurb: 'Patient. Will let three rooms go to take the fourth.',
    winRate: 0.54,
    avgPremiumPct: -1, // can land below floor on great nights
    bidIntervalMs: 3200,
    color: '#34D399',
  },
}

export const AGENT_LIST = [AGENTS.hawk, AGENTS.sage, AGENTS.owl]

export function getAgent(id) {
  return AGENTS[id] || AGENTS.sage
}

export const RIVAL_NAMES = ['7x3k', '4f8r', '9k2v', '1b6w', '3d5m', '8j2k', 'a2c4']

export function makeRival(i) {
  return {
    id: RIVAL_NAMES[i % RIVAL_NAMES.length],
    name: RIVAL_NAMES[i % RIVAL_NAMES.length],
    tagline: 'Anonymous rival agent',
    color: '#A8A29E',
    isRival: true,
  }
}
