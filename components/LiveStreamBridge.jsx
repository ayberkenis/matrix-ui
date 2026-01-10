"use client";

import { useEffect } from "react";
import { getWSClient } from "../store/wsClient";
import { useWorldStore } from "../store/worldStore";
import { clientFetch } from "../lib/matrixApi";

export default function LiveStreamBridge() {
  const wsStatus = useWorldStore((state) => state.wsStatus);

  useEffect(() => {
    // Only fetch if store is empty (fallback if server data wasn't provided)
    const store = useWorldStore.getState();
    const needsInitialization = !store.state && store.agents.length === 0 && store.districts.length === 0;

    if (needsInitialization) {
      // Initialize store with initial data (fallback)
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

          store.initialize({
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
    }

    // Connect WebSocket
    const wsClient = getWSClient();
    if (wsClient) {
      // Sync intervals and pause states from store
      const store = useWorldStore.getState();
      if (store.eventUpdateInterval) {
        wsClient.setEventUpdateInterval(store.eventUpdateInterval);
      }
      if (store.causalityUpdateInterval) {
        wsClient.setCausalityUpdateInterval(store.causalityUpdateInterval);
      }
      if (store.emotionsUpdateInterval) {
        wsClient.setEmotionsUpdateInterval(store.emotionsUpdateInterval);
      }
      wsClient.setEventsPaused(store.eventsPaused || false);
      wsClient.setCausalityPaused(store.causalityPaused || false);
      wsClient.setEmotionsPaused(store.emotionsPaused || false);
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
