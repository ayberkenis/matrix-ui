"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useWorldStore } from "../../../../store/worldStore";
import {
  MatrixAsciiView,
  HudOverlay,
  RendererControlPanel,
} from "../../../../renderer/MatrixAsciiView";
import { useAsciiRenderer } from "../../../../renderer/useAsciiRenderer";

/**
 * Matrix State 2.5D Visualization - Optimized
 */
export default function MatrixAscii25DPage() {
  // Subscribe to store state (read-only)
  const districts = useWorldStore((state) => state.districts);
  const agents = useWorldStore((state) => state.agents);
  const state = useWorldStore((state) => state.state);
  const wsStatus = useWorldStore((state) => state.wsStatus);

  // Responsive dimensions - calculated once
  const [dimensions, setDimensions] = useState({ width: 100, height: 30 });

  useEffect(() => {
    const updateDimensions = () => {
      // Use nearly full width and height for maximum detail
      const charWidth = 6.1; // Width of monospace char at 10px
      const charHeight = 11.5; // Line height at 1.15
      const headerHeight = 210; // Header + District Selector + HUD + controls

      const availableWidth = window.innerWidth - 16;
      const availableHeight = window.innerHeight - headerHeight;

      // Maximize grid to fill available space
      setDimensions({
        width: Math.max(100, Math.floor(availableWidth / charWidth)),
        height: Math.max(30, Math.floor(availableHeight / charHeight)),
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Control states
  const [showAgents, setShowAgents] = useState(true);
  const [glyphRamp, setGlyphRamp] = useState("default");
  const [selectedDistrict, setSelectedDistrict] = useState("all"); // "all" or district ID

  // Filter districts/agents if a specific district is selected
  const filteredData = useMemo(() => {
    if (selectedDistrict === "all") {
      return { districts, agents };
    }

    const selectedDist = districts.find(
      (d) => d.id === selectedDistrict || d.name === selectedDistrict
    );

    if (!selectedDist) {
      return { districts, agents };
    }

    // Filter agents to selected district
    const filteredAgents = agents.filter(
      (a) =>
        a.district === selectedDist.id ||
        a.district === selectedDist.name ||
        a.location === selectedDist.id ||
        a.location === selectedDist.name
    );

    return { districts: [selectedDist], agents: filteredAgents };
  }, [districts, agents, selectedDistrict]);

  // Store state for renderer
  const storeState = useMemo(
    () => ({
      districts: filteredData.districts,
      agents: filteredData.agents,
      state,
      selectedDistrict,
    }),
    [filteredData.districts, filteredData.agents, state, selectedDistrict]
  );

  // Use optimized renderer hook - more agents for bigger grid
  const maxAgents = Math.min(
    300,
    Math.floor((dimensions.width * dimensions.height) / 50)
  );
  const { frame, isReady, isPaused, isLoading, fps, controls } =
    useAsciiRenderer(
      {
        width: dimensions.width,
        height: dimensions.height,
        showAgents,
        glyphRamp,
        targetFps: 12,
        maxAgents,
      },
      storeState
    );

  // Extract metrics for HUD - show everything possible
  const hudMetrics = useMemo(() => {
    const turn = state?.turn ?? state?.current_turn;
    const time = state?.time ?? state?.world_time;
    const weatherRaw = state?.weather;
    const economy = state?.economy;

    // Format weather - handle both string and object formats
    let weather = null;
    if (weatherRaw) {
      if (typeof weatherRaw === "string") {
        weather = weatherRaw;
      } else if (typeof weatherRaw === "object") {
        const parts = [];
        if (weatherRaw.sky) parts.push(weatherRaw.sky);
        if (weatherRaw.wind) parts.push(weatherRaw.wind);
        if (weatherRaw.precipitation) parts.push(weatherRaw.precipitation);
        if (weatherRaw.temperature) parts.push(weatherRaw.temperature);
        weather = parts.join(" • ") || null;
      }
    }

    let avgTension;
    let totalPopulation = 0;
    let activeAgents = 0;
    let totalFood = 0;

    if (Array.isArray(districts) && districts.length > 0) {
      const tensions = districts
        .map((d) => d?.tension)
        .filter((t) => typeof t === "number");
      if (tensions.length > 0) {
        avgTension = tensions.reduce((a, b) => a + b, 0) / tensions.length;
        if (avgTension > 1) avgTension = avgTension / 100;
      }

      // Aggregate district data
      districts.forEach((d) => {
        totalPopulation += d.total_population || d.active_agents || 0;
        activeAgents += d.active_agents || 0;
        if (d.resources?.food_stock) {
          totalFood += d.resources.food_stock;
        }
      });
    }

    return {
      turn,
      time,
      tension: avgTension,
      weather,
      economy,
      totalPopulation,
      activeAgents,
      totalFood,
    };
  }, [state, districts]);

  // Get selected district details for enhanced HUD (must be before any conditional returns)
  const selectedDistrictData = useMemo(() => {
    if (selectedDistrict === "all") return null;
    return districts.find(
      (d) => d.id === selectedDistrict || d.name === selectedDistrict
    );
  }, [selectedDistrict, districts]);

  // Control handlers
  const handleToggleAgents = useCallback(() => {
    const next = !showAgents;
    setShowAgents(next);
    controls.setShowAgents(next);
  }, [showAgents, controls]);

  const handleTogglePause = useCallback(() => {
    if (isPaused) controls.resume();
    else controls.pause();
  }, [isPaused, controls]);

  const handleGlyphRampChange = useCallback(
    (ramp) => {
      setGlyphRamp(ramp);
      controls.setGlyphRamp(ramp);
    },
    [controls]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-black items-center justify-center">
        <div className="text-matrix-green text-lg font-mono animate-pulse">
          INITIALIZING MATRIX...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* District Selector */}
      <div className="px-4 py-2 bg-black border-b border-matrix-green/30 flex items-center gap-4">
        <label className="text-matrix-green text-xs font-mono flex items-center gap-2">
          <span>DISTRICT:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-black border border-matrix-green/40 text-matrix-green px-3 py-1 text-xs font-mono focus:outline-none focus:border-matrix-green cursor-pointer"
          >
            <option value="all">ALL DISTRICTS</option>
            {districts.map((d) => (
              <option key={d.id || d.name} value={d.id || d.name}>
                {d.name || d.id || "Unknown"}
              </option>
            ))}
          </select>
        </label>
        {selectedDistrictData && (
          <div className="text-matrix-green/80 text-xs font-mono flex gap-4">
            <span>
              Tension:{" "}
              <span className="text-matrix-green">
                {(selectedDistrictData.tension || 0).toFixed(1)}
              </span>
            </span>
            <span>
              Pop:{" "}
              <span className="text-matrix-green">
                {(
                  selectedDistrictData.total_population ||
                  selectedDistrictData.active_agents ||
                  0
                ).toLocaleString()}
              </span>
            </span>
            {selectedDistrictData.resources?.food_stock !== undefined && (
              <span>
                Food:{" "}
                <span className="text-matrix-green">
                  {(selectedDistrictData.resources.food_stock || 0).toFixed(1)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <HudOverlay
        turn={hudMetrics.turn}
        time={hudMetrics.time}
        tension={hudMetrics.tension}
        fps={fps}
        agentCount={frame?.stats?.agentCount}
        visibleAgents={frame?.stats?.visibleAgents}
        districtCount={frame?.stats?.districtCount}
        wsStatus={wsStatus}
        selectedDistrict={selectedDistrictData}
        weather={hudMetrics.weather}
        economy={hudMetrics.economy}
        totalPopulation={hudMetrics.totalPopulation}
        activeAgents={hudMetrics.activeAgents}
        totalFood={hudMetrics.totalFood}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <MatrixAsciiView frame={frame} className="h-full" />
      </div>

      <RendererControlPanel
        showAgents={showAgents}
        isPaused={isPaused}
        onToggleAgents={handleToggleAgents}
        onTogglePause={handleTogglePause}
        onGlyphRampChange={handleGlyphRampChange}
        currentGlyphRamp={glyphRamp}
      />
    </div>
  );
}
