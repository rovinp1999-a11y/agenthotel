import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import { createAuction } from '../../lib/auction'
import { getAgent, makeRival } from '../../lib/agents'
import { getDeal, dealToHotel } from '../../lib/deals'
import { readJSON, readBool, writeBool, KEYS } from '../../lib/storage'
import HotelTarget from './HotelTarget'
import BidLadder from './BidLadder'
import AgentThoughts from './AgentThoughts'
import BidTicker from './BidTicker'
import WinMoment from './WinMoment'
import LossPath from './LossPath'

const DEFAULT_HOTEL = {
  name: 'Marriott Downtown',
  location: 'Las Vegas Strip',
  rackRate: 220,
  startPrice: 102,
  left: 3,
}

export default function Live() {
  const [bids, setBids] = useState([])
  const [thoughts, setThoughts] = useState([])
  const [msLeft, setMsLeft] = useState(28000)
  const [outcome, setOutcome] = useState(null)
  const auctionRef = useRef(null)

  const [searchParams] = useSearchParams()
  const dealId = searchParams.get('deal')
  const deal = dealId ? getDeal(dealId) : null
  const hotel = deal ? dealToHotel(deal) : DEFAULT_HOTEL

  const [replayKey, setReplayKey] = useState(0)

  const [audioOn, setAudioOn] = useState(() => readBool(KEYS.audioOn, false))

  function toggleAudio() {
    const next = !audioOn
    setAudioOn(next)
    writeBool(KEYS.audioOn, next)
  }

  function replay() {
    if (auctionRef.current) auctionRef.current.stop()
    setBids([])
    setThoughts([])
    setMsLeft(28000)
    setOutcome(null)
    // Re-trigger the auction effect by toggling a key — easiest fix:
    setReplayKey(k => k + 1)
  }

  // Load chosen agent (or default to Sage if visited cold — boss-friendly)
  const stored = readJSON(KEYS.yourAgent, null)
  const isColdVisit = !stored
  const agentId = stored?.agentId || 'sage'
  const cap     = stored?.cap     || 180
  const yourAgent = getAgent(agentId)
  const rivals = [makeRival(0), makeRival(1), makeRival(2)]

  useEffect(() => {
    const auction = createAuction({
      hotel,
      yourAgent,
      rivals,
      startPrice: hotel.startPrice,
      capPrice: cap,
      rackRate: hotel.rackRate,
      durationMs: 28000,
    })
    auctionRef.current = auction
    const off = auction.onEvent(ev => {
      if (ev.type === 'bid')     setBids(prev => [...prev, ev])
      if (ev.type === 'thought') setThoughts(prev => [...prev, ev])
      if (ev.type === 'tick')    setMsLeft(ev.msLeft)
      if (ev.type === 'end')     setOutcome(ev)
    })
    auction.start()
    return () => { off(); auction.stop() }
  }, [hotel.name, replayKey])

  useEffect(() => {
    if (!audioOn || outcome) return
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (typeof ctx.resume === 'function') ctx.resume().catch(() => {})
    let cancel = false
    function beat() {
      if (cancel) return
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 80
      g.gain.value = 0.0
      o.connect(g); g.connect(ctx.destination)
      o.start()
      const t = ctx.currentTime
      g.gain.linearRampToValueAtTime(0.04, t + 0.02)
      g.gain.linearRampToValueAtTime(0.0, t + 0.18)
      o.stop(t + 0.2)
      setTimeout(beat, 1600)
    }
    beat()
    return () => { cancel = true; ctx.close() }
  }, [audioOn, outcome])

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live auction</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            <span className="text-[var(--text-2)]">{yourAgent.name}</span> is bidding for you · cap ${cap}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleAudio}
            aria-pressed={audioOn}
            className="text-[var(--text-3)] hover:text-[var(--text-2)] cursor-pointer"
            title="Toggle heartbeat audio"
          >
            {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <Link to="/deploy" className="text-[12px] text-[var(--text-3)] hover:text-[var(--text-2)]">Reconfigure →</Link>
        </div>
      </div>

      {isColdVisit && !outcome && (
        <p className="text-[12px] text-[var(--text-3)] mb-3">
          You haven't commissioned an agent yet — this is a demo run with Sage. <Link to="/deploy" className="text-[var(--accent)] hover:opacity-80">Pick your own →</Link>
        </p>
      )}

      <div className={`${outcome ? '' : 'heartbeat'} rounded-lg ${outcome ? '' : 'p-px'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <HotelTarget hotel={hotel} msLeft={msLeft} />
            <BidLadder bids={bids} yourAgentId={agentId} />
          </div>
          <div className="space-y-4">
            <AgentThoughts thoughts={thoughts} />
            <BidTicker bids={bids} />
          </div>
        </div>
      </div>

      {outcome?.status === 'won' && (
        <WinMoment outcome={outcome} hotel={hotel} onReplay={replay} />
      )}
      {outcome?.status === 'lost' && (
        <LossPath outcome={outcome} hotel={hotel} capPrice={cap} agentName={yourAgent.name} />
      )}
    </div>
  )
}
