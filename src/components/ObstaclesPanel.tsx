import type { SimState } from '../App'

const TYPE_ICONS: Record<string, string> = {
  car: '🚗',
  pedestrian: '🚶',
  cyclist: '🚲',
  traffic_light: '🚦',
  stop_sign: '🛑',
}

export function ObstaclesPanel({ simState }: { simState: SimState }) {
  const allClear = simState.detectedObjects.length === 0

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="panel-title">Object Detection</div>

      {allClear ? (
        <div className="obstacle-tag clear">
          <span>✅</span>
          <span>All clear — no obstacles detected</span>
        </div>
      ) : (
        simState.detectedObjects.map(obj => {
          const isClose = obj.distance < 25
          return (
            <div key={obj.id} className={`obstacle-tag ${isClose ? '' : 'clear'}`}
              style={isClose ? { borderColor: 'rgba(255,51,85,0.25)', background: 'rgba(255,51,85,0.05)', color: 'var(--accent-red)' } : {}}>
              <span>{TYPE_ICONS[obj.type] || '⬛'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', fontFamily: 'var(--font-mono)' }}>
                  {obj.type.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                  {obj.distance.toFixed(1)}m · {obj.angle > 0 ? `${obj.angle}° R` : `${Math.abs(obj.angle)}° L`}
                </div>
              </div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: obj.confidence > 90 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                {obj.confidence}%
              </div>
            </div>
          )
        })
      )}

      {/* Detection stats */}
      <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {[
          { label: 'Detected', val: simState.detectedObjects.length },
          { label: 'Avg Conf', val: simState.detectedObjects.length > 0 ? `${Math.round(simState.detectedObjects.reduce((s, o) => s + o.confidence, 0) / simState.detectedObjects.length)}%` : 'N/A' },
          { label: 'FPS', val: '30' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>{stat.val}</div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
