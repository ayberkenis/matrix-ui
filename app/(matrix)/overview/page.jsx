import DistrictsPanel from "../../../components/DistrictsPanel";
import WorldSummary from "../../../components/WorldSummary";
import AgentsPanel from "../../../components/AgentsPanel";
import DistrictDynamicsPanel from "../../../components/DistrictDynamicsPanel";

export default function OverviewPage() {
  return (
    <div className="h-full grid grid-cols-12 gap-4 p-4">
      <div className="col-span-12 lg:col-span-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <DistrictsPanel hideCollapsed={true} />
      </div>
      <div className="col-span-12 lg:col-span-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <WorldSummary />
      </div>
      <div className="col-span-12 lg:col-span-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <AgentsPanel />
      </div>
      <div className="col-span-12 lg:col-span-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <DistrictDynamicsPanel />
      </div>
    </div>
  );
}
