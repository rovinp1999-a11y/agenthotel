import { AGENT_LIST } from '../../lib/agents'
import AgentAvatar from '../shared/AgentAvatar'
import { emitTourSignal } from '../../lib/tour'

export default function PersonalityPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {AGENT_LIST.map(a => {
        const active = value === a.id
        return (
          <button
            key={a.id}
            onClick={() => { onChange(a.id); emitTourSignal('tour:agent-picked') }}
            aria-pressed={active}
            className={`relative text-left p-5 rounded-lg border overflow-hidden transition-all cursor-pointer ${
              active
                ? 'border-[var(--accent)] bg-[var(--bg-2)] shadow-[0_0_0_3px_var(--accent-soft)]'
                : 'border-[var(--border)] hover:border-[var(--border-2)] hover:bg-[var(--bg-2)]'
            }`}
            style={active ? { borderColor: a.color } : undefined}
          >
            <div className="absolute -top-3 -right-3 opacity-30" style={{ color: a.color }}>
              <AgentAvatar id={a.id} color={a.color} size={80} />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AgentAvatar id={a.id} color={a.color} size={28} />
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
                    {Math.round(a.winRate * 100)}% win rate
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-[var(--text-2)] leading-snug">{a.tagline}</p>
              <p className="text-[11px] text-[var(--text-3)] mt-2 leading-snug">{a.blurb}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
