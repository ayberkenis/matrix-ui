"use client";

import { useEffect, useState, useRef } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";

function EmotionTraceItem({ trace, index, hasBeenSeen }) {
  const [isNew, setIsNew] = useState(false);
  const itemRef = useRef(null);
  const traceKey = `${trace.turn}-${trace.event}`;

  useEffect(() => {
    // Only glow if this trace hasn't been seen before
    if (!hasBeenSeen) {
      setIsNew(true);
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 250); // 0.25 seconds

      return () => clearTimeout(timer);
    }
  }, [hasBeenSeen, traceKey]);

  const emotionColors = {
    fear: "text-purple-400",
    anger: "text-red-400",
    hope: "text-blue-400",
    joy: "text-yellow-400",
    sadness: "text-gray-400",
    surprise: "text-orange-400",
  };

  const formatPercent = (value) => ((value || 0) * 100).toFixed(1);

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
      <p className="text-matrix-green-dim text-xs mb-2">{trace.event}</p>
      <div className="flex items-center gap-3 text-xs text-matrix-green-dim flex-wrap">
        <span
          className={`font-bold ${
            emotionColors[trace.dominant] || "text-matrix-green"
          }`}
        >
          {trace.dominant?.toUpperCase()}
        </span>
        <span>Turn: {trace.turn}</span>
        <div className="flex gap-2">
          {Object.entries(trace)
            .filter(
              ([key]) =>
                !["event", "turn", "timestamp", "dominant"].includes(key)
            )
            .map(([emotion, value]) => (
              <span
                key={emotion}
                className={`${
                  emotionColors[emotion] || "text-matrix-green-dim"
                }`}
              >
                {emotion}: {formatPercent(value)}%
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function EmotionsPanel() {
  const emotions = useWorldStore((state) => state.emotions);
  const setEmotions = useWorldStore((state) => state.setEmotions);
  const emotionsUpdateInterval = useWorldStore(
    (state) => state.emotionsUpdateInterval
  );
  const setEmotionsUpdateInterval = useWorldStore(
    (state) => state.setEmotionsUpdateInterval
  );
  const emotionsPaused = useWorldStore((state) => state.emotionsPaused);
  const setEmotionsPaused = useWorldStore((state) => state.setEmotionsPaused);

  useEffect(() => {
    // Initial fetch
    const fetchEmotions = async () => {
      try {
        const data = await clientFetch("/world/emotions");
        if (data) {
          setEmotions(data);
        }
      } catch (error) {
        console.error("Failed to fetch emotions:", error);
      }
    };

    fetchEmotions();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    const interval = setInterval(fetchEmotions, 10000);
    return () => clearInterval(interval);
  }, [setEmotions]);

  // Handle WebSocket updates - update summary and merge recent traces
  useEffect(() => {
    if (emotions?.summary) {
      // WebSocket sent updated emotions, use it directly
      // The payload from WebSocket is already in the correct format
    }
  }, [emotions]);

  const summary = emotions?.summary || {};
  const traces = emotions?.recent_traces || [];
  const seenTracesRef = useRef(new Set());

  // Track initial traces as seen
  useEffect(() => {
    if (traces.length > 0 && seenTracesRef.current.size === 0) {
      traces.forEach((trace) => {
        const key = `${trace.turn}-${trace.event}`;
        seenTracesRef.current.add(key);
      });
    }
  }, []);

  // Track new traces from WebSocket updates
  useEffect(() => {
    if (traces && Array.isArray(traces)) {
      traces.forEach((trace) => {
        const key = `${trace.turn}-${trace.event}`;
        // If it's a new trace, mark it as seen after a delay (so it can glow first)
        if (!seenTracesRef.current.has(key)) {
          setTimeout(() => {
            seenTracesRef.current.add(key);
          }, 300); // Slightly longer than glow duration
        }
      });
    }
  }, [traces]);

  const emotionColors = {
    fear: "text-purple-400",
    anger: "text-red-400",
    hope: "text-blue-400",
    joy: "text-yellow-400",
    sadness: "text-gray-400",
    surprise: "text-orange-400",
  };

  const formatPercent = (value) => ((value || 0) * 100).toFixed(1);

  const speedOptions = [
    { label: "Fast", value: 100 },
    { label: "Normal", value: 500 },
    { label: "Slow", value: 1000 },
    { label: "Very Slow", value: 2000 },
  ];

  const handleSpeedChange = (value) => {
    const interval = Number(value);
    setEmotionsUpdateInterval(interval);
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setEmotionsUpdateInterval(interval);
      }
    }
  };

  const handlePauseResume = () => {
    const newPaused = !emotionsPaused;
    setEmotionsPaused(newPaused);
    if (typeof window !== "undefined") {
      const { getWSClient } = require("../store/wsClient");
      const wsClient = getWSClient();
      if (wsClient) {
        wsClient.setEmotionsPaused(newPaused);
      }
    }
  };

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          EMOTIONS
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePauseResume}
            className="text-xs font-mono px-3 py-1 border border-matrix-green border-opacity-30 hover:border-opacity-60 transition-all bg-matrix-dark text-matrix-green hover:text-matrix-green-bright"
          >
            {emotionsPaused ? "▶ RESUME" : "⏸ PAUSE"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-matrix-green-dim font-mono">
              Speed:
            </span>
            <select
              value={emotionsUpdateInterval}
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
        <div className="pr-2 space-y-4">
          {/* Summary */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-matrix-green mb-3">
              SUMMARY
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(summary).map(([emotion, value]) => (
                <div
                  key={emotion}
                  className="flex items-center justify-between"
                >
                  <span
                    className={`font-mono capitalize ${
                      emotionColors[emotion] || "text-matrix-green-dim"
                    }`}
                  >
                    {emotion}:
                  </span>
                  <div className="flex items-center gap-2 flex-1 max-w-xs ml-2">
                    <div className="flex-1 bg-matrix-dark h-2 border border-matrix-green border-opacity-20">
                      <div
                        className={`h-full ${
                          emotionColors[emotion]?.replace("text-", "bg-") ||
                          "bg-matrix-green"
                        }`}
                        style={{
                          width: `${formatPercent(value)}%`,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <span className="text-matrix-green-dim font-mono w-12 text-right">
                      {formatPercent(value)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Traces */}
          {traces.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-matrix-green mb-3">
                RECENT TRACES ({traces.length})
              </h3>
              <div>
                {traces.map((trace, index) => {
                  const traceKey = `${trace.turn}-${trace.event}`;
                  return (
                    <EmotionTraceItem
                      key={`${traceKey}-${index}`}
                      trace={trace}
                      index={index}
                      hasBeenSeen={seenTracesRef.current.has(traceKey)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
