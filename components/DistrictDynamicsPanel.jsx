"use client";

import { useEffect, useState, useMemo } from "react";
import { getDistrictsDynamics, getDistrictsWars, getCollapsedDistricts } from "../lib/matrixApi";
import { useTranslation } from "../lib/useTranslation";
import InfoPopup from "./InfoPopup";
import Link from "next/link";

export default function DistrictDynamicsPanel() {
  const t = useTranslation();
  const [dynamics, setDynamics] = useState(null);
  const [wars, setWars] = useState(null);
  const [collapsed, setCollapsed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [dynamicsData, warsData, collapsedData] = await Promise.all([
          getDistrictsDynamics(),
          getDistrictsWars(),
          getCollapsedDistricts(),
        ]);

        if (isMounted) {
          setDynamics(dynamicsData);
          setWars(warsData);
          setCollapsed(collapsedData);
        }
      } catch (error) {
        console.error("Failed to fetch district dynamics:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const districtDynamicsInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">DISTRICT DYNAMICS</h3>
        <p className="mb-3">
          This panel shows the overall state of districts in the Matrix
          simulation, including active districts, wars, collapses, and recent
          events.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">DISTRICT STATES</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Active:</strong> Districts functioning normally
          </li>
          <li>
            <strong>Struggling:</strong> Districts facing difficulties but still
            operational
          </li>
          <li>
            <strong>At War:</strong> Districts currently engaged in conflict
          </li>
          <li>
            <strong>Collapsed:</strong> Districts that have failed
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">WARS</h3>
        <p className="mb-3">
          Active wars between districts. Wars can result in casualties, resource
          transfers, and district collapses.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">RECENT EVENTS</h3>
        <p className="mb-3">
          Recent significant events affecting districts, including battles,
          refugee movements, war victories, and other major occurrences. Events
          are displayed with turn number, event type, description, and affected
          region.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">SYSTEM STATUS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Emergency Aid:</strong> System-wide protection mechanism
            status
          </li>
          <li>
            <strong>Collapse Cooldown:</strong> Turns remaining before new
            collapses can occur
          </li>
          <li>
            <strong>Min/Max Districts:</strong> Enforced limits on district
            count
          </li>
          <li>
            <strong>New District Cooldown:</strong> Turns remaining before new
            districts can be established
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">PROTECTED DISTRICTS</h3>
        <p className="mb-3">
          Districts that are currently protected from collapse by the emergency
          aid system. These districts are marked with a shield icon.
        </p>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            DISTRICT DYNAMICS
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-matrix-green-dim text-sm matrix-typing-inline">
            Loading dynamics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          DISTRICT DYNAMICS
        </h2>
        <InfoPopup
          title="DISTRICT DYNAMICS GUIDE"
          content={districtDynamicsInfoContent}
        />
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {dynamics && (
          <>
            {/* District Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  ACTIVE DISTRICTS
                </div>
                <div className="text-lg font-bold text-green-400">
                  {dynamics.active_districts || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  STRUGGLING DISTRICTS
                </div>
                <div className="text-lg font-bold text-yellow-400">
                  {dynamics.struggling_districts || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  DISTRICTS AT WAR
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {dynamics.districts_at_war || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  COLLAPSED DISTRICTS
                </div>
                <div className="text-lg font-bold text-red-400">
                  {dynamics.collapsed_districts || 0}
                </div>
              </div>
            </div>

            {/* War Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  ACTIVE WARS
                </div>
                <div className="text-lg font-bold text-red-400">
                  {dynamics.active_wars || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  TOTAL WARS
                </div>
                <div className="text-lg font-bold text-matrix-green">
                  {dynamics.total_wars || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  TOTAL MERGES
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {dynamics.total_merges || 0}
                </div>
              </div>
              <div className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-1">
                  TOTAL COLLAPSES
                </div>
                <div className="text-lg font-bold text-red-400">
                  {dynamics.total_collapses || 0}
                </div>
              </div>
            </div>

            {/* System Status */}
            {(dynamics.protected_districts ||
              dynamics.emergency_aid_active !== undefined ||
              dynamics.collapse_cooldown_remaining !== undefined ||
              dynamics.min_districts_enforced !== undefined ||
              dynamics.max_districts !== undefined) && (
              <div className="mb-4 pt-4 border-t border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-3 font-bold">
                  SYSTEM STATUS
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {dynamics.emergency_aid_active !== undefined && (
                    <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                      <div className="text-xs text-matrix-green-dim mb-1">
                        EMERGENCY AID
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          dynamics.emergency_aid_active
                            ? "text-yellow-400"
                            : "text-matrix-green-dim"
                        }`}
                      >
                        {dynamics.emergency_aid_active ? "● ACTIVE" : "○ INACTIVE"}
                      </div>
                    </div>
                  )}
                  {dynamics.collapse_cooldown_remaining !== undefined && (
                    <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                      <div className="text-xs text-matrix-green-dim mb-1">
                        COLLAPSE COOLDOWN
                      </div>
                      <div className="text-sm font-bold text-matrix-green">
                        {dynamics.collapse_cooldown_remaining} turns
                      </div>
                    </div>
                  )}
                  {dynamics.min_districts_enforced !== undefined && (
                    <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                      <div className="text-xs text-matrix-green-dim mb-1">
                        MIN DISTRICTS
                      </div>
                      <div className="text-sm font-bold text-blue-400">
                        {dynamics.min_districts_enforced}
                      </div>
                    </div>
                  )}
                  {dynamics.max_districts !== undefined && (
                    <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                      <div className="text-xs text-matrix-green-dim mb-1">
                        MAX DISTRICTS
                      </div>
                      <div className="text-sm font-bold text-purple-400">
                        {dynamics.max_districts}
                      </div>
                    </div>
                  )}
                </div>
                {dynamics.total_districts_established !== undefined && (
                  <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded mb-3">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      TOTAL DISTRICTS ESTABLISHED
                    </div>
                    <div className="text-sm font-bold text-matrix-green">
                      {dynamics.total_districts_established}
                    </div>
                  </div>
                )}
                {dynamics.new_district_cooldown_remaining !== undefined && (
                  <div className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                    <div className="text-xs text-matrix-green-dim mb-1">
                      NEW DISTRICT COOLDOWN
                    </div>
                    <div className="text-sm font-bold text-matrix-green">
                      {dynamics.new_district_cooldown_remaining} turns
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Protected Districts */}
            {dynamics.protected_districts &&
              dynamics.protected_districts.length > 0 && (
                <div className="mb-4 pt-4 border-t border-matrix-green border-opacity-20">
                  <div className="text-xs text-matrix-green-dim mb-2">
                    PROTECTED DISTRICTS ({dynamics.protected_districts.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dynamics.protected_districts.map((districtId) => (
                      <Link
                        key={districtId}
                        href={`/districts/${districtId}`}
                        className="text-xs px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30 hover:border-opacity-60 transition-all"
                      >
                        🛡️ {districtId.replace("region_", "").toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* Pending New Districts */}
            {dynamics.pending_new_districts &&
              dynamics.pending_new_districts.length > 0 && (
                <div className="mb-4 pt-4 border-t border-matrix-green border-opacity-20">
                  <div className="text-xs text-matrix-green-dim mb-2">
                    PENDING NEW DISTRICTS ({dynamics.pending_new_districts.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dynamics.pending_new_districts.map((districtId, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-30"
                      >
                        ⏳ {typeof districtId === "string"
                          ? districtId.replace("region_", "").toUpperCase()
                          : districtId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Collapsed Districts List */}
            {collapsed && collapsed.collapsed && collapsed.collapsed.length > 0 && (
              <div className="mb-4 pt-4 border-t border-matrix-green border-opacity-20">
                <div className="text-xs text-matrix-green-dim mb-2">
                  COLLAPSED DISTRICTS ({collapsed.collapsed.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {collapsed.collapsed.map((districtId) => (
                    <Link
                      key={districtId}
                      href={`/districts/${districtId}`}
                      className="text-xs px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 hover:border-opacity-60 transition-all"
                    >
                      {districtId.replace("region_", "").toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events */}
            {dynamics.recent_events &&
              dynamics.recent_events.length > 0 && (
                <div className="pt-4 border-t border-matrix-green border-opacity-20">
                  <div className="text-xs text-matrix-green-dim mb-2">
                    RECENT EVENTS ({dynamics.recent_events.length})
                  </div>
                  <div className="space-y-2">
                    {dynamics.recent_events
                      .slice()
                      .reverse()
                      .map((event, idx) => {
                        const [turn, type, description, region] = event;
                        return (
                          <div
                            key={idx}
                            className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 text-xs"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-matrix-green-dim font-mono">
                                Turn {turn}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  type === "war_victory"
                                    ? "bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500 border-opacity-30"
                                    : type === "war_declared"
                                    ? "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                                    : type === "battle"
                                    ? "bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30"
                                    : type === "district_struggling"
                                    ? "bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-30"
                                    : type === "district_recovered"
                                    ? "bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30"
                                    : type === "refugees_arrived"
                                    ? "bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30"
                                    : "bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-30"
                                }`}
                              >
                                {type.replace(/_/g, " ").toUpperCase()}
                              </span>
                            </div>
                            <div className="text-matrix-green mb-1">
                              {description}
                            </div>
                            {region && (
                              <div className="text-matrix-green-dim">
                                Region:{" "}
                                <Link
                                  href={`/districts/${region}`}
                                  className="text-matrix-green hover:text-matrix-green-bright"
                                >
                                  {region.replace("region_", "").toUpperCase()}
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
          </>
        )}

        {!dynamics && !loading && (
          <div className="text-matrix-green-dim text-sm">
            NO DYNAMICS DATA AVAILABLE
          </div>
        )}
      </div>
    </div>
  );
}
