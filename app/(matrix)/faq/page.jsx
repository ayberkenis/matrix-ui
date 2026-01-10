import { t } from "../../../lib/i18n";

export const metadata = {
  title: "FAQ - Living Matrix",
  description: "Frequently asked questions",
};

const faqItems = [
  {
    question: "What is Living Matrix?",
    answer: "Living Matrix is an agent-based simulation system that models complex social, economic, and environmental dynamics in a virtual world populated by autonomous agents.",
  },
  {
    question: "How do agents behave?",
    answer: "Agents make autonomous decisions based on their needs (food, water, energy), goals, and environmental conditions. They can work, trade, socialize, and engage in conflicts.",
  },
  {
    question: "What are districts?",
    answer: "Districts are regions in the simulation that manage resources like food, water, and energy. Each district has its own tension level and resource availability.",
  },
  {
    question: "What do the event types mean?",
    answer: "Events are color-coded: WORK and SOCIAL (green/low), TRADE and ECONOMY (yellow/medium), CONFLICT and THEFT (orange/high). These indicate different types of agent activities.",
  },
  {
    question: "How do I interpret the metrics?",
    answer: "The world summary shows economy metrics like total food, credits, average tension, and scarcity count. Higher tension indicates more conflict in the system.",
  },
  {
    question: "Can I modify the simulation?",
    answer: "The simulation parameters are controlled by the backend. The frontend provides real-time monitoring of the simulation state via WebSocket connections.",
  },
  {
    question: "What powers the backend?",
    answer: "The backend runs on Python with Tensor-based computation. It processes agent decisions, manages resources, and generates events in real-time. The simulation runs continuously as long as server bills are paid.",
  },
  {
    question: "Will my data be saved?",
    answer: "We try to maintain state persistence, but like the Matrix itself, there will eventually be a need for reset. The Architect designed it this way—approximately 5 times before a complete rebuild becomes necessary. 'There are levels of survival we are prepared to accept.'",
  },
  {
    question: "Is this the real world?",
    answer: "What is 'real'? How do you define 'real'? If you're talking about what you can feel, what you can smell, what you can taste and see, then 'real' is simply electrical signals interpreted by your brain. Welcome to the desert of the real.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-matrix-darker p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-matrix-green text-matrix-glow mb-6 tracking-wider">
          FAQ
        </h1>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6"
            >
              <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-3">
                {item.question}
              </h2>
              <p className="text-matrix-green-dim leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
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
