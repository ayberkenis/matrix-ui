import { useWorldStore } from "./worldStore";
import { clientFetch } from "../lib/matrixApi";

const getWsUrl = () => {
  if (typeof window === "undefined") return null;

  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_MATRIX_WS_URL) {
    return process.env.NEXT_PUBLIC_MATRIX_WS_URL;
  }

  // Auto-detect: use production in production builds, localhost in dev
  if (process.env.NODE_ENV === "production") {
    return "wss://api.ayberkenis.com.tr/matrix/ws";
  }

  return "ws://localhost:8000/ws";
};

class WSClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = Infinity;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.pollingInterval = null;
    this.isPolling = false;
    this.shouldReconnect = true;

    // Throttling and batching
    this.updateQueue = {
      state: null,
      events: [],
      agents: null,
      districts: null,
      metrics: null,
    };
    this.updateTimer = null;
    this.updateInterval = 500; // Batch updates every 500ms (slower for better performance)
    this.eventUpdateInterval = 500; // Can be adjusted by UI
  }

  setEventUpdateInterval(interval) {
    this.eventUpdateInterval = interval;
    // If there's a pending update timer, reschedule it with new interval
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
      // Reschedule with new interval if there are queued updates
      if (
        this.updateQueue.events.length > 0 ||
        this.updateQueue.state !== null ||
        this.updateQueue.agents !== null ||
        this.updateQueue.districts !== null ||
        this.updateQueue.metrics !== null
      ) {
        this.scheduleUpdate();
      }
    }
  }

  connect() {
    if (typeof window === "undefined") return;

    const wsUrl = getWsUrl();
    if (!wsUrl) {
      console.warn("WebSocket URL not configured, using polling only");
      this.startPolling();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        useWorldStore.getState().setWsStatus("connected");
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.stopPolling();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onerror = () => {
        // Connection errors are handled by onclose and will trigger reconnection or polling fallback
        // No need to log - this is expected when backend is unavailable
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        useWorldStore.getState().setWsStatus("disconnected");
        this.ws = null;

        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.startPolling();
    }
  }

  handleMessage(message) {
    const { type, payload } = message;

    // Queue updates instead of applying immediately
    switch (type) {
      case "state":
        this.updateQueue.state = payload;
        break;
      case "event":
        // Add events to queue (keep last 50 in queue to prevent memory issues)
        this.updateQueue.events.push(payload);
        if (this.updateQueue.events.length > 50) {
          this.updateQueue.events.shift();
        }
        break;
      case "agents":
        this.updateQueue.agents = payload;
        break;
      case "districts":
        this.updateQueue.districts = payload;
        break;
      case "metrics":
        this.updateQueue.metrics = payload;
        break;
      default:
        console.warn("Unknown message type:", type);
    }

    // Schedule batched update
    this.scheduleUpdate();
  }

  scheduleUpdate() {
    // Clear existing timer
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    // Use event-specific interval if there are events, otherwise use general interval
    const interval =
      this.updateQueue.events.length > 0
        ? this.eventUpdateInterval
        : this.updateInterval;

    // Schedule update after a delay to batch multiple messages
    this.updateTimer = setTimeout(() => {
      this.flushUpdates();
    }, interval);
  }

  flushUpdates() {
    const store = useWorldStore.getState();

    // Apply queued updates
    if (this.updateQueue.state !== null) {
      store.updateState(this.updateQueue.state);
      this.updateQueue.state = null;
    }

    // Batch add all queued events at once
    if (this.updateQueue.events.length > 0) {
      const events = [...this.updateQueue.events];
      this.updateQueue.events = [];

      // Add events in batch (reverse to maintain newest-first order)
      events.reverse().forEach((event) => {
        store.addEvent(event);
      });
    }

    if (this.updateQueue.agents !== null) {
      store.setAgents(this.updateQueue.agents);
      this.updateQueue.agents = null;
    }

    if (this.updateQueue.districts !== null) {
      store.setDistricts(this.updateQueue.districts);
      this.updateQueue.districts = null;
    }

    if (this.updateQueue.metrics !== null) {
      store.updateMetrics(this.updateQueue.metrics);
      this.updateQueue.metrics = null;
    }

    this.updateTimer = null;

    // If there are more queued events, schedule another update
    if (
      this.updateQueue.events.length > 0 ||
      this.updateQueue.state !== null ||
      this.updateQueue.agents !== null ||
      this.updateQueue.districts !== null ||
      this.updateQueue.metrics !== null
    ) {
      this.scheduleUpdate();
    }
  }

  scheduleReconnect() {
    if (!this.shouldReconnect) return;

    useWorldStore.getState().setWsStatus("reconnecting");

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    setTimeout(() => {
      if (this.shouldReconnect && !this.ws) {
        this.reconnectAttempts++;
        this.connect();
      }
    }, delay);
  }

  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log("Starting polling fallback");

    const poll = async () => {
      try {
        const state = await clientFetch("/state");
        if (state) {
          useWorldStore.getState().updateState(state);
        }

        const events = await clientFetch("/events");
        if (events && Array.isArray(events)) {
          useWorldStore.getState().setEvents(events.slice(0, 200));
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Poll immediately
    poll();

    // Then poll every 2 seconds
    this.pollingInterval = setInterval(poll, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopPolling();

    // Flush any pending updates before disconnecting
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.flushUpdates();
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let wsClientInstance = null;

export const getWSClient = () => {
  if (typeof window === "undefined") return null;

  if (!wsClientInstance) {
    wsClientInstance = new WSClient();
  }

  return wsClientInstance;
};
