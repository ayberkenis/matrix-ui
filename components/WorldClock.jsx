'use client'

import { useWorldStore } from '../store/worldStore'
import { t } from '../lib/i18n'

export default function WorldClock() {
  const worldState = useWorldStore((state) => state.state)
  
  if (!worldState) {
    return (
      <div className="text-sm text-matrix-green-dim">
        {t('time.day')}: -- | {t('time.time')}: --:--:--
      </div>
    )
  }
  
  return (
    <div className="text-sm text-matrix-green-dim font-mono">
      <span className="text-matrix-green">TURN</span>: {worldState.turn || '--'} |{' '}
      <span className="text-matrix-green">{t('time.day')}</span>: {worldState.day || '--'} |{' '}
      <span className="text-matrix-green">{t('time.time')}</span>: {worldState.time || '--:--:--'}
    </div>
  )
}
