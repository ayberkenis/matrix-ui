import { create } from 'zustand'

export const useWorldStore = create((set, get) => ({
  // Connection status
  wsStatus: 'disconnected', // 'connected' | 'disconnected' | 'reconnecting'
  
  // State snapshot
  state: null,
  
  // Data
  agents: [],
  districts: [],
  events: [], // Keep last 200
  metrics: {
    stability: 0,
    novelty: 0,
    cohesion: 0,
    expression: 0,
  },
  
  // Actions
  setWsStatus: (status) => set({ wsStatus: status }),
  
  updateState: (state) => set({ state }),
  
  setAgents: (agents) => set({ 
    agents: Array.isArray(agents) ? agents : (agents?.agents || [])
  }),
  
  setDistricts: (districts) => set({ 
    districts: Array.isArray(districts) ? districts : (districts?.districts || [])
  }),
  
  addEvent: (event) => set((state) => {
    const events = [event, ...state.events].slice(0, 200)
    return { events }
  }),
  
  setEvents: (events) => set({ 
    events: Array.isArray(events) ? events : (events?.events || [])
  }),
  
  updateMetrics: (metrics) => set({ metrics }),
  
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
}))
