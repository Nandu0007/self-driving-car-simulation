import type { SimState } from '../App'

export function V2XPanel({ simState }: { simState: SimState }) {
  if (!simState.v2xData) {
    return (
        <div className="glass-card fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="panel-title">V2X System (V2I)</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>No active V2X broadcasts in range</div>
        </div>
    )
  }

  const { phase, timeToChange } = simState.v2xData
  const v2xColor = phase === 'red' ? '#ff3344' : phase === 'green' ? '#00ff88' : '#ffcc00'

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="panel-title">V2X System (V2I)</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Intersection: <span style={{ color: '#00d4ff'}}>INT-42</span></div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ 
          width: 24, height: 24, borderRadius: '50%', background: v2xColor,
          boxShadow: `0 0 10px ${v2xColor}`, border: '2px solid rgba(255,255,255,0.2)' 
        }} />
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Phase</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: v2xColor }}>{phase.toUpperCase()}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Timer</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)' }}>{timeToChange.toFixed(1)}s</div>
        </div>
      </div>
    </div>
  )
}
