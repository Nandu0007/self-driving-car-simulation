import { useRef, useEffect } from 'react'
import { Battery, Signal, Navigation, Camera, AlertTriangle, Layers, Maximize } from 'lucide-react'
import type { SimState } from '../App'

export function HeaderBar({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  const uptimeRef = useRef(0)
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const id = setInterval(() => {
      uptimeRef.current++
      if (displayRef.current) {
        const h = String(Math.floor(uptimeRef.current / 3600)).padStart(2, '0')
        const m = String(Math.floor((uptimeRef.current % 3600) / 60)).padStart(2, '0')
        const s = String(uptimeRef.current % 60).padStart(2, '0')
        displayRef.current.textContent = `${h}:${m}:${s}`
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const modeColor: Record<string, string> = {
    autonomous: 'var(--accent-green)',
    manual: 'var(--accent-yellow)',
    emergency: 'var(--accent-red)',
  }

  return (
    <div className="header-bar" style={{ position: 'relative', zIndex: 10 }}>
      <div className="header-logo">
        <div className="header-logo-icon">🚗</div>
        <div>
          <span className="header-logo-text">AutoDrive AI</span>
          <span className="header-logo-sub">Self-Driving Simulation Platform v4.2.1</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Mode badge */}
        <div style={{
          padding: '4px 14px', borderRadius: 20, border: `1px solid ${modeColor[simState.driveMode]}`,
          background: `${modeColor[simState.driveMode]}18`, color: modeColor[simState.driveMode],
          fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase'
        }}>
          {simState.driveMode === 'autonomous' ? '⚡ AUTONOMOUS' : simState.driveMode === 'manual' ? '🕹️ MANUAL' : '🛑 EMERGENCY STOP'}
        </div>

        {/* GPS */}
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          GPS {simState.gpsLat.toFixed(4)}°N {simState.gpsLon.toFixed(4)}°W
        </div>

        {/* Uptime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="status-dot" />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
            SYS ONLINE
          </span>
          <span ref={displayRef} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            00:00:00
          </span>
        </div>
      </div>

      <div className="header-controls">
        <div className="status-item" onClick={() => {
          const modes = ['third-person', 'cockpit', 'depth', 'segmentation', 'semantic', 'surround'] as const
          const next = modes[(modes.indexOf(simState.viewMode as any) + 1) % modes.length]
          onStateUpdate({ viewMode: next })
        }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {simState.viewMode === 'third-person' && <Camera size={14} />}
          {simState.viewMode === 'cockpit' && <Navigation size={14} />}
          {simState.viewMode === 'depth' && <Layers size={14} />}
          {simState.viewMode === 'segmentation' && <Maximize size={14} />}
          {simState.viewMode === 'semantic' && <Layers size={14} />}
          {simState.viewMode === 'surround' && <Camera size={14} />}
          <span style={{ fontSize: 10, textTransform: 'uppercase' }}>{simState.viewMode}</span>
        </div>
        <button className="icon-btn" title="Settings" style={{ fontSize: 14 }}>⚙️</button>
        <button className="icon-btn" title="Fullscreen" style={{ fontSize: 14 }}>⛶</button>
      </div>
    </div>
  )
}
