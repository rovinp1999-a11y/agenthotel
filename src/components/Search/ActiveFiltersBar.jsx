import { X } from 'lucide-react'
import { ALL_AMENITIES, STAR_OPTIONS } from '../../lib/hotels'

export default function ActiveFiltersBar({ filters, onChange }) {
  const chips = []

  if (filters.stars && filters.stars > 0) {
    const lbl = STAR_OPTIONS.find(o => o.value === filters.stars)?.label || `${filters.stars}+`
    chips.push({ key: 'stars', label: `${lbl} stars`, clear: () => onChange({ ...filters, stars: 0 }) })
  }
  if (filters.minPrice > 40 || filters.maxPrice < 500) {
    chips.push({
      key: 'price',
      label: `$${filters.minPrice}–$${filters.maxPrice}`,
      clear: () => onChange({ ...filters, minPrice: 40, maxPrice: 500 }),
    })
  }
  ;(filters.amenities || []).forEach(a => {
    const lbl = ALL_AMENITIES.find(x => x.id === a)?.label || a
    chips.push({
      key: `amenity:${a}`,
      label: lbl,
      clear: () => onChange({ ...filters, amenities: filters.amenities.filter(x => x !== a) }),
    })
  })
  ;(filters.neighborhoods || []).forEach(n => {
    chips.push({
      key: `nbhd:${n}`,
      label: n,
      clear: () => {
        const next = filters.neighborhoods.filter(x => x !== n)
        onChange({ ...filters, neighborhoods: next.length ? next : null })
      },
    })
  })
  if (filters.freeCancelOnly) {
    chips.push({ key: 'freeCancel', label: 'Free cancel', clear: () => onChange({ ...filters, freeCancelOnly: false }) })
  }
  if (filters.checkIn || filters.checkOut) {
    const r = [filters.checkIn, filters.checkOut].filter(Boolean).join(' → ')
    chips.push({ key: 'dates', label: r, clear: () => onChange({ ...filters, checkIn: '', checkOut: '' }) })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">Filters:</span>
      {chips.map(c => (
        <button
          key={c.key}
          onClick={c.clear}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] cursor-pointer hover:opacity-80"
        >
          {c.label}
          <X size={12} />
        </button>
      ))}
      <button
        onClick={() => onChange({
          stars: 0, minPrice: 40, maxPrice: 500, amenities: [], neighborhoods: null, freeCancelOnly: false, checkIn: '', checkOut: '',
        })}
        className="text-[11px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer"
      >
        Clear all
      </button>
    </div>
  )
}
