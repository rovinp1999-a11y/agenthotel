import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ALL_AMENITIES, STAR_OPTIONS } from '../../lib/hotels'

const FREE_CANCEL_LABELS = ['Any', 'Free cancel only']

export default function FiltersDrawer({ open, onClose, filters, onChange, neighborhoods, matchCount }) {
  function set(patch) { onChange({ ...filters, ...patch }) }

  function toggleAmenity(id) {
    const cur = filters.amenities || []
    set({ amenities: cur.includes(id) ? cur.filter(a => a !== id) : [...cur, id] })
  }

  function toggleNeighborhood(name) {
    const cur = filters.neighborhoods || []
    const next = cur.includes(name) ? cur.filter(n => n !== name) : [...cur, name]
    set({ neighborhoods: next.length ? next : null })
  }

  function reset() {
    onChange({
      stars: 0,
      minPrice: 40,
      maxPrice: 500,
      amenities: [],
      neighborhoods: null,
      freeCancelOnly: false,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-[var(--bg)] border-l border-[var(--border)] flex flex-col"
            role="dialog"
            aria-label="Filters"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
                <p className="text-[12px] text-[var(--text-3)] mt-0.5 font-mono">
                  {matchCount} hotel{matchCount === 1 ? '' : 's'} match
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Dates (UI only — visual placeholder; no real date math) */}
              <Field label="Dates">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    aria-label="Check-in"
                    value={filters.checkIn || ''}
                    onChange={e => set({ checkIn: e.target.value })}
                    className="px-3 py-2 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-[12px]"
                  />
                  <input
                    type="date"
                    aria-label="Check-out"
                    value={filters.checkOut || ''}
                    onChange={e => set({ checkOut: e.target.value })}
                    className="px-3 py-2 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-[12px]"
                  />
                </div>
              </Field>

              {/* Stars */}
              <Field label="Stars">
                <div className="flex gap-2">
                  {STAR_OPTIONS.map(opt => (
                    <Pill key={opt.value} active={filters.stars === opt.value} onClick={() => set({ stars: opt.value })}>
                      {opt.label}
                    </Pill>
                  ))}
                </div>
              </Field>

              {/* Price range — dual-thumb proxy via two range inputs */}
              <Field label={`Price · $${filters.minPrice} – $${filters.maxPrice}`}>
                <div className="space-y-2">
                  <input
                    type="range" min="40" max="500" step="5"
                    value={filters.minPrice}
                    onChange={e => set({ minPrice: Math.min(Number(e.target.value), filters.maxPrice - 5) })}
                    className="w-full accent-[var(--accent)]"
                    aria-label="Minimum price"
                  />
                  <input
                    type="range" min="40" max="500" step="5"
                    value={filters.maxPrice}
                    onChange={e => set({ maxPrice: Math.max(Number(e.target.value), filters.minPrice + 5) })}
                    className="w-full accent-[var(--accent)]"
                    aria-label="Maximum price"
                  />
                </div>
              </Field>

              {/* Neighborhood */}
              {neighborhoods && neighborhoods.length > 0 && (
                <Field label="Neighborhood">
                  <div className="flex flex-wrap gap-2">
                    {neighborhoods.map(n => {
                      const active = (filters.neighborhoods || []).includes(n)
                      return (
                        <Pill key={n} active={active} onClick={() => toggleNeighborhood(n)}>{n}</Pill>
                      )
                    })}
                  </div>
                </Field>
              )}

              {/* Amenities */}
              <Field label="Amenities">
                <div className="grid grid-cols-2 gap-2">
                  {ALL_AMENITIES.map(a => {
                    const active = (filters.amenities || []).includes(a.id)
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleAmenity(a.id)}
                        aria-pressed={active}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-[12px] cursor-pointer transition-colors ${
                          active
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                            : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-2)]'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-sm border ${active ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-2)]'}`} />
                        {a.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              {/* Free cancel */}
              <Field label="Cancellation">
                <div className="flex gap-2">
                  {FREE_CANCEL_LABELS.map((label, idx) => (
                    <Pill
                      key={label}
                      active={filters.freeCancelOnly === Boolean(idx)}
                      onClick={() => set({ freeCancelOnly: Boolean(idx) })}
                    >
                      {label}
                    </Pill>
                  ))}
                </div>
              </Field>

            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] px-5 py-3 flex items-center justify-between gap-3">
              <button onClick={reset} className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium cursor-pointer hover:opacity-90"
              >
                See {matchCount} hotel{matchCount === 1 ? '' : 's'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider mb-2 block">{label}</label>
      {children}
    </div>
  )
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1 rounded-full text-[12px] border whitespace-nowrap cursor-pointer transition-colors ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
          : 'border-[var(--border-2)] text-[var(--text-3)] hover:text-[var(--text-2)]'
      }`}
    >
      {children}
    </button>
  )
}
