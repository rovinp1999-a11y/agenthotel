export function readBool(key, fallback = false) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key)
    if (v === null) return fallback
    return v === 'true'
  } catch { return fallback }
}

export function writeBool(key, value) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, String(value)) } catch {}
}

export function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key)
    if (v === null) return fallback
    return JSON.parse(v)
  } catch { return fallback }
}

export function writeJSON(key, value) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const KEYS = {
  pmView: 'ax.pmView',
  yourAgent: 'ax.yourAgent',
  wakeMe: 'ax.wakeMe',
  audioOn: 'ax.audioOn',
  demoSeen: 'ax.demoSeen',
  selectedHotel: 'ax.selectedHotel',
  tourSeen: 'ax.tourSeen',
}
