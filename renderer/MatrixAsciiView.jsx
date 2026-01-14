/**
 * MatrixAsciiView Component - Highly Optimized
 * Uses CSS classes and batched segments instead of per-character spans
 */

"use client";

import React, { memo, useMemo, useState, useCallback, useRef } from "react";

// Color definitions using CSS custom properties
const SEGMENT_COLORS = {
  agent: "var(--ascii-agent)",
  dead: "var(--ascii-dead)",
  boundary: "var(--ascii-boundary)",
  label: "var(--ascii-label)",
  high: "var(--ascii-high)",
  medium: "var(--ascii-medium)",
  low: "var(--ascii-low)",
};

/**
 * Single row - renders segments as spans
 */
const AsciiRow = memo(function AsciiRow({
  row,
  rowIndex,
  totalRows,
  onCharHover,
  onCharLeave,
  startX = 0,
}) {
  // Enhanced 2.5D: perspective with scale and translate
  const depth = rowIndex / Math.max(1, totalRows - 1);
  const scaleY = 0.5 + depth * 0.5; // Dramatic vertical compression
  const scaleX = 0.98 + depth * 0.02; // Slight horizontal scaling for perspective
  const rotateX = (1 - depth) * 1.5; // Subtle rotation for depth
  const brightness = 0.25 + depth * 0.75; // Brightness fade with depth

  const style = useMemo(
    () => ({
      transform: `perspective(1500px) rotateX(${rotateX}deg) scale(${scaleX}, ${scaleY})`,
      transformOrigin: "top center",
      opacity: brightness,
      filter: `blur(${Math.max(0, (1 - depth) * 0.15)}px)`, // Subtle blur for far rows
    }),
    [depth, scaleX, scaleY, rotateX, brightness]
  );

  let charIndex = 0; // Each row starts at x=0

  return (
    <div style={style} className="ascii-row-2d5">
      {row.segments.map((seg, i) => {
        const segmentStartX = charIndex;
        const segmentChars = seg.text.split("");
        const segmentLength = segmentChars.length;
        charIndex += segmentLength;

        return (
          <span
            key={i}
            className={`ascii-seg ascii-${seg.colorType}`}
            style={{ opacity: seg.intensity }}
            onMouseMove={(e) => {
              if (onCharHover) {
                // Calculate which character in the segment is being hovered
                const rect = e.currentTarget.getBoundingClientRect();
                const relativeX = e.clientX - rect.left;
                const charWidth =
                  segmentLength > 0 ? rect.width / segmentLength : 0;
                const charOffset = Math.max(
                  0,
                  Math.min(Math.floor(relativeX / charWidth), segmentLength - 1)
                );
                const charX = segmentStartX + charOffset;
                // Pass the event directly - React synthetic events have clientX/clientY
                onCharHover(charX, rowIndex, e);
              }
            }}
            onMouseLeave={onCharLeave}
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
});

/**
 * Main ASCII view - renders all rows
 */
export const MatrixAsciiView = memo(function MatrixAsciiView({
  frame,
  className = "",
}) {
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleCharHover = useCallback(
    (x, y, event) => {
      if (!frame?.charMetadata) return;

      const key = `${x},${y}`;
      const metadata = frame.charMetadata.get(key);

      if (metadata) {
        setTooltip(metadata);
        // Use clientX/clientY for viewport-relative positioning (fixed position)
        // These coordinates are relative to the viewport, perfect for fixed positioning
        setTooltipPos({
          x: event.clientX,
          y: event.clientY,
        });
      }
    },
    [frame]
  );

  const handleCharLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  if (!frame || !frame.rows) {
    return (
      <div className={`ascii-container ${className}`}>
        <pre className="ascii-pre">INITIALIZING...</pre>
      </div>
    );
  }

  return (
    <>
      <div className={`ascii-container ${className}`}>
        <style jsx global>{`
          .ascii-container {
            background: #000;
            overflow: hidden;
            height: 100%;
            perspective: 1200px;
            perspective-origin: center top;
          }
          .ascii-row-2d5 {
            display: block;
            transition: transform 0.1s ease-out, opacity 0.1s ease-out;
          }
          .ascii-pre {
            margin: 0;
            padding: 4px 8px;
            font-family: "Fira Code", "Consolas", "Monaco", monospace;
            font-size: 10px;
            line-height: 1.15;
            white-space: pre;
            letter-spacing: 0px;
            --ascii-agent: #00ffff;
            --ascii-dead: #ff4444;
            --ascii-boundary: #00ff41;
            --ascii-label: #ffff00;
            --ascii-high: #ff6600;
            --ascii-medium: #88ff00;
            --ascii-low: #00ff41;
          }
          .ascii-seg {
            white-space: pre;
          }
          .ascii-agent {
            color: var(--ascii-agent);
            text-shadow: 0 0 8px var(--ascii-agent);
          }
          .ascii-dead {
            color: var(--ascii-dead);
          }
          .ascii-boundary {
            color: var(--ascii-boundary);
            opacity: 0.5;
          }
          .ascii-label {
            color: var(--ascii-label);
            font-weight: bold;
          }
          .ascii-high {
            color: var(--ascii-high);
          }
          .ascii-medium {
            color: var(--ascii-medium);
          }
          .ascii-low {
            color: var(--ascii-low);
          }
          .ascii-event {
            color: #ff6600;
            text-shadow: 0 0 6px #ff6600;
            font-weight: bold;
          }
        `}</style>
        <pre
          ref={containerRef}
          className="ascii-pre"
          onMouseLeave={handleCharLeave}
        >
          {frame.rows.map((row, y) => (
            <AsciiRow
              key={y}
              row={row}
              rowIndex={y}
              totalRows={frame.rows.length}
              onCharHover={handleCharHover}
              onCharLeave={handleCharLeave}
              startX={0}
            />
          ))}
        </pre>
      </div>

      {/* Render tooltip outside container to avoid transform issues */}
      {tooltip && (
        <div
          className="ascii-tooltip fixed pointer-events-none z-[10000]"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y + 15}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="ascii-tooltip-title">
            <span className="ascii-tooltip-char">{tooltip.char}</span>
            {tooltip.type === "agent" && tooltip.agent?.name
              ? tooltip.agent.name
              : tooltip.type === "event"
              ? "Event Indicator"
              : tooltip.type === "boundary"
              ? "District Boundary"
              : tooltip.type === "label"
              ? "District Label"
              : "Terrain"}
          </div>
          <div className="ascii-tooltip-desc">{tooltip.description}</div>
          {tooltip.agent && (
            <div className="ascii-tooltip-desc mt-1 text-xs text-matrix-green/70">
              {tooltip.agent.role && `Role: ${tooltip.agent.role}`}
              {tooltip.agent.current_action &&
                ` | Action: ${tooltip.agent.current_action}`}
              {typeof tooltip.agent.mood === "number" &&
                ` | Mood: ${(tooltip.agent.mood * 100).toFixed(0)}%`}
            </div>
          )}
          {tooltip.district && (
            <div className="ascii-tooltip-desc mt-1 text-xs text-matrix-green/70">
              District: {tooltip.district.name || tooltip.district.id}
              {tooltip.district.tension !== undefined &&
                ` | Tension: ${tooltip.district.tension.toFixed(1)}`}
            </div>
          )}
        </div>
      )}
    </>
  );
});

/**
 * HUD Overlay - Shows stats
 */
export const HudOverlay = memo(function HudOverlay({
  turn,
  time,
  population,
  tension,
  fps,
  districtCount,
  visibleAgents,
  agentCount,
  wsStatus,
  selectedDistrict,
  weather,
  economy,
  totalPopulation,
  activeAgents,
  totalFood,
}) {
  return (
    <div className="ascii-hud">
      <style jsx>{`
        .ascii-hud {
          font-family: monospace;
          font-size: 11px;
          background: rgba(0, 0, 0, 0.8);
          color: #00ff41;
          padding: 6px 12px;
          border-bottom: 1px solid rgba(0, 255, 65, 0.3);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ascii-hud-item {
          display: flex;
          gap: 4px;
        }
        .ascii-hud-label {
          color: #00aa33;
        }
        .ascii-hud-value {
          color: #00ff41;
          font-weight: bold;
        }
        .ascii-hud-tension {
          color: ${tension > 0.5 ? "#ff6600" : "#00ff41"};
        }
        .ascii-hud-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ascii-hud-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${wsStatus === "connected" ? "#00ff41" : "#ff4444"};
        }
      `}</style>

      <div className="ascii-hud-item">
        <span className="ascii-hud-label">TURN:</span>
        <span className="ascii-hud-value">{turn ?? "---"}</span>
      </div>

      {time && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">TIME:</span>
          <span className="ascii-hud-value">{time}</span>
        </div>
      )}

      <div className="ascii-hud-item">
        <span className="ascii-hud-label">POP:</span>
        <span className="ascii-hud-value">
          {agentCount?.toLocaleString() ?? "---"}
        </span>
        {visibleAgents < agentCount && (
          <span className="ascii-hud-label">({visibleAgents} shown)</span>
        )}
      </div>

      <div className="ascii-hud-item">
        <span className="ascii-hud-label">DISTRICTS:</span>
        <span className="ascii-hud-value">{districtCount ?? "---"}</span>
      </div>

      {tension !== undefined && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">AVG TENSION:</span>
          <span className="ascii-hud-value ascii-hud-tension">
            {(tension * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {totalPopulation > 0 && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">TOTAL POP:</span>
          <span className="ascii-hud-value">
            {totalPopulation.toLocaleString()}
          </span>
        </div>
      )}

      {totalFood !== undefined && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">TOTAL FOOD:</span>
          <span className="ascii-hud-value">{totalFood.toFixed(1)}</span>
        </div>
      )}

      {economy?.global_tension_index !== undefined && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">GLOBAL TENSION:</span>
          <span className="ascii-hud-value">
            {(economy.global_tension_index * 100).toFixed(1)}%
          </span>
        </div>
      )}

      {weather && (
        <div className="ascii-hud-item">
          <span className="ascii-hud-label">WEATHER:</span>
          <span className="ascii-hud-value" style={{ fontSize: "10px" }}>
            {weather.length > 50 ? weather.substring(0, 50) + "..." : weather}
          </span>
        </div>
      )}

      {selectedDistrict && (
        <>
          <div className="ascii-hud-item">
            <span className="ascii-hud-label">DISTRICT:</span>
            <span className="ascii-hud-value">
              {selectedDistrict.name || selectedDistrict.id}
            </span>
          </div>
          {selectedDistrict.tension !== undefined && (
            <div className="ascii-hud-item">
              <span className="ascii-hud-label">TENSION:</span>
              <span
                className={`ascii-hud-value ${
                  selectedDistrict.tension > 50 ? "ascii-hud-tension" : ""
                }`}
              >
                {selectedDistrict.tension.toFixed(1)}
              </span>
            </div>
          )}
          {selectedDistrict.resources?.food_stock !== undefined && (
            <div className="ascii-hud-item">
              <span className="ascii-hud-label">FOOD:</span>
              <span className="ascii-hud-value">
                {selectedDistrict.resources.food_stock.toFixed(1)}
              </span>
            </div>
          )}
          {selectedDistrict.risk_flags && (
            <div className="ascii-hud-item">
              <span className="ascii-hud-label">RISKS:</span>
              <span className="ascii-hud-value">
                {Object.entries(selectedDistrict.risk_flags)
                  .filter(([_, v]) => v)
                  .map(([k]) => k.replace("_risk", "").toUpperCase())
                  .join(", ") || "NONE"}
              </span>
            </div>
          )}
        </>
      )}

      <div className="ascii-hud-status">
        <div className="ascii-hud-dot" />
        <span className="ascii-hud-label">
          {wsStatus?.toUpperCase() ?? "OFFLINE"}
        </span>
        <span className="ascii-hud-label">FPS:{fps}</span>
      </div>
    </div>
  );
});

/**
 * Control Panel
 */
export const RendererControlPanel = memo(function RendererControlPanel({
  showAgents,
  isPaused,
  onToggleAgents,
  onTogglePause,
  onGlyphRampChange,
  currentGlyphRamp,
}) {
  return (
    <div className="ascii-controls">
      <style jsx>{`
        .ascii-controls {
          display: flex;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid rgba(0, 255, 65, 0.3);
        }
        .ascii-btn {
          font-family: monospace;
          font-size: 11px;
          padding: 4px 10px;
          border: 1px solid rgba(0, 255, 65, 0.4);
          background: transparent;
          color: #00ff41;
          cursor: pointer;
        }
        .ascii-btn:hover {
          border-color: #00ff41;
          background: rgba(0, 255, 65, 0.1);
        }
        .ascii-btn.active {
          border-color: #00ffff;
          color: #00ffff;
        }
        .ascii-select {
          font-family: monospace;
          font-size: 11px;
          padding: 4px 8px;
          border: 1px solid rgba(0, 255, 65, 0.4);
          background: #000;
          color: #00ff41;
        }
      `}</style>

      <button
        className={`ascii-btn ${isPaused ? "active" : ""}`}
        onClick={onTogglePause}
      >
        {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
      </button>

      <button
        className={`ascii-btn ${showAgents ? "active" : ""}`}
        onClick={onToggleAgents}
      >
        {showAgents ? "◉ AGENTS ON" : "○ AGENTS OFF"}
      </button>

      <select
        className="ascii-select"
        value={currentGlyphRamp}
        onChange={(e) => onGlyphRampChange(e.target.value)}
      >
        <option value="default">Default</option>
        <option value="minimal">Minimal</option>
        <option value="blocks">Blocks</option>
        <option value="matrix">Matrix</option>
      </select>

      <div
        style={{
          marginLeft: "auto",
          color: "#00aa33",
          fontSize: "9px",
          fontFamily: "monospace",
          lineHeight: "1.4",
        }}
        className="flex flex-row justify-center items-center gap-4"
      >
        <div>
          <strong>AGENTS:</strong> ◉Alive ◎Active ●Worker ★Leader ◆Trader ▲Scout
          ■Builder ◊Farmer ▼Guard ✕Dead
        </div>
        <div>
          <strong>ACTIONS:</strong> →Move ⚒Work ◌Rest ◍Eat
        </div>
        <div>
          <strong>TERRAIN:</strong>{" "}
          <span style={{ color: "#00ff41" }}> .:-=+*#%@</span> (sparse→dense)
          │║=Border
        </div>
        <div>
          <strong>SPECIAL:</strong> ⚠HighTension ⚡FoodShortage 🔥Riot
          ⇄Migration
        </div>
      </div>
    </div>
  );
});

export default MatrixAsciiView;
