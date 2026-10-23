import { useEffect, useState } from 'react'

export const tone = (v) => (v >= 75 ? 'good' : v >= 50 ? 'warn' : 'bad')
const COLORS = { good: '#34d399', warn: '#fbbf24', bad: '#fb7185' }

export function ScoreRing({ value = 0, size = 168, label }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setV(value), 80)
    return () => clearTimeout(t)
  }, [value])
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  const color = COLORS[tone(value)]
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.09)" strokeWidth="11" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="11" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)', filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: size * 0.3, fontWeight: 800, lineHeight: 1, color }}>{Math.round(v)}</div>
          {label && <div className="muted small" style={{ marginTop: 4 }}>{label}</div>}
        </div>
      </div>
    </div>
  )
}
