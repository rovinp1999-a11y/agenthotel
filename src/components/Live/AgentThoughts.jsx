import { motion, AnimatePresence } from 'framer-motion'

export default function AgentThoughts({ thoughts }) {
  // Last 5
  const visible = thoughts.slice(-5)
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="text-[11px] font-mono text-[var(--text-3)] mb-3">AGENT THOUGHTS</div>
      {visible.length === 0 && (
        <div className="text-[12px] text-[var(--text-3)] py-8 text-center">Quiet so far…</div>
      )}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map(t => (
            <motion.li
              key={t.t + ':' + t.agentId}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-[12px] leading-snug text-[var(--text-2)]"
            >
              {t.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
