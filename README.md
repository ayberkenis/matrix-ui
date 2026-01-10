# Living Matrix - Frontend

A Next.js 16 App Router frontend for the Living Matrix simulation project, featuring a Matrix-themed control room interface.

## Features

- **Real-time Dashboard**: Live updates via WebSocket with REST fallback polling
- **Matrix Aesthetic**: Dark theme with green phosphor glow, terminal typography, and subtle effects
- **Three-Panel Layout**:
  - **Districts Panel**: Shows district resources, tension, and hotspots
  - **Events Stream**: Live event feed with severity indicators
  - **Agents Panel**: Agent list with detailed view
- **Control Panel**: Pause/resume simulation, adjust speed, reset
- **World Summary**: Overview metrics and warnings
- **Connection Status**: Visual indicator for WebSocket connection state

## Tech Stack

- Next.js 16 (App Router)
- React 18
- Zustand (state management)
- Tailwind CSS
- WebSocket client with auto-reconnect

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (optional, defaults to localhost:8000):
```env
NEXT_PUBLIC_MATRIX_API_URL=http://localhost:8000
NEXT_PUBLIC_MATRIX_WS_URL=ws://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Architecture

### Server Components (Default)
- Main dashboard page (`app/(matrix)/page.jsx`)
- Layout components
- Initial data fetching

### Client Components
- `LiveStreamBridge`: Connects WebSocket and initializes store
- `ControlPanel`: Interactive controls (pause/resume/speed)
- `ConnectionStatus`: Real-time connection indicator
- All panels that display live data from store

### State Management
- Zustand store (`store/worldStore.js`) for global state
- WebSocket client (`store/wsClient.js`) with exponential backoff reconnection
- Automatic fallback to polling if WebSocket fails

### API Client
- `lib/matrixApi.js`: REST API client with timeout handling
- Automatic mock data fallback when backend unavailable
- Separate `serverFetch` and `clientFetch` functions

## Backend API Contract

### REST Endpoints
- `GET /health` - Health check
- `GET /state` - Current world state
- `GET /agents` - List of agents
- `GET /districts` - List of districts
- `GET /events` - Recent events
- `POST /control/pause` - Pause simulation
- `POST /control/resume` - Resume simulation
- `POST /control/speed` - Set simulation speed (body: `{ "ms": number }`)

### WebSocket
- Endpoint: `ws://localhost:8000/ws`
- Message format:
  ```json
  {
    "type": "state" | "event" | "agents" | "districts" | "metrics",
    "payload": { ... }
  }
  ```

## Project Structure

```
matrix-ui/
├── app/
│   ├── (matrix)/
│   │   ├── layout.jsx      # Matrix-themed layout
│   │   └── page.jsx         # Main dashboard
│   ├── globals.css          # Global styles + Matrix theme
│   └── layout.jsx           # Root layout
├── components/
│   ├── AgentsPanel.jsx      # Agents list + detail
│   ├── ConnectionStatus.jsx # WS connection indicator
│   ├── ControlPanel.jsx     # Pause/resume/speed controls
│   ├── DistrictsPanel.jsx   # Districts with resources
│   ├── EventsPanel.jsx      # Live event stream
│   ├── Header.jsx           # Top bar with clock/weather
│   ├── LiveStreamBridge.jsx # WS client bridge
│   ├── MatrixRainBackground.jsx # Optional green rain effect
│   ├── WeatherDisplay.jsx   # Weather info
│   ├── WorldClock.jsx       # Day/time/phase display
│   └── WorldSummary.jsx     # Overview metrics
├── lib/
│   ├── i18n.js              # i18n dictionary
│   └── matrixApi.js         # API client
├── store/
│   ├── worldStore.js        # Zustand store
│   └── wsClient.js          # WebSocket client
└── package.json
```

## Styling

The UI uses Tailwind CSS with custom Matrix theme:
- Colors: `matrix-dark`, `matrix-green`, `matrix-green-dim`, etc.
- Utilities: `text-matrix-glow`, `border-matrix`, `bg-matrix-panel`
- Custom animations: scanline, flicker
- Grid background pattern
- Optional green rain background effect

## Development Notes

- The app works with mock data when backend is unavailable
- WebSocket automatically falls back to polling every 2 seconds if connection fails
- All strings are i18n-ready (currently English only)
- Server Components fetch initial data for fast first paint
- Client Components subscribe to store for live updates

## Build

```bash
npm run build
npm start
```

## License

MIT
