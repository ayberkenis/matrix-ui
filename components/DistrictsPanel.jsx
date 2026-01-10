"use client";

import { useWorldStore } from "../store/worldStore";
import { t } from "../lib/i18n";

function ResourceBar({ label, value, color = "rgba(0, 255, 65, 0.8)" }) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-matrix-green-dim">{label}</span>
        <span className="text-matrix-green">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-matrix-dark border border-matrix-green border-opacity-20 relative overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function DistrictsPanel() {
  const districts = useWorldStore((state) => state.districts);

  // Ensure districts is always an array
  const districtsArray = Array.isArray(districts) ? districts : [];

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col min-h-0">
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
        {t("panels.districts")}
      </h2>
      
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-matrix">

        {districtsArray.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">NO DISTRICTS</div>
        ) : (
          <div className="space-y-4 pr-2">
            {districtsArray.map((district) => (
              <div
                key={district.id}
                className="border-matrix border-matrix-green border-opacity-20 p-3 bg-matrix-dark bg-opacity-50"
              >
                <h3 className="text-matrix-green font-bold mb-3">
                  {district.name}
                </h3>

                <ResourceBar
                  label={t("districts.tension")}
                  value={district.tension || 0}
                  color="rgba(239, 68, 68, 0.8)"
                />
                <ResourceBar
                  label={t("districts.food")}
                  value={district.food || 0}
                />
                <ResourceBar
                  label={t("districts.water")}
                  value={district.water || 0}
                />
                <ResourceBar
                  label={t("districts.energy")}
                  value={district.energy || 0}
                />

                {district.hotspots && district.hotspots.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      {t("districts.hotspots")}:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {district.hotspots.map((hotspot, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                        >
                          {hotspot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
