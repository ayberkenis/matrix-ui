"use client";

import { useEffect, useState, useRef } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";
import { t } from "../lib/i18n";

function CausalityItem({ record, index, hasBeenSeen }) {
  const [isNew, setIsNew] = useState(false);
  const itemRef = useRef(null);
  const recordKey = `${record.turn}-${record.cause}-${record.effect}`;

  useEffect(() => {
    // Only glow if this record hasn't been seen before
    if (!hasBeenSeen) {
      setIsNew(true);
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 250); // 0.25 seconds

      return () => clearTimeout(timer);
    }
  }, [hasBeenSeen, recordKey]);

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
            <span className="text-xs text-matrix-green font-mono">
              {record.cause}
            </span>
            <span className="text-xs text-matrix-green-dim">→</span>
            <span className="text-xs text-matrix-green-dim">
              {record.effect}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-matrix-green-dim">
            <span>Confidence: {(record.confidence * 100).toFixed(1)}%</span>
            <span>Turn: {record.turn}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CausalityPanel() {
  const causality = useWorldStore((state) => state.causality);
  const setCausality = useWorldStore((state) => state.setCausality);
  const causalityUpdateInterval = useWorldStore(
    (state) => state.causalityUpdateInterval
  );
  const setCausalityUpdateInterval = useWorldStore(
    (state) => state.setCausalityUpdateInterval
  );
  const causalityPaused = useWorldStore((state) => state.causalityPaused);
  const setCausalityPaused = useWorldStore((state) => state.setCausalityPaused);
  const seenRecordsRef = useRef(new Set());

  const speedOptions = [
    { label: "Fast", value: 100 },
    { label: "Normal", value: 500 },
    { label: "Slow", value: 1000 },
    { label: "Very Slow", value: 2000 },
  ];

  const handleSpeedChange = (value) => {
    const interval = Number(value);
    setCausalityUpdateInterval(interval);
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setCausalityUpdateInterval(interval);
      }
    }
  };

  const handlePauseResume = () => {
    const newPaused = !causalityPaused;
    setCausalityPaused(newPaused);
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setCausalityPaused(newPaused);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    const fetchCausality = async () => {
      try {
        const data = await clientFetch("/world/causality");
        if (data) {
          setCausality(data);
          // Mark all initial records as seen
          if (data.records && Array.isArray(data.records)) {
            data.records.forEach((record) => {
              const key = `${record.turn}-${record.cause}-${record.effect}`;
              seenRecordsRef.current.add(key);
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch causality:", error);
      }
    };

    fetchCausality();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    const interval = setInterval(fetchCausality, 10000);
    return () => clearInterval(interval);
  }, [setCausality]);

  // Track new records from WebSocket updates
  useEffect(() => {
    if (causality?.records) {
      causality.records.forEach((record) => {
        const key = `${record.turn}-${record.cause}-${record.effect}`;
        // If it's a new record, mark it as seen after a delay (so it can glow first)
        if (!seenRecordsRef.current.has(key)) {
          setTimeout(() => {
            seenRecordsRef.current.add(key);
          }, 300); // Slightly longer than glow duration
        }
      });
    }
  }, [causality]);

  const records = causality?.records || [];

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          CAUSALITY
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePauseResume}
            className="text-xs font-mono px-3 py-1 border border-matrix-green border-opacity-30 hover:border-opacity-60 transition-all bg-matrix-dark text-matrix-green hover:text-matrix-green-bright"
          >
            {causalityPaused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-matrix-green-dim font-mono">
              Speed:
            </span>
            <select
              value={causalityUpdateInterval}
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
        {records.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">
            No causality records
          </div>
        ) : (
          <div className="pr-2">
            {records.slice(0, 50).map((record, index) => {
              const recordKey = `${record.turn}-${record.cause}-${record.effect}`;
              return (
                <CausalityItem
                  key={`${recordKey}-${index}`}
                  record={record}
                  index={index}
                  hasBeenSeen={seenRecordsRef.current.has(recordKey)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
