"use client";

import { useEffect, useMemo } from "react";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";
import { getWorldFlags, getPopulationStats } from "../lib/matrixApi";
import InfoPopup from "./InfoPopup";

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

  // Fetch flags and population stats on mount - optimized with proper cleanup
  useEffect(() => {
    let isMounted = true;

    getWorldFlags()
      .then((data) => {
        if (isMounted && data) setFlags(data);
      })
      .catch((err) => {
        if (isMounted) console.warn("Failed to fetch flags:", err);
      });

    getPopulationStats()
      .then((data) => {
        if (isMounted && data) setPopulationStats(data);
      })
      .catch((err) => {
        if (isMounted) console.warn("Failed to fetch population stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [setFlags, setPopulationStats]);

  // Ensure arrays - memoized to prevent unnecessary recalculations
  const districtsArray = useMemo(() => {
    return Array.isArray(districts) ? districts : [];
  }, [districts]);

  const agentsArray = useMemo(() => {
    return Array.isArray(agents) ? agents : [];
  }, [agents]);

  // Get economy data from state - memoized
  const economy = useMemo(
    () => worldState?.economy || {},
    [worldState?.economy]
  );

  // average_tension from API is already a percentage (0-100) - memoized
  const avgTension = useMemo(() => {
    return economy.average_tension !== undefined
      ? economy.average_tension
      : districtsArray.length > 0
      ? (districtsArray.reduce((sum, d) => sum + (d.tension || 0), 0) /
          districtsArray.length) *
        100
      : 0;
  }, [economy.average_tension, districtsArray]);

  const worldSummaryInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">
          WORLD SUMMARY OVERVIEW
        </h3>
        <p className="mb-3">
          The World Summary provides a high-level view of the entire Matrix
          simulation, including economy metrics, population statistics, system
          health, and global events.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">BASIC METRICS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Districts:</strong> Total number of districts in the
            simulation
          </li>
          <li>
            <strong>Agents:</strong> Total number of active agents
          </li>
          <li>
            <strong>Avg Tension:</strong> Average tension across all districts
            (0-100%)
          </li>
          <li>
            <strong>Total Food:</strong> Combined food stock across all
            districts
          </li>
          <li>
            <strong>Total Credits:</strong> Combined currency/wealth in the
            system
          </li>
          <li>
            <strong>Global Tension Index:</strong> Overall system-wide stress
            indicator (0-1, shown as %)
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">SYSTEM HEALTH</h3>
        <p className="mb-2">Overall stability assessment of the simulation:</p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Stability:</strong> Current system state (e.g.,
            "recovering", "stable", "unstable")
          </li>
          <li>
            <strong>Risk Level:</strong> Threat assessment (e.g., "low",
            "medium", "high", "critical")
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">METRICS</h3>
        <p className="mb-2">
          Core simulation quality metrics (0-1, displayed as 0-100%):
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Stability:</strong> How stable the simulation is running
          </li>
          <li>
            <strong>Novelty:</strong> Amount of new/interesting events occurring
          </li>
          <li>
            <strong>Cohesion:</strong> How well-connected and unified the system
            is
          </li>
          <li>
            <strong>Expression:</strong> Level of agent agency and
            self-expression
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">TENSION HOTSPOTS</h3>
        <p className="mb-3">
          Districts with elevated tension levels. Displayed with district name
          and tension percentage. Color coding: Red (&gt;15%), Yellow (5-15%),
          Green (&lt;5%).
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">ACTIVE EVENTS</h3>
        <p className="mb-3">
          Currently ongoing events in the simulation. Displayed as badges with
          event names in uppercase format.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">WARNINGS</h3>
        <p className="mb-3">
          System warnings about potential issues or anomalies in the simulation.
          Displayed with a warning icon (⚠).
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">DEATH COUNTS</h3>
        <p className="mb-3">
          Statistics on agent deaths by cause. Each entry shows the cause of
          death and the number of agents who died from it. Common causes include
          exhaustion, starvation, conflict, etc.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">POPULATION</h3>
        <p className="mb-2">Detailed population statistics:</p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Alive:</strong> Number of currently living agents
          </li>
          <li>
            <strong>Total:</strong> Total agents (alive + deceased) in history
          </li>
          <li>
            <strong>Children:</strong> Count of agents in child age group
          </li>
          <li>
            <strong>Adults:</strong> Count of agents in adult age group
          </li>
          <li>
            <strong>Elderly:</strong> Count of agents in elderly age group
          </li>
          <li>
            <strong>Avg Age:</strong> Average age of all agents
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">WORLD FLAGS</h3>
        <p className="mb-2">
          World flags are significant events or conditions that have been
          triggered in the simulation. Each flag includes:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>ID:</strong> Unique identifier for the flag
          </li>
          <li>
            <strong>Description:</strong> What the flag represents
          </li>
          <li>
            <strong>Triggered At Turn:</strong> When the flag was activated
          </li>
          <li>
            <strong>Irreversible:</strong> Whether the flag's effects can be
            undone
          </li>
          <li>
            <strong>Effects:</strong> Changes the flag has caused (may be nested
            objects)
          </li>
        </ul>
        <p className="mb-3">
          Flags can have lasting impacts on the simulation and may affect
          multiple districts or the entire system.
        </p>
      </div>
    </>
  );

  return (
    <div
      className={`bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0 ${className}`}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          {t("panels.worldSummary")}
        </h2>
        <InfoPopup
          title="WORLD SUMMARY DATA GUIDE"
          content={worldSummaryInfoContent}
        />
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
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

        {/* Death Counts */}
        {economy.death_counts &&
          Object.keys(economy.death_counts).length > 0 && (
            <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
              <div className="text-matrix-green-dim text-xs mb-2">
                DEATH COUNTS
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(economy.death_counts).map(([cause, count]) => (
                  <div key={cause} className="flex justify-between">
                    <span className="text-matrix-green-dim capitalize">
                      {cause.replace(/_/g, " ")}:
                    </span>
                    <span className="text-red-400 font-bold">{count}</span>
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
    </div>
  );
}
