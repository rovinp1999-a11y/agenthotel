const ACTS = [
  {
    label: 'The waste',
    head: '30% of hotel rooms go unsold each night.',
    body: 'Hotels would rather discount than leave a room empty. They just won\'t admit it in public — yield desks quietly drop rates after 6pm and only locals know which knobs to push.',
    stat: '~30%',
    sub: 'rooms unsold past 6pm · industry avg',
  },
  {
    label: 'The bet',
    head: 'Hotels run revenue bots. Travelers don\'t. We give travelers a bot.',
    body: 'AgentExchange deploys an AI agent that bids against the hotel\'s revenue management system in real time, with a hard price cap and a personality you choose.',
    stat: '34%',
    sub: 'avg savings vs. rack · last 30 days',
  },
  {
    label: 'The proof',
    head: 'Sarah\'s agent saved $312 in 4 minutes.',
    body: 'Sarah picked Hawk, set $180, and went to dinner. Her agent won the room for $142 — receipt in her inbox before dessert.',
    stat: '$2.3M',
    sub: 'saved by AgentExchange travelers this month',
  },
]

export default function StoryActs() {
  return (
    <div className="space-y-12">
      {ACTS.map((a, i) => (
        <article key={a.label} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          <div className="md:col-span-2">
            <div className="text-[11px] font-mono text-[var(--text-3)]">ACT {i + 1}</div>
            <div className="text-[12px] text-[var(--text-2)] mt-1">{a.label}</div>
          </div>
          <div className="md:col-span-7">
            <h3 className="serif text-3xl md:text-4xl text-[var(--text)] leading-tight">{a.head}</h3>
            <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-[58ch]">{a.body}</p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <div className="font-mono text-3xl text-[var(--accent)] tabular-nums">{a.stat}</div>
            <div className="text-[11px] text-[var(--text-3)] mt-1">{a.sub}</div>
          </div>
        </article>
      ))}
    </div>
  )
}
