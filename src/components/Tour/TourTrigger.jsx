import { HelpCircle } from 'lucide-react'
import { useTour } from '../../lib/tour'

export default function TourTrigger() {
  const { start } = useTour()
  return (
    <button
      onClick={start}
      title="Show the tour"
      aria-label="Show the tour"
      className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer transition-colors"
    >
      <HelpCircle size={13} />
      <span>Tour</span>
    </button>
  )
}
