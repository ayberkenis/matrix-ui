"use client";

import { useEffect } from "react";
import { useWorldStore } from "../store/worldStore";

export default function StoreInitializer({ initialData }) {
  useEffect(() => {
    if (initialData) {
      const normalizeArray = (arr) => {
        if (!arr) return [];
        if (Array.isArray(arr)) return arr;
        if (arr.districts) return arr.districts;
        if (arr.agents) return arr.agents;
        if (arr.events) return arr.events;
        return [];
      };

      useWorldStore.getState().initialize({
        state: initialData.state,
        agents: normalizeArray(initialData.agents),
        districts: normalizeArray(initialData.districts),
        events: normalizeArray(initialData.events),
      });
    }
  }, [initialData]);

  return null;
}
