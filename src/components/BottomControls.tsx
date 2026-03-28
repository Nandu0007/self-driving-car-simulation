import type { SimState, DriveMode } from '../App'

export function BottomControls({ simState, onStateUpdate }: {
  simState: SimState
  onStateUpdate: (p: Partial<SimState>) => void
}) {
  const modes: { id: DriveMode, label: string, icon: string, danger?: boolean }[] = [
    { id: 'autonomous', label: 'Autonomous', icon: '🤖' },
    { id: 'manual', label: 'Manual Override', icon: '🕹️' },
    { id: 'emergency', label: 'Emergency Stop', icon: '🛑', danger: true },
  ]

  return (
    <div className="mode-selector" style={{ flex: 1 }}>
      {/* Live data strip */}
      <div className="glass-card" style={{ flex: 1, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 20 }}>
        {[
          { label: 'Top Speed', value: '127 km/h', color: 'var(--accent-primary)' },
          { label: 'Route ETA', value: '4.2 km', color: 'var(--accent-green)' },
          { label: 'Avg Speed', value: `${simState.speed} km/h`, color: 'var(--text-primary)' },
          { label: 'Incidents', value: '0', color: 'var(--accent-green)' },
          { label: 'AI Score', value: '98.7%', color: 'var(--accent-yellow)' },
          { label: 'Time', value: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), color: 'var(--text-secondary)' },
        ].map(stat => (
          <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mode buttons */}
      {modes.map(m => (
        <button key={m.id} className={`mode-btn ${simState.driveMode === m.id ? 'active' : ''} ${m.danger ? 'danger' : ''}`}
          onClick={() => onStateUpdate({ driveMode: m.id })}>
          <div>{m.icon}</div>
          <div style={{ marginTop: 2 }}>{m.label}</div>
        </button>
      ))}
    </div>
  )
}
