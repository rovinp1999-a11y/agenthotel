import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-[1120px] mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-[var(--text-3)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent-soft)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F97066" aria-hidden="true">
              <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
          </span>
          <span className="font-semibold text-[var(--text-2)]">AgentExchange</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Smart hotel deals on autopilot</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/hotels" className="hover:text-[var(--text-2)] transition-colors">For hotels →</Link>
          <a href="#" className="hover:text-[var(--text-2)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--text-2)] transition-colors">Terms</a>
          <span className="font-mono">v0.2 · demo</span>
        </div>
      </div>
    </footer>
  )
}
