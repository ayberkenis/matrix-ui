// API client for Matrix backend
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_MATRIX_API_URL || "http://localhost:8000";
  }
  return process.env.MATRIX_API_URL || "http://localhost:8000";
};

const getWsUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_MATRIX_WS_URL || "ws://localhost:8000";
  }
  return process.env.MATRIX_WS_URL || "ws://localhost:8000";
};

// Mock data for when backend is unavailable
const mockState = {
  turn: 0,
  day: 1,
  time: "Day 1 • 12:00 (Noon)",
  weather: "Sky: clear • Wind: calm • Precip: none • Temp: mild",
  economy: {
    total_food: 100,
    total_credits: 1000,
    average_tension: 50.0,
    scarcity_count: 0,
    district_count: 5,
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
    id: "A",
    name: "District A",
    tension: 0.3,
    food: 0.7,
    water: 0.8,
    energy: 0.6,
    hotspots: [],
  },
  {
    id: "B",
    name: "District B",
    tension: 0.6,
    food: 0.4,
    water: 0.5,
    energy: 0.7,
    hotspots: ["CONFLICT"],
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
    if (endpoint === "/agents" && data.agents) {
      return data.agents;
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
    if (endpoint === "/agents" && data.agents) {
      return data.agents;
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

export { getWsUrl };
