"use client";

import { useMemo } from "react";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";
import InfoPopup from "./InfoPopup";

function ResourceBar({ label, value, color = "rgba(0, 255, 65, 0.8)", icon }) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);
  const showTextInFilled = percentage >= 15; // Only show text in filled portion if wide enough
  const hasValue = percentage > 0; // Only show filled portion if there's a value

  return (
    <div className="mb-3">
      <div className="h-8 bg-matrix-dark border border-matrix-green border-opacity-20 relative overflow-hidden rounded-md flex items-center">
        {/* Filled portion with white text - only show if percentage > 0 */}
        {hasValue && (
          <div
            className="h-full transition-all duration-300 rounded-md flex items-center px-3 relative z-10"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          >
            {showTextInFilled && (
              <div className="flex items-center gap-2 w-full min-w-0">
                {icon && <span className="text-sm flex-shrink-0">{icon}</span>}
                <span className="text-white font-semibold text-sm truncate">
                  {label}
                </span>
                <span className="text-white font-bold text-sm flex-shrink-0 ml-auto">
                  {Math.round(percentage)}%
                </span>
              </div>
            )}
          </div>
        )}
        {/* Unfilled portion - text overlay for the empty part, or full width if percentage is too low or 0 */}
        <div
          className="absolute inset-0 flex items-center px-3 pointer-events-none"
          style={{ left: showTextInFilled ? `${percentage}%` : 0, right: 0 }}
        >
          <div className="flex items-center gap-2 w-full min-w-0">
            {icon && <span className="text-sm flex-shrink-0">{icon}</span>}
            <span className="text-matrix-green-dim font-semibold text-sm truncate">
              {label}
            </span>
            <span className="text-matrix-green-dim font-bold text-sm flex-shrink-0 ml-auto">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-3 mt-4 first:mt-0">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <h4 className="text-sm font-bold text-matrix-green">{title}</h4>
      </div>
      {subtitle && (
        <p className="text-xs text-matrix-green-dim ml-7">{subtitle}</p>
      )}
    </div>
  );
}

export default function DistrictsPanel() {
  const t = useTranslation();
  const districts = useWorldStore((state) => state.districts);

  // Ensure districts is always an array - memoized to prevent unnecessary recalculations
  const districtsArray = useMemo(() => {
    return Array.isArray(districts) ? districts : [];
  }, [districts]);

  const districtsInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">DISTRICTS OVERVIEW</h3>
        <p className="mb-3">
          Districts are the fundamental geographic and administrative units of
          the Matrix simulation. Each district has its own resources,
          population, tension levels, and cultural characteristics.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">TENSION</h3>
        <p className="mb-2">
          Tension represents the overall stress level in a district (0-100%).
          High tension (&gt;80%) indicates critical instability, medium (50-80%)
          shows warning signs, and low (&lt;50%) is relatively stable.
        </p>
        <p className="mb-3">
          <strong>Tension Multi:</strong> Breakdown of tension by category:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Economic:</strong> Financial and resource-related stress
          </li>
          <li>
            <strong>Social:</strong> Interpersonal and community conflicts
          </li>
          <li>
            <strong>Political:</strong> Governance and authority issues
          </li>
          <li>
            <strong>Existential:</strong> Deep-seated fears and survival
            concerns
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">RESOURCES</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Food Stock:</strong> Available food units in the district
          </li>
          <li>
            <strong>Jobs Available:</strong> Number of employment opportunities
          </li>
          <li>
            <strong>Food/Water/Energy:</strong> Legacy resource format (0-1
            normalized values)
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">INTENT</h3>
        <p className="mb-3">
          Intent represents the district's collective goals and motivations.
          Values are percentages (0-100%) indicating the strength of each intent
          category. Common intents include expansion, stability, trade, defense,
          etc.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">PRESSURE</h3>
        <p className="mb-3">
          Pressure metrics show various external and internal forces affecting
          the district. Each pressure type is normalized (0-1) and displayed as
          a percentage. High pressure indicates significant stress in that area.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">PSYCHOLOGY</h3>
        <p className="mb-3">
          Psychological traits of the district's population. Values are
          normalized (0-1) and shown as percentages. These traits influence how
          agents in the district behave and make decisions.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">CULTURE</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Collectivism:</strong> Preference for group over individual
            (0-1)
          </li>
          <li>
            <strong>Obedience:</strong> Tendency to follow authority (0-1)
          </li>
          <li>
            <strong>Aggression:</strong> Propensity for conflict (0-1)
          </li>
          <li>
            <strong>Risk Tolerance:</strong> Willingness to take chances (0-1)
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">
          RISK FLAGS & HOTSPOTS
        </h3>
        <p className="mb-3">
          Risk flags indicate specific danger conditions in the district.
          Hotspots (legacy format) mark areas of particular concern. Both are
          displayed as badges when present.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">SCARCITY</h3>
        <p className="mb-3">
          The [SCARCITY] badge appears when a district is experiencing resource
          shortages that may lead to conflict or migration.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">
          TENSION PROGRESS BAR
        </h3>
        <p className="mb-3">
          The colored background bar in collapsed districts provides a quick
          visual indicator of tension level. Red indicates high tension, yellow
          indicates medium, and lighter red indicates lower tension.
        </p>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          {t("panels.districts")}
        </h2>
        <InfoPopup
          title="DISTRICTS DATA GUIDE"
          content={districtsInfoContent}
        />
      </div>

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
                  <Accordion.Trigger className="group w-full px-3 py-3 flex items-center justify-between text-left hover:bg-matrix-dark hover:bg-opacity-70 transition-all data-[state=open]:bg-matrix-dark data-[state=open]:bg-opacity-50 relative overflow-hidden">
                    {/* Tension Progress Background */}
                    {district.tension !== undefined && (
                      <div
                        className="absolute inset-0 opacity-20 transition-opacity duration-300"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              district.tension > 1
                                ? district.tension
                                : district.tension * 100,
                              0
                            ),
                            100
                          )}%`,
                          backgroundColor:
                            district.tension > 80 ||
                            (district.tension > 1 && district.tension > 80)
                              ? "rgba(239, 68, 68, 0.9)"
                              : district.tension > 50 ||
                                (district.tension > 1 && district.tension > 50)
                              ? "rgba(255, 193, 7, 0.8)"
                              : "rgba(239, 68, 68, 0.6)",
                        }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <h3 className="text-matrix-green font-bold">
                        {district.name}
                        {district.scarcity && (
                          <span className="ml-2 text-xs text-red-400">
                            [SCARCITY]
                          </span>
                        )}
                        {district.tension !== undefined && (
                          <span className="ml-2 text-xs text-matrix-green-dim">
                            (
                            {Math.round(
                              district.tension > 1
                                ? district.tension
                                : district.tension * 100
                            )}
                            %)
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
                    </div>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="px-4 py-4">
                    {/* Examine Button - at top */}
                    <div className="mb-4 pb-4 border-b border-matrix-green border-opacity-30">
                      <Link
                        href={`/districts/${district.id}`}
                        className="flex items-center justify-center gap-2 w-full text-center text-sm font-mono px-4 py-2.5 border-2 border-matrix-green border-opacity-40 hover:border-opacity-70 transition-all bg-matrix-dark text-matrix-green hover:text-matrix-green-bright hover:bg-matrix-dark hover:bg-opacity-70"
                      >
                        <span>🔍</span>
                        <span>EXAMINE DISTRICT</span>
                        <span>→</span>
                      </Link>
                    </div>

                    {/* Tension - REST API format (0-100) or WebSocket format (0-1) */}
                    {district.tension !== undefined && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="⚠️"
                          title="TENSION"
                          subtitle={`Overall stress level: ${Math.round(
                            district.tension > 1
                              ? district.tension
                              : district.tension * 100
                          )}%`}
                        />
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
                          icon="🔥"
                        />
                      </div>
                    )}

                    {/* Tension Multi (WebSocket format) */}
                    {district.tension_multi && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="📊"
                          title="TENSION BREAKDOWN"
                          subtitle={`Trend: ${
                            district.tension_trend || "stable"
                          }`}
                        />
                        <div className="space-y-2">
                          <ResourceBar
                            label="Economic"
                            value={(district.tension_multi.economic || 0) / 100}
                            color="rgba(239, 68, 68, 0.8)"
                            icon="💰"
                          />
                          <ResourceBar
                            label="Social"
                            value={(district.tension_multi.social || 0) / 100}
                            color="rgba(239, 68, 68, 0.7)"
                            icon="👥"
                          />
                          <ResourceBar
                            label="Political"
                            value={
                              (district.tension_multi.political || 0) / 100
                            }
                            color="rgba(239, 68, 68, 0.6)"
                            icon="🏛️"
                          />
                          <ResourceBar
                            label="Existential"
                            value={
                              (district.tension_multi.existential || 0) / 100
                            }
                            color="rgba(239, 68, 68, 0.5)"
                            icon="💀"
                          />
                        </div>
                      </div>
                    )}

                    {/* Resources - REST API format */}
                    {(district.food_stock !== undefined ||
                      district.jobs_available !== undefined ||
                      district.resources ||
                      (district.food !== undefined &&
                        district.food_stock === undefined)) && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="📦"
                          title="RESOURCES"
                          subtitle="Available supplies and opportunities"
                        />
                        {district.food_stock !== undefined && (
                          <div className="mb-3 p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span>🍞</span>
                                <span className="text-matrix-green-dim">
                                  Food Stock:
                                </span>
                              </div>
                              <span className="text-matrix-green font-bold text-base">
                                {district.food_stock}
                              </span>
                            </div>
                          </div>
                        )}

                        {district.jobs_available !== undefined && (
                          <div className="mb-3 p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span>💼</span>
                                <span className="text-matrix-green-dim">
                                  Jobs Available:
                                </span>
                              </div>
                              <span className="text-matrix-green font-bold text-base">
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
                              icon="🍞"
                            />
                            <div className="mb-3 p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span>💼</span>
                                  <span className="text-matrix-green-dim">
                                    Jobs Available:
                                  </span>
                                </div>
                                <span className="text-matrix-green font-bold">
                                  {district.resources.jobs_available || 0}
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Legacy format (food, water, energy) */}
                        {district.food !== undefined &&
                          district.food_stock === undefined && (
                            <div className="space-y-2">
                              <ResourceBar
                                label={t("districts.food")}
                                value={district.food || 0}
                                icon="🍞"
                              />
                              <ResourceBar
                                label={t("districts.water")}
                                value={district.water || 0}
                                icon="💧"
                              />
                              <ResourceBar
                                label={t("districts.energy")}
                                value={district.energy || 0}
                                icon="⚡"
                              />
                            </div>
                          )}
                      </div>
                    )}

                    {/* Intent (WebSocket format) */}
                    {district.intent && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="🎯"
                          title="INTENT"
                          subtitle="Collective goals and motivations"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(district.intent).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded flex justify-between items-center"
                              >
                                <span className="text-sm text-matrix-green-dim capitalize">
                                  {key}:
                                </span>
                                <span className="text-matrix-green font-bold">
                                  {(value * 100).toFixed(0)}%
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pressure (WebSocket format) */}
                    {district.pressure && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="⚡"
                          title="PRESSURE"
                          subtitle="External and internal forces"
                        />
                        <div className="space-y-2">
                          {Object.entries(district.pressure).map(
                            ([key, value]) => (
                              <ResourceBar
                                key={key}
                                label={key.replace(/_/g, " ").toUpperCase()}
                                value={value || 0}
                                color="rgba(255, 193, 7, 0.8)"
                                icon="📈"
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Psychology (WebSocket format) */}
                    {district.psychology && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="🧠"
                          title="PSYCHOLOGY"
                          subtitle="Population behavioral traits"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(district.psychology).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="p-2 bg-matrix-dark bg-opacity-30 border border-matrix-green border-opacity-20 rounded flex justify-between items-center"
                              >
                                <span className="text-sm text-matrix-green-dim capitalize">
                                  {key}:
                                </span>
                                <span className="text-matrix-green font-bold">
                                  {(value * 100).toFixed(0)}%
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Risk Flags (WebSocket format) */}
                    {((district.risk_flags && district.risk_flags.length > 0) ||
                      (district.hotspots && district.hotspots.length > 0)) && (
                      <div className="mb-4">
                        <SectionHeader
                          icon="🚨"
                          title="RISK INDICATORS"
                          subtitle="Danger conditions and hotspots"
                        />
                        {district.risk_flags &&
                          district.risk_flags.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {district.risk_flags.map((flag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-3 py-1.5 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-40 rounded"
                                  >
                                    ⚠️ {flag.replace(/_/g, " ").toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {district.hotspots && district.hotspots.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {district.hotspots.map((hotspot, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-3 py-1.5 bg-orange-500 bg-opacity-20 text-orange-400 border border-orange-500 border-opacity-40 rounded"
                              >
                                🔥 {hotspot}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Culture - now included directly in district data */}
                    {district.culture && (
                      <div className="mb-4 pt-4 border-t border-matrix-green border-opacity-30">
                        <SectionHeader
                          icon="🎭"
                          title="CULTURE"
                          subtitle="Social values and behavioral norms"
                        />
                        <div className="space-y-2">
                          <ResourceBar
                            label="Collectivism"
                            value={district.culture.collectivism || 0}
                            color="rgba(0, 255, 65, 0.6)"
                            icon="👥"
                          />
                          <ResourceBar
                            label="Obedience"
                            value={district.culture.obedience || 0}
                            color="rgba(0, 255, 65, 0.7)"
                            icon="✋"
                          />
                          <ResourceBar
                            label="Aggression"
                            value={district.culture.aggression || 0}
                            color="rgba(239, 68, 68, 0.7)"
                            icon="⚔️"
                          />
                          <ResourceBar
                            label="Risk Tolerance"
                            value={district.culture.risk_tolerance || 0}
                            color="rgba(255, 193, 7, 0.7)"
                            icon="🎲"
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
