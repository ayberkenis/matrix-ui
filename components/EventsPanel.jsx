'use client'

import { useState, useEffect, useRef } from 'react'
import { useWorldStore } from '../store/worldStore'
import { t } from '../lib/i18n'

function EventItem({ event, index }) {
  const [isNew, setIsNew] = useState(true)
  const itemRef = useRef(null)
  
  useEffect(() => {
    // Trigger glow animation when event is first rendered
    setIsNew(true)
    const timer = setTimeout(() => {
      setIsNew(false)
    }, 250) // 0.25 seconds
    
    return () => clearTimeout(timer)
  }, [event.id]) // Re-trigger when event ID changes
  // Map event types to severity levels for color coding
  const typeToSeverity = {
    work: 'LOW',
    social: 'LOW',
    trade: 'MEDIUM',
    economy: 'MEDIUM',
    conflict: 'HIGH',
    theft: 'HIGH',
  }
  
  const severityColors = {
    LOW: 'text-matrix-green-dim',
    MEDIUM: 'text-yellow-500',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-red-500',
  }
  
  const eventType = event.type || null
  const severity = eventType ? (typeToSeverity[eventType] || 'LOW') : 'LOW'
  const color = severityColors[severity] || severityColors.LOW
  
  return (
    <div 
      ref={itemRef}
      className={`border-b border-matrix-green border-opacity-10 pb-3 mb-3 last:border-0 last:mb-0 transition-all duration-250 ${
        isNew ? 'opacity-100' : 'opacity-60'
      }`}
      style={{
        backgroundColor: isNew 
          ? 'rgba(0, 255, 65, 0.25)' 
          : 'transparent',
        transition: 'opacity 0.25s ease-out, background-color 0.25s ease-out'
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {eventType && (
              <span className={`text-xs font-bold ${color}`}>
                [{t(`events.types.${eventType}`) || eventType.toUpperCase()}]
              </span>
            )}
            {event.agent_id && (
              <span className="text-xs text-matrix-green-dim">
                {event.agent_id}
              </span>
            )}
          </div>
          <p className="text-matrix-green-dim text-xs leading-relaxed">
            {event.description || 'No description'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EventsPanel() {
  const events = useWorldStore((state) => state.events)
  const eventUpdateInterval = useWorldStore((state) => state.eventUpdateInterval)
  const setEventUpdateInterval = useWorldStore((state) => state.setEventUpdateInterval)
  
  // Ensure events is always an array
  const eventsArray = Array.isArray(events) ? events : []
  
  const speedOptions = [
    { label: 'Fast', value: 100 },
    { label: 'Normal', value: 500 },
    { label: 'Slow', value: 1000 },
    { label: 'Very Slow', value: 2000 },
  ]
  
  const handleSpeedChange = (value) => {
    const interval = Number(value)
    setEventUpdateInterval(interval)
    // Update WebSocket client interval immediately
    if (typeof window !== 'undefined') {
      const { getWSClient } = require('../store/wsClient')
      const wsClient = getWSClient()
      if (wsClient) {
        wsClient.setEventUpdateInterval(interval)
      }
    }
  }
  
  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-matrix-green text-matrix-glow tracking-wider">
          {t('panels.events')}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-matrix-green-dim font-mono">Speed:</span>
          <select
            value={eventUpdateInterval}
            onChange={(e) => handleSpeedChange(e.target.value)}
            className="bg-matrix-dark border border-matrix-green border-opacity-30 text-matrix-green text-xs font-mono px-2 py-1 focus:outline-none focus:border-matrix-green focus:border-opacity-60"
          >
            {speedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-matrix">
        {eventsArray.length === 0 ? (
          <div className="text-matrix-green-dim text-sm">{t('events.noEvents')}</div>
        ) : (
          <div className="pr-2">
            {eventsArray.map((event, index) => (
              <EventItem key={event.id || `event-${index}`} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
