'use client'

import { useState } from 'react'
import Link from 'next/link'
import { pauseSimulation, resumeSimulation, setSpeed } from '../lib/matrixApi'
import { useTranslation } from '../lib/useTranslation'
import { useLocale } from '../lib/localeContext'

export default function ControlPanel({ className = "" }) {
  const t = useTranslation();
  const locale = useLocale();
  const localePrefix = locale === 'tr' ? '/tr' : '';
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeedValue] = useState(1000)
  const [showResetModal, setShowResetModal] = useState(false)
  
  const handlePause = async () => {
    try {
      await pauseSimulation()
      setIsPaused(true)
    } catch (error) {
      console.error('Failed to pause:', error)
    }
  }
  
  const handleResume = async () => {
    try {
      await resumeSimulation()
      setIsPaused(false)
    } catch (error) {
      console.error('Failed to resume:', error)
    }
  }
  
  const handleSpeedChange = async (e) => {
    const newSpeed = parseInt(e.target.value)
    setSpeedValue(newSpeed)
    try {
      await setSpeed(newSpeed)
    } catch (error) {
      console.error('Failed to set speed:', error)
    }
  }
  
  const handleReset = () => {
    setShowResetModal(true)
  }
  
  const confirmReset = async () => {
    // TODO: Implement reset endpoint when available
    console.log('Reset simulation')
    setShowResetModal(false)
  }
  
  return (
    <>
      <div className={`bg-matrix-panel border-t border-matrix border-matrix-green border-opacity-30 px-6 py-4 ${className}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {isPaused ? (
              <button
                onClick={handleResume}
                className="px-6 py-2 bg-matrix-green bg-opacity-20 text-matrix-green border border-matrix-green border-opacity-50 hover:bg-opacity-30 hover:border-opacity-70 transition-all font-mono text-sm font-bold"
              >
                {t('controls.resume')}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-2 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50 hover:bg-opacity-30 hover:border-opacity-70 transition-all font-mono text-sm font-bold"
              >
                {t('controls.pause')}
              </button>
            )}
            
            <div className="flex items-center gap-3">
              <label className="text-matrix-green-dim text-sm font-mono">
                {t('controls.speed')}: {speed}ms
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={speed}
                onChange={handleSpeedChange}
                className="w-32 accent-matrix-green"
              />
            </div>
            
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50 hover:bg-opacity-30 hover:border-opacity-70 transition-all font-mono text-sm font-bold"
            >
              {t('controls.reset')}
            </button>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-matrix-green-dim">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" />
              <span className="font-mono">{t('footer.live')}</span>
            </div>
            <div className="h-4 w-px bg-matrix-green bg-opacity-30 hidden sm:block" />
            <div className="flex items-center gap-3 sm:gap-4 font-mono flex-wrap">
              <Link
                href={`${localePrefix}/about`}
                className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
              >
                {t('footer.about')}
              </Link>
              <a
                href="https://github.com/ayberkenis/matrix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
              >
                {t('footer.github')}
              </a>
              <Link
                href={`${localePrefix}/why`}
                className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
              >
                {t('footer.why')}
              </Link>
              <Link
                href={`${localePrefix}/faq`}
                className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
              >
                {t('footer.faq')}
              </Link>
              <Link
                href={`${localePrefix}/docs`}
                className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
              >
                {t('footer.docs')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-matrix-dark border-matrix border-matrix-green border-opacity-50 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-matrix-green text-matrix-glow mb-4">
              {t('controls.reset')}
            </h3>
            <p className="text-matrix-green-dim mb-6">
              {t('controls.resetConfirm')}
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-matrix-green border-opacity-30 text-matrix-green hover:border-opacity-60 transition-all font-mono text-sm"
              >
                {t('controls.cancel')}
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50 hover:bg-opacity-30 hover:border-opacity-70 transition-all font-mono text-sm font-bold"
              >
                {t('controls.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
