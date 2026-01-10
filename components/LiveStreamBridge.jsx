"use client";

import { useEffect } from "react";
import { getWSClient } from "../store/wsClient";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";

export default function LiveStreamBridge() {
  const wsStatus = useWorldStore((state) => state.wsStatus);

  useEffect(() => {
    // Initialize store with initial data
    const initialize = async () => {
      try {
        const [state, agents, districts, events] = await Promise.all([
          clientFetch("/state"),
          clientFetch("/agents"),
          clientFetch("/districts"),
          clientFetch("/events"),
        ]);

        // Handle different response formats - API might return { districts: [...] } or [...]
        const normalizeArray = (data) => {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          if (data.districts) return data.districts;
          if (data.agents) return data.agents;
          if (data.events) return data.events;
          return [];
        };

        useWorldStore.getState().initialize({
          state,
          agents: normalizeArray(agents),
          districts: normalizeArray(districts),
          events: normalizeArray(events),
        });
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };

    initialize();

    // Connect WebSocket
    const wsClient = getWSClient();
    if (wsClient) {
      wsClient.connect();
    }

    return () => {
      if (wsClient) {
        wsClient.disconnect();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
