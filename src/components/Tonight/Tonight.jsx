import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { readBool, writeBool, KEYS } from '../../lib/storage'
import { TONIGHT_DEALS as DEALS } from '../../lib/deals'
import { cityAccent } from '../../lib/cityAccent'

const CITIES = ['All', 'Las Vegas', 'New York', 'London']

export default function Tonight() {
  const [time, setTime] = useState('')
  const [filter, setFilter] = useState('All')
  const [wakeMe, setWakeMe] = useState(() => readBool(KEYS.wakeMe, false))
  const [deployed, setDeployed] = useState(247)
  const navigate = useNavigate()

  useEffect(() => {
    const i = setInterval(() => setDeployed(d => Math.max(220, d + Math.floor(Math.random() * 5) - 1)), 5000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const target = new Date()
      target.setHours(22, 0, 0, 0)
      if (now > target) target.setDate(target.getDate() + 1)
      const d = target - now
      const h = String(Math.floor(d / 3600000)).padStart(2, '0')
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((d % 60000) / 1000)).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  const visible = filter === 'All' ? DEALS : DEALS.filter(d => d.city === filter)

  function toggleWake() {
    const next = !wakeMe
    setWakeMe(next)
    writeBool(KEYS.wakeMe, next)
  }

  function openDeal(deal) {
    navigate(`/live?deal=${deal.id}`)
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-12">
      {/* Countdown */}
      <div className="text-center mb-12">
        <p className="text-xs text-[var(--text-3)] mb-3 font-mono">Deals drop at 10:00 PM · agents already deployed: {deployed}</p>
        <div className="font-mono text-5xl md:text-7xl font-semibold tracking-tighter text-[var(--accent)]">{time}</div>
        <p className="text-sm text-[var(--text-3)] mt-4">Half-price hotels · Check-in after 10pm</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate('/deploy')}
            className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
          >
            Deploy agent for tonight
          </button>
          <button
            onClick={toggleWake}
            aria-pressed={wakeMe}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm ${
              wakeMe
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--border-2)] text-[var(--text-2)] hover:bg-[var(--bg-2)]'
            }`}
          >
            <Bell size={14} />
            {wakeMe ? "I'll wake you at 10pm" : 'Wake me at 10pm'}
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {CITIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-[12px] border whitespace-nowrap cursor-pointer ${
              filter === c
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-2)] text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Deals */}
      <h2 className="text-sm font-medium text-[var(--text-2)] mb-3">Tonight's hotels</h2>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] p-8 text-center text-[13px] text-[var(--text-3)]">
          No drops in {filter} tonight. Try All.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
          {visible.map(d => (
            <button
              key={d.id}
              onClick={() => openDeal(d)}
              className="text-left bg-[var(--bg)] hover:bg-[var(--bg-2)] transition-colors cursor-pointer flex flex-col"
            >
              <div className="h-0.5 w-full" style={{ background: cityAccent(d.city).bar }} />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: cityAccent(d.city).tag, color: cityAccent(d.city).bar }}
                  >
                    {d.city}
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                    -{d.savings}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold">${d.price}</span>
                  <span className="text-[11px] font-mono text-[var(--text-3)] line-through">${d.original}</span>
                  <span className="text-[10px] text-[var(--text-3)] ml-auto">/ night</span>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[var(--text)] leading-tight">{d.hotel}</p>
                  <p className="text-[12px] text-[var(--text-3)] mt-0.5">{d.left} rooms left tonight</p>
                </div>
                <div className="mt-auto pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-3)]">{d.agentsBidding} agents bidding</span>
                  <span className="text-[11px] font-mono text-[var(--accent)]">Watch live →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
