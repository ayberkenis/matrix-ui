"use client";

import { useState, useEffect, useRef } from "react";
import { useWorldStore } from "../store/worldStore";
import { useTranslation } from "../lib/useTranslation";
import { getEscalations } from "../lib/matrixApi";

function EventItem({ event, index }) {
  const t = useTranslation();
  const [isNew, setIsNew] = useState(true);
  const itemRef = useRef(null);

  useEffect(() => {
    // Trigger glow animation when event is first rendered
    setIsNew(true);
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 250); // 0.25 seconds

    return () => clearTimeout(timer);
  }, [event.id]); // Re-trigger when event ID changes
  // Map event types to severity levels for color coding
  const typeToSeverity = {
    work: "LOW",
    social: "LOW",
    trade: "MEDIUM",
    economy: "MEDIUM",
    conflict: "HIGH",
    theft: "HIGH",
  };

  const severityColors = {
    LOW: "text-matrix-green-dim",
    MEDIUM: "text-yellow-500",
    HIGH: "text-orange-500",
    CRITICAL: "text-red-500",
  };

  const eventType = event.type || null;
  const severity = eventType ? typeToSeverity[eventType] || "LOW" : "LOW";
  const color = severityColors[severity] || severityColors.LOW;

  return (
    <div
      ref={itemRef}
      className={`border-b border-matrix-green border-opacity-10 pb-3 mb-3 last:border-0 last:mb-0 transition-all duration-250 ${
        isNew ? "opacity-100" : "opacity-100"
      }`}
      style={{
        backgroundColor: isNew ? "rgba(0, 255, 65, 0.25)" : "transparent",
        transition: "opacity 0.25s ease-out, background-color 0.25s ease-out",
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {eventType && (
              <span className={`text-xs font-bold ${color}`}>
                [{t(`events.types.${eventType}`) || eventType.toUpperCase()}]
              </span>
            )}
            {event.agent_id && (
              <span className="text-xs text-matrix-green-dim">
                [{event.agent_id}] {event.agent_name}
              </span>
            )}
          </div>
          <p className="text-matrix-green-dim text-xs leading-relaxed">
            {event.description || "No description"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EventsPanel() {
  const t = useTranslation();
  const events = useWorldStore((state) => state.events);
  const eventUpdateInterval = useWorldStore(
    (state) => state.eventUpdateInterval
  );
  const setEventUpdateInterval = useWorldStore(
    (state) => state.setEventUpdateInterval
  );
  const eventsPaused = useWorldStore((state) => state.eventsPaused);
  const setEventsPaused = useWorldStore((state) => state.setEventsPaused);
  const escalations = useWorldStore((state) => state.escalations);
  const setEscalations = useWorldStore((state) => state.setEscalations);

  // Fetch escalations on mount
  useEffect(() => {
    getEscalations()
      .then((data) => {
        if (data) setEscalations(data);
      })
      .catch((err) => console.warn("Failed to fetch escalations:", err));
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      getEscalations()
        .then((data) => {
          if (data) setEscalations(data);
        })
        .catch((err) => console.warn("Failed to fetch escalations:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, [setEscalations]);

  // Ensure events is always an array
  const eventsArray = Array.isArray(events) ? events : [];

  const speedOptions = [
    { label: "Fast", value: 100 },
    { label: "Normal", value: 500 },
    { label: "Slow", value: 1000 },
    { label: "Very Slow", value: 2000 },
  ];

  const handleSpeedChange = (value) => {
    const interval = Number(value);
    setEventUpdateInterval(interval);
    // Update WebSocket client interval immediately
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setEventUpdateInterval(interval);
      }
    }
  };

  const handlePauseResume = () => {
    const newPaused = !eventsPaused;
    setEventsPaused(newPaused);
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setEventsPaused(newPaused);
      }
    }
  };

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          {t("panels.events")}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePauseResume}
            className="text-xs font-mono px-3 py-1 border border-matrix-green border-opacity-30 hover:border-opacity-60 transition-all bg-matrix-dark text-matrix-green hover:text-matrix-green-bright"
          >
            {eventsPaused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-matrix-green-dim font-mono">
              Speed:
            </span>
            <select
              value={eventUpdateInterval}
              onChange={(e) => handleSpeedChange(e.target.value)}
              className="bg-matrix-dark border border-matrix-green border-opacity-30 text-matrix-green text-xs font-mono px-2 py-1 focus:outline-none focus:border-matrix-green focus:border-opacity-60"
            >
              {speedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto lg:min-h-0 scrollbar-matrix">
        {/* Escalations Section */}
        {escalations && (
          <div className="mb-4 pb-4 border-b border-matrix-green border-opacity-30">
            <div className="text-xs text-matrix-green font-bold mb-2">
              ESCALATIONS
            </div>
            <div className="text-xs text-matrix-green-dim mb-1">
              Active: {escalations.active_count || 0} / Total Chains:{" "}
              {escalations.total_chains || 0}
            </div>
            {escalations.chains && escalations.chains.length > 0 ? (
              <div className="space-y-2 mt-2">
                {escalations.chains.map((chain, idx) => (
                  <div
                    key={idx}
                    className="border border-red-500 border-opacity-30 p-2 bg-red-500 bg-opacity-10"
                  >
                    <div className="text-xs text-red-400 font-bold">
                      Chain #{idx + 1}
                    </div>
                    {/* Add more chain details if available */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-matrix-green-dim">
                No active escalation chains
              </div>
            )}
          </div>
        )}

        {/* Events Section */}
        <div className="text-xs text-matrix-green font-bold mb-2">EVENTS</div>
        {eventsArray.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">
            {t("events.noEvents")}
          </div>
        ) : (
          <div className="pr-2">
            {eventsArray.map((event, index) => (
              <EventItem
                key={event.id || `event-${index}`}
                event={event}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
