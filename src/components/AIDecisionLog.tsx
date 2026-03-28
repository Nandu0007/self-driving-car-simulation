import { useState, useEffect, useRef } from 'react'
import type { SimState } from '../App'

interface LogEntry {
  id: number
  icon: string
  message: string
  time: string
  level: 'info' | 'warn' | 'alert'
}

const AI_MESSAGES = [
  { icon: '🚗', message: 'Lane keeping active — maintaining center.', level: 'info' as const },
  { icon: '⚠️', message: 'Vehicle detected at 24.5m — reducing speed.', level: 'warn' as const },
  { icon: '🚶', message: 'Pedestrian at 42m on right — monitoring.', level: 'warn' as const },
  { icon: '🟢', message: 'Traffic light green — proceeding at 52 km/h.', level: 'info' as const },
  { icon: '📡', message: 'LiDAR scan complete — 512 points processed.', level: 'info' as const },
  { icon: '🔮', message: 'Path prediction updated — 99.2% confidence.', level: 'info' as const },
  { icon: '🌧️', message: 'Rain detected — traction compensation ON.', level: 'warn' as const },
  { icon: '🛣️', message: 'Switching lane — checking blind spot clear.', level: 'info' as const },
  { icon: '🔴', message: 'Stop sign detected at 30m — braking.', level: 'alert' as const },
  { icon: '📍', message: 'GPS waypoint reached — calculating next.', level: 'info' as const },
  { icon: '⚡', message: 'Regen braking active — recovering energy.', level: 'info' as const },
  { icon: '🧠', message: 'Neural net inference: 4.2ms latency.', level: 'info' as const },
  { icon: '🚦', message: 'Traffic light state: RED predicted in 3s.', level: 'warn' as const },
  { icon: '✅', message: 'Intersection cleared — resuming cruise.', level: 'info' as const },
  { icon: '🌫️', message: 'Low visibility — engaged fog sensors.', level: 'warn' as const },
]

export function AIDecisionLog({ simState }: { simState: SimState }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const counterRef = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const addLog = () => {
      const msg = AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)]
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
      const entry: LogEntry = { id: counterRef.current++, icon: msg.icon, message: msg.message, time, level: msg.level }
      setLogs(prev => [entry, ...prev].slice(0, 12))
    }

    addLog()
    const id = setInterval(addLog, 2800)
    return () => clearInterval(id)
  }, [])

  const levelColor = { info: 'var(--text-secondary)', warn: 'var(--accent-yellow)', alert: 'var(--accent-red)' }

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.2s', flex: 1 }}>
      <div className="panel-title">AI Decision Log</div>
      <div className="ai-log-list" ref={listRef}>
        {logs.map(log => (
          <div key={log.id} className="ai-log-entry"
            style={{ borderColor: log.level !== 'info' ? `${levelColor[log.level]}30` : undefined }}>
            <span className="ai-log-icon">{log.icon}</span>
            <span className="ai-log-text" style={{ color: levelColor[log.level] }}>{log.message}</span>
            <span className="ai-log-time">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
