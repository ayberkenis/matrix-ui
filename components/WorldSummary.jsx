"use client";

import { useEffect } from "react";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";
import { getWorldFlags, getPopulationStats } from "../lib/matrixApi";

export default function WorldSummary({ className = "" }) {
  const t = useTranslation();
  const worldState = useWorldStore((state) => state.state);
  const metrics = useWorldStore((state) => state.metrics);
  const districts = useWorldStore((state) => state.districts);
  const agents = useWorldStore((state) => state.agents);
  const flags = useWorldStore((state) => state.flags);
  const populationStats = useWorldStore((state) => state.populationStats);
  const setFlags = useWorldStore((state) => state.setFlags);
  const setPopulationStats = useWorldStore((state) => state.setPopulationStats);

  // Fetch flags and population stats on mount
  useEffect(() => {
    getWorldFlags()
      .then((data) => {
        if (data) setFlags(data);
      })
      .catch((err) => console.warn("Failed to fetch flags:", err));

    getPopulationStats()
      .then((data) => {
        if (data) setPopulationStats(data);
      })
      .catch((err) => console.warn("Failed to fetch population stats:", err));
  }, [setFlags, setPopulationStats]);

  // Ensure arrays
  const districtsArray = Array.isArray(districts) ? districts : [];
  const agentsArray = Array.isArray(agents) ? agents : [];

  // Get economy data from state
  const economy = worldState?.economy || {};
  // average_tension from API is already a percentage (0-100)
  const avgTension =
    economy.average_tension !== undefined
      ? economy.average_tension
      : districtsArray.length > 0
      ? (districtsArray.reduce((sum, d) => sum + (d.tension || 0), 0) /
          districtsArray.length) *
        100
      : 0;

  return (
    <div
      className={`bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 mb-4 ${className}`}
    >
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider">
        {t("panels.worldSummary")}
      </h2>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-matrix-green-dim mb-1">DISTRICTS</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.district_count || districtsArray.length}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">AGENTS</div>
          <div className="text-matrix-green text-xl font-bold">
            {agentsArray.length}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">AVG TENSION</div>
          <div className="text-matrix-green text-xl font-bold">
            {Math.round(avgTension)}%
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">TOTAL FOOD</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.total_food || "--"}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">TOTAL CREDITS</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.total_credits || "--"}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">GLOBAL TENSION</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.global_tension_index !== undefined
              ? (economy.global_tension_index * 100).toFixed(1) + "%"
              : "--"}
          </div>
        </div>
        {economy.system_health && (
          <div>
            <div className="text-matrix-green-dim mb-1">SYSTEM HEALTH</div>
            <div className="text-matrix-green text-xl font-bold">
              {economy.system_health.stability || "--"}
            </div>
            <div className="text-xs text-matrix-green-dim">
              Risk: {economy.system_health.risk_level || "--"}
            </div>
          </div>
        )}
        {metrics && (
          <>
            <div>
              <div className="text-matrix-green-dim mb-1">
                {t("metrics.stability")}
              </div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.stability || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">
                {t("metrics.novelty")}
              </div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.novelty || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">
                {t("metrics.cohesion")}
              </div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.cohesion || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">
                {t("metrics.expression")}
              </div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.expression || 0) * 100)}%
              </div>
            </div>
          </>
        )}
      </div>

      {/* Economy Hotspots */}
      {economy.hotspots &&
        Array.isArray(economy.hotspots) &&
        economy.hotspots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
            <div className="text-matrix-green-dim text-xs mb-2">
              TENSION HOTSPOTS
            </div>
            <div className="space-y-1">
              {economy.hotspots.map((hotspot, idx) => (
                <div key={idx} className="text-xs flex justify-between">
                  <span className="text-matrix-green-dim">
                    {hotspot.district}:
                  </span>
                  <span
                    className={
                      hotspot.tension > 15
                        ? "text-red-400"
                        : hotspot.tension > 5
                        ? "text-yellow-400"
                        : "text-matrix-green"
                    }
                  >
                    {hotspot.tension.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Active Events */}
      {economy.active_events &&
        Array.isArray(economy.active_events) &&
        economy.active_events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
            <div className="text-matrix-green-dim text-xs mb-2">
              ACTIVE EVENTS
            </div>
            <div className="flex flex-wrap gap-1">
              {economy.active_events.map((event, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500 border-opacity-30"
                >
                  {event.replace(/_/g, " ").toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

      {worldState?.warnings && worldState.warnings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
          <div className="text-matrix-green-dim text-xs mb-2">WARNINGS</div>
          <div className="space-y-1">
            {worldState.warnings.map((warning, idx) => (
              <div key={idx} className="text-xs text-yellow-500">
                ⚠ {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Population Stats */}
      {populationStats && (
        <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
          <div className="text-matrix-green-dim text-xs mb-2">POPULATION</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-matrix-green-dim">Alive:</span>{" "}
              <span className="text-matrix-green font-bold">
                {populationStats.alive || 0}
              </span>
            </div>
            <div>
              <span className="text-matrix-green-dim">Total:</span>{" "}
              <span className="text-matrix-green font-bold">
                {populationStats.total || 0}
              </span>
            </div>
            {populationStats.age_groups && (
              <>
                <div>
                  <span className="text-matrix-green-dim">Children:</span>{" "}
                  <span className="text-matrix-green">
                    {populationStats.age_groups.children || 0}
                  </span>
                </div>
                <div>
                  <span className="text-matrix-green-dim">Adults:</span>{" "}
                  <span className="text-matrix-green">
                    {populationStats.age_groups.adults || 0}
                  </span>
                </div>
                <div>
                  <span className="text-matrix-green-dim">Elderly:</span>{" "}
                  <span className="text-matrix-green">
                    {populationStats.age_groups.elderly || 0}
                  </span>
                </div>
                <div>
                  <span className="text-matrix-green-dim">Avg Age:</span>{" "}
                  <span className="text-matrix-green">
                    {Math.round(populationStats.average_age || 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* World Flags */}
      {flags && flags.flags && flags.flags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
          <div className="text-matrix-green-dim text-xs mb-2">
            WORLD FLAGS ({flags.count || flags.flags.length})
          </div>
          <div className="space-y-2">
            {flags.flags.map((flag, idx) => (
              <div
                key={flag.id || idx}
                className="border border-matrix-green border-opacity-30 p-2 bg-matrix-dark bg-opacity-50"
              >
                <div className="text-xs text-matrix-green font-bold mb-1">
                  {flag.id?.replace(/_/g, " ").toUpperCase()}
                </div>
                <div className="text-xs text-matrix-green-dim mb-1">
                  {flag.description}
                </div>
                <div className="text-xs text-matrix-green-dim">
                  Triggered: Turn {flag.triggered_at_turn}
                  {flag.irreversible && (
                    <span className="ml-2 text-red-400">[IRREVERSIBLE]</span>
                  )}
                </div>
                {flag.effects && (
                  <div className="mt-2 text-xs">
                    <div className="text-matrix-green-dim mb-1">EFFECTS:</div>
                    <div className="grid grid-cols-2 gap-1 ml-2">
                      {Object.entries(flag.effects).map(([key, value]) => {
                        if (typeof value === "object" && value !== null) {
                          return (
                            <div key={key} className="col-span-2">
                              <span className="text-matrix-green-dim capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <div className="ml-2 mt-1">
                                {Object.entries(value).map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="text-matrix-green-dim"
                                  >
                                    {k}: {(v * 100).toFixed(0)}%
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={key}>
                            <span className="text-matrix-green-dim capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>{" "}
                            <span className="text-matrix-green">
                              {typeof value === "number"
                                ? (value * 100).toFixed(0) + "%"
                                : value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
