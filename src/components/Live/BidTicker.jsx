export default function BidTicker({ bids }) {
  const last = [...bids].slice(-3).reverse()
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-2 font-mono text-[11px] text-[var(--text-3)] overflow-hidden">
      {last.length === 0 ? (
        <span>… awaiting bids …</span>
      ) : (
        last.map((b, i) => (
          <span key={b.t + b.agentId} className="mr-4">
            {formatT(b.t)} · {b.agentName} → ${b.amount} {i === 0 && <span className="text-[var(--accent)]">·</span>}
          </span>
        ))
      )}
    </div>
  )
}

function formatT(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
