import Header from "../../components/Header";
import DistrictsPanel from "../../components/DistrictsPanel";
import EventsPanel from "../../components/EventsPanel";
import AgentsPanel from "../../components/AgentsPanel";
import WorldSummary from "../../components/WorldSummary";
import { serverFetch } from "../../lib/matrixApi";

export default async function MatrixDashboard() {
  // Fetch initial data on server
  const [state, agents, districts, events] = await Promise.all([
    serverFetch("/state"),
    serverFetch("/agents"),
    serverFetch("/districts"),
    serverFetch("/events"),
  ]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header className="flex-shrink-0" />

      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Column: Districts */}
        <div className="col-span-12 lg:col-span-3 h-full min-h-0 overflow-hidden">
          <DistrictsPanel />
        </div>

        {/* Center Column: Events + Summary */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full min-h-0 overflow-hidden">
          <WorldSummary className="flex-shrink-0" />
          <div className="flex-1 min-h-0 overflow-hidden">
            <EventsPanel />
          </div>
        </div>

        {/* Right Column: Agents */}
        <div className="col-span-12 lg:col-span-3 h-full min-h-0 overflow-hidden">
          <AgentsPanel />
        </div>
      </main>
    </div>
  );
}
