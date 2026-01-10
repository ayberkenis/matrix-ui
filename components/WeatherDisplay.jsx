'use client'

import { useWorldStore } from '../store/worldStore'
import { t } from '../lib/i18n'

export default function WeatherDisplay() {
  const worldState = useWorldStore((state) => state.state)
  
  if (!worldState?.weather) {
    return (
      <div className="text-sm text-matrix-green-dim">
        WEATHER: --
      </div>
    )
  }
  
  // Weather is a formatted string from the API
  const weather = typeof worldState.weather === 'string' 
    ? worldState.weather 
    : '--'
  
  return (
    <div className="text-sm text-matrix-green-dim font-mono">
      <span className="text-matrix-green">WEATHER</span>: {weather}
    </div>
  )
}
