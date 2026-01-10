import { useWorldStore } from './worldStore'
import { clientFetch } from '../lib/matrixApi'

const getWsUrl = () => {
  if (typeof window === 'undefined') return null
  return process.env.NEXT_PUBLIC_MATRIX_WS_URL || 'ws://localhost:8000/ws'
}

class WSClient {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = Infinity
    this.reconnectDelay = 1000
    this.maxReconnectDelay = 30000
    this.pollingInterval = null
    this.isPolling = false
    this.shouldReconnect = true
  }

  connect() {
    if (typeof window === 'undefined') return
    
    const wsUrl = getWsUrl()
    if (!wsUrl) {
      console.warn('WebSocket URL not configured, using polling only')
      this.startPolling()
      return
    }

    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        useWorldStore.getState().setWsStatus('connected')
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
        this.stopPolling()
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onerror = () => {
        // Connection errors are handled by onclose and will trigger reconnection or polling fallback
        // No need to log - this is expected when backend is unavailable
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        useWorldStore.getState().setWsStatus('disconnected')
        this.ws = null
        
        if (this.shouldReconnect) {
          this.scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.startPolling()
    }
  }

  handleMessage(message) {
    const { type, payload } = message
    
    switch (type) {
      case 'state':
        useWorldStore.getState().updateState(payload)
        break
      case 'event':
        useWorldStore.getState().addEvent(payload)
        break
      case 'agents':
        useWorldStore.getState().setAgents(payload)
        break
      case 'districts':
        useWorldStore.getState().setDistricts(payload)
        break
      case 'metrics':
        useWorldStore.getState().updateMetrics(payload)
        break
      default:
        console.warn('Unknown message type:', type)
    }
  }

  scheduleReconnect() {
    if (!this.shouldReconnect) return
    
    useWorldStore.getState().setWsStatus('reconnecting')
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    )
    
    setTimeout(() => {
      if (this.shouldReconnect && !this.ws) {
        this.reconnectAttempts++
        this.connect()
      }
    }, delay)
  }

  startPolling() {
    if (this.isPolling) return
    
    this.isPolling = true
    console.log('Starting polling fallback')
    
    const poll = async () => {
      try {
        const state = await clientFetch('/state')
        if (state) {
          useWorldStore.getState().updateState(state)
        }
        
        const events = await clientFetch('/events')
        if (events && Array.isArray(events)) {
          useWorldStore.getState().setEvents(events.slice(0, 200))
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }
    
    // Poll immediately
    poll()
    
    // Then poll every 2 seconds
    this.pollingInterval = setInterval(poll, 2000)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.isPolling = false
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.stopPolling()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Singleton instance
let wsClientInstance = null

export const getWSClient = () => {
  if (typeof window === 'undefined') return null
  
  if (!wsClientInstance) {
    wsClientInstance = new WSClient()
  }
  
  return wsClientInstance
}
