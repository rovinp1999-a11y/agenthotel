import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { time: '6pm', rate: 62 }, { time: '7pm', rate: 65 }, { time: '8pm', rate: 69 },
  { time: '9pm', rate: 74 }, { time: '10pm', rate: 78 }, { time: '11pm', rate: 82 },
  { time: '12am', rate: 85 },
]

const rules = [
  { active: true, condition: 'occupancy < 40% AND time > 18:00', action: 'release 10 rooms @ $145 floor' },
  { active: true, condition: 'agent_demand > 10 AND checkin < 4h', action: 'raise floor by 15%' },
  { active: false, condition: 'unsold_rooms > 5 AND time = 21:00', action: 'release all @ 50% rack rate' },
]

export default function Supplier() {
  return (
    <div className="max-w-[1120px] mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Revenue cockpit</h1>
      <p className="text-sm text-[var(--text-3)] mb-10">W Hotel Las Vegas</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] rounded-lg overflow-hidden mb-10">
        {[
          { label: 'Occupancy', value: '78%' },
          { label: 'Revenue (7d)', value: '$12,840' },
          { label: 'Agents bidding', value: '47' },
          { label: 'Avg rate', value: '$168' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[var(--bg)] p-5">
            <div className="text-xs text-[var(--text-3)] mb-1">{kpi.label}</div>
            <div className="text-xl font-semibold font-mono">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Chart */}
        <div>
          <h2 className="text-sm font-medium text-[var(--text-2)] mb-4">Occupancy tonight</h2>
          <div className="border border-[var(--border)] rounded-lg p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97066" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#F97066" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#78716C', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716C', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#171412', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#FAFAF9' }} />
                <Area type="monotone" dataKey="rate" stroke="#F97066" fill="url(#g)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rules */}
        <div>
          <h2 className="text-sm font-medium text-[var(--text-2)] mb-4">Pricing rules</h2>
          <div className="space-y-2">
            {rules.map((r, i) => (
              <div key={i} className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${r.active ? 'bg-green-500' : 'bg-[var(--text-3)]'}`} />
                  <span className="text-xs text-[var(--text-3)]">{r.active ? 'Active' : 'Paused'}</span>
                </div>
                <p className="text-xs font-mono text-[var(--text-2)]">IF {r.condition}</p>
                <p className="text-xs font-mono text-[var(--accent)] mt-1">→ {r.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
