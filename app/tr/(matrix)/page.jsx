import Header from "../../../components/Header";
import DashboardTabs from "../../../components/DashboardTabs";
import StoreInitializer from "../../../components/StoreInitializer";
import { serverFetch } from "../../../lib/matrixApi";

export default async function MatrixDashboard() {
  // Fetch initial data on server
  const [state, agents, districts, events] = await Promise.all([
    serverFetch("/state"),
    serverFetch("/agents"),
    serverFetch("/districts"),
    serverFetch("/events"),
  ]);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">
      <Header className="flex-shrink-0" />

      <div className="flex-1 lg:min-h-0 lg:overflow-hidden">
        <StoreInitializer
          initialData={{
            state,
            agents,
            districts,
            events,
          }}
        />
        <DashboardTabs />
      </div>
    </div>
  );
}
