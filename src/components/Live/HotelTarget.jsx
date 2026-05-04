import { cityAccent } from '../../lib/cityAccent'

export default function HotelTarget({ hotel, msLeft }) {
  const sec = Math.max(0, Math.floor(msLeft / 1000))
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  const accent = cityAccent(hotel.city || hotel.location)
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
      <div className="h-1 w-full" style={{ background: accent.bar }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">Target</div>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight truncate mt-1">{hotel.name}</h2>
            <p className="text-[12px] text-[var(--text-3)] mt-1">{hotel.location} · {hotel.left} rooms left tonight</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">Closes in</div>
            <div className={`font-mono text-3xl tabular-nums leading-none mt-1 ${msLeft < 6000 ? 'text-[var(--accent)] heartbeat' : 'text-[var(--text)]'}`}>{m}:{s}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
