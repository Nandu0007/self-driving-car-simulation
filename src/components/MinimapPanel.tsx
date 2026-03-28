import { useRef, useEffect } from 'react'
import type { SimState } from '../App'

export function MinimapPanel({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scale = canvas.width / 100
    const worldX = (x - canvas.width / 2) / scale
    const worldZ = (y - canvas.height / 2) / scale
    onStateUpdate({ targetDestination: { x: worldX, z: worldZ } })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width
    const H = canvas.height
    const scale = W / 100  // world units [-50,50] => canvas [0,W]
    const toX = (x: number) => W / 2 + x * scale
    const toY = (z: number) => H / 2 + z * scale

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#04100a'
    ctx.fillRect(0, 0, W, H)

    // Road ring
    ctx.strokeStyle = '#1a2a1a'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 30, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#223322'
    ctx.lineWidth = 16
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 30, 0, Math.PI * 2)
    ctx.stroke()

    // Route path glowing
    ctx.strokeStyle = 'rgba(0,212,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 4
      if (i === 0) ctx.moveTo(W/2 + Math.sin(0)*30, H/2 + Math.cos(0)*30)
      ctx.lineTo(toX(Math.sin(t) * 30), toY(Math.cos(t) * 30))
    }
    ctx.stroke()

    // Traffic cars
    const traffics = [{ x: -24, z: 18, color: '#8B0000' }, { x: 22, z: -15, color: '#003366' }, { x: -18, z: -25, color: '#1a3a1a' }]
    traffics.forEach(t => {
      ctx.fillStyle = t.color
      ctx.beginPath()
      ctx.arc(toX(t.x), toY(t.z), 2, 0, Math.PI * 2)
      ctx.fill()
    })

    // Ego car
    const ex = toX(simState.carX)
    const ez = toY(simState.carZ)
    ctx.save()
    ctx.translate(ex, ez)
    ctx.rotate(simState.carRotY)
    ctx.fillStyle = '#00d4ff'
    ctx.shadowColor = '#00d4ff'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(0, -5)
    ctx.lineTo(3, 3)
    ctx.lineTo(-3, 3)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()

    // Detected objects
    simState.detectedObjects.forEach(obj => {
      const angle = obj.angle * Math.PI / 180 + simState.carRotY
      const ox = simState.carX + Math.cos(angle) * obj.distance
      const oz = simState.carZ + Math.sin(angle) * obj.distance
      const color = obj.type === 'pedestrian' ? '#ffcc00' : '#ff4466'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(toX(ox), toY(oz), 2.5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Target Destination Pin
    if (simState.targetDestination) {
      const tx = toX(simState.targetDestination.x)
      const tz = toY(simState.targetDestination.z)
      ctx.fillStyle = '#00ff9d'
      ctx.shadowColor = '#00ff9d'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(tx, tz, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Dashed line from car to target
      ctx.strokeStyle = 'rgba(0,255,157,0.4)'
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(ex, ez)
      ctx.lineTo(tx, tz)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Compass
    ctx.fillStyle = 'rgba(0,212,255,0.6)'
    ctx.font = '8px monospace'
    ctx.fillText('N', W / 2 - 3, 10)
    ctx.fillText('S', W / 2 - 3, H - 3)
    ctx.fillText('W', 2, H / 2 + 3)
    ctx.fillText('E', W - 9, H / 2 + 3)
  }, [simState.carX, simState.carZ, simState.carRotY, simState.detectedObjects, simState.targetDestination])

  return (
    <div className="glass-card" style={{ width: 140, flexShrink: 0, alignSelf: 'flex-end', cursor: 'crosshair' }} title="Click map to set destination">
      <div className="panel-title" style={{ marginBottom: 6 }}>Minimap</div>
      <canvas ref={canvasRef} onClick={handleClick} width={116} height={100} style={{ width: '100%', borderRadius: 6, background: '#04100a' }} />
    </div>
  )
}
