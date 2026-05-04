import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Share2, Gift } from 'lucide-react'

export default function WinMoment({ outcome, hotel, onReplay }) {
  const savedDollars = Math.max(0, hotel.rackRate - outcome.winningAmount)
  const [shown, setShown] = useState(0)

  // Count up the savings number
  useEffect(() => {
    let raf, start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 900)
      setShown(Math.round(savedDollars * easeOut(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [savedDollars])

  function shareWin() {
    const text = `My agent ${outcome.winningAgentName} won ${hotel.name} for $${outcome.winningAmount} (saved $${savedDollars}) on AgentExchange.`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden mt-6 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-6"
    >
      <Confetti />
      <div className="text-[11px] font-mono text-[var(--accent)] mb-1">WON</div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">{outcome.winningAgentName} closed the room.</h2>
      <p className="text-sm text-[var(--text-2)] mb-5">
        {hotel.name} · ${outcome.winningAmount} (was ${hotel.rackRate})
      </p>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-[11px] font-mono text-[var(--text-3)]">YOU SAVED</span>
        <span className="font-mono text-4xl text-[var(--accent)] tabular-nums">${shown}</span>
        <span className="text-[12px] font-mono text-[var(--text-3)]">· {outcome.savings}% off rack</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={shareWin} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium cursor-pointer hover:opacity-90">
          <Share2 size={14} /> Share this win
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border-2)] text-sm cursor-pointer hover:bg-[var(--bg-2)]">
          <Gift size={14} /> Refer a friend · both get $10
        </button>
        {onReplay && (
          <button onClick={onReplay} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--border-2)] text-sm cursor-pointer hover:bg-[var(--bg-2)]">
            Run another
          </button>
        )}
        <Link to="/tonight" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm text-[var(--text-3)] hover:text-[var(--text-2)]">
          Try Tonight's drops →
        </Link>
      </div>
    </motion.div>
  )
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

function Confetti() {
  // CSS-only confetti — 24 small dots, pseudo-random positions.
  const dots = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map(i => (
        <span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            top: `${(i * 41) % 100}%`,
            left: `${(i * 73) % 100}%`,
            background: i % 3 === 0 ? '#F97066' : i % 3 === 1 ? '#FBBF24' : '#34D399',
            animation: `slideUp 0.9s var(--ease) ${i * 30}ms both`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}
