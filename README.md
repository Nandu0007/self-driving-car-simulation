# Self-Driving Car Simulation Platform

A high-fidelity, interactive web-based dashboard and simulation environment for monitoring autonomous vehicle systems. Designed with a professional, comprehensive user interface to visualize real-time telemetry, sensor data, AI decision schemas, and environmental obstacles.

## 🚀 Key Features

*   **Real-time Telemetry & Dynamic Charts:** Monitor live performance metrics (speed, acceleration, steering angle, braking) rendered with interactive data visualizations.
*   **Advanced Sensor Visualization:** Inspect discrete data feeds from multiple arrays, including 3D LiDAR point clouds, Camera views, and Radar objects.
*   **AI Decision Logging:** Track the autonomous brain's continuous stream of actions, predictions, trajectory planning, and corresponding confidence levels.
*   **Environment & Obstacle Controls:** Manipulate dynamic weather (rain, fog, time-of-day) and interactively spawn pedestrians, vehicles, and road hazards.
*   **V2X Communication:** Monitor Vehicle-to-Everything message protocols, predicting interactions with infrastructure like traffic lights and connected entities.
*   **ROS2 Integration Panel:** Bridging and monitoring interface for Robot Operating System 2 specific nodes, topics, and latency.
*   **Interactive Minimap:** Top-down spatial view of the ego-vehicle's active position, route plotting, and surrounding mapped area.
*   **System Health Dashboard:** Keep watch over core sub-system diagnostics, battery/power modules, and CPU/GPU compute loads.

## 🛠 Tech Stack

*   **Framework:** React 18 + TypeScript
*   **Build Tool:** Vite (for fast, optimized HMR and bundling)
*   **Styling:** Custom Vanilla CSS with responsive auto-layout features and CSS variable themes.

## ⚙️ Getting Started

### Prerequisites
Ensure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nandu0007/self-driving-car-simulation.git
   ```
2. Navigate to the project directory:
   ```bash
   cd self-driving-car-simulation
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Vite development server:
```bash
npm run dev
```

Your app should now be running in your browser (typically at `http://localhost:5173`).

## 📄 License

This project is open-source and available under the terms of the [MIT License](LICENSE).
