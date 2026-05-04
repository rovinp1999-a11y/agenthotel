import { motion, AnimatePresence } from 'framer-motion'
import AgentAvatar from '../shared/AgentAvatar'

export default function BidLadder({ bids, yourAgentId }) {
  // Last 7 bids, newest first
  const visible = [...bids].slice(-7).reverse()

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-mono text-[var(--text-3)]">BID LADDER</div>
        <div className="text-[11px] font-mono text-[var(--text-3)]">{bids.length} bids</div>
      </div>

      {visible.length === 0 && (
        <div className="text-[12px] text-[var(--text-3)] py-8 text-center">Waiting for first bid…</div>
      )}

      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {visible.map((b, idx) => {
            const isYou = b.agentId === yourAgentId
            return (
              <motion.li
                key={b.t + ':' + b.agentId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: idx === 0 ? 1 : Math.max(0.4, 1 - idx * 0.12), y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isYou ? 'bg-[var(--accent-soft)] border border-[var(--accent)]' : 'border border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.color }} />
                <AgentAvatar id={b.agentId} color={b.color} size={22} />
                <span className={`text-sm ${isYou ? 'text-[var(--text)]' : 'text-[var(--text-2)]'}`}>
                  {b.agentName}
                  {isYou && <span className="text-[10px] font-mono text-[var(--accent)] ml-1.5">YOU</span>}
                </span>
                <span className="ml-auto font-mono tabular-nums text-sm">${b.amount}</span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
