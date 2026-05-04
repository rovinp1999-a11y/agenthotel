import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function LossPath({ outcome, hotel, capPrice, agentName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-lg border border-[var(--border-2)] bg-[var(--bg-2)] p-6"
    >
      <div className="text-[11px] font-mono text-[var(--text-3)] mb-1">CAP REACHED</div>
      <h2 className="text-xl font-medium tracking-tight mb-1">{agentName} held the line.</h2>
      <p className="text-sm text-[var(--text-2)] mb-5">
        Room sold for ${outcome.winningAmount}, ${outcome.winningAmount - capPrice} above your cap.
        We don't break the cap, ever.
      </p>

      <p className="text-[13px] text-[var(--text-3)] mb-5">
        Want me to try Tonight's drops instead? Last-minute releases are usually 40–55% off.
      </p>

      <div className="flex flex-wrap gap-2">
        <Link to="/tonight" className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">
          Try Tonight →
        </Link>
        <Link to="/deploy" className="inline-flex items-center px-4 py-2 rounded-md border border-[var(--border-2)] text-sm hover:bg-[var(--bg-3)]">
          Raise the cap and retry
        </Link>
      </div>
    </motion.div>
  )
}
