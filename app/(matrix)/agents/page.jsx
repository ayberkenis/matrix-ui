import { Suspense } from "react";
import AgentsTable from "../../../components/AgentsTable";

function AgentsTableFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-matrix-green-dim text-sm matrix-typing-inline">
        Loading agents
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
      <div className="h-full">
        <Suspense fallback={<AgentsTableFallback />}>
          <AgentsTable />
        </Suspense>
      </div>
    </div>
  );
}
