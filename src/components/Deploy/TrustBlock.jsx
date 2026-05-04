import { ShieldCheck } from 'lucide-react'

export default function TrustBlock({ cap }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)] p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="text-[var(--success)] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm">
            <span className="text-[var(--text)]">Hard cap.</span>{' '}
            <span className="text-[var(--text-2)]">Your agent will never bid above ${cap}. If it overpays by $1, we eat the difference.</span>
          </p>
          <p className="text-[12px] text-[var(--text-3)] mt-1.5">Cancel free up to 24h before check-in. Receipts in your email within 60 seconds of a win.</p>
        </div>
      </div>
    </div>
  )
}
