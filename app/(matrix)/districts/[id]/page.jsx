"use client";

import { useParams } from "next/navigation";
import { useWorldStore } from "../../../../store/worldStore";
import { useTranslation } from "../../../../lib/useTranslation";
import Link from "next/link";

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

export default function DistrictDetailPage() {
  const params = useParams();
  const districtId = params.id;
  const t = useTranslation();
  const districts = useWorldStore((state) => state.districts);

  const district = Array.isArray(districts)
    ? districts.find((d) => d.id === districtId)
    : null;

  if (!district) {
    return (
      <div className="h-full p-8">
        <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6">
          <h1 className="text-xl font-bold text-matrix-green mb-4">
            District Not Found
          </h1>
          <p className="text-matrix-green-dim mb-4">
            The district with ID "{districtId}" could not be found.
          </p>
          <Link
            href="/"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 lg:p-8 lg:overflow-y-auto">
      <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-matrix-green text-matrix-glow mb-2">
              {district.name}
            </h1>
            <p className="text-matrix-green-dim text-sm">ID: {district.id}</p>
          </div>
          <Link
            href="/"
            className="text-matrix-green hover:text-matrix-green-bright border border-matrix-green border-opacity-30 px-4 py-2 hover:border-opacity-60 transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Tension */}
          {district.tension !== undefined && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                TENSION
              </h2>
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
              {district.tension_trend && (
                <p className="text-xs text-matrix-green-dim mt-1">
                  Trend: {district.tension_trend}
                </p>
              )}
            </div>
          )}

          {/* Tension Multi */}
          {district.tension_multi && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                TENSION BREAKDOWN
              </h2>
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

          {/* Resources */}
          <div>
            <h2 className="text-lg font-bold text-matrix-green mb-3">
              RESOURCES
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {district.food_stock !== undefined && (
                <div>
                  <span className="text-matrix-green-dim">Food Stock:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {district.food_stock}
                  </span>
                </div>
              )}
              {district.jobs_available !== undefined && (
                <div>
                  <span className="text-matrix-green-dim">Jobs Available:</span>{" "}
                  <span className="text-matrix-green font-bold">
                    {district.jobs_available}
                  </span>
                </div>
              )}
              {district.resources && (
                <>
                  <div>
                    <span className="text-matrix-green-dim">Food Stock:</span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.resources.food_stock || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-matrix-green-dim">
                      Jobs Available:
                    </span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.resources.jobs_available || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Intent */}
          {district.intent && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                INTENT
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
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

          {/* Pressure */}
          {district.pressure && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                PRESSURE
              </h2>
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

          {/* Psychology */}
          {district.psychology && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                PSYCHOLOGY
              </h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Object.entries(district.psychology).map(([key, value]) => (
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

          {/* Culture */}
          {district.culture && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                CULTURE
              </h2>
              <div className="space-y-1">
                <ResourceBar
                  label="Collectivism"
                  value={district.culture.collectivism || 0}
                  color="rgba(0, 255, 65, 0.6)"
                />
                <ResourceBar
                  label="Obedience"
                  value={district.culture.obedience || 0}
                  color="rgba(0, 255, 65, 0.7)"
                />
                <ResourceBar
                  label="Aggression"
                  value={district.culture.aggression || 0}
                  color="rgba(239, 68, 68, 0.7)"
                />
                <ResourceBar
                  label="Risk Tolerance"
                  value={district.culture.risk_tolerance || 0}
                  color="rgba(255, 193, 7, 0.7)"
                />
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {district.risk_flags && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                RISK FLAGS
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(district.risk_flags).map(([key, value]) => (
                  <span
                    key={key}
                    className={`text-xs px-3 py-1 border ${
                      value
                        ? "bg-red-500 bg-opacity-20 text-red-400 border-red-500 border-opacity-30"
                        : "bg-matrix-dark bg-opacity-50 text-matrix-green-dim border-matrix-green border-opacity-20"
                    }`}
                  >
                    {key.replace(/_/g, " ").toUpperCase()}:{" "}
                    {value ? "YES" : "NO"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          {district.recent_events && district.recent_events.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                RECENT EVENTS
              </h2>
              <div className="space-y-2">
                {district.recent_events.map((event, idx) => (
                  <div
                    key={idx}
                    className="border border-matrix-green border-opacity-20 p-3 bg-matrix-dark bg-opacity-30"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-matrix-green font-bold text-sm">
                        {event.type?.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span className="text-matrix-green-dim text-xs">
                        Turn {event.turn}
                      </span>
                    </div>
                    {event.severity !== undefined && (
                      <div className="text-xs text-matrix-green-dim">
                        Severity: {(event.severity * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Population Stats */}
          {(district.active_agents !== undefined ||
            district.total_population !== undefined ||
            district.child_pool !== undefined) && (
            <div>
              <h2 className="text-lg font-bold text-matrix-green mb-3">
                POPULATION
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {district.active_agents !== undefined && (
                  <div>
                    <span className="text-matrix-green-dim">
                      Active Agents:
                    </span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.active_agents}
                    </span>
                  </div>
                )}
                {district.total_population !== undefined && (
                  <div>
                    <span className="text-matrix-green-dim">
                      Total Population:
                    </span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.total_population}
                    </span>
                  </div>
                )}
                {district.child_pool !== undefined && (
                  <div>
                    <span className="text-matrix-green-dim">Child Pool:</span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.child_pool}
                    </span>
                  </div>
                )}
                {district.population_pressure !== undefined && (
                  <div>
                    <span className="text-matrix-green-dim">
                      Population Pressure:
                    </span>{" "}
                    <span className="text-matrix-green font-bold">
                      {(district.population_pressure * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {district.birth_pressure !== undefined && (
                  <div>
                    <span className="text-matrix-green-dim">
                      Birth Pressure:
                    </span>{" "}
                    <span className="text-matrix-green font-bold">
                      {district.birth_pressure.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
