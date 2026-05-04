import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PersonalityPicker from './PersonalityPicker'
import TrustBlock from './TrustBlock'
import AgentAvatar from '../shared/AgentAvatar'
import { getAgent } from '../../lib/agents'
import { writeJSON, readJSON, KEYS } from '../../lib/storage'

export default function Deploy() {
  const selectedHotel = readJSON(KEYS.selectedHotel, null)
  const [agentId, setAgentId] = useState('sage')
  const [cap, setCap] = useState(180)
  const navigate = useNavigate()
  const agent = getAgent(agentId)

  function deploy() {
    writeJSON(KEYS.yourAgent, { agentId, cap, deployedAt: Date.now() })
    navigate('/live')
  }

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-1">
        <AgentAvatar id={agentId} color={agent.color} size={28} />
        <h1 className="text-2xl font-semibold tracking-tight">Commission your agent</h1>
      </div>
      <p className="text-sm text-[var(--text-3)] mb-10">
        {agent.name} is awake. {agent.blurb}
      </p>

      <div className="space-y-6">
        {/* Destination */}
        <div>
          <label className="text-sm text-[var(--text-2)] mb-2 block">Destination</label>
          <div className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm">
            {selectedHotel ? `${selectedHotel.name} · ${selectedHotel.city}` : 'Las Vegas, NV'}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm text-[var(--text-2)] mb-2 block">Check-in</label>
          <div className="px-4 py-3 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm">
            Tonight · May 4, 2026
          </div>
        </div>

        {/* Cap (with simple slider) */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="cap" className="text-sm text-[var(--text-2)]">Price cap</label>
            <span className="text-sm font-mono">${cap} <span className="text-[var(--text-3)]">/ night</span></span>
          </div>
          <input
            id="cap"
            type="range"
            min="80"
            max="320"
            step="5"
            value={cap}
            onChange={e => setCap(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        {/* Trust block — directly under cap, on purpose */}
        <TrustBlock cap={cap} />

        {/* Personality */}
        <div data-tour="personality-picker">
          <label className="text-sm text-[var(--text-2)] mb-3 block">Pick a personality</label>
          <PersonalityPicker value={agentId} onChange={setAgentId} />
        </div>

        {/* Summary */}
        <div className="pt-5 border-t border-[var(--border)] space-y-2">
          <div className="grid grid-cols-3 gap-3">
            <SummaryCell label="Competing agents" value="47" />
            <SummaryCell label="Rooms left" value="23" />
            <SummaryCell label="Est. savings" value={`${Math.max(0, agent.avgPremiumPct < 0 ? 30 + Math.abs(agent.avgPremiumPct) : 30 - agent.avgPremiumPct)}–${Math.max(20, 50 - agent.avgPremiumPct)}%`} accent />
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[var(--text-3)] uppercase tracking-wider">Win probability</span>
              <span className="font-mono text-sm">{Math.round(agent.winRate * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round(agent.winRate * 100)}%`, background: agent.color }}
              />
            </div>
          </div>
        </div>

        {/* Deploy */}
        <motion.button
          onClick={deploy}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg text-sm font-medium cursor-pointer bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Deploy {agent.name} · $2.00
        </motion.button>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-2)]">{label}</span>
      <span className={`font-mono ${accent ? 'text-[var(--accent)]' : ''}`}>{value}</span>
    </div>
  )
}

function SummaryCell({ label, value, accent }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-2)] p-3">
      <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">{label}</div>
      <div className={`font-mono text-base mt-1 ${accent ? 'text-[var(--accent)]' : ''}`}>{value}</div>
    </div>
  )
}
