// Simple i18n dictionary structure
export const dict = {
  en: {
    title: 'LIVING MATRIX',
    connection: {
      connected: 'CONNECTED',
      disconnected: 'DISCONNECTED',
      reconnecting: 'RECONNECTING...',
    },
    panels: {
      districts: 'DISTRICTS',
      events: 'EVENT STREAM',
      agents: 'AGENTS',
      worldSummary: 'WORLD SUMMARY',
    },
    controls: {
      pause: 'PAUSE',
      resume: 'RESUME',
      speed: 'SPEED',
      reset: 'RESET',
      resetConfirm: 'Reset simulation? This action cannot be undone.',
      confirm: 'CONFIRM',
      cancel: 'CANCEL',
    },
    metrics: {
      stability: 'STABILITY',
      novelty: 'NOVELTY',
      cohesion: 'COHESION',
      expression: 'EXPRESSION',
    },
    districts: {
      tension: 'TENSION',
      food: 'FOOD',
      water: 'WATER',
      energy: 'ENERGY',
      hotspots: 'HOTSPOTS',
    },
    agents: {
      location: 'LOCATION',
      role: 'ROLE',
      mood: 'MOOD',
      needs: 'NEEDS',
      goal: 'GOAL',
    },
    events: {
      noEvents: 'NO EVENTS',
      severity: {
        low: 'LOW',
        medium: 'MEDIUM',
        high: 'HIGH',
        critical: 'CRITICAL',
      },
      types: {
        work: 'WORK',
        social: 'SOCIAL',
        trade: 'TRADE',
        conflict: 'CONFLICT',
        theft: 'THEFT',
        economy: 'ECONOMY',
      },
    },
    weather: {
      sky: 'SKY',
      wind: 'WIND',
      precip: 'PRECIP',
      temp: 'TEMP',
    },
    time: {
      day: 'DAY',
      time: 'TIME',
      phase: 'PHASE',
    },
    footer: {
      live: 'LIVE',
      about: 'ABOUT',
      github: 'GITHUB',
      why: 'WHY',
      faq: 'FAQ',
      docs: 'DOCS',
    },
  },
}

export const t = (key, lang = 'en') => {
  const keys = key.split('.')
  let value = dict[lang]
  for (const k of keys) {
    value = value?.[k]
  }
  return value ?? key
}
