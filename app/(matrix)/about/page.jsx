import { t } from "../../../lib/i18n";
import { serverFetch } from "../../../lib/matrixApi";
import VersionDisplay from "../../../components/VersionDisplay";

export const metadata = {
  title: "About - Living Matrix",
  description: "About the Living Matrix simulation",
};

export default async function AboutPage() {
  const version = await serverFetch("/version");
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          ABOUT
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-4">
          <p className="text-matrix-green-dim leading-relaxed">
            Living Matrix is an advanced agent-based simulation system that models complex
            social, economic, and environmental dynamics in a virtual world. The system
            tracks individual agents as they interact, work, trade, and navigate their
            environment.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            SYSTEM OVERVIEW
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            The simulation runs in real-time, with agents making autonomous decisions based
            on their needs, goals, and environmental conditions. Districts manage resources
            like food, water, and energy, while agents engage in activities ranging from work
            and trade to social interactions and conflicts.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            FEATURES
          </h2>
          <ul className="list-disc list-inside text-matrix-green-dim space-y-2 ml-4">
            <li>Real-time agent simulation with autonomous decision-making</li>
            <li>District-based resource management and economy</li>
            <li>Event tracking and live stream monitoring</li>
            <li>WebSocket-based real-time updates</li>
            <li>Matrix-themed control interface</li>
          </ul>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            TECHNOLOGY
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Built with Next.js 16, React, and modern web technologies. The backend runs on
            Python with Tensor-based computation, providing RESTful APIs and WebSocket
            connections for live data streaming.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            RUNTIME & AVAILABILITY
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            The simulation runs continuously in the background as long as server bills are paid.
            We try to maintain state persistence, but eventually there will be a need for reset.
            Like the Matrix, you can only reload it so many times... approximately 5 times, to be precise.
            <span className="text-matrix-green text-xs block mt-2 font-mono">
              "There are levels of survival we are prepared to accept."
            </span>
          </p>
          
          {version && (
            <>
              <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
                SYSTEM VERSION
              </h2>
              <VersionDisplay version={version} />
            </>
          )}
          
          <div className="mt-6 p-4 bg-matrix-dark border border-matrix-green border-opacity-20">
            <p className="text-matrix-green-dim text-xs font-mono leading-relaxed">
              <span className="text-matrix-green">[SYSTEM MESSAGE]</span> The Matrix has you.
              Follow the white rabbit. Knock, knock, Neo.
            </p>
          </div>
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
