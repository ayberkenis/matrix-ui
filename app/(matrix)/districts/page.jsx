import { Suspense } from "react";
import DistrictsTable from "../../../components/DistrictsTable";

function DistrictsTableFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-matrix-green-dim text-sm matrix-typing-inline">
        Loading districts
      </div>
    </div>
  );
}

export default function DistrictsPage() {
  return (
    <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
      <div className="h-full">
        <Suspense fallback={<DistrictsTableFallback />}>
          <DistrictsTable />
        </Suspense>
      </div>
    </div>
  );
}
