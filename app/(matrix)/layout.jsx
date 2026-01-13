import { t } from "../../lib/i18n";
import MatrixRainBackground from "../../components/MatrixRainBackground";
import LiveStreamBridge from "../../components/LiveStreamBridge";
import SplashScreen from "../../components/SplashScreen";
import Header from "../../components/Header";
import StoreInitializer from "../../components/StoreInitializer";
import TabNavigation from "../../components/TabNavigation";
import { serverFetch } from "../../lib/matrixApi";

export default async function MatrixLayout({ children }) {
  // Fetch initial data on server for all pages
  const [state, agents, districts, events] = await Promise.all([
    serverFetch("/state"),
    serverFetch("/agents"),
    serverFetch("/districts"),
    serverFetch("/events"),
  ]);

  return (
    <div className="min-h-screen bg-matrix-darker relative overflow-y-auto">
      <SplashScreen />
      <MatrixRainBackground />
      <div className="relative z-10">
        <LiveStreamBridge />
        <div className="min-h-screen lg:h-screen flex flex-col ">
          <Header className="flex-shrink-0" />
          <div className="flex-1 lg:min-h-0 ">
            <StoreInitializer
              initialData={{
                state,
                agents,
                districts,
                events,
              }}
            />
            <TabNavigation />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
