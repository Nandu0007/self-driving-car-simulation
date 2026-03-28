import { useState, useRef, useEffect } from 'react'
import { SimulationViewport } from './components/SimulationViewport'
import { TelemetryPanel } from './components/TelemetryPanel'
import { LidarPanel } from './components/LidarPanel'
import { AIDecisionLog } from './components/AIDecisionLog'
import { SensorsPanel } from './components/SensorsPanel'
import { EnvironmentPanel } from './components/EnvironmentPanel'
import { ObstaclesPanel } from './components/ObstaclesPanel'
import { SystemHealthPanel } from './components/SystemHealthPanel'
import { MinimapPanel } from './components/MinimapPanel'
import { BottomControls } from './components/BottomControls'
import { HeaderBar } from './components/HeaderBar'
import { V2XPanel } from './components/V2XPanel'
import { ROS2Panel } from './components/ROS2Panel'
import { TelemetryChartsPanel } from './components/TelemetryChartsPanel'

export type DriveMode = 'autonomous' | 'manual' | 'emergency'
export type Weather = 'clear' | 'rain' | 'fog'
export type Scenario = 'none' | 'pedestrian_rush' | 'aggressive_car'
export type MapType = 'circular' | 'intersection' | 'highway'

export interface SimState {
  speed: number       // km/h
  gear: number
  battery: number     // %
  tempMotor: number   // °C
  tempBattery: number // °C
  cpuLoad: number     // %
  range: number       // km
  heading: number     // degrees
  gpsLat: number
  gpsLon: number
  weather: Weather
  timeOfDay: 'day' | 'night'
  isRaining: boolean
  foggy: boolean
  driveMode: DriveMode
  viewMode: 'third-person' | 'cockpit' | 'depth' | 'segmentation' | 'semantic' | 'surround'
  targetDestination: { x: number, z: number } | null
  faults: { lidar: boolean, camera: boolean, radar: boolean, gps: boolean }
  isReplaying: boolean
  replayIndex: number
  carX: number
  carZ: number
  carRotY: number
  detectedObjects: DetectedObject[]
  scenario: Scenario
  mapType: MapType
  ros2Connected: boolean
  v2xData: { phase: 'red' | 'green' | 'yellow', timeToChange: number } | null
  latencyMs: number
  telemetryHistory: { time: number, targetSpeed: number, actualSpeed: number, steering: number }[]
}

export interface DetectedObject {
  id: string
  type: 'car' | 'pedestrian' | 'cyclist' | 'traffic_light' | 'stop_sign'
  distance: number
  angle: number
  confidence: number
}

const initialState: SimState = {
  speed: 0, gear: 1, battery: 87, tempMotor: 42, tempBattery: 28,
  cpuLoad: 34, range: 310, heading: 0, gpsLat: 37.7749, gpsLon: -122.4194,
  weather: 'clear', timeOfDay: 'day', isRaining: false, foggy: false,
  driveMode: 'autonomous', viewMode: 'third-person', targetDestination: null, 
  faults: { lidar: false, camera: false, radar: false, gps: false },
  isReplaying: false, replayIndex: 0,
  carX: 0, carZ: 0, carRotY: 0,
  detectedObjects: [
    { id: 'obj1', type: 'car', distance: 24.5, angle: 2, confidence: 98 },
    { id: 'obj2', type: 'pedestrian', distance: 42, angle: -15, confidence: 91 },
  ],
  scenario: 'none', mapType: 'circular', ros2Connected: false, v2xData: null,
  latencyMs: 12, telemetryHistory: []
}

function App() {
  const [state, setState] = useState<SimState>(initialState)
  const telemetryBuffer = useRef<SimState[]>([])

  const updateState = (updates: Partial<SimState>) => {
    setState(prev => {
      // Do not accept state updates from physics if we are in replay mode
      if (prev.isReplaying && updates.carX !== undefined) return prev

      let latency = prev.latencyMs
      if (updates.weather || updates.foggy !== undefined) {
         const w = updates.weather || prev.weather
         const f = updates.foggy !== undefined ? updates.foggy : prev.foggy
         latency = w === 'rain' ? 35 : f ? 42 : 12
         // CPU Load goes up with latency
         updates.cpuLoad = w === 'rain' ? 88 : f ? 94 : 34
      }

      return { ...prev, ...updates, latencyMs: latency }
    })
  }

  // Telemetry Recorder (30fps)
  useEffect(() => {
    if (state.isReplaying) return
    const interval = setInterval(() => {
      telemetryBuffer.current.push(state)
      // Keep last 1800 frames (60 seconds at 30fps)
      if (telemetryBuffer.current.length > 1800) telemetryBuffer.current.shift()
    }, 1000 / 30)
    return () => clearInterval(interval)
  }, [state])

  // If replaying, override state rendering
  const activeState = state.isReplaying && telemetryBuffer.current[state.replayIndex] 
    ? telemetryBuffer.current[state.replayIndex] 
    : state

  return (
    <div className="app-root">
      {/* 3D Simulation Canvas fills background */}
      <div className="simulation-canvas-wrapper">
        <SimulationViewport simState={state} onStateUpdate={updateState} />
      </div>

      {/* Subtle grid overlay for sci-fi feel */}
      <div className="grid-overlay" />

      {/* Header */}
      <HeaderBar simState={activeState} onStateUpdate={updateState} />

      {/* Main dashboard overlays */}
      <div className="dashboard-overlay">
        {/* Left Column */}
        <div className="panel-col-left">
          <TelemetryPanel simState={activeState} />
          <LidarPanel simState={activeState} />
          <SensorsPanel simState={activeState} />
          <V2XPanel simState={activeState} />
          <ROS2Panel simState={activeState} onStateUpdate={updateState} />
        </div>

        {/* Right Column */}
        <div className="panel-col-right">
          <ObstaclesPanel simState={activeState} />
          <AIDecisionLog simState={activeState} />
          <EnvironmentPanel simState={activeState} onStateUpdate={updateState} />
          {/* Chaos Engineering Panel */}
          <div className="glass-card fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="panel-title">Chaos Engineering</div>
            
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8, marginBottom: 4, textTransform: 'uppercase' }}>Sensor Faults</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {['lidar', 'camera', 'radar', 'gps'].map(f => (
                <button key={f} className={`sys-btn ${state.faults[f as keyof typeof state.faults] ? 'critical' : ''}`}
                  onClick={() => updateState({ faults: { ...state.faults, [f]: !state.faults[f as keyof typeof state.faults] } })}
                  style={{ padding: '4px', fontSize: 10 }}>
                  Kill {f.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 12, marginBottom: 4, textTransform: 'uppercase' }}>OOD Edge Cases</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {(['none', 'pedestrian_rush', 'aggressive_car'] as Scenario[]).map(sc => (
                <button key={sc} className={`sys-btn ${state.scenario === sc ? 'active' : ''}`}
                  onClick={() => updateState({ scenario: sc })}
                  style={{ padding: '4px', fontSize: 9 }}>
                  {sc === 'none' ? 'None' : sc === 'pedestrian_rush' ? 'Pedestrian' : 'Aggr. Car'}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 12, marginBottom: 4, textTransform: 'uppercase' }}>Map Topology</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {(['circular', 'intersection', 'highway'] as MapType[]).map(m => (
                <button key={m} className={`sys-btn ${state.mapType === m ? 'active' : ''}`}
                  onClick={() => updateState({ mapType: m })}
                  style={{ padding: '4px', fontSize: 9 }}>
                  {m === 'circular' ? 'Track' : m === 'intersection' ? 'Urban' : 'Highway'}
                </button>
              ))}
            </div>
          </div>
          <TelemetryChartsPanel telemetryBuffer={telemetryBuffer.current} simState={activeState} />
          <SystemHealthPanel simState={activeState} />
        </div>

        {/* Bottom Center */}
        <div className="panel-bottom">
          <MinimapPanel simState={activeState} onStateUpdate={updateState} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 440 }}>
            {/* VCR Telemetry Controls */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
              <div className="panel-title" style={{ margin: 0, width: 60 }}>TELEMETRY</div>
              <button className={`sys-btn ${state.isReplaying ? 'active' : ''}`} style={{ padding: '4px 12px' }}
                onClick={() => updateState({ isReplaying: !state.isReplaying, replayIndex: telemetryBuffer.current.length - 1 })}>
                {state.isReplaying ? '⏹ LIVE' : '⏮ REPLAY'}
              </button>
              {state.isReplaying && (
                <input type="range" min={0} max={telemetryBuffer.current.length - 1} value={state.replayIndex}
                  onChange={(e) => updateState({ replayIndex: parseInt(e.target.value) })}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)' }} />
              )}
            </div>
            <BottomControls simState={activeState} onStateUpdate={updateState} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
