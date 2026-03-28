import type { SimState } from '../App'

const SENSORS = [
  { name: 'LiDAR 360°', status: 'active' as const },
  { name: 'Camera F', status: 'active' as const },
  { name: 'Camera R', status: 'active' as const },
  { name: 'Camera L', status: 'active' as const },
  { name: 'Radar Front', status: 'active' as const },
  { name: 'Radar Rear', status: 'active' as const },
  { name: 'Ultrasonic', status: 'active' as const },
  { name: 'GPS RTK', status: 'active' as const },
  { name: 'IMU', status: 'active' as const },
  { name: 'Odometry', status: 'active' as const },
]

export function SensorsPanel({ simState }: { simState: SimState }) {
  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="panel-title">Active Sensors</div>
      <div className="sensors-grid">
        {SENSORS.map(s => (
          <div key={s.name} className="sensor-item">
            <div className={`sensor-dot ${s.status}`} />
            <span className="sensor-name">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
