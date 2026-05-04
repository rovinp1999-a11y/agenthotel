/**
 * Pure auction simulation. Emits a deterministic-with-randomness event stream
 * over `durationMs`. Consumers subscribe with `onEvent` and call `start()`.
 *
 * Events emitted:
 *   { type: 'bid', t, agentId, amount, agentName, color }
 *   { type: 'thought', t, agentId, agentName, text }
 *   { type: 'tick', t, msLeft }
 *   { type: 'end', t, status: 'won' | 'lost', winningAgentId, winningAmount, savings }
 *
 * Contract:
 *   - Total runtime is `durationMs` (default 28_000).
 *   - Your agent's id is `yourAgentId`. Cap is `capPrice`.
 *   - At least 8 bids fire across the run, including at least one from your agent.
 *   - Status is 'won' iff your agent's last bid is the highest at end-of-run AND <= capPrice.
 *   - 'lost' is emitted if a rival's highest bid exceeds your cap, or if rivals outbid you and you can't legally raise.
 */

const DEFAULT_DURATION = 28_000
const TICK_INTERVAL    = 250

export function createAuction({
  hotel,
  yourAgent,        // { id, name, color, bidIntervalMs, avgPremiumPct }
  rivals,           // [{ id, name, color }]
  startPrice,
  capPrice,
  durationMs = DEFAULT_DURATION,
  rackRate,         // for savings %
  rng = Math.random,
}) {
  let running = false
  let listeners = []
  let timeouts = []
  let bids = []     // { agentId, amount, t }
  let ended = false

  function emit(ev) {
    listeners.forEach(fn => fn(ev))
  }

  function highestBid() {
    return bids.reduce((acc, b) => (b.amount > acc.amount ? b : acc), { amount: -Infinity, agentId: null })
  }

  function scheduleBid(agent, atMs, amount) {
    const id = setTimeout(() => {
      if (!running || ended) return
      bids.push({ agentId: agent.id, amount, t: atMs })
      emit({ type: 'bid', t: atMs, agentId: agent.id, agentName: agent.name, amount, color: agent.color })
    }, atMs)
    timeouts.push(id)
  }

  function scheduleThought(agent, atMs, text) {
    const id = setTimeout(() => {
      if (!running || ended) return
      emit({ type: 'thought', t: atMs, agentId: agent.id, agentName: agent.name, text })
    }, atMs)
    timeouts.push(id)
  }

  function plan() {
    // Build a bid timeline that climbs from startPrice toward (but mostly below) capPrice.
    // Your agent and rivals interleave. Last bid is your agent for a 'won' outcome,
    // unless a rival's bid forces a 'lost' path (chosen randomly per run).
    const willWin = rng() > 0.18 // 82% wins, dramatic enough but not always
    const all = [yourAgent, ...rivals]
    let priceFloor = startPrice
    let lastBidder = null
    const timeline = []

    let t = 800
    while (t < durationMs - 1500) {
      const bidder = all[Math.floor(rng() * all.length)]
      if (bidder.id === lastBidder) { t += 600; continue }
      const bump = Math.round(2 + rng() * 6) // $2-$8 jumps
      priceFloor += bump
      if (priceFloor > capPrice + 25) break // safety
      timeline.push({ agent: bidder, t, amount: priceFloor })
      lastBidder = bidder.id
      t += 1100 + Math.floor(rng() * 1700)
    }

    // Force the final bid to fit the chosen outcome
    const finalT = durationMs - 600
    const finalAgent = willWin ? yourAgent : rivals[Math.floor(rng() * rivals.length)]
    const finalAmount = willWin
      ? Math.min(capPrice, priceFloor + 1)
      : capPrice + 4 + Math.floor(rng() * 8)
    timeline.push({ agent: finalAgent, t: finalT, amount: finalAmount })

    timeline.forEach(b => scheduleBid(b.agent, b.t, b.amount))

    // Sprinkle thoughts, biased toward your agent
    const thoughts = [
      { agentId: yourAgent.id, when: 1500, text: `${yourAgent.name}: scanning rivals · ${rivals.length} active.` },
      { agentId: yourAgent.id, when: 6500, text: `${yourAgent.name}: rival just blinked, holding firm.` },
      { agentId: rivals[0].id,  when: 4200, text: `${rivals[0].name}: pushing harder.` },
      { agentId: rivals[1] ? rivals[1].id : rivals[0].id, when: 9000, text: `${rivals[1] ? rivals[1].name : rivals[0].name}: dropped out (cap reached).` },
      { agentId: yourAgent.id, when: durationMs - 4000, text: `${yourAgent.name}: closing window — final move incoming.` },
    ]
    thoughts.forEach(th => {
      const speaker = [yourAgent, ...rivals].find(a => a.id === th.agentId) || yourAgent
      scheduleThought(speaker, th.when, th.text)
    })

    return { willWin, finalAmount, finalAgent }
  }

  function startTicks() {
    let elapsed = 0
    const id = setInterval(() => {
      elapsed += TICK_INTERVAL
      const left = Math.max(0, durationMs - elapsed)
      emit({ type: 'tick', t: elapsed, msLeft: left })
      if (left <= 0) { clearInterval(id) }
    }, TICK_INTERVAL)
    timeouts.push(id)
  }

  function scheduleEnd(planResult) {
    const id = setTimeout(() => {
      if (!running || ended) return
      ended = true
      const { finalAgent, finalAmount, willWin } = planResult
      const status = willWin ? 'won' : 'lost'
      // Reconcile loss outcomes with the visible bid ladder so the displayed
      // "Room sold for $X" never falls below the highest bid the user saw.
      const highest = highestBid()
      const reportedAmount = willWin
        ? finalAmount
        : Math.max(finalAmount, highest.amount === -Infinity ? finalAmount : highest.amount)
      const savings = rackRate ? Math.max(0, Math.round(((rackRate - reportedAmount) / rackRate) * 100)) : 0
      emit({
        type: 'end',
        t: durationMs,
        status,
        winningAgentId: finalAgent.id,
        winningAgentName: finalAgent.name,
        winningAmount: reportedAmount,
        savings,
      })
    }, durationMs)
    timeouts.push(id)
  }

  return {
    onEvent(fn) {
      listeners.push(fn)
      return () => { listeners = listeners.filter(l => l !== fn) }
    },
    start() {
      if (running) return
      running = true
      const planResult = plan()
      startTicks()
      scheduleEnd(planResult)
    },
    stop() {
      running = false
      timeouts.forEach(id => { clearTimeout(id); clearInterval(id) })
      timeouts = []
    },
    state() {
      return { running, ended, bids: [...bids], highest: highestBid() }
    },
  }
}
