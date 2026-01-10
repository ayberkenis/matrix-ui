"use client";

import { useState, useEffect } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";
import { getDistrictCulture } from "../lib/matrixApi";

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
  const t = useTranslation();
  const districts = useWorldStore((state) => state.districts);
  const districtCultures = useWorldStore((state) => state.districtCultures);
  const setDistrictCulture = useWorldStore((state) => state.setDistrictCulture);

  // Ensure districts is always an array
  const districtsArray = Array.isArray(districts) ? districts : [];

  // Fetch culture for districts that don't have it yet
  useEffect(() => {
    districtsArray.forEach((district) => {
      if (district.id && !districtCultures[district.id]) {
        getDistrictCulture(district.id)
          .then((data) => {
            if (data?.culture) {
              setDistrictCulture(district.id, data.culture);
            }
          })
          .catch((err) => {
            console.warn(`Failed to fetch culture for ${district.id}:`, err);
          });
      }
    });
  }, [districtsArray, districtCultures, setDistrictCulture]);

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
        {t("panels.districts")}
      </h2>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {districtsArray.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">NO DISTRICTS</div>
        ) : (
          <Accordion.Root
            type="multiple"
            defaultValue={[]}
            className="space-y-2 pr-2"
          >
            {districtsArray.map((district) => (
              <Accordion.Item
                key={district.id}
                value={district.id}
                className="border-matrix border-matrix-green border-opacity-20 bg-matrix-dark bg-opacity-50 overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group w-full px-3 py-3 flex items-center justify-between text-left hover:bg-matrix-dark hover:bg-opacity-70 transition-all data-[state=open]:bg-matrix-dark data-[state=open]:bg-opacity-50">
                    <h3 className="text-matrix-green font-bold">
                      {district.name}
                      {district.scarcity && (
                        <span className="ml-2 text-xs text-red-400">
                          [SCARCITY]
                        </span>
                      )}
                    </h3>
                    <svg
                      className="w-4 h-4 text-matrix-green transition-transform duration-200 group-data-[state=open]:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-3 pb-3">

                {/* Tension - REST API format (0-100) or WebSocket format (0-1) */}
                {district.tension !== undefined && (
                  <ResourceBar
                    label={t("districts.tension")}
                    value={
                      district.tension > 1
                        ? district.tension / 100
                        : district.tension
                    }
                    color={
                      district.tension > 80
                        ? "rgba(239, 68, 68, 0.9)"
                        : district.tension > 50
                        ? "rgba(255, 193, 7, 0.8)"
                        : "rgba(239, 68, 68, 0.6)"
                    }
                  />
                )}

                {/* Tension Multi (WebSocket format) */}
                {district.tension_multi && (
                  <div className="mb-3">
                    <div className="text-xs text-matrix-green-dim mb-2">
                      TENSION: {district.tension?.toFixed(1) || 0}% (
                      {district.tension_trend || "stable"})
                    </div>
                    <div className="space-y-1">
                      <ResourceBar
                        label="Economic"
                        value={(district.tension_multi.economic || 0) / 100}
                        color="rgba(239, 68, 68, 0.8)"
                      />
                      <ResourceBar
                        label="Social"
                        value={(district.tension_multi.social || 0) / 100}
                        color="rgba(239, 68, 68, 0.7)"
                      />
                      <ResourceBar
                        label="Political"
                        value={(district.tension_multi.political || 0) / 100}
                        color="rgba(239, 68, 68, 0.6)"
                      />
                      <ResourceBar
                        label="Existential"
                        value={(district.tension_multi.existential || 0) / 100}
                        color="rgba(239, 68, 68, 0.5)"
                      />
                    </div>
                  </div>
                )}

                {/* Resources - REST API format */}
                {district.food_stock !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-matrix-green-dim">Food Stock:</span>
                      <span className="text-matrix-green font-bold">
                        {district.food_stock}
                      </span>
                    </div>
                  </div>
                )}

                {/* Jobs Available - REST API format */}
                {district.jobs_available !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-matrix-green-dim">
                        Jobs Available:
                      </span>
                      <span className="text-matrix-green font-bold">
                        {district.jobs_available}
                      </span>
                    </div>
                  </div>
                )}

                {/* Resources (WebSocket format) */}
                {district.resources && !district.food_stock && (
                  <>
                    <ResourceBar
                      label="Food Stock"
                      value={(district.resources.food_stock || 0) / 100}
                    />
                    <div className="text-xs text-matrix-green-dim mb-2">
                      Jobs Available: {district.resources.jobs_available || 0}
                    </div>
                  </>
                )}

                {/* Legacy format (food, water, energy) */}
                {district.food !== undefined &&
                  district.food_stock === undefined && (
                    <>
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
                    </>
                  )}

                {/* Intent (WebSocket format) */}
                {district.intent && (
                  <div className="mt-3 mb-2">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      INTENT:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(district.intent).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-matrix-green-dim capitalize">
                            {key}:
                          </span>
                          <span className="text-matrix-green">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pressure (WebSocket format) */}
                {district.pressure && (
                  <div className="mt-3 mb-2">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      PRESSURE:
                    </div>
                    <div className="space-y-1">
                      {Object.entries(district.pressure).map(([key, value]) => (
                        <ResourceBar
                          key={key}
                          label={key.replace(/_/g, " ").toUpperCase()}
                          value={value || 0}
                          color="rgba(255, 193, 7, 0.8)"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Psychology (WebSocket format) */}
                {district.psychology && (
                  <div className="mt-3 mb-2">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      PSYCHOLOGY:
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      {Object.entries(district.psychology).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-matrix-green-dim capitalize">
                              {key}:
                            </span>
                            <span className="text-matrix-green">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Flags (WebSocket format) */}
                {district.risk_flags && district.risk_flags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      RISK FLAGS:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {district.risk_flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                        >
                          {flag.replace(/_/g, " ").toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotspots (legacy) */}
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

                {/* Culture */}
                {districtCultures[district.id] && (
                  <div className="mt-3 pt-3 border-t border-matrix-green border-opacity-20">
                    <div className="text-xs text-matrix-green font-bold mb-2">
                      CULTURE:
                    </div>
                    <div className="space-y-1">
                      <ResourceBar
                        label="Collectivism"
                        value={districtCultures[district.id].collectivism || 0}
                        color="rgba(0, 255, 65, 0.6)"
                      />
                      <ResourceBar
                        label="Obedience"
                        value={districtCultures[district.id].obedience || 0}
                        color="rgba(0, 255, 65, 0.7)"
                      />
                      <ResourceBar
                        label="Aggression"
                        value={districtCultures[district.id].aggression || 0}
                        color="rgba(239, 68, 68, 0.7)"
                      />
                      <ResourceBar
                        label="Risk Tolerance"
                        value={districtCultures[district.id].risk_tolerance || 0}
                        color="rgba(255, 193, 7, 0.7)"
                      />
                    </div>
                  </div>
                )}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </div>
    </div>
  );
}
