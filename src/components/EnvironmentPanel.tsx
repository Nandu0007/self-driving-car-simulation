import type { SimState, Weather } from '../App'

interface ToggleProps {
  label: string
  icon: string
  on: boolean
  onChange: (v: boolean) => void
}

function Toggle({ label, icon, on, onChange }: ToggleProps) {
  return (
    <div className="env-toggle-row">
      <div className="env-label">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <label className={`toggle-switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
        <div className="toggle-track" />
        <div className="toggle-thumb" />
      </label>
    </div>
  )
}

export function EnvironmentPanel({ simState, onStateUpdate }: {
  simState: SimState
  onStateUpdate: (p: Partial<SimState>) => void
}) {
  const setWeather = (w: Weather) => {
    onStateUpdate({
      weather: w,
      isRaining: w === 'rain',
      foggy: w === 'fog',
    })
  }

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.25s' }}>
      <div className="panel-title">Environment</div>
      <div className="env-controls">
        <Toggle label="Night Mode" icon="🌙" on={simState.timeOfDay === 'night'}
          onChange={v => onStateUpdate({ timeOfDay: v ? 'night' : 'day' })} />
        <Toggle label="Rain" icon="🌧️" on={simState.isRaining}
          onChange={v => setWeather(v ? 'rain' : 'clear')} />
        <Toggle label="Fog" icon="🌫️" on={simState.foggy}
          onChange={v => setWeather(v ? 'fog' : 'clear')} />
        <Toggle label="Headlights" icon="💡" on={simState.timeOfDay === 'night'}
          onChange={v => onStateUpdate({ timeOfDay: v ? 'night' : 'day' })} />

        {/* Weather quick-select */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {(['clear', 'rain', 'fog'] as Weather[]).map(w => (
            <button key={w} onClick={() => setWeather(w)}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, border: `1px solid ${simState.weather === w ? 'var(--border-bright)' : 'var(--border)'}`,
                background: simState.weather === w ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: simState.weather === w ? 'var(--accent-primary)' : 'var(--text-dim)',
                fontSize: 9, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: 1, transition: 'all 0.2s',
              }}>
              {w === 'clear' ? '☀️' : w === 'rain' ? '🌧️' : '🌫️'} {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
