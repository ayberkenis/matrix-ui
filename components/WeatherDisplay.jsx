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
  
  // Handle both old string format and new object format
  let weatherText = '--'
  
  if (typeof worldState.weather === 'string') {
    // Old format: string
    weatherText = worldState.weather
  } else if (typeof worldState.weather === 'object') {
    // New format: object with sky, wind, precipitation, temperature
    const w = worldState.weather
    const parts = []
    
    if (w.sky && w.sky !== 'unknown') {
      parts.push(`Sky: ${w.sky}`)
    }
    if (w.wind !== undefined) {
      const windLevel = w.wind < 0.3 ? 'calm' : w.wind < 0.7 ? 'moderate' : 'strong'
      parts.push(`Wind: ${windLevel}`)
    }
    if (w.precipitation !== undefined) {
      const precipLevel = w.precipitation < 0.1 ? 'none' : w.precipitation < 0.5 ? 'light' : 'heavy'
      parts.push(`Precip: ${precipLevel}`)
    }
    if (w.temperature !== undefined) {
      const tempLevel = w.temperature < 0.3 ? 'cold' : w.temperature < 0.7 ? 'mild' : 'warm'
      parts.push(`Temp: ${tempLevel}`)
    }
    
    weatherText = parts.length > 0 ? parts.join(' • ') : 'Unknown'
  }
  
  return (
    <div className="text-sm text-matrix-green-dim font-mono">
      <span className="text-matrix-green">WEATHER</span>: {weatherText}
    </div>
  )
}
