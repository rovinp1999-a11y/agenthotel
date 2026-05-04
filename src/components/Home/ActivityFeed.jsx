import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

function relativeTime(t) {
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (sec < 60)   return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60)   return `${min}m ago`
  const hr  = Math.floor(min / 60)
  return `${hr}h ago`
}

export default function ActivityFeed({ wins, winsPerMin }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-[320px]">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border border-[var(--border-2)] bg-[var(--bg-2)]/95 backdrop-blur-md shadow-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--bg-3)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] heartbeat" />
                <span className="text-[12px] font-medium">Live activity</span>
                <span className="text-[11px] font-mono text-[var(--text-3)]">· {winsPerMin}/min</span>
              </div>
              <ChevronDown size={14} className="text-[var(--text-3)]" />
            </button>

            <ul className="max-h-[280px] overflow-y-auto divide-y divide-[var(--border)]">
              <AnimatePresence initial={false}>
                {wins.length === 0 ? (
                  <li className="px-4 py-4 text-[12px] text-[var(--text-3)] text-center">Watching for wins…</li>
                ) : wins.map(w => (
                  <motion.li
                    key={w.id}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 py-3 text-[12px]"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-[var(--text)] truncate">{w.who} · {w.agent}</span>
                      <span className="font-mono text-[var(--accent)] shrink-0">-{w.savingsPct}%</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-3)] truncate">{w.hotel} · {w.city}</p>
                    <p className="text-[10px] font-mono text-[var(--text-3)] mt-0.5">{relativeTime(w.t)}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--border-2)] bg-[var(--bg-2)]/95 backdrop-blur-md shadow-lg text-[12px] cursor-pointer hover:bg-[var(--bg-3)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] heartbeat" />
            <span className="font-mono text-[var(--text-2)]">{winsPerMin}/min</span>
            <ChevronUp size={12} className="text-[var(--text-3)]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
