"use client";

import { useEffect, useState, useRef, memo, useMemo } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";
import { useTranslation } from "../lib/useTranslation";
import InfoPopup from "./InfoPopup";

const CausalityItem = memo(function CausalityItem({ record, index, hasBeenSeen }) {
  const t = useTranslation();
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
});

export default function CausalityPanel() {
  const t = useTranslation();
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
    let isMounted = true;
    let interval = null;
    
    // Initial fetch
    const fetchCausality = async () => {
      try {
        const data = await clientFetch("/world/causality");
        if (isMounted && data) {
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
        if (isMounted) console.error("Failed to fetch causality:", error);
      }
    };

    fetchCausality();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    interval = setInterval(fetchCausality, 10000);
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
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

  // Memoize records to prevent unnecessary recalculations
  const records = useMemo(() => {
    return causality?.records || [];
  }, [causality?.records]);
  
  // Limit seen records Set to prevent unbounded growth (keep last 200)
  useEffect(() => {
    if (seenRecordsRef.current.size > 200) {
      const keys = Array.from(seenRecordsRef.current);
      const toKeep = keys.slice(-200);
      seenRecordsRef.current = new Set(toKeep);
    }
  }, [records]);

  const causalityInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">CAUSALITY OVERVIEW</h3>
        <p className="mb-3">
          The Causality panel tracks cause-and-effect relationships discovered in the simulation. These relationships show how actions and events lead to consequences, helping understand the underlying dynamics of the Matrix.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">CAUSALITY RECORDS</h3>
        <p className="mb-2">
          Each causality record represents a discovered relationship:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li><strong>Cause:</strong> The initiating action, event, or condition</li>
          <li><strong>Effect:</strong> The resulting outcome or consequence</li>
          <li><strong>Confidence:</strong> How certain the system is about this relationship (0-100%)</li>
          <li><strong>Turn:</strong> When this causality relationship was observed</li>
        </ul>
        <p className="mb-3">
          Records are displayed as "Cause → Effect" with confidence and turn information. New records briefly glow when first discovered.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">HOW CAUSALITY WORKS</h3>
        <p className="mb-3">
          The system learns causality patterns by observing correlations between events over time. Higher confidence values indicate stronger, more frequently observed relationships. These patterns help predict future outcomes and understand system behavior.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">CONTROLS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li><strong>PAUSE/RESUME:</strong> Temporarily stop or resume causality updates</li>
          <li><strong>Speed:</strong> Control how frequently causality records are updated (Fast, Normal, Slow, Very Slow)</li>
        </ul>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            CAUSALITY
          </h2>
          <InfoPopup
            title="CAUSALITY DATA GUIDE"
            content={causalityInfoContent}
          />
        </div>
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
              const hasBeenSeen = seenRecordsRef.current.has(recordKey);
              return (
                <CausalityItem
                  key={`${recordKey}-${index}`}
                  record={record}
                  index={index}
                  hasBeenSeen={hasBeenSeen}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
