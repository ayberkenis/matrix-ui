"use client";

import { useEffect, useState, useRef, memo, useMemo } from "react";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";
import InfoPopup from "./InfoPopup";

const EmotionTraceItem = memo(function EmotionTraceItem({
  trace,
  index,
  hasBeenSeen,
}) {
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

  const emotionEmojis = {
    fear: "😨",
    anger: "😠",
    hope: "🙏",
    joy: "😊",
    sadness: "😢",
    surprise: "😲",
  };

  const formatPercent = (value) => ((value || 0) * 100).toFixed(1);

  // Get emotion entries, excluding metadata fields
  const emotionEntries = Object.entries(trace).filter(
    ([key]) => !["event", "turn", "timestamp", "dominant"].includes(key)
  );

  return (
    <div
      ref={itemRef}
      className={`border border-matrix-green border-opacity-20 p-3 mb-3 last:mb-0 transition-all duration-250 bg-matrix-dark bg-opacity-30 ${
        isNew ? "opacity-100" : "opacity-100"
      }`}
      style={{
        backgroundColor: isNew ? "rgba(0, 255, 65, 0.25)" : undefined,
        transition: "opacity 0.25s ease-out, background-color 0.25s ease-out",
      }}
    >
      <div className="mb-2">
        <p className="text-matrix-green-dim text-xs mb-1">{trace.event}</p>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`font-bold ${
              emotionColors[trace.dominant] || "text-matrix-green"
            }`}
          >
            {trace.dominant && emotionEmojis[trace.dominant]}{" "}
            {trace.dominant?.toUpperCase()}
          </span>
          <span className="text-matrix-green-dim">•</span>
          <span className="text-matrix-green-dim">Turn: {trace.turn}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {emotionEntries.map(([emotion, value]) => (
          <div
            key={emotion}
            className={`flex items-center gap-1 ${
              emotionColors[emotion] || "text-matrix-green-dim"
            }`}
          >
            <span className="text-base">{emotionEmojis[emotion] || "•"}</span>
            <span className="capitalize flex-1 truncate">{emotion}</span>
            <span className="font-mono text-matrix-green-dim">
              {formatPercent(value)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

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
    let isMounted = true;
    let interval = null;

    // Initial fetch
    const fetchEmotions = async () => {
      try {
        const data = await clientFetch("/world/emotions");
        if (isMounted && data) {
          setEmotions(data);
        }
      } catch (error) {
        if (isMounted) console.error("Failed to fetch emotions:", error);
      }
    };

    fetchEmotions();
    // Refresh every 10 seconds as fallback (WebSocket will update in real-time)
    interval = setInterval(fetchEmotions, 10000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [setEmotions]);

  // Handle WebSocket updates - update summary and merge recent traces
  useEffect(() => {
    if (emotions?.summary) {
      // WebSocket sent updated emotions, use it directly
      // The payload from WebSocket is already in the correct format
    }
  }, [emotions]);

  // Memoize to prevent unnecessary recalculations
  const summary = useMemo(() => emotions?.summary || {}, [emotions?.summary]);
  const traces = useMemo(
    () => emotions?.recent_traces || [],
    [emotions?.recent_traces]
  );
  const seenTracesRef = useRef(new Set());

  // Limit seen traces Set to prevent unbounded growth (keep last 100)
  useEffect(() => {
    if (seenTracesRef.current.size > 100) {
      const keys = Array.from(seenTracesRef.current);
      const toKeep = keys.slice(-100);
      seenTracesRef.current = new Set(toKeep);
    }
  }, [traces]);

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

  const emotionsInfoContent = (
    <>
      <div>
        <h3 className="text-matrix-green font-bold mb-2">EMOTIONS OVERVIEW</h3>
        <p className="mb-3">
          The Emotions panel tracks the emotional state of the simulation world.
          It shows both aggregate emotional summaries and individual emotion
          traces triggered by specific events.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">EMOTION TYPES</h3>
        <p className="mb-2">
          The system tracks six core emotions, each with color coding:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Fear:</strong> Anxiety and apprehension (purple)
          </li>
          <li>
            <strong>Anger:</strong> Frustration and hostility (red)
          </li>
          <li>
            <strong>Hope:</strong> Optimism and expectation (blue)
          </li>
          <li>
            <strong>Joy:</strong> Happiness and satisfaction (yellow)
          </li>
          <li>
            <strong>Sadness:</strong> Grief and melancholy (gray)
          </li>
          <li>
            <strong>Surprise:</strong> Shock and unexpectedness (orange)
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">SUMMARY</h3>
        <p className="mb-3">
          The summary section shows aggregate emotional levels across the entire
          simulation. Each emotion is displayed as a percentage (0-100%) with a
          visual progress bar. These values represent the average emotional
          state of all agents.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">RECENT TRACES</h3>
        <p className="mb-2">
          Emotion traces show how specific events triggered emotional responses:
        </p>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>Event:</strong> The triggering event description
          </li>
          <li>
            <strong>Dominant:</strong> The strongest emotion in this trace
            (highlighted)
          </li>
          <li>
            <strong>Turn:</strong> When this emotional response occurred
          </li>
          <li>
            <strong>Emotion Values:</strong> Percentage breakdown of all
            emotions (0-100%)
          </li>
        </ul>
        <p className="mb-3">
          New traces briefly glow when first received. Traces help understand
          how events affect the emotional landscape of the simulation.
        </p>
      </div>

      <div>
        <h3 className="text-matrix-green font-bold mb-2">CONTROLS</h3>
        <ul className="list-disc list-inside mb-3 space-y-1 ml-2">
          <li>
            <strong>PAUSE/RESUME:</strong> Temporarily stop or resume emotion
            updates
          </li>
          <li>
            <strong>Speed:</strong> Control how frequently emotions are updated
            (Fast, Normal, Slow, Very Slow)
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
            EMOTIONS
          </h2>
          <InfoPopup
            title="EMOTIONS DATA GUIDE"
            content={emotionsInfoContent}
          />
        </div>
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
                {/* Limit displayed traces to 40 to reduce DOM nodes and improve performance */}
                {traces.slice(0, 40).map((trace, index) => {
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
