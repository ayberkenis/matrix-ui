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
        {/* Event Chains Section */}
        {escalations && (
          <div className="mb-4 pb-4 border-b border-matrix-green border-opacity-30">
            <div className="text-xs text-matrix-green font-bold mb-2">
              EVENT CHAINS
            </div>
            <div className="text-xs text-matrix-green-dim mb-3">
              Active: {escalations.active_count || 0} / Total:{" "}
              {escalations.total_chains || 0}
            </div>
            {escalations.chains && escalations.chains.length > 0 ? (
              <div className="space-y-3 mt-2">
                {escalations.chains.map((chain, idx) => {
                  const currentStageIndex = chain.current_stage || 0;
                  const totalStages = chain.stages?.length || 0;
                  const progress = totalStages > 0 ? (currentStageIndex + 1) / totalStages : 0;
                  const severity = chain.severity || 0;
                  
                  // Determine severity color
                  const getSeverityColor = (sev) => {
                    if (sev >= 0.8) return "text-red-500";
                    if (sev >= 0.6) return "text-orange-500";
                    if (sev >= 0.4) return "text-yellow-500";
                    return "text-matrix-green-dim";
                  };
                  
                  const severityColor = getSeverityColor(severity);
                  
                  return (
                    <div
                      key={chain.id || idx}
                      className="border border-red-500 border-opacity-40 p-3 bg-red-500 bg-opacity-10 hover:bg-opacity-15 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-red-400 font-bold">
                              {chain.id || `Chain #${idx + 1}`}
                            </span>
                            {chain.district_id && (
                              <span className="text-xs text-matrix-green-dim">
                                [{chain.district_id}]
                              </span>
                            )}
                            <span className={`text-xs font-bold ${severityColor}`}>
                              SEVERITY: {(severity * 100).toFixed(0)}%
                            </span>
                          </div>
                          {chain.trigger_condition && (
                            <div className="text-xs text-matrix-green-dim mb-2">
                              Trigger: {chain.trigger_condition}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Stage Progression */}
                      {chain.stages && chain.stages.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-matrix-green-dim mb-2">
                            PROGRESSION:
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {chain.stages.map((stage, stageIdx) => {
                              const isActive = stageIdx === currentStageIndex;
                              const isCompleted = stageIdx < currentStageIndex;
                              const isPending = stageIdx > currentStageIndex;
                              
                              return (
                                <span
                                  key={stageIdx}
                                  className={`text-xs px-2 py-1 border ${
                                    isActive
                                      ? "bg-red-500 bg-opacity-30 text-red-400 border-red-500 border-opacity-60 font-bold"
                                      : isCompleted
                                      ? "bg-orange-500 bg-opacity-20 text-orange-400 border-orange-500 border-opacity-40"
                                      : "bg-matrix-dark bg-opacity-50 text-matrix-green-dim border-matrix-green border-opacity-20"
                                  }`}
                                >
                                  {stageIdx + 1}. {stage.toUpperCase()}
                                  {isActive && " ⚡"}
                                </span>
                              );
                            })}
                          </div>
                          {/* Progress Bar */}
                          <div className="h-1.5 bg-matrix-dark border border-matrix-green border-opacity-20 relative overflow-hidden">
                            <div
                              className="h-full bg-red-500 transition-all duration-300"
                              style={{
                                width: `${progress * 100}%`,
                                opacity: 0.7,
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Chain Metadata */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-matrix-green-dim mt-2 pt-2 border-t border-matrix-green border-opacity-20">
                        {chain.triggered_at_turn !== undefined && (
                          <div>
                            <span className="text-matrix-green">Triggered:</span> Turn {chain.triggered_at_turn}
                          </div>
                        )}
                        {chain.last_advance_turn !== undefined && (
                          <div>
                            <span className="text-matrix-green">Last Advance:</span> Turn {chain.last_advance_turn}
                          </div>
                        )}
                        {chain.stalled_turns !== undefined && (
                          <div className={chain.stalled_turns > 5 ? "text-yellow-400" : ""}>
                            <span className="text-matrix-green">Stalled:</span> {chain.stalled_turns} turns
                            {chain.stalled_turns > 5 && " ⚠"}
                          </div>
                        )}
                        {chain.current_stage !== undefined && (
                          <div>
                            <span className="text-matrix-green">Stage:</span> {chain.current_stage + 1}/{totalStages}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-matrix-green-dim">
                No active event chains
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
