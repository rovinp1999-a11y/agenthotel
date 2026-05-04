/**
 * Geometric SVG mark for an agent. No AI-generated faces — just shapes.
 *
 * Props:
 * - id: 'hawk' | 'sage' | 'owl' | rival id (anything else)
 * - color: hex (overrides default)
 * - size: px (default 40)
 */
export default function AgentAvatar({ id, color, size = 40 }) {
  const stroke = color || '#A8A29E'
  const props = { width: size, height: size, viewBox: '0 0 40 40', fill: 'none' }

  if (id === 'hawk') {
    // Sharp triangular dive
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <path d="M10 14 L20 26 L30 14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="1.5" fill={stroke} />
      </svg>
    )
  }
  if (id === 'sage') {
    // Balanced horizontal — two stacked lines
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="10" y1="17" x2="30" y2="17" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="23" x2="26" y2="23" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'owl') {
    // Patient — concentric arcs
    return (
      <svg {...props} aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <circle cx="20" cy="20" r="10" stroke={stroke} strokeWidth="1.5" />
        <circle cx="20" cy="20" r="4"  stroke={stroke} strokeWidth="1.5" />
      </svg>
    )
  }
  // Rival default — single dot in a ring
  return (
    <svg {...props} aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
      <circle cx="20" cy="20" r="3" fill={stroke} opacity="0.7" />
    </svg>
  )
}
