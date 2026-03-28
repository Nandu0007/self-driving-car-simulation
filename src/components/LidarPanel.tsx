import { useRef, useEffect } from 'react'
import type { SimState } from '../App'

export function LidarPanel({ simState }: { simState: SimState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef<number>(0)
  const animRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const maxR = W / 2 - 6

    function draw() {
      animRef.current = requestAnimationFrame(draw)
      angleRef.current += 0.04
      const angle = angleRef.current

      // Fade trail
      ctx.fillStyle = 'rgba(0, 8, 4, 0.25)'
      ctx.fillRect(0, 0, W, H)

      // Rings
      ctx.strokeStyle = 'rgba(0,255,100,0.10)'
      ctx.lineWidth = 0.8
      ;[0.25, 0.5, 0.75, 1.0].forEach(f => {
        ctx.beginPath()
        ctx.arc(cx, cy, maxR * f, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Crosshairs
      ctx.strokeStyle = 'rgba(0,255,100,0.08)'
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()

      // Sweep gradient
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      const sweepGrad = ctx.createLinearGradient(0, 0, maxR, 0)
      sweepGrad.addColorStop(0, 'rgba(0,255,100,0.35)')
      sweepGrad.addColorStop(1, 'rgba(0,255,100,0)')
      ctx.fillStyle = sweepGrad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, maxR, -Math.PI / 6, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Sweep line
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#00ff88'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Detected blips
      simState.detectedObjects.forEach((obj, i) => {
        const r = Math.min((obj.distance / 60) * maxR, maxR - 4)
        const a = (obj.angle * Math.PI / 180) + (i * 0.2)
        const bx = cx + Math.cos(a) * r
        const by = cy + Math.sin(a) * r

        const blipColor = obj.type === 'pedestrian' ? '#ffcc00' : obj.type === 'car' ? '#ff4466' : '#00aaff'
        const blipAlpha = 0.4 + 0.6 * ((angle % (Math.PI * 2)) < (a % (Math.PI * 2)) + 0.3 && (angle % (Math.PI * 2)) > (a % (Math.PI * 2)) - 0.5 ? 1 : 0.5)

        ctx.globalAlpha = blipAlpha
        ctx.fillStyle = blipColor
        ctx.shadowColor = blipColor
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(bx, by, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        // Type label
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '7px monospace'
        ctx.fillText(obj.type.slice(0, 3).toUpperCase(), bx + 6, by - 4)
      })

      // Car blip center
      ctx.fillStyle = '#00d4ff'
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(cx, cy, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Range rings labels
      ctx.fillStyle = 'rgba(0,255,100,0.3)'
      ctx.font = '7px monospace'
      ;[15, 30, 45, 60].forEach((m, i) => {
        ctx.fillText(`${m}m`, cx + 3, cy - maxR * (i + 1) / 4 + 4)
      })
    }

    draw()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [simState.detectedObjects])

  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="panel-title">LiDAR — Radar View</div>
      <canvas ref={canvasRef} className="lidar-canvas" width={220} height={220}
        style={{ imageRendering: 'pixelated' }} />
    </div>
  )
}
