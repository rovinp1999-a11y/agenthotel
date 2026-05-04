import * as Lucide from 'lucide-react'
import { Star, MapPin, Pin, Check } from 'lucide-react'
import { cityAccent } from '../../lib/cityAccent'

const AMENITY_ICON = {
  pool:           'Waves',
  breakfast:      'Coffee',
  'late-checkin': 'Moon',
  'pet-friendly': 'PawPrint',
  parking:        'Car',
  gym:            'Dumbbell',
}

export default function HotelCard({ hotel, distanceMi, onDeploy, pinned, onTogglePin, pinDisabled, density = 'comfortable', dataTour }) {
  const savingsPct = Math.round(((hotel.rackRate - hotel.price) / hotel.rackRate) * 100)
  const accent = cityAccent(hotel.city)
  const compact = density === 'compact'

  return (
    <div data-tour={dataTour} className={`relative bg-[var(--bg)] hover:bg-[var(--bg-2)] transition-colors flex flex-col ${pinned ? 'ring-1 ring-[var(--accent)]' : ''}`}>
      {/* City accent bar */}
      <div className="h-0.5 w-full" style={{ background: accent.bar }} />

      <div className={`flex-1 flex flex-col ${compact ? 'p-4 gap-2' : 'p-5 gap-3'}`}>
        {/* Top: city tag + savings badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: accent.tag, color: accent.bar }}
          >
            {hotel.city}
          </span>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
            -{savingsPct}%
          </span>
        </div>

        {/* Price hero */}
        <div className="flex items-baseline gap-2">
          <span className={`font-mono font-semibold ${compact ? 'text-xl' : 'text-2xl'}`}>${hotel.price}</span>
          <span className="text-[11px] font-mono text-[var(--text-3)] line-through">${hotel.rackRate}</span>
          <span className="text-[10px] text-[var(--text-3)] ml-auto">/ night</span>
        </div>

        {/* Hotel name + neighborhood */}
        <div>
          <p className={`text-[var(--text)] ${compact ? 'text-sm' : 'text-base'} font-medium leading-tight`}>{hotel.name}</p>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5 flex items-center gap-1 flex-wrap">
            <MapPin size={11} className="shrink-0" />
            <span>{hotel.neighborhood}</span>
            {Number.isFinite(distanceMi) && <span className="text-[var(--text-3)]">· {Math.round(distanceMi)} mi</span>}
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 text-[var(--accent)]">
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} size={11} fill="currentColor" stroke="none" />
          ))}
          {Array.from({ length: 5 - hotel.stars }).map((_, i) => (
            <Star key={`o${i}`} size={11} className="text-[var(--border-2)]" fill="currentColor" stroke="none" />
          ))}
        </div>

        {/* Amenity icons */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5">
            {hotel.amenities.slice(0, 6).map(a => {
              const iconName = AMENITY_ICON[a]
              const Icon = iconName ? Lucide[iconName] : null
              return (
                <span
                  key={a}
                  title={a}
                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-3)]"
                >
                  {Icon ? <Icon size={11} /> : <span className="text-[8px] font-mono uppercase">{a.slice(0,2)}</span>}
                </span>
              )
            })}
            {hotel.freeCancel && (
              <span title="Free cancellation" className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--success)]">
                <Check size={12} />
              </span>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className={`flex items-center justify-between gap-2 ${compact ? 'mt-1' : 'mt-auto pt-2 border-t border-[var(--border)]'}`}>
          <span className="text-[11px] font-mono text-[var(--text-3)]">{hotel.agentsBidding} agents bidding</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePin}
              disabled={pinDisabled && !pinned}
              aria-pressed={pinned}
              title={pinned ? 'Unpin' : 'Pin to compare'}
              className={`inline-flex items-center justify-center w-7 h-7 rounded border cursor-pointer transition-colors ${
                pinned
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border-2)] text-[var(--text-3)] hover:text-[var(--text-2)] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Pin size={12} />
            </button>
            <button
              onClick={onDeploy}
              className="text-[11px] font-mono px-3 py-1.5 rounded bg-[var(--accent)] text-white cursor-pointer hover:opacity-90"
            >
              Deploy →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
