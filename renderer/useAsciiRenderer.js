/**
 * useAsciiRenderer Hook - Optimized
 * Capped FPS, minimal re-renders
 */

"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { composeFrame, createPlaceholderFrame } from "./ascii/frameComposer";

const DEFAULT_OPTIONS = {
  width: 100,
  height: 35,
  showAgents: true,
  glyphRamp: "default",
  targetFps: 30, // Lower FPS for less CPU
  maxAgents: 150, // Fewer agents for less DOM
};

/**
 * Hook to render ASCII visualization from store state
 */
export function useAsciiRenderer(options, storeState) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Control states
  const [isPaused, setIsPaused] = useState(false);
  const [showAgents, setShowAgents] = useState(opts.showAgents);
  const [glyphRamp, setGlyphRamp] = useState(opts.glyphRamp);

  // Frame state - null until mounted
  const [frame, setFrame] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Stats
  const frameCountRef = useRef(0);
  const fpsRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());
  const framesThisSecRef = useRef(0);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    setFrame(createPlaceholderFrame(opts.width, opts.height));
  }, []);

  // Extract data safely - reactive to all WebSocket updates
  const districts = useMemo(() => {
    // Handle both direct array and payload object with districts array
    const dists = storeState?.districts;
    if (Array.isArray(dists)) return dists;
    if (dists?.districts && Array.isArray(dists.districts))
      return dists.districts;
    return [];
  }, [storeState?.districts]);

  const agents = useMemo(() => {
    // Handle both direct array and payload object with agents array
    const ags = storeState?.agents;
    if (Array.isArray(ags)) return ags;
    if (ags?.agents && Array.isArray(ags.agents)) return ags.agents;
    return [];
  }, [storeState?.agents]);

  // Also track state updates to ensure reactivity
  const stateUpdate = storeState?.state;

  const isReady = districts.length > 0 || agents.length > 0;

  // Render function
  const render = useCallback(() => {
    if (isPaused || !isClient) return;

    const newFrame = isReady
      ? composeFrame(districts, agents, opts.width, opts.height, {
          glyphRamp,
          showAgents,
          maxAgents: opts.maxAgents,
        })
      : createPlaceholderFrame(opts.width, opts.height, "AWAITING MATRIX...");

    setFrame(newFrame);

    // Update FPS counter
    frameCountRef.current++;
    framesThisSecRef.current++;
    const now = Date.now();
    if (now - lastFpsTimeRef.current >= 1000) {
      fpsRef.current = framesThisSecRef.current;
      framesThisSecRef.current = 0;
      lastFpsTimeRef.current = now;
    }
  }, [
    isPaused,
    isClient,
    isReady,
    districts,
    agents,
    stateUpdate, // Include state to trigger re-render on any WebSocket update
    opts.width,
    opts.height,
    glyphRamp,
    showAgents,
    opts.maxAgents,
  ]);

  // Trigger immediate render when data changes (WebSocket updates)
  useEffect(() => {
    if (isPaused || !isClient) return;
    // Trigger render immediately when districts or agents change
    if (isReady) {
      render();
    }
  }, [districts, agents, isPaused, isClient, isReady, render]);

  // Render loop with FPS cap
  useEffect(() => {
    if (isPaused || !isClient) return;

    const interval = 1000 / opts.targetFps;
    let lastTime = 0;
    let animId;

    const loop = (time) => {
      if (time - lastTime >= interval) {
        lastTime = time;
        render();
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isClient, opts.targetFps, render]);

  // Controls
  const controls = useMemo(
    () => ({
      pause: () => setIsPaused(true),
      resume: () => setIsPaused(false),
      setShowAgents: (v) => setShowAgents(v),
      setGlyphRamp: (v) => setGlyphRamp(v),
    }),
    []
  );

  return {
    frame,
    isReady,
    isPaused,
    isLoading: !isClient || frame === null,
    fps: fpsRef.current,
    controls,
  };
}
