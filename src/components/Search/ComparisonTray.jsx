import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function ComparisonTray({ pinnedHotels, onUnpin, onCompare, onClear }) {
  const count = pinnedHotels.length
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-[640px]"
        >
          <div className="rounded-xl border border-[var(--border-2)] bg-[var(--bg-2)]/95 backdrop-blur-md shadow-xl p-3 flex items-center gap-3">
            <span className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider shrink-0">
              {count} pinned
            </span>
            <ul className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
              {pinnedHotels.map(h => (
                <li key={h.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--border-2)] bg-[var(--bg)]/80">
                  <span className="text-[12px] truncate max-w-[160px]">{h.name}</span>
                  <button onClick={() => onUnpin(h.id)} aria-label={`Unpin ${h.name}`} className="text-[var(--text-3)] hover:text-[var(--text)] cursor-pointer">
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onClear} className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
                Clear
              </button>
              <button
                onClick={onCompare}
                disabled={count < 2}
                className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white text-[12px] font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare {count} →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
