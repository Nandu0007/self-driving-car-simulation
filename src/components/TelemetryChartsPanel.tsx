import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SimState } from '../App'

export function TelemetryChartsPanel({ telemetryBuffer, simState }: { telemetryBuffer: SimState[], simState: SimState }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Only update the chart chart 5 times a second to save performance, 
    // sampling every 30th frame from the buffer for a 60-second window
    const interval = setInterval(() => {
      if (telemetryBuffer.length === 0) return
      
      const sampled = []
      // Sample 60 points (1 per second roughly)
      const step = Math.max(1, Math.floor(telemetryBuffer.length / 60))
      for (let i = 0; i < telemetryBuffer.length; i += step) {
        const s = telemetryBuffer[i]
        sampled.push({
          time: i,
          speed: s.speed,
          targetSpeed: s.driveMode === 'manual' || s.driveMode === 'emergency' ? 0 : 52, // Mock target
          steering: s.heading
        })
      }
      setData(sampled)
    }, 200)

    return () => clearInterval(interval)
  }, [telemetryBuffer])

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="panel-title">LIVE TELEMETRY (60s)</div>
      
      <div style={{ height: 100, width: '100%', marginTop: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 140]} hide />
            <Tooltip 
              contentStyle={{ background: 'rgba(5, 12, 18, 0.9)', border: '1px solid #00d4ff', fontSize: 10, borderRadius: 4 }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="speed" stroke="#00d4ff" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="targetSpeed" stroke="rgba(255, 255, 255, 0.3)" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: 'var(--text-dim)' }}>HIL Processing Latency</div>
        <div style={{ color: simState.latencyMs > 20 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
          {simState.latencyMs.toFixed(1)} ms
        </div>
      </div>
    </div>
  )
}
