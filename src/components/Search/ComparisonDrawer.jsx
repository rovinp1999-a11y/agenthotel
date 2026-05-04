import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Check } from 'lucide-react'
import { ALL_AMENITIES } from '../../lib/hotels'
import { CITY_ACCENT } from '../../lib/cityAccent'

export default function ComparisonDrawer({ open, onClose, pinnedHotels, onDeploy }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[820px] bg-[var(--bg)] border-l border-[var(--border)] flex flex-col"
            role="dialog"
            aria-label="Compare hotels"
          >
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Compare</h2>
                <p className="text-[12px] text-[var(--text-3)] mt-0.5 font-mono">
                  {pinnedHotels.length} hotels side by side
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <div className={`grid gap-4 grid-cols-1 ${pinnedHotels.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                {pinnedHotels.map(h => {
                  const savingsPct = Math.round(((h.rackRate - h.price) / h.rackRate) * 100)
                  const accent = CITY_ACCENT[h.city] || { bar: '#A8A29E', tag: 'rgba(168,162,158,0.15)' }
                  return (
                    <div key={h.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] flex flex-col overflow-hidden">
                      <div className="h-1 w-full" style={{ background: accent.bar }} />
                      <div className="px-4 py-4 border-b border-[var(--border)]">
                        <span
                          className="inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded mb-2"
                          style={{ background: accent.tag, color: accent.bar }}
                        >
                          {h.city}
                        </span>
                        <p className="text-sm font-medium text-[var(--text)]">{h.name}</p>
                        <p className="text-[11px] text-[var(--text-3)] mt-0.5">{h.neighborhood}</p>
                        <div className="flex items-center gap-0.5 mt-2 text-[var(--accent)]">
                          {Array.from({ length: h.stars }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" stroke="none" />
                          ))}
                          {Array.from({ length: 5 - h.stars }).map((_, i) => (
                            <Star key={`o${i}`} size={11} className="text-[var(--border-2)]" fill="currentColor" stroke="none" />
                          ))}
                        </div>
                      </div>
                      <Row label="Price">
                        <span className="font-mono text-base font-semibold">${h.price}</span>
                        <span className="font-mono text-[10px] text-[var(--text-3)] line-through ml-1">${h.rackRate}</span>
                      </Row>
                      <Row label="Savings">
                        <span className="font-mono text-[var(--accent)]">-{savingsPct}%</span>
                      </Row>
                      <Row label="Distance">
                        {Number.isFinite(h.distance) ? <span className="font-mono">{Math.round(h.distance)} mi</span> : <span className="text-[var(--text-3)]">—</span>}
                      </Row>
                      <Row label="Agents">
                        <span className="font-mono">{h.agentsBidding} bidding</span>
                      </Row>
                      <Row label="Free cancel">
                        {h.freeCancel ? <Check size={12} className="text-[var(--success)]" /> : <span className="text-[var(--text-3)] text-[11px]">No</span>}
                      </Row>
                      <div className="px-4 py-3 border-t border-[var(--border)]">
                        <p className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider mb-2">Amenities</p>
                        <ul className="space-y-1">
                          {ALL_AMENITIES.map(a => {
                            const has = h.amenities.includes(a.id)
                            return (
                              <li key={a.id} className="flex items-center gap-2 text-[12px]">
                                {has ? <Check size={12} className="text-[var(--success)]" /> : <X size={12} className="text-[var(--text-3)]" />}
                                <span className={has ? 'text-[var(--text-2)]' : 'text-[var(--text-3)]'}>{a.label}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div className="px-4 py-3 border-t border-[var(--border)] mt-auto">
                        <button
                          onClick={() => onDeploy(h)}
                          className="w-full px-3 py-2 rounded-md bg-[var(--accent)] text-white text-[12px] font-medium cursor-pointer hover:opacity-90"
                        >
                          Deploy on this →
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Row({ label, children }) {
  return (
    <div className="px-4 py-2 flex items-center justify-between gap-3 border-b border-[var(--border)] last:border-b-0">
      <span className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">{label}</span>
      <span className="text-[12px] text-right">{children}</span>
    </div>
  )
}
