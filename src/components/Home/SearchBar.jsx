import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'

const MAX_RESULTS = 6

export default function SearchBar({ cities, onSelect, selectedName = null }) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return cities.slice(0, MAX_RESULTS)
    return cities
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS)
  }, [cities, value])

  function commit(city) {
    onSelect(city)
    setValue('')
    setOpen(false)
    setHighlight(0)
    if (inputRef.current) inputRef.current.blur()
  }

  function clear() {
    setValue('')
    setHighlight(0)
    if (inputRef.current) inputRef.current.focus()
  }

  function onKey(e) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(matches.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)) }
    else if (e.key === 'Enter')   { e.preventDefault(); if (matches[highlight]) commit(matches[highlight]) }
    else if (e.key === 'Escape')  { setOpen(false) }
  }

  return (
    <div ref={wrapRef} data-tour="search-bar" className="relative w-full max-w-[420px]">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setHighlight(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={selectedName ? selectedName : 'Search a city or country…'}
          aria-label="Search"
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[var(--border-2)] bg-[var(--bg-2)]/90 backdrop-blur-sm text-sm placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent)]"
        />
        {value && (
          <button onClick={clear} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {open && matches.length > 0 && (
        <ul role="listbox" className="absolute left-0 right-0 mt-1 max-h-[260px] overflow-auto rounded-lg border border-[var(--border-2)] bg-[var(--bg-2)] shadow-lg z-20">
          {matches.map((c, i) => (
            <li key={c.name} role="option" aria-selected={i === highlight}>
              <button
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(c)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm cursor-pointer ${
                  i === highlight ? 'bg-[var(--bg-3)]' : ''
                }`}
              >
                <span className="text-[var(--text)] truncate">{c.name}</span>
                <span className="text-[11px] font-mono text-[var(--text-3)]">{c.agents} agents · {c.savings}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && matches.length === 0 && (
        <div className="absolute left-0 right-0 mt-1 px-3 py-3 rounded-lg border border-[var(--border-2)] bg-[var(--bg-2)] text-[12px] text-[var(--text-3)] z-20">
          No matches. Try a major city — Tokyo, Paris, Dubai…
        </div>
      )}
    </div>
  )
}
