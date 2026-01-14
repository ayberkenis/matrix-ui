"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useWorldStore } from "../../store/worldStore";
import { getDistrictsDynamics } from "../../lib/matrixApi";

export default function HomePage() {
  const state = useWorldStore((state) => state.state);
  const agents = useWorldStore((state) => state.agents);
  const districts = useWorldStore((state) => state.districts);
  const events = useWorldStore((state) => state.events);
  const wsStatus = useWorldStore((state) => state.wsStatus);
  const [districtDynamics, setDistrictDynamics] = useState(null);

  // Fetch district dynamics
  useEffect(() => {
    getDistrictsDynamics()
      .then((data) => setDistrictDynamics(data))
      .catch((err) => console.warn("Failed to fetch district dynamics:", err));

    const interval = setInterval(() => {
      getDistrictsDynamics()
        .then((data) => setDistrictDynamics(data))
        .catch((err) =>
          console.warn("Failed to fetch district dynamics:", err)
        );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const agentsArray = Array.isArray(agents) ? agents : [];
    const districtsArray = Array.isArray(districts) ? districts : [];
    const eventsArray = Array.isArray(events) ? events : [];

    const aliveAgents = agentsArray.filter((a) => a.is_alive !== false).length;
    const totalAgents = agentsArray.length;

    const activeDistricts =
      districtDynamics?.active_districts ||
      districtsArray.filter((d) => {
        const tension =
          d.tension !== undefined
            ? d.tension > 1
              ? d.tension
              : d.tension * 100
            : 0;
        return tension < 50;
      }).length;

    const collapsedDistricts = districtDynamics?.collapsed_districts || 0;
    const districtsAtWar = districtDynamics?.districts_at_war || 0;
    const activeWars = districtDynamics?.active_wars || 0;

    const recentEvents = eventsArray.slice(0, 5);

    return {
      turn: state?.turn || 0,
      day: state?.day || 0,
      time: state?.time || "Initializing...",
      aliveAgents,
      totalAgents,
      districts: districtsArray.length,
      activeDistricts,
      collapsedDistricts,
      districtsAtWar,
      activeWars,
      totalEvents: eventsArray.length,
      recentEvents,
      isLive: wsStatus === "connected",
    };
  }, [state, agents, districts, events, districtDynamics, wsStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Hero section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-matrix-green text-matrix-glow tracking-wider">
              MATRIX
            </h1>
            {stats.isLive && (
              <div className="relative">
                <div className="absolute inset-0 bg-matrix-green rounded-full animate-ping opacity-75" />
                <div className="relative w-4 h-4 bg-matrix-green rounded-full" />
              </div>
            )}
          </div>
          <p className="text-xl md:text-2xl text-matrix-green-dim mb-4">
            Live AI Simulation Platform
          </p>
          <p className="text-sm md:text-base text-matrix-green-dim opacity-70">
            {stats.isLive ? (
              <span className="text-matrix-green">● LIVE</span>
            ) : (
              <span className="text-matrix-green-dim">○ CONNECTING...</span>
            )}{" "}
            • Turn {stats.turn} • {stats.time}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard
            label="AGENTS"
            value={stats.aliveAgents}
            total={stats.totalAgents}
            icon="👤"
            color="text-blue-400"
            glowColor="rgba(96, 165, 250, 0.3)"
          />
          <StatCard
            label="DISTRICTS"
            value={stats.activeDistricts}
            total={stats.districts}
            icon="🏛️"
            color="text-purple-400"
            glowColor="rgba(196, 181, 253, 0.3)"
          />
          <StatCard
            label="EVENTS"
            value={stats.totalEvents}
            icon="⚡"
            color="text-yellow-400"
            glowColor="rgba(251, 191, 36, 0.3)"
          />
          <StatCard
            label="WARS"
            value={stats.activeWars}
            icon="⚔️"
            color="text-red-400"
            glowColor="rgba(248, 113, 113, 0.3)"
          />
        </div>

        {/* District status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatusCard
            label="ACTIVE DISTRICTS"
            value={stats.activeDistricts}
            color="text-green-400"
            bgColor="bg-green-500"
            opacity="bg-opacity-20"
          />
          <StatusCard
            label="AT WAR"
            value={stats.districtsAtWar}
            color="text-orange-400"
            bgColor="bg-orange-500"
            opacity="bg-opacity-20"
          />
          <StatusCard
            label="COLLAPSED"
            value={stats.collapsedDistricts}
            color="text-red-400"
            bgColor="bg-red-500"
            opacity="bg-opacity-20"
          />
        </div>

        {/* Recent activity */}
        {stats.recentEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-matrix-green mb-4 text-center">
              RECENT ACTIVITY
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-matrix">
              {stats.recentEvents.map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="p-3 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20 rounded text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-matrix-green-dim font-mono text-xs">
                      Turn {event.turn || "?"}
                    </span>
                    <span className="text-matrix-green-dim text-xs">
                      {event.timestamp
                        ? new Date(event.timestamp).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>
                  <div className="text-matrix-green mt-1">
                    {event.description || event.title || "Event occurred"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/overview"
            className="px-8 py-4 bg-matrix-green bg-opacity-20 border-2 border-matrix-green text-matrix-green font-bold text-lg hover:bg-opacity-30 hover:text-matrix-green-bright transition-all transform hover:scale-105"
          >
            EXPLORE DASHBOARD →
          </Link>
          <Link
            href="/agents"
            className="px-8 py-4 border-2 border-matrix-green border-opacity-30 text-matrix-green font-bold text-lg hover:border-opacity-60 hover:text-matrix-green-bright transition-all"
          >
            VIEW AGENTS
          </Link>
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-xs text-matrix-green-dim opacity-50">
          <p>Simulation running in real-time • Data updates automatically</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, total, icon, color, glowColor }) {
  return (
    <div
      className="p-6 bg-matrix-dark bg-opacity-50 border border-matrix-green border-opacity-20 rounded relative overflow-hidden"
      style={{
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      <div className="relative z-10">
        <div className="text-3xl mb-2">{icon}</div>
        <div className={`text-3xl md:text-4xl font-bold mb-1 ${color}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-matrix-green-dim">
          {label}
          {total !== undefined && (
            <span className="ml-1 opacity-70">/ {total}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, color, bgColor, opacity }) {
  return (
    <div
      className={`p-6 ${bgColor} ${opacity} border border-matrix-green border-opacity-20 rounded text-center`}
    >
      <div className={`text-4xl font-bold mb-2 ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-matrix-green-dim">{label}</div>
    </div>
  );
}
