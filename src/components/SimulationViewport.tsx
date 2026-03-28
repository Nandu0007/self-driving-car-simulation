import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Sky, Stars, ContactShadows, Html, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, Glitch } from '@react-three/postprocessing'
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import type { SimState } from '../App'

function SceneMaterials({ viewMode }: { viewMode: string }) {
  const { scene } = useThree()
  useEffect(() => {
    if (viewMode === 'depth') {
      scene.overrideMaterial = new THREE.MeshDepthMaterial()
    } else if (viewMode === 'segmentation') {
      scene.overrideMaterial = new THREE.MeshNormalMaterial() // Simulates clustered segmentation coloring
    } else if (viewMode === 'semantic') {
      scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: '#00d4ff', wireframe: true, transparent: true, opacity: 0.15 })
    } else {
      scene.overrideMaterial = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])
  return null
}

// ---- Car Model ----
function CarModel({ rotY }: { rotY: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotY, delta * 3)
    }
  })

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: '#0a1628',
    metalness: 0.9,
    roughness: 0.1,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  })

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#88ccff',
    metalness: 0,
    roughness: 0,
    transmission: 0.85,
    opacity: 0.5,
    transparent: true,
  })

  const wheelMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.8, metalness: 0.2 })
  const rimMat = new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 1, roughness: 0.1 })
  const lightMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 2 })
  const redLightMat = new THREE.MeshStandardMaterial({ color: '#ff2244', emissive: '#ff2244', emissiveIntensity: 3 })
  const accentMat = new THREE.MeshStandardMaterial({ color: '#00d4ff', emissive: '#00d4ff', emissiveIntensity: 1.5 })

  return (
    <group ref={group}>
      {/* Main body */}
      <mesh castShadow receiveShadow material={bodyMat} position={[0, 0.38, 0]}>
        <boxGeometry args={[2, 0.45, 4.5]} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow material={bodyMat} position={[0, 0.82, -0.1]}>
        <boxGeometry args={[1.7, 0.5, 2.2]} />
      </mesh>
      {/* Windshield front */}
      <mesh material={glassMat} position={[0, 0.82, 0.98]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.6, 0.48, 0.04]} />
      </mesh>
      {/* Windshield rear */}
      <mesh material={glassMat} position={[0, 0.82, -1.18]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.6, 0.44, 0.04]} />
      </mesh>
      {/* Side windows left */}
      <mesh material={glassMat} position={[-0.86, 0.82, -0.1]}>
        <boxGeometry args={[0.04, 0.4, 1.8]} />
      </mesh>
      {/* Side windows right */}
      <mesh material={glassMat} position={[0.86, 0.82, -0.1]}>
        <boxGeometry args={[0.04, 0.4, 1.8]} />
      </mesh>

      {/* Wheels */}
      {[[-0.95, 0.18, 1.35], [0.95, 0.18, 1.35], [-0.95, 0.18, -1.35], [0.95, 0.18, -1.35]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={wheelMat} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 32]} />
          </mesh>
          <mesh material={rimMat} position={[0, x > 0 ? 0.12 : -0.12, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
          </mesh>
          {/* Spokes */}
          {[0, 1, 2, 3, 4].map(j => (
            <mesh key={j} material={rimMat} rotation={[0, (j * Math.PI * 2) / 5, 0]} position={[0, x > 0 ? 0.12 : -0.12, 0]}>
              <boxGeometry args={[0.04, 0.04, 0.38]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Headlights */}
      <mesh material={lightMat} position={[-0.6, 0.42, 2.26]}>
        <boxGeometry args={[0.35, 0.12, 0.06]} />
      </mesh>
      <mesh material={lightMat} position={[0.6, 0.42, 2.26]}>
        <boxGeometry args={[0.35, 0.12, 0.06]} />
      </mesh>
      {/* DRL strips */}
      <mesh material={accentMat} position={[0, 0.28, 2.26]}>
        <boxGeometry args={[1.6, 0.04, 0.04]} />
      </mesh>

      {/* Taillights */}
      <mesh material={redLightMat} position={[-0.6, 0.42, -2.26]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
      </mesh>
      <mesh material={redLightMat} position={[0.6, 0.42, -2.26]}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
      </mesh>
      <mesh material={redLightMat} position={[0, 0.3, -2.26]}>
        <boxGeometry args={[1.6, 0.04, 0.04]} />
      </mesh>

      {/* Underglow accent */}
      <mesh material={accentMat} position={[0, 0.04, 0]}>
        <boxGeometry args={[2.1, 0.02, 4.6]} />
      </mesh>

      {/* Headlight point lights */}
      <pointLight position={[-0.6, 0.45, 2.5]} color="#ffffff" intensity={8} distance={18} castShadow />
      <pointLight position={[0.6, 0.45, 2.5]} color="#ffffff" intensity={8} distance={18} castShadow />
      <pointLight position={[0, 0.04, 0]} color="#00d4ff" intensity={1.5} distance={4} />
    </group>
  )
}

// ---- AI Route Path helper ----
function RoutePath() {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * Math.PI * 4
    points.push(new THREE.Vector3(Math.sin(t) * 30, 0.02, Math.cos(t) * 30))
  }
  const curve = new THREE.CatmullRomCurve3(points, true)
  const tubePoints = curve.getPoints(300)
  const geometry = new THREE.BufferGeometry().setFromPoints(tubePoints)
  const mat = new THREE.LineBasicMaterial({ color: '#00d4ff', opacity: 0.4, transparent: true })
  const lineObj = new THREE.Line(geometry, mat)
  return <primitive object={lineObj} />
}

// ---- Other cars on road + 3D Tracking Boxes ----
function TrafficCar({ startProgress, laneOffset, speed, color, type, simState }: { startProgress: number, laneOffset: number, speed: number, color: string, type: string, simState: SimState }) {
  const rb = useRef<RapierRigidBody>(null)
  const progressRef = useRef(startProgress)
  const posRef = useRef([0,0,0])
  
  const curve = useMemo(() => new THREE.CatmullRomCurve3(
    Array.from({ length: 200 }, (_, i) => {
      const t = (i / 200) * Math.PI * 4
      return new THREE.Vector3(Math.sin(t) * 30, 0, Math.cos(t) * 30)
    }), true
  ), [])

  useFrame((_, delta) => {
    if (!rb.current || simState.isReplaying) return
    
    progressRef.current = (progressRef.current + delta * (speed / 370)) % 1
    const point = curve.getPoint(progressRef.current)
    const tangent = curve.getTangent(progressRef.current)
    const angle = Math.atan2(tangent.x, tangent.z)

    const tx = point.x + Math.cos(angle) * laneOffset
    const tz = point.z - Math.sin(angle) * laneOffset
    
    posRef.current = [tx, 0.35, tz]
    rb.current.setNextKinematicTranslation({ x: tx, y: 0.35, z: tz })
    rb.current.setNextKinematicRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle))
  })

  // Dynamic distance calculation for HUD
  const distToEgo = Math.sqrt(Math.pow(posRef.current[0] - simState.carX, 2) + Math.pow(posRef.current[2] - simState.carZ, 2)).toFixed(1)

  const mat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.7, roughness: 0.2, clearcoat: 0.8 })
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#111' })

  // Prediction Intent Curve
  const predictionPoints = useMemo(() => {
    const pts = []
    for(let i=0; i<15; i++) {
      const p = (startProgress + (i*0.003)) % 1
      const pt = curve.getPoint(p)
      const tang = curve.getTangent(p)
      const a = Math.atan2(tang.x, tang.z)
      const tx = pt.x + Math.cos(a) * laneOffset
      const tz = pt.z - Math.sin(a) * laneOffset
      pts.push(new THREE.Vector3(tx, 0.35, tz))
    }
    return pts
  }, [curve, laneOffset, startProgress])

  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders="cuboid" position={[0,-10,0]}>
      {/* 3D Hardware Tracking Box Overlay */}
      <Html position={[0, 1.8, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
        <div style={{
          border: '2px solid rgba(0,255,100,0.8)', background: 'rgba(0,40,20,0.6)',
          padding: '4px 8px', borderRadius: '4px', color: '#00ff9d',
          fontFamily: 'monospace', fontSize: '10px', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 'bold' }}>{type.toUpperCase()}</div>
          <div>{distToEgo}m | 98%</div>
        </div>
      </Html>

      <mesh castShadow receiveShadow material={mat} position={[0, 0.35, 0]}>
        <boxGeometry args={[1.8, 0.4, 4]} />
      </mesh>
      <mesh castShadow material={mat} position={[0, 0.7, -0.2]}>
        <boxGeometry args={[1.55, 0.38, 1.9]} />
      </mesh>
      {[[-0.88, 0.18, 1.2], [0.88, 0.18, 1.2], [-0.88, 0.18, -1.2], [0.88, 0.18, -1.2]].map(([x, y, z], i) => (
        <mesh key={i} material={wheelMat} position={[x, y, z]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 24]} />
        </mesh>
      ))}

      {/* Trajectory Prediction Glow Line */}
      <group position={[0, -0.35, 0]}>
        <Line points={predictionPoints.map(p => [p.x - posRef.current[0], 0.1, p.z - posRef.current[2]])} 
              color={type === 'aggressive_agent' ? "#ff0044" : "#00ff88"} 
              lineWidth={3} 
              transparent 
              opacity={0.6} />
      </group>
    </RigidBody>
  )
}

// ---- Buildings ----
function CityBlock() {
  const buildings = [
    { pos: [-30, 8, -30] as [number,number,number], size: [8, 16, 8] as [number,number,number], color: '#0a1a2e' },
    { pos: [-45, 12, -15] as [number,number,number], size: [10, 24, 10] as [number,number,number], color: '#071420' },
    { pos: [-20, 6, -45] as [number,number,number], size: [7, 12, 7] as [number,number,number], color: '#0d1f30' },
    { pos: [35, 10, -30] as [number,number,number], size: [9, 20, 9] as [number,number,number], color: '#0a1a2e' },
    { pos: [50, 14, -18] as [number,number,number], size: [11, 28, 11] as [number,number,number], color: '#071420' },
    { pos: [28, 7, -50] as [number,number,number], size: [8, 14, 8] as [number,number,number], color: '#0d1f30' },
    { pos: [-35, 9, 35] as [number,number,number], size: [9, 18, 9] as [number,number,number], color: '#0b1c2f' },
    { pos: [40, 11, 42] as [number,number,number], size: [10, 22, 10] as [number,number,number], color: '#071420' },
    { pos: [0, 15, -60] as [number,number,number], size: [12, 30, 12] as [number,number,number], color: '#060f1a' },
    { pos: [-55, 8, 5] as [number,number,number], size: [8, 16, 8] as [number,number,number], color: '#0a1826' },
  ]

  return (
    <>
      {buildings.map((b, i) => {
        const mat = new THREE.MeshPhysicalMaterial({
          color: b.color,
          metalness: 0.1, roughness: 0.8, emissive: '#001833', emissiveIntensity: 0.08
        })
        // Random lit windows
        const windowMat = new THREE.MeshStandardMaterial({ color: '#ffee88', emissive: '#ffdd44', emissiveIntensity: 1.5, transparent: true, opacity: 0.7 })
        return (
          <RigidBody key={i} type="fixed" colliders="cuboid" position={b.pos}>
            <mesh castShadow receiveShadow material={mat}>
              <boxGeometry args={b.size} />
            </mesh>
            {/* Window lights rows */}
            {Array.from({ length: Math.floor(b.size[1] / 4) }).map((_, floor) =>
              Array.from({ length: 3 }).map((__, col) => (
                Math.random() > 0.35 ? (
                  <mesh key={`${i}-${floor}-${col}`} material={windowMat}
                    position={[
                      -b.size[0] / 2 + b.size[0] * ((col + 1) / 4),
                      -b.size[1] / 2 + floor * 4 + 2,
                      b.size[2] / 2 + 0.05
                    ]}>
                    <boxGeometry args={[0.8, 0.6, 0.05]} />
                  </mesh>
                ) : null
              ))
            )}
          </RigidBody>
        )
      })}
    </>
  )
}

// ---- Road & Markings ----
function Road() {
  const roadMat = new THREE.MeshStandardMaterial({ color: '#111418', roughness: 0.92, metalness: 0.05 })
  const dashMat = new THREE.MeshStandardMaterial({ color: '#ffee00', emissive: '#ffee00', emissiveIntensity: 0.5, transparent: true, opacity: 0.8 })
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#1a1e24', roughness: 0.95 })

  return (
    <group>
      {/* Main road loop — large flat box */}
      <mesh receiveShadow material={roadMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[80, 128]} />
      </mesh>
      {/* Road surface top (slightly elevated) */}
      <mesh receiveShadow material={roadMat} position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[18, 40, 128]} />
      </mesh>

      {/* Center island */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#0d1c10" roughness={1} />
      </mesh>

      {/* Sidewalks */}
      <mesh receiveShadow material={sidewalkMat} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[40, 46, 128]} />
      </mesh>

      {/* Lane center dashes */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2
        const r = 29
        return (
          <mesh key={i} material={dashMat} position={[Math.cos(angle) * r, 0.03, Math.sin(angle) * r]}
            rotation={[-Math.PI/2, 0, angle + Math.PI/2]}>
            <planeGeometry args={[0.18, 2.5]} />
          </mesh>
        )
      })}

      {/* Outer lane white lines */}
      <mesh receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[38.8, 39.2, 128]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[19.8, 20.2, 128]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      {/* Street lamps */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const r = 44
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
              <meshStandardMaterial color="#334" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 3.8, 0.5]}>
              <boxGeometry args={[1.2, 0.15, 0.15]} />
              <meshStandardMaterial color="#223" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Lamp head */}
            <mesh position={[0, 3.6, 1]}>
              <boxGeometry args={[0.5, 0.3, 0.5]} />
              <meshStandardMaterial color="#ffeeaa" emissive="#ffdd88" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 3.4, 1]} color="#ffeecc" intensity={3} distance={18} castShadow />
          </group>
        )
      })}
    </group>
  )
}

// ---- Rain Particles ----
function Rain({ active }: { active: boolean }) {
  const count = 3000
  const positions = useRef<Float32Array | undefined>(undefined)
  const meshRef = useRef<THREE.Points>(null!)

  useEffect(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120
      pos[i * 3 + 1] = Math.random() * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    positions.current = pos
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    }
  }, [])

  useFrame((_, delta) => {
    if (!active || !meshRef.current || !positions.current) return
    const pos = positions.current
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * 30
      if (pos[i * 3 + 1] < -5) pos[i * 3 + 1] = 50
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!active) return null
  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial color="#aaddff" size={0.08} transparent opacity={0.5} />
    </points>
  )
}

// ---- Physics Car + Manual WASD ----
function PhysicsCar({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  const rb = useRef<RapierRigidBody>(null)
  const progressRef = useRef(0)
  const speedRef = useRef(0)
  const angleRef = useRef(simState.carRotY)
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false })

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); if (['w','a','s','d'].includes(k)) setKeys(p => ({ ...p, [k]: true }))
    }
    const handleUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(); if (['w','a','s','d'].includes(k)) setKeys(p => ({ ...p, [k]: false }))
    }
    window.addEventListener('keydown', handleDown); window.addEventListener('keyup', handleUp)
    return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp) }
  }, [])

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 200 }, (_, i) => {
      const t = (i / 200) * Math.PI * 4
      return new THREE.Vector3(Math.sin(t) * 30, 0, Math.cos(t) * 30)
    }),
    true
  )

  useFrame((_, delta) => {
    if (!rb.current) return

    if (simState.driveMode === 'manual') {
      // WASD physics input
      if (keys.w) speedRef.current = THREE.MathUtils.lerp(speedRef.current, 35, delta * 2) // ~126 km/h max
      else if (keys.s) speedRef.current = THREE.MathUtils.lerp(speedRef.current, -10, delta * 4) // brake/reverse
      else speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0, delta * 1.5) // coasting

      if (Math.abs(speedRef.current) > 1) { // Only steer if moving
        const turnForce = (keys.a ? 1 : 0) - (keys.d ? 1 : 0)
        angleRef.current += turnForce * delta * 1.8 * Math.sign(speedRef.current)
      }
      
      const vx = Math.sin(angleRef.current) * speedRef.current
      const vz = Math.cos(angleRef.current) * speedRef.current
      rb.current.setLinvel({ x: vx, y: rb.current.linvel().y, z: vz }, true)
      rb.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angleRef.current), true)

    } else {
      // Autonomous or Emergency
      if (simState.driveMode === 'emergency') {
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0, delta * 5)
      } else if (simState.faults.camera && simState.faults.radar) {
        // Critical Sensor Fusion Failure - Force AEB
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, 0, delta * 6)
      } else {
        // GPS Fault -> Random speed fluctuations
        let targetSpeed = 14.5
        if (simState.faults.gps) targetSpeed += (Math.random() - 0.5) * 5
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, delta * 2) // ~52 km/h cruise
      }

      if (simState.targetDestination) {
        // Dynamic steering toward user-clicked Minimap waypoint
        const dx = simState.targetDestination.x - simState.carX
        const dz = simState.targetDestination.z - simState.carZ
        const dist = Math.sqrt(dx*dx + dz*dz)
        
        if (dist < 2.5) {
           onStateUpdate({ targetDestination: null }) // Arrived at destination
        } else {
           const targetRot = Math.atan2(dx, dz)
           let angleDiff = targetRot - angleRef.current
           // Wrap angle to -PI to PI
           while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
           while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
           angleRef.current += angleDiff * delta * 2.5 // Turn speed
           
           const vx = Math.sin(angleRef.current) * speedRef.current
           const vz = Math.cos(angleRef.current) * speedRef.current
           rb.current.setLinvel({ x: vx, y: rb.current.linvel().y, z: vz }, true)
           rb.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angleRef.current), true)
        }
      } else if (simState.mapType === 'circular') {
        // Default circular test track
        progressRef.current = (progressRef.current + delta * (speedRef.current / 370)) % 1
        const point = curve.getPoint(progressRef.current)
        const tangent = curve.getTangent(progressRef.current)
        angleRef.current = Math.atan2(tangent.x, tangent.z)
        
        rb.current.setTranslation({ x: point.x, y: 0.18, z: point.z }, true)
        rb.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angleRef.current), true)
      } else {
         // Intersection/Highway mode without a path: just drive straight until crashed or user inputs waypoint
         const vx = Math.sin(angleRef.current) * speedRef.current
         const vz = Math.cos(angleRef.current) * speedRef.current
         rb.current.setLinvel({ x: vx, y: rb.current.linvel().y, z: vz }, true)
         rb.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angleRef.current), true)
      }
    }

    const pos = rb.current.translation()
    onStateUpdate({
      speed: Math.abs(Math.round(speedRef.current * 3.6)),
      carX: pos.x, carZ: pos.z, carRotY: angleRef.current,
      heading: Math.round(THREE.MathUtils.radToDeg(angleRef.current)) % 360
    })
  })

  return (
    <RigidBody ref={rb} type="kinematicVelocity" colliders="cuboid" position={[simState.carX, 0.18, simState.carZ]}>
      <CarModel rotY={0} />
      {/* Driver View internal dash indicator glow */}
      <pointLight position={[0, 0.4, 0.5]} color="#00d4ff" intensity={0.2} distance={1} />
    </RigidBody>
  )
}

// ---- Intersection Road (Dynamic Map Demo) ----
function IntersectionRoad() {
  const roadMat = new THREE.MeshStandardMaterial({ color: '#111418', roughness: 0.92, metalness: 0.05 })
  const dashMat = new THREE.MeshStandardMaterial({ color: '#ffee00', emissive: '#ffee00', emissiveIntensity: 0.5, transparent: true, opacity: 0.8 })
  return (
    <group position={[0, -0.01, 0]}>
      {/* N-S Road */}
      <mesh receiveShadow material={roadMat} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 200]} />
      </mesh>
      {/* E-W Road */}
      <mesh receiveShadow material={roadMat} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 20]} />
      </mesh>
      {/* Dashes N-S */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={`ns-${i}`} material={dashMat} position={[0, 0.04, -100 + i * 5]} rotation={[-Math.PI/2, 0, 0]}>
           {Math.abs(-100 + i * 5) > 12 ? <planeGeometry args={[0.2, 2.5]} /> : null}
        </mesh>
      ))}
      {/* Dashes E-W */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={`ew-${i}`} material={dashMat} position={[-100 + i * 5, 0.04, 0]} rotation={[-Math.PI/2, 0, Math.PI/2]}>
           {Math.abs(-100 + i * 5) > 12 ? <planeGeometry args={[0.2, 2.5]} /> : null}
        </mesh>
      ))}
    </group>
  )
}

// ---- Dynamic Scenarios ----
function DynamicScenario({ scenario, simState }: { scenario: string, simState: SimState }) {
  const pedRef = useRef<RapierRigidBody>(null)
  
  useFrame((_, delta) => {
    if (scenario === 'pedestrian_rush' && pedRef.current) {
      // Jaywalk directly into the car's path if it gets close
      const dist = Math.sqrt(Math.pow(15 - simState.carX, 2) + Math.pow(30 - simState.carZ, 2))
      if (dist < 40) {
         // trigger crossing sprint
         const pos = pedRef.current.translation()
         if (pos.x > 0) {
           pedRef.current.setNextKinematicTranslation({ x: pos.x - delta * 4, y: 0.5, z: 30 })
         }
      }
    }
  })

  if (scenario === 'pedestrian_rush') {
    return (
      <RigidBody ref={pedRef} type="kinematicPosition" colliders="cuboid" position={[15, 0.5, 30]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 1.8, 0.5]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <Html position={[0, 1.5, 0]} center>
          <div style={{ background: 'rgba(255,0,0,0.8)', padding: '2px 4px', fontSize: 8, color: '#fff', borderRadius: 2 }}>JAYWALKER</div>
        </Html>
      </RigidBody>
    )
  }
  
  if (scenario === 'aggressive_car') {
    return (
      <TrafficCar startProgress={0.05} laneOffset={-1.5} speed={45.0} color="#ff0000" type="aggressive_agent" simState={simState} />
    )
  }

  return null
}

// ---- Scene ----
function Scene({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  const isNight = simState.timeOfDay === 'night'
  const backgroundColor = isNight ? '#010408' : '#a0c0e0'

  return (
    <>
      {/* Sky */}
      {isNight ? (
        <>
          <color attach="background" args={[backgroundColor]} />
          <Stars radius={200} depth={80} count={6000} factor={5} fade />
          <ambientLight intensity={0.08} color="#1a3a6a" />
          <directionalLight position={[20, 30, 20]} intensity={0.05} color="#3a5a9a" />
        </>
      ) : (
        <>
          <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
          <ambientLight intensity={0.5} color="#c8d8ff" />
          <directionalLight position={[80, 60, 40]} intensity={2.5} castShadow color="#fff8f0"
            shadow-mapSize={[4096, 4096]} shadow-camera-far={200} shadow-camera-left={-80}
            shadow-camera-right={80} shadow-camera-top={80} shadow-camera-bottom={-80} />
        </>
      )}

      {/* Fog */}
      {simState.foggy && <fog attach="fog" args={['#cccccc', 10, 60]} />}

      <SceneMaterials viewMode={simState.viewMode} />

      {/* Environment HDR */}
      <Environment preset={isNight ? 'night' : 'city'} />

      {/* AI Car + Physics */}
      <Physics>
        {/* Ground Collider */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, -0.6, 0]}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[600, 600]} />
            <meshStandardMaterial color="#0a0e12" roughness={0.95} />
          </mesh>
        </RigidBody>

        <Road />
        <CityBlock />

        {/* Dynamic traffic passing by (AI Agents) */}
        {simState.mapType === 'circular' && (
          <>
            <TrafficCar startProgress={0.4} laneOffset={-3} speed={12.5} color="#dd2211" type="car" simState={simState} />
            <TrafficCar startProgress={0.15} laneOffset={3} speed={16.2} color="#1188ff" type="car" simState={simState} />
            <TrafficCar startProgress={0.7} laneOffset={0} speed={14.0} color="#77ff22" type="car" simState={simState} />
            <TrafficCar startProgress={0.25} laneOffset={-1.5} speed={10.0} color="#1a3a1a" type="car" simState={simState} />
            <TrafficCar startProgress={0.8} laneOffset={1.5} speed={18.0} color="#2a1a00" type="car" simState={simState} />
            <RoutePath />
          </>
        )}
        
        {simState.mapType === 'intersection' && (
          <IntersectionRoad />
        )}

        <DynamicScenario scenario={simState.scenario} simState={simState} />

        <PhysicsCar simState={simState} onStateUpdate={onStateUpdate} />
      </Physics>

      {/* Rain */}
      <Rain active={simState.isRaining} />

      {/* Contact shadows for realism */}
      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={80} blur={2} far={10} />
    </>
  )
}

// ---- Dynamic Camera (Cockpit vs Third-Person) ----
function DynamicCamera({ simState }: { simState: SimState }) {
  const { camera } = useThree()
  useFrame(() => {
    if (simState.viewMode === 'cockpit') {
      // Inside driver's seat
      // Head position offset: slightly left and back relative to car center
      const headOffset = new THREE.Vector3(-0.35, 0.65, -0.2) // X: left, Y: up, Z: back
      headOffset.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), simState.carRotY))
      const cx = simState.carX + headOffset.x
      const cz = simState.carZ + headOffset.z
      camera.position.set(cx, 0.18 + headOffset.y, cz)
      
      // Look forward
      const lx = simState.carX + Math.sin(simState.carRotY) * 20
      const lz = simState.carZ + Math.cos(simState.carRotY) * 20
      camera.lookAt(lx, 0.18 + headOffset.y, lz)
    } else if (simState.viewMode === 'surround') {
      // Top-down 360 birds eye view used for close proximity monitoring
      camera.position.set(simState.carX, 35, simState.carZ)
      camera.lookAt(simState.carX, 0, simState.carZ)
      // Slight rotation to align with car heading conceptually, or keep fixed North up. Fixed north up is standard for surround minimaps.
    } else {
      // Third person follow
      const targetX = simState.carX - Math.sin(simState.carRotY) * 10
      const targetZ = simState.carZ - Math.cos(simState.carRotY) * 10
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 6, 0.05)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)
      camera.lookAt(simState.carX, 1, simState.carZ)
    }
  })
  return null
}

// ---- True 3D LiDAR Volumetric Point Cloud ----
function LidarCloud({ simState }: { simState: SimState }) {
  const meshRef = useRef<THREE.Points>(null!)
  const angleRef = useRef(0)
  const count = 4096

  useFrame((_, delta) => {
    angleRef.current += delta * 6 // Rapid spin
    if (!meshRef.current) return
    const pos = new Float32Array(count * 3)
    
    // Simulate a spinning 16-channel LiDAR puck
    for (let i = 0; i < count; i++) {
       const layer = i % 16
       const vAngle = -0.15 + (layer / 16) * 0.3 // Vertical spread angle
       const a = (i / count) * Math.PI * 2 * 32 + angleRef.current // 32 sweeps per frame
       
       let maxR = 45 // Ray length
       
       // Faux geometry intersection for realistic point clustering against walls
       const worldX = simState.carX + Math.cos(a) * maxR
       const worldZ = simState.carZ + Math.sin(a) * maxR
       if (Math.abs(worldX) > 40 || Math.abs(worldZ) > 40) maxR = 25 + Math.random() * 5
       
       let range = Math.min(maxR, 5 + Math.random() * 2 + (layer * 2.5))
       
       // Handle LiDAR Degradation (Hardware + Weather)
       if (simState.faults.lidar) {
         range += (Math.random() - 0.5) * 30 // Extreme noise
         if (Math.random() > 0.4) range = 0 // Packet loss
       } else if (simState.weather === 'rain') {
         range += (Math.random() - 0.5) * 4 // Splash scatter
         if (Math.random() > 0.85) range = 0 // Rain absorption missing points
       } else if (simState.weather === 'fog') {
         range += (Math.random() - 0.5) * 8 // Heavy scatter
         if (Math.random() > 0.6) range = 0 // Fog attenuation
       }
       
       pos[i * 3] = simState.carX + Math.cos(a) * Math.cos(vAngle) * range
       pos[i * 3 + 1] = 0.6 + Math.sin(vAngle) * range // Sensor mounted on roof
       pos[i * 3 + 2] = simState.carZ + Math.sin(a) * Math.cos(vAngle) * range
       
       // Ground clipping
       if (pos[i * 3 + 1] < 0.05) pos[i * 3 + 1] = 0.05 + Math.random() * 0.02
    }
    meshRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial color="#00ff88" size={0.06} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ---- Main export ----
export function SimulationViewport({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, -10], fov: 60, near: 0.1, far: 1000 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene simState={simState} onStateUpdate={onStateUpdate} />
      <LidarCloud simState={simState} />
      <DynamicCamera simState={simState} />
      <EffectComposer>
        {simState.faults.camera && (
          <Glitch 
            delay={new THREE.Vector2(0.5, 1.5)} 
            duration={new THREE.Vector2(0.1, 0.3)} 
            strength={new THREE.Vector2(0.3, 1.0)} 
            active 
          />
        )}
        {(simState.weather === 'rain' || simState.foggy) && <Noise opacity={0.15} />}
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.9} intensity={1.2} />
        <Vignette eskil={false} offset={0.35} darkness={0.7} />
        <ChromaticAberration offset={[0.0005, 0.0005]} />
      </EffectComposer>
    </Canvas>
  )
}
