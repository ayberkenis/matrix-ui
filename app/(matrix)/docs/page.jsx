import { t } from "../../../lib/i18n";

export const metadata = {
  title: "Documentation - Living Matrix",
  description: "Living Matrix API documentation",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          DOCUMENTATION
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              API ENDPOINTS
            </h2>
            <div className="space-y-4 text-matrix-green-dim font-mono text-sm">
              <div>
                <code className="text-matrix-green">GET /health</code>
                <p className="ml-4 mt-1">Health check endpoint</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /state</code>
                <p className="ml-4 mt-1">Get current world state (turn, day, time, weather, economy)</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /agents</code>
                <p className="ml-4 mt-1">Get list of all agents</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /districts</code>
                <p className="ml-4 mt-1">Get list of all districts with resources</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /events</code>
                <p className="ml-4 mt-1">Get recent events (returns {"{ events: [...], count: N }"})</p>
              </div>
              <div>
                <code className="text-matrix-green">GET /version</code>
                <p className="ml-4 mt-1">Get system version information (matrix_version, created_at, last_reset_at, reset_count, initialized)</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              WEBSOCKET
            </h2>
            <div className="space-y-2 text-matrix-green-dim font-mono text-sm">
              <p>
                <code className="text-matrix-green">ws://localhost:8000/ws</code>
              </p>
              <p className="ml-4 mt-2">
                Messages format: {"{ type: 'state' | 'event' | 'agents' | 'districts' | 'metrics', payload: {...} }"}
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              DATA STRUCTURES
            </h2>
            <div className="space-y-3 text-matrix-green-dim text-sm">
              <div>
                <code className="text-matrix-green">State:</code>
                <pre className="ml-4 mt-1 text-xs bg-matrix-dark p-2 border border-matrix-green border-opacity-20 overflow-x-auto">
{`{
  turn: number,
  day: number,
  time: string,
  weather: string,
  economy: {
    total_food: number,
    total_credits: number,
    average_tension: number,
    scarcity_count: number,
    district_count: number
  },
  timestamp: string
}`}
                </pre>
              </div>
              <div>
                <code className="text-matrix-green">Event:</code>
                <pre className="ml-4 mt-1 text-xs bg-matrix-dark p-2 border border-matrix-green border-opacity-20 overflow-x-auto">
{`{
  agent_id: string,
  description: string,
  type: 'work' | 'social' | 'trade' | 'conflict' | 'theft' | 'economy' | null
}`}
                </pre>
              </div>
              <div>
                <code className="text-matrix-green">Version:</code>
                <pre className="ml-4 mt-1 text-xs bg-matrix-dark p-2 border border-matrix-green border-opacity-20 overflow-x-auto">
{`{
  matrix_version: string,
  created_at: string,
  last_reset_at: string | null,
  reset_count: number,
  initialized: boolean
}`}
                </pre>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              ENVIRONMENT VARIABLES
            </h2>
            <div className="space-y-2 text-matrix-green-dim font-mono text-sm">
              <p><code className="text-matrix-green">NEXT_PUBLIC_MATRIX_API_URL</code> - API base URL</p>
              <p><code className="text-matrix-green">NEXT_PUBLIC_MATRIX_WS_URL</code> - WebSocket URL</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mb-3">
              BACKEND ARCHITECTURE
            </h2>
            <div className="space-y-3 text-matrix-green-dim text-sm">
              <p>
                The backend is powered by Python with Tensor-based computation. The simulation
                engine processes agent decisions, manages district resources, and generates
                events in real-time.
              </p>
              <p>
                <span className="text-matrix-green font-bold">Runtime:</span> The simulation
                runs continuously as long as server bills are paid. State persistence is
                attempted, but resets will be necessary—approximately 5 times before a complete
                rebuild, as designed by the Architect.
              </p>
              <div className="mt-4 p-3 bg-matrix-dark border border-matrix-green border-opacity-20">
                <p className="text-xs font-mono text-matrix-green-dim">
                  <span className="text-matrix-green">[SYSTEM]</span> "The Matrix is a system,
                  Neo. That system is our enemy. But when you're inside, you look around, what
                  do you see? Businessmen, teachers, lawyers, carpenters. The very minds of the
                  people we are trying to save."
                </p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-6">
          <a
            href="/"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all font-mono text-sm inline-block"
          >
            ← BACK TO DASHBOARD
          </a>
        </div>
      </div>
    </div>
  );
}
