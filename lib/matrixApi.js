// API client for Matrix backend
// Production: https://api.ayberkenis.com.tr/matrix
// Development: http://localhost:8000
const getApiUrl = () => {
  // Check for explicit environment variable first
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_MATRIX_API_URL) {
      return process.env.NEXT_PUBLIC_MATRIX_API_URL;
    }
  } else {
    if (process.env.MATRIX_API_URL) {
      return process.env.MATRIX_API_URL;
    }
  }

  // Auto-detect: use production in production builds, localhost in dev
  if (process.env.NODE_ENV === "production") {
    return "https://api.ayberkenis.com.tr/matrix";
  }
  return "http://localhost:8000";
};

const getWsUrl = () => {
  // Check for explicit environment variable first
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_MATRIX_WS_URL) {
      return process.env.NEXT_PUBLIC_MATRIX_WS_URL;
    }
  } else {
    if (process.env.MATRIX_WS_URL) {
      return process.env.MATRIX_WS_URL;
    }
  }

  // Auto-detect: use production in production builds, localhost in dev
  if (process.env.NODE_ENV === "production") {
    return "wss://api.ayberkenis.com.tr/matrix/ws";
  }
  return "ws://localhost:8000/ws";
};

// Mock data for when backend is unavailable
const mockState = {
  turn: 0,
  day: 0,
  time: "Day 0 • 08:15 (Morning)",
  weather: {
    sky: "clear",
    wind: 0.3,
    precipitation: 0.0,
    temperature: 0.5,
  },
  economy: {
    total_food: 356.7,
    total_credits: 2000.0,
    average_tension: 4.2,
    global_tension_index: 0.04,
    district_count: 10,
    hotspots: [
      { district: "Vey", tension: 19.3 },
      { district: "Kora", tension: 7.0 },
    ],
    active_events: ["food_shortage_wave"],
    system_health: {
      stability: "recovering",
      risk_level: "low",
    },
  },
  timestamp: new Date().toISOString(),
};

const mockAgents = [
  {
    id: "1",
    name: "Agent Alpha",
    location: "District A",
    role: "OBSERVER",
    mood: "CALM",
    needs: [],
    goal: "MONITOR",
  },
  {
    id: "2",
    name: "Agent Beta",
    location: "District B",
    role: "ACTOR",
    mood: "TENSE",
    needs: ["FOOD"],
    goal: "SURVIVE",
  },
];

const mockDistricts = [
  {
    id: "region_kora",
    name: "Kora",
    food_stock: 14,
    tension: 99.5,
    jobs_available: 5,
    scarcity: true,
  },
  {
    id: "region_rift",
    name: "Rift",
    food_stock: 19,
    tension: 90.5,
    jobs_available: 5,
    scarcity: true,
  },
];

const mockEvents = [
  {
    id: "1",
    ts: new Date().toISOString(),
    title: "System Initialized",
    detail: "Matrix simulation started",
    severity: "LOW",
    district: null,
    actors: [],
  },
];

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Server-side fetch (for Server Components)
export const serverFetch = async (endpoint, options = {}) => {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint}`;

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Normalize response format - extract arrays from wrapper objects
    if (endpoint === "/events" && data.events) {
      return data.events;
    }
    if (endpoint === "/districts" && data.districts) {
      return data.districts;
    }
    // For /agents with query params, return the full paginated response
    if (endpoint.startsWith("/agents") && data.agents) {
      // If it's a paginated response, return the full object
      if (data.count !== undefined || data.total !== undefined) {
        return data;
      }
      // Otherwise return just the agents array for backward compatibility
      return data.agents;
    }
    // Handle agent relationships endpoint
    if (endpoint.startsWith("/agents/") && endpoint.endsWith("/relationships")) {
      return data;
    }
    // Handle district culture endpoint
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/culture")) {
      return data;
    }

    return data;
  } catch (error) {
    console.warn(
      `API fetch failed (${endpoint}), using mock data:`,
      error.message
    );
    // Return mock data based on endpoint
    if (endpoint === "/state") return mockState;
    if (endpoint === "/agents") return mockAgents;
    if (endpoint === "/districts") return mockDistricts;
    if (endpoint === "/events") return mockEvents;
    if (endpoint === "/health") return { status: "ok", mock: true };
    if (endpoint === "/version")
      return {
        matrix_version: "1.0.0",
        created_at: new Date().toISOString(),
        last_reset_at: null,
        reset_count: 0,
        initialized: true,
      };
    if (endpoint === "/world/causality")
      return {
        records: [],
        total_records: 0,
        returned: 0,
      };
    if (endpoint === "/world/emotions")
      return {
        summary: {
          fear: 0,
          anger: 0,
          hope: 0,
          joy: 0,
          sadness: 0,
          surprise: 0,
        },
        recent_traces: [],
        total_traces: 0,
      };
    if (endpoint === "/world/rules")
      return {
        rules: [],
        total_rules: 0,
        returned: 0,
      };
    if (endpoint.startsWith("/agents/") && endpoint.endsWith("/relationships"))
      return {
        agent_id: endpoint.split("/")[2],
        relationships: {},
        count: 0,
      };
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/culture"))
      return {
        district_id: endpoint.split("/")[2],
        culture: {
          collectivism: 0.5,
          obedience: 0.5,
          aggression: 0.5,
          risk_tolerance: 0.5,
        },
      };
    if (endpoint === "/world/flags")
      return {
        flags: [],
        count: 0,
      };
    if (endpoint === "/escalations")
      return {
        chains: [],
        active_count: 0,
        total_chains: 0,
      };
    if (endpoint === "/population/stats")
      return {
        alive: 0,
        total: 0,
        age_groups: {
          children: 0,
          adults: 0,
          elderly: 0,
        },
        average_age: 0,
      };
    if (endpoint === "/districts/dynamics")
      return {
        active_districts: 0,
        struggling_districts: 0,
        districts_at_war: 0,
        collapsed_districts: 0,
        active_wars: 0,
        total_wars: 0,
        total_merges: 0,
        total_collapses: 0,
        recent_events: [],
        protected_districts: [],
        emergency_aid_active: false,
        collapse_cooldown_remaining: 0,
        min_districts_enforced: 0,
        pending_new_districts: [],
        total_districts_established: 0,
        new_district_cooldown_remaining: 0,
        max_districts: 20,
      };
    if (endpoint === "/districts/wars")
      return {
        wars: [],
      };
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/dynamics"))
      return {
        state: "active",
        struggling_turns: 0,
        war_weariness: 0,
        defensive_strength: 0,
        offensive_strength: 0,
        allies: [],
        enemies: [],
        current_war: null,
      };
    if (endpoint === "/districts/collapsed")
      return {
        collapsed: [],
      };
    if (endpoint === "/districts/pending")
      return {
        pending: [],
      };
    if (endpoint === "/districts/history")
      return {
        history: [],
      };
    return null;
  }
};

// Client-side fetch (for Client Components)
export const clientFetch = async (endpoint, options = {}) => {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint}`;

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Normalize response format - extract arrays from wrapper objects
    if (endpoint === "/events" && data.events) {
      return data.events;
    }
    if (endpoint === "/districts" && data.districts) {
      return data.districts;
    }
    // For /agents with query params, return the full paginated response
    if (endpoint.startsWith("/agents") && data.agents) {
      // If it's a paginated response, return the full object
      if (data.count !== undefined || data.total !== undefined) {
        return data;
      }
      // Otherwise return just the agents array for backward compatibility
      return data.agents;
    }
    // Handle agent relationships endpoint
    if (endpoint.startsWith("/agents/") && endpoint.endsWith("/relationships")) {
      return data;
    }
    // Handle district culture endpoint
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/culture")) {
      return data;
    }

    return data;
  } catch (error) {
    console.warn(
      `API fetch failed (${endpoint}), using mock data:`,
      error.message
    );
    // Return mock data based on endpoint
    if (endpoint === "/state") return mockState;
    if (endpoint === "/agents") return mockAgents;
    if (endpoint === "/districts") return mockDistricts;
    if (endpoint === "/events") return mockEvents;
    if (endpoint === "/health") return { status: "ok", mock: true };
    if (endpoint === "/version")
      return {
        matrix_version: "1.0.0",
        created_at: new Date().toISOString(),
        last_reset_at: null,
        reset_count: 0,
        initialized: true,
      };
    if (endpoint === "/world/causality")
      return {
        records: [],
        total_records: 0,
        returned: 0,
      };
    if (endpoint === "/world/emotions")
      return {
        summary: {
          fear: 0,
          anger: 0,
          hope: 0,
          joy: 0,
          sadness: 0,
          surprise: 0,
        },
        recent_traces: [],
        total_traces: 0,
      };
    if (endpoint === "/world/rules")
      return {
        rules: [],
        total_rules: 0,
        returned: 0,
      };
    if (endpoint.startsWith("/agents/") && endpoint.endsWith("/relationships"))
      return {
        agent_id: endpoint.split("/")[2],
        relationships: {},
        count: 0,
      };
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/culture"))
      return {
        district_id: endpoint.split("/")[2],
        culture: {
          collectivism: 0.5,
          obedience: 0.5,
          aggression: 0.5,
          risk_tolerance: 0.5,
        },
      };
    if (endpoint === "/world/flags")
      return {
        flags: [],
        count: 0,
      };
    if (endpoint === "/escalations")
      return {
        chains: [],
        active_count: 0,
        total_chains: 0,
      };
    if (endpoint === "/population/stats")
      return {
        alive: 0,
        total: 0,
        age_groups: {
          children: 0,
          adults: 0,
          elderly: 0,
        },
        average_age: 0,
      };
    if (endpoint === "/districts/dynamics")
      return {
        active_districts: 0,
        struggling_districts: 0,
        districts_at_war: 0,
        collapsed_districts: 0,
        active_wars: 0,
        total_wars: 0,
        total_merges: 0,
        total_collapses: 0,
        recent_events: [],
        protected_districts: [],
        emergency_aid_active: false,
        collapse_cooldown_remaining: 0,
        min_districts_enforced: 0,
        pending_new_districts: [],
        total_districts_established: 0,
        new_district_cooldown_remaining: 0,
        max_districts: 20,
      };
    if (endpoint === "/districts/wars")
      return {
        wars: [],
      };
    if (endpoint.startsWith("/districts/") && endpoint.endsWith("/dynamics"))
      return {
        state: "active",
        struggling_turns: 0,
        war_weariness: 0,
        defensive_strength: 0,
        offensive_strength: 0,
        allies: [],
        enemies: [],
        current_war: null,
      };
    if (endpoint === "/districts/collapsed")
      return {
        collapsed: [],
      };
    if (endpoint === "/districts/pending")
      return {
        pending: [],
      };
    if (endpoint === "/districts/history")
      return {
        history: [],
      };
    return null;
  }
};

// Control endpoints
export const pauseSimulation = async () => {
  return clientFetch("/control/pause", { method: "POST" });
};

export const resumeSimulation = async () => {
  return clientFetch("/control/resume", { method: "POST" });
};

export const setSpeed = async (ms) => {
  return clientFetch("/control/speed", {
    method: "POST",
    body: JSON.stringify({ ms }),
  });
};

// New endpoints
export const getAgentRelationships = async (agentId) => {
  return clientFetch(`/agents/${agentId}/relationships`);
};

export const getDistrictCulture = async (districtId) => {
  return clientFetch(`/districts/${districtId}/culture`);
};

export const getWorldFlags = async () => {
  return clientFetch("/world/flags");
};

export const getEscalations = async () => {
  return clientFetch("/escalations");
};

export const getPopulationStats = async () => {
  return clientFetch("/population/stats");
};

// District dynamics endpoints
export const getDistrictsDynamics = async () => {
  return clientFetch("/districts/dynamics");
};

export const getDistrictsWars = async () => {
  return clientFetch("/districts/wars");
};

export const getDistrictDynamics = async (districtId) => {
  return clientFetch(`/districts/${districtId}/dynamics`);
};

export const getCollapsedDistricts = async () => {
  return clientFetch("/districts/collapsed");
};

export const getDistrictsPending = async () => {
  return clientFetch("/districts/pending");
};

export const getDistrictsHistory = async () => {
  return clientFetch("/districts/history");
};

// Get the state image URL
export const getStateImageUrl = () => {
  const apiUrl = getApiUrl();
  return `${apiUrl}/state/image`;
};

// Get the state image info
export const getStateImageInfo = async () => {
  return clientFetch("/state/image/info");
};

export { getWsUrl };
