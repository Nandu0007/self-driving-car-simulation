import { useRef, useEffect } from 'react'
import type { SimState } from '../App'

function Speedometer({ speed, maxSpeed = 120 }: { speed: number, maxSpeed?: number }) {
  const pct = Math.min(speed / maxSpeed, 1)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const startAngle = 210
  const totalArc = 300 // degrees
  const strokeDash = (pct * totalArc / 360) * circumference

  const color = speed > 90 ? '#ff3355' : speed > 60 ? '#ffcc00' : '#00d4ff'

  return (
    <div className="speed-display">
      <svg className="speedometer-svg" width="130" height="80" viewBox="0 0 130 90">
        {/* Background arc */}
        <circle cx="65" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth="8" strokeDasharray={`${(totalArc / 360) * circumference} ${circumference}`}
          strokeDashoffset="0" strokeLinecap="round"
          transform={`rotate(${startAngle}, 65, 70)`} />
        {/* Value arc */}
        <circle cx="65" cy="70" r={radius} fill="none" stroke={color}
          strokeWidth="8" strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset="0" strokeLinecap="round"
          transform={`rotate(${startAngle}, 65, 70)`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 0.4s ease' }} />
        {/* Tick marks */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (startAngle + (i / 6) * totalArc) * Math.PI / 180
          const x1 = 65 + (radius - 6) * Math.cos(a)
          const y1 = 70 + (radius - 6) * Math.sin(a)
          const x2 = 65 + radius * Math.cos(a)
          const y2 = 70 + radius * Math.sin(a)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        })}
      </svg>
      <div className="speed-number" style={{ color, filter: speed > 0 ? `drop-shadow(0 0 12px ${color})` : 'none' }}>
        {speed}
      </div>
      <div className="speed-unit-label">KM/H</div>
    </div>
  )
}

export function TelemetryPanel({ simState }: { simState: SimState }) {
  const battColor = simState.battery < 20 ? '#ff3355' : simState.battery < 40 ? '#ffcc00' : '#00ff9d'
  const tempColor = simState.tempMotor > 80 ? '#ff3355' : simState.tempMotor > 65 ? '#ffcc00' : '#00d4ff'

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.05s' }}>
      <div className="panel-title">Telemetry</div>
      <Speedometer speed={simState.speed} />

      <div className="telemetry-grid" style={{ marginTop: 10 }}>
        {/* Gear */}
        <div className="telemetry-item">
          <div className="telemetry-label">Gear</div>
          <div className="telemetry-value" style={{ color: 'var(--accent-primary)' }}>
            {simState.driveMode === 'emergency' ? 'P' : `D${simState.gear}`}
          </div>
          <div className="telemetry-unit">Drive Mode</div>
        </div>
        {/* Range */}
        <div className="telemetry-item">
          <div className="telemetry-label">Range</div>
          <div className="telemetry-value" style={{ fontSize: 20, color: 'var(--accent-green)' }}>{simState.range}</div>
          <div className="telemetry-unit">km est.</div>
        </div>
        {/* Battery */}
        <div className="telemetry-item" style={{ gridColumn: 'span 2' }}>
          <div className="telemetry-label">Battery</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="telemetry-value" style={{ color: battColor, fontSize: 20 }}>{simState.battery}%</div>
            <div className="telemetry-unit">⚡ Charging Ready</div>
          </div>
          <div className="telemetry-bar-wrap">
            <div className="telemetry-bar-fill" style={{ width: `${simState.battery}%`, background: battColor, boxShadow: `0 0 8px ${battColor}` }} />
          </div>
        </div>
        {/* Motor Temp */}
        <div className="telemetry-item">
          <div className="telemetry-label">Motor Temp</div>
          <div className="telemetry-value" style={{ color: tempColor, fontSize: 18 }}>{simState.tempMotor}°</div>
          <div className="telemetry-bar-wrap">
            <div className="telemetry-bar-fill" style={{ width: `${(simState.tempMotor / 100) * 100}%`, background: tempColor }} />
          </div>
        </div>
        {/* Heading */}
        <div className="telemetry-item">
          <div className="telemetry-label">Heading</div>
          <div className="telemetry-value" style={{ fontSize: 18 }}>{simState.heading}°</div>
          <div className="telemetry-unit">
            {simState.heading < 45 || simState.heading > 315 ? 'N' : simState.heading < 135 ? 'E' : simState.heading < 225 ? 'S' : 'W'}
          </div>
        </div>
      </div>
    </div>
  )
}
