import { create } from "zustand";

export const useWorldStore = create((set, get) => ({
  // Connection status
  wsStatus: "disconnected", // 'connected' | 'disconnected' | 'reconnecting'

  // State snapshot
  state: null,

  // Data
  agents: [],
  districts: [],
  events: [], // Keep last 200
  eventUpdateInterval: 500, // Throttle interval for events (ms)
  eventsPaused: false, // Pause/resume for events
  causalityUpdateInterval: 500, // Throttle interval for causality (ms)
  causalityPaused: false, // Pause/resume for causality
  emotionsUpdateInterval: 500, // Throttle interval for emotions (ms)
  emotionsPaused: false, // Pause/resume for emotions
  metrics: {
    stability: 0,
    novelty: 0,
    cohesion: 0,
    expression: 0,
  },
  version: null, // Version info from /version endpoint
  causality: null, // Causality records from /world/causality
  emotions: null, // Emotions data from /world/emotions
  rules: null, // Rules from /world/rules

  // Actions
  setWsStatus: (status) => set({ wsStatus: status }),

  updateState: (state) => set({ state }),

  setAgents: (agents) =>
    set({
      // Handle WebSocket payload with agents array, or REST API response
      agents: Array.isArray(agents) ? agents : agents?.agents || [],
    }),

  setDistricts: (districts) =>
    set({
      // Handle WebSocket payload with districts array, or REST API response
      districts: Array.isArray(districts)
        ? districts
        : districts?.districts || [],
    }),

  addEvent: (event) =>
    set((state) => {
      // Ensure event has a unique ID
      // Combine turn, agent_id, description, and timestamp to create a truly unique ID
      // This prevents duplicate keys when multiple events occur in the same turn
      let uniqueId = event.id;
      if (!uniqueId) {
        const parts = [
          event.turn ? `turn-${event.turn}` : "",
          event.agent_id || "",
          event.description
            ? event.description.substring(0, 20).replace(/\s+/g, "-")
            : "",
          Date.now().toString(),
          Math.random().toString(36).substr(2, 9),
        ]
          .filter(Boolean)
          .join("-");
        uniqueId = `event-${parts}`;
      }

      const eventWithId = {
        ...event,
        id: uniqueId,
        // Add timestamp if not present
        timestamp: event.timestamp || new Date().toISOString(),
      };

      // Check if event already exists (by turn + agent_id + description) to prevent duplicates
      const existingIndex = state.events.findIndex(
        (e) =>
          e.turn === event.turn &&
          e.agent_id === event.agent_id &&
          e.description === event.description
      );

      let events;
      if (existingIndex >= 0) {
        // Replace existing event at the same position (update it)
        events = [...state.events];
        events[existingIndex] = eventWithId;
      } else {
        // Add new event to beginning of array
        events = [eventWithId, ...state.events];
      }

      // Keep last 200
      return { events: events.slice(0, 200) };
    }),

  setEvents: (events) =>
    set({
      events: Array.isArray(events) ? events : events?.events || [],
    }),

  updateMetrics: (metrics) => set({ metrics }),

  setVersion: (version) => set({ version }),

  setEventUpdateInterval: (interval) => set({ eventUpdateInterval: interval }),
  setEventsPaused: (paused) => set({ eventsPaused: paused }),
  setCausalityUpdateInterval: (interval) => set({ causalityUpdateInterval: interval }),
  setCausalityPaused: (paused) => set({ causalityPaused: paused }),
  setEmotionsUpdateInterval: (interval) => set({ emotionsUpdateInterval: interval }),
  setEmotionsPaused: (paused) => set({ emotionsPaused: paused }),

  setCausality: (causality) =>
    set((state) => {
      // Handle WebSocket updates with new_records
      if (causality?.new_records && Array.isArray(causality.new_records)) {
        const currentRecords = state.causality?.records || [];
        const newRecords = causality.new_records;
        // Add new records to the beginning, keep last 100
        const merged = [...newRecords, ...currentRecords].slice(0, 100);
        return { causality: { ...causality, records: merged } };
      }
      // Handle REST API response with records array
      return { causality };
    }),
  setEmotions: (emotions) =>
    set((state) => {
      // Handle WebSocket updates with recent_traces
      if (emotions?.recent_traces && Array.isArray(emotions.recent_traces)) {
        const currentTraces = state.emotions?.recent_traces || [];
        const newTraces = emotions.recent_traces;
        // Add new traces to the beginning, keep last 50
        const merged = [...newTraces, ...currentTraces].slice(0, 50);
        return { emotions: { ...emotions, recent_traces: merged } };
      }
      // Handle REST API response with full data
      return { emotions };
    }),
  setRules: (rules) =>
    set((state) => {
      // Handle WebSocket updates with new_rules
      if (rules?.new_rules && Array.isArray(rules.new_rules)) {
        const currentRules = state.rules?.rules || [];
        const newRules = rules.new_rules;
        // Add new rules to the beginning, keep last 50
        const merged = [...newRules, ...currentRules].slice(0, 50);
        return { rules: { ...rules, rules: merged } };
      }
      // Handle REST API response with rules array
      return { rules };
    }),

  // Initialize with server data
  initialize: (data) => {
    const normalizeArray = (arr) => {
      if (!arr) return [];
      if (Array.isArray(arr)) return arr;
      return [];
    };

    set({
      state: data.state,
      agents: normalizeArray(data.agents),
      districts: normalizeArray(data.districts),
      events: normalizeArray(data.events),
      metrics: data.metrics || {
        stability: 0,
        novelty: 0,
        cohesion: 0,
        expression: 0,
      },
    });
  },
}));
