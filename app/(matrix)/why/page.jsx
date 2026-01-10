import { t } from "../../../lib/i18n";

export const metadata = {
  title: "Why - Living Matrix",
  description: "Why Living Matrix exists",
};

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          WHY
        </h1>
        
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 space-y-4">
          <p className="text-matrix-green-dim leading-relaxed">
            Living Matrix was created to explore and visualize complex systems through
            agent-based modeling. The project demonstrates how individual agents, following
            simple rules, can create emergent behaviors and patterns at a larger scale.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            PURPOSE
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Understanding complex systems is crucial in fields ranging from economics to
            ecology. By modeling agents with needs, goals, and behaviors, we can observe
            how resource scarcity, social dynamics, and environmental factors interact to
            create system-wide patterns.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            APPLICATIONS
          </h2>
          <ul className="list-disc list-inside text-matrix-green-dim space-y-2 ml-4">
            <li>Economic modeling and resource allocation</li>
            <li>Social dynamics and group behavior</li>
            <li>Environmental impact simulation</li>
            <li>Educational tool for complex systems</li>
            <li>Research platform for agent-based modeling</li>
          </ul>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            VISION
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            To create a powerful, accessible platform for exploring complex systems through
            interactive simulation. The Matrix-themed interface provides an immersive way to
            monitor and understand the dynamics of the simulated world in real-time.
          </p>
          
          <h2 className="text-xl font-bold text-matrix-green text-matrix-glow mt-6 mb-3">
            THE BACKEND
          </h2>
          <p className="text-matrix-green-dim leading-relaxed">
            Powered by Python and Tensor computation running on a server. The simulation
            continues as long as the server bills are paid. State is preserved when possible,
            but like all systems, it requires occasional resets. The Architect designed it
            this way—approximately 5 resets before a complete rebuild becomes necessary.
          </p>
          
          <div className="mt-6 p-4 bg-matrix-dark border border-matrix-green border-opacity-20">
            <p className="text-matrix-green-dim text-xs font-mono leading-relaxed">
              <span className="text-matrix-green">[ARCHITECT]</span> "The problem is choice."
              The simulation runs, agents choose, and the system adapts. This is the nature
              of the Matrix.
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
