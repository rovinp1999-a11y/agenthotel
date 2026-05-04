import { emitTourSignal } from '../../lib/tour'

const STEPS = [50, 100, 250, 500]

export default function RadiusSelector({ value, onChange }) {
  return (
    <div data-tour="radius-selector" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-2)] bg-[var(--bg-2)]/90 backdrop-blur-sm">
      <span className="text-[11px] font-mono text-[var(--text-3)]">RADIUS</span>
      <div role="radiogroup" aria-label="Coverage radius (miles)" className="flex items-center gap-1">
        {STEPS.map(step => {
          const active = value === step
          return (
            <button
              key={step}
              role="radio"
              aria-checked={active}
              onClick={() => { onChange(step); emitTourSignal('tour:radius-changed') }}
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors ${
                active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-2)] hover:text-[var(--text)]'
              }`}
            >
              {step}mi
            </button>
          )
        })}
      </div>
      <span className="hidden md:inline text-[10px] font-mono text-[var(--text-3)] pl-1 border-l border-[var(--border-2)]">⇧ + drag</span>
    </div>
  )
}
