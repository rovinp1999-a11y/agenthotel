import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTour, STEPS, runSetup, onTourSignal } from '../../lib/tour'

const PADDING = 8       // halo padding around the target
const TIP_OFFSET = 16   // gap between target and tooltip
const TIP_WIDTH  = 360  // tooltip width

function useTargetRect(selector, deps) {
  const [rect, setRect] = useState(null)

  useLayoutEffect(() => {
    if (!selector) { setRect(null); return }

    let raf = null
    let cancelled = false
    const findAndSet = () => {
      if (cancelled) return
      const el = document.querySelector(selector)
      if (!el) {
        // Element may not be mounted yet (route just changed). Retry next frame.
        raf = requestAnimationFrame(findAndSet)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })

      // Scroll into view if needed
      const inView = r.top >= 0 && r.bottom <= window.innerHeight
      if (!inView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    findAndSet()

    function onResize() { findAndSet() }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps])

  return rect
}

function tooltipPosition(rect) {
  if (!rect) return null
  const vpW = window.innerWidth
  const vpH = window.innerHeight

  // Try below first
  if (rect.bottom + TIP_OFFSET + 200 < vpH) {
    return {
      placement: 'below',
      top: rect.bottom + TIP_OFFSET,
      left: clampX(rect.left + rect.width / 2 - TIP_WIDTH / 2, vpW),
    }
  }
  // Try above
  if (rect.top - TIP_OFFSET - 200 > 0) {
    return {
      placement: 'above',
      top: Math.max(8, rect.top - 220),
      left: clampX(rect.left + rect.width / 2 - TIP_WIDTH / 2, vpW),
    }
  }
  // Right
  if (rect.right + TIP_OFFSET + TIP_WIDTH < vpW) {
    return {
      placement: 'right',
      top: clampY(rect.top + rect.height / 2 - 100, vpH),
      left: rect.right + TIP_OFFSET,
    }
  }
  // Left
  return {
    placement: 'left',
    top: clampY(rect.top + rect.height / 2 - 100, vpH),
    left: Math.max(8, rect.left - TIP_OFFSET - TIP_WIDTH),
  }
}

function clampX(x, vpW) { return Math.max(8, Math.min(x, vpW - TIP_WIDTH - 8)) }
function clampY(y, vpH) { return Math.max(8, Math.min(y, vpH - 220)) }

export default function Tour() {
  const { open, step, next, prev, skip, finish } = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Sync route with the current step
  useEffect(() => {
    if (!open || !current) return
    const desired = current.route
    if (!desired) return
    const here = `${location.pathname}${location.search}`
    if (here !== desired) navigate(desired)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step])

  // Run any setup
  useEffect(() => {
    if (!open || !current) return
    if (current.setup) runSetup(current.setup)
  }, [open, step, current])

  // Subscribe to the current step's advance signal. When the user performs the
  // action, auto-advance.
  useEffect(() => {
    if (!open || !current?.advanceOn) return
    const off = onTourSignal(current.advanceOn, () => {
      // Small delay so the user sees their action complete (e.g., dropdown closes,
      // pin button highlights) before the tour moves on.
      setTimeout(() => next(), 350)
    })
    return off
  }, [open, step, current, next])

  const rect = useTargetRect(open && current?.target ? current.target : null, [open, step])
  const tip = tooltipPosition(rect)

  function handleNext() {
    if (isLast) finish()
    else next()
  }

  return (
    <AnimatePresence>
      {open && current && (
        <>
          {/* Spotlight scrim */}
          {rect ? (
            <SpotlightScrim rect={rect} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm pointer-events-auto"
              onClick={(e) => { e.stopPropagation() }}
              aria-hidden="true"
            />
          )}

          {/* Tooltip / centered card */}
          {rect && tip ? (
            <SpotlightTooltip
              tip={tip} step={step} stepCount={STEPS.length}
              title={current.title} body={current.body}
              actionPrompt={current.actionPrompt}
              onSkip={skip} onPrev={prev} onNext={handleNext}
              isFirst={step === 0} isLast={isLast}
            />
          ) : (
            <CenteredCard
              step={step} stepCount={STEPS.length}
              title={current.title} body={current.body}
              actionPrompt={current.actionPrompt}
              onSkip={skip} onPrev={prev} onNext={handleNext}
              isFirst={step === 0} isLast={isLast}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}

function SpotlightScrim({ rect }) {
  // Box-shadow trick: a small box at the target's position with a huge shadow
  // creates a "punch-out" effect, leaving the target visible.
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + 2 * PADDING,
        height: rect.height + 2 * PADDING,
        borderRadius: 12,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
        pointerEvents: 'none',
        zIndex: 60,
      }}
      aria-hidden="true"
    />
  )
}

function SpotlightTooltip({ tip, step, stepCount, title, body, actionPrompt, onSkip, onPrev, onNext, isFirst, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'fixed', top: tip.top, left: tip.left, width: 360, zIndex: 61 }}
      role="dialog"
      aria-label="Tour step"
    >
      <CardBody
        step={step} stepCount={stepCount}
        title={title} body={body} actionPrompt={actionPrompt}
        onSkip={onSkip} onPrev={onPrev} onNext={onNext}
        isFirst={isFirst} isLast={isLast}
      />
    </motion.div>
  )
}

function CenteredCard({ step, stepCount, title, body, actionPrompt, onSkip, onPrev, onNext, isFirst, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 -translate-x-1/2 bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-[61] w-[calc(100%-2rem)] max-w-[480px]"
      role="dialog"
      aria-label="Tour step"
    >
      <CardBody
        step={step} stepCount={stepCount}
        title={title} body={body} actionPrompt={actionPrompt}
        onSkip={onSkip} onPrev={onPrev} onNext={onNext}
        isFirst={isFirst} isLast={isLast}
      />
    </motion.div>
  )
}

function CardBody({ step, stepCount, title, body, actionPrompt, onSkip, onPrev, onNext, isFirst, isLast }) {
  return (
    <div className="rounded-2xl border border-[var(--border-2)] bg-[var(--bg-2)] shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          Tour · {step + 1} of {stepCount}
        </span>
        <button onClick={onSkip} aria-label="Close tour" className="text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
          <X size={16} />
        </button>
      </div>
      <div className="px-5 pt-3 pb-5">
        <h2 className="serif text-2xl tracking-tight leading-tight text-[var(--text)]">{title}</h2>
        <p className="text-[14px] text-[var(--text-2)] mt-2 leading-snug">{body}</p>
      </div>
      {actionPrompt && (
        <div className="px-5 pb-3 -mt-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[11px] font-mono text-[var(--accent)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] heartbeat" />
            <span>{actionPrompt}</span>
          </div>
        </div>
      )}
      <div className="h-0.5 bg-[var(--bg-3)]">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${((step + 1) / stepCount) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-3">
        <button onClick={onSkip} className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer">
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--border-2)] text-[12px] cursor-pointer hover:bg-[var(--bg-3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-md bg-[var(--accent)] text-white text-[12px] font-medium cursor-pointer hover:opacity-90"
          >
            {isLast ? 'Done' : 'Next'} {!isLast && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  )
}
