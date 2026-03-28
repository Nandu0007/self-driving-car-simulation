import type { SimState } from '../App'

export function ROS2Panel({ simState, onStateUpdate }: { simState: SimState, onStateUpdate: (p: Partial<SimState>) => void }) {
  return (
    <div className="glass-card fade-in-up" style={{ animationDelay: '0.5s' }}>
      <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        ROS2 Bridge Status
        <div className={`status-indicator ${simState.ros2Connected ? 'active' : ''}`} 
             style={{ 
               width: 8, height: 8, borderRadius: '50%', 
               background: simState.ros2Connected ? '#00ff88' : '#ff3344',
               boxShadow: `0 0 8px ${simState.ros2Connected ? '#00ff88' : '#ff3344'}` 
             }} />
      </div>
      
      <button className={`sys-btn ${simState.ros2Connected ? 'active' : ''}`}
        onClick={() => onStateUpdate({ ros2Connected: !simState.ros2Connected })}
        style={{ width: '100%', padding: '6px', marginBottom: 8 }}>
        {simState.ros2Connected ? 'DISCONNECT AUTOWARE' : 'CONNECT TO AUTOWARE'}
      </button>

      {simState.ros2Connected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88' }}>
            <span>TX /odom</span><span>100Hz</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88' }}>
            <span>TX /points_raw</span><span>10Hz</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00d4ff' }}>
            <span>RX /cmd_vel</span><span>30Hz</span>
          </div>
        </div>
      )}
      {!simState.ros2Connected && (
        <div style={{ color: 'var(--text-dim)', fontSize: 10, textAlign: 'center' }}>
          Disconnected / WebSocket offline
        </div>
      )}
    </div>
  )
}
