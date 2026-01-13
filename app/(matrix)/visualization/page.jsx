import StateVisualizationPanel from "../../../components/StateVisualizationPanel";

export default function VisualizationPage() {
  return (
    <div className="h-full p-4 lg:min-h-0 lg:overflow-hidden">
      <div className="h-full">
        <StateVisualizationPanel />
      </div>
    </div>
  );
}
