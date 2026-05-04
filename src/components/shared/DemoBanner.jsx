import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { readBool, writeBool, KEYS } from '../../lib/storage'

export default function DemoBanner() {
  const [seen, setSeen] = useState(true) // assume seen on SSR; correct on mount

  useEffect(() => {
    setSeen(readBool(KEYS.demoSeen, false))
  }, [])

  function dismiss() {
    setSeen(true)
    writeBool(KEYS.demoSeen, true)
  }

  if (seen) return null

  return (
    <div className="border-b border-[var(--accent)] bg-[var(--accent-soft)]">
      <div className="max-w-[1120px] mx-auto px-6 h-9 flex items-center justify-between gap-4 text-[12px]">
        <Link to="/live" onClick={dismiss} className="text-[var(--accent)] hover:opacity-80">
          Watch a 30-second demo →
        </Link>
        <button onClick={dismiss} aria-label="Dismiss" className="text-[var(--text-3)] hover:text-[var(--text-2)]">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
