import { cityAccent } from '../../lib/cityAccent'

const WINS = [
  { who: 'Sarah K.', city: 'Las Vegas', agent: 'Hawk', saved: 312, ago: '4m' },
  { who: 'Diego R.', city: 'New York',  agent: 'Sage', saved: 184, ago: '11m' },
  { who: 'Maya T.',  city: 'London',    agent: 'Owl',  saved: 219, ago: '17m' },
  { who: 'Jules P.', city: 'Tokyo',     agent: 'Hawk', saved: 96,  ago: '24m' },
  { who: 'Ana S.',   city: 'Miami',     agent: 'Sage', saved: 158, ago: '31m' },
  { who: 'Leo M.',   city: 'Paris',     agent: 'Owl',  saved: 273, ago: '42m' },
]

export default function SocialProof() {
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--text-2)] mb-3">Recent wins</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] rounded-lg overflow-hidden">
        {WINS.map((w, i) => (
          <div key={i} className="bg-[var(--bg)] flex flex-col">
            <div className="h-0.5 w-full" style={{ background: cityAccent(w.city).bar }} />
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-[var(--accent)]">${w.saved}</span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: cityAccent(w.city).tag, color: cityAccent(w.city).bar }}
                >
                  {w.city}
                </span>
              </div>
              <p className="text-sm text-[var(--text)] mt-3">{w.who} saved on a stay</p>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">won by {w.agent} · {w.ago} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
