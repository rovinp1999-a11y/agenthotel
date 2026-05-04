import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import TourTrigger from '../Tour/TourTrigger'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/deploy', label: 'Deploy' },
  { to: '/live', label: 'Live' },
  { to: '/tonight', label: 'Tonight' },
]

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
    isActive
      ? 'text-[var(--text)] bg-[var(--bg-2)]'
      : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
  }`

export default function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="max-w-[1120px] mx-auto px-6 h-12 flex items-center justify-between">
        <NavLink to="/" className="text-sm font-semibold tracking-tight">AgentExchange</NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <TourTrigger />
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-[var(--text-2)] cursor-pointer" aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-6 py-3 space-y-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer ${
                  isActive ? 'text-[var(--text)] bg-[var(--bg-2)]' : 'text-[var(--text-3)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
