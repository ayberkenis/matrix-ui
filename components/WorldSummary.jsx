'use client'

import { useWorldStore } from '../store/worldStore'
import { t } from '../lib/i18n'

export default function WorldSummary({ className = "" }) {
  const worldState = useWorldStore((state) => state.state)
  const metrics = useWorldStore((state) => state.metrics)
  const districts = useWorldStore((state) => state.districts)
  const agents = useWorldStore((state) => state.agents)
  
  // Ensure arrays
  const districtsArray = Array.isArray(districts) ? districts : []
  const agentsArray = Array.isArray(agents) ? agents : []
  
  // Get economy data from state
  const economy = worldState?.economy || {}
  // average_tension from API is already a percentage (0-100)
  const avgTension = economy.average_tension !== undefined
    ? economy.average_tension
    : (districtsArray.length > 0
      ? districtsArray.reduce((sum, d) => sum + (d.tension || 0), 0) / districtsArray.length * 100
      : 0)
  
  return (
    <div className={`bg-matrix-panel border-matrix border-matrix-green border-opacity-30 p-4 mb-4 ${className}`}>
      <h2 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4 tracking-wider">
        {t('panels.worldSummary')}
      </h2>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-matrix-green-dim mb-1">DISTRICTS</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.district_count || districtsArray.length}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">AGENTS</div>
          <div className="text-matrix-green text-xl font-bold">{agentsArray.length}</div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">AVG TENSION</div>
          <div className="text-matrix-green text-xl font-bold">
            {Math.round(avgTension)}%
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">TOTAL FOOD</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.total_food || '--'}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">TOTAL CREDITS</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.total_credits || '--'}
          </div>
        </div>
        <div>
          <div className="text-matrix-green-dim mb-1">SCARCITY COUNT</div>
          <div className="text-matrix-green text-xl font-bold">
            {economy.scarcity_count || 0}
          </div>
        </div>
        {metrics && (
          <>
            <div>
              <div className="text-matrix-green-dim mb-1">{t('metrics.stability')}</div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.stability || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">{t('metrics.novelty')}</div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.novelty || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">{t('metrics.cohesion')}</div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.cohesion || 0) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-matrix-green-dim mb-1">{t('metrics.expression')}</div>
              <div className="text-matrix-green text-xl font-bold">
                {Math.round((metrics.expression || 0) * 100)}%
              </div>
            </div>
          </>
        )}
      </div>
      
      {worldState?.warnings && worldState.warnings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-matrix-green border-opacity-20">
          <div className="text-matrix-green-dim text-xs mb-2">WARNINGS</div>
          <div className="space-y-1">
            {worldState.warnings.map((warning, idx) => (
              <div key={idx} className="text-xs text-yellow-500">
                ⚠ {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
