import { useState, useEffect } from 'react'
import type { SimState } from '../App'

interface HealthMetric {
  label: string
  value: number
  unit: string
  color: string
  warn: number
}

export function SystemHealthPanel({ simState }: { simState: SimState }) {
  const [cpu, setCpu] = useState(simState.cpuLoad)
  const [gpu, setGpu] = useState(62)
  const [ram, setRam] = useState(47)
  const [net, setNet] = useState(12)

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(prev => Math.max(10, Math.min(99, prev + (Math.random() - 0.5) * 8)))
      setGpu(prev => Math.max(30, Math.min(99, prev + (Math.random() - 0.5) * 6)))
      setRam(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 4)))
      setNet(prev => Math.max(2, Math.min(50, prev + (Math.random() - 0.5) * 5)))
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const metrics: HealthMetric[] = [
    { label: 'CPU', value: Math.round(cpu), unit: '%', color: cpu > 80 ? '#ff3355' : '#00d4ff', warn: 80 },
    { label: 'GPU', value: Math.round(gpu), unit: '%', color: gpu > 85 ? '#ff3355' : '#a855f7', warn: 85 },
    { label: 'RAM', value: Math.round(ram), unit: '%', color: ram > 80 ? '#ffcc00' : '#00ff9d', warn: 80 },
    { label: 'NET I/O', value: Math.round(net), unit: 'Mb/s', color: '#ffcc00', warn: 45 },
  ]

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="panel-title">System Health</div>
      {metrics.map(m => (
        <div key={m.label} className="stat-bar-row">
          <div className="stat-bar-header">
            <span className="stat-bar-label">{m.label}</span>
            <span className="stat-bar-val" style={{ color: m.color }}>{m.value}{m.unit}</span>
          </div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{
              width: `${Math.min(m.value / (m.unit === 'Mb/s' ? 50 : 100) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${m.color}99, ${m.color})`,
              boxShadow: `0 0 6px ${m.color}66`,
            }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
        <span>AutoDrive AI v4.2.1</span>
        <span style={{ color: 'var(--accent-green)' }}>● All Systems OK</span>
      </div>
    </div>
  )
}
