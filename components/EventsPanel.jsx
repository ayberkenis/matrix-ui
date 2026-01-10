'use client'

import { useWorldStore } from '../store/worldStore'
import { t } from '../lib/i18n'

function EventItem({ event, index }) {
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
    <div className="border-b border-matrix-green border-opacity-10 pb-3 mb-3 last:border-0 last:mb-0">
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
  
  // Ensure events is always an array
  const eventsArray = Array.isArray(events) ? events : []
  
  return (
    <div className="bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 h-full flex flex-col min-h-0">
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider flex-shrink-0">
        {t('panels.events')}
      </h2>
      
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
