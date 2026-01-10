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
      id: 'ID',
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
  tr: {
    title: 'YAŞAYAN MATRİS',
    connection: {
      connected: 'BAĞLI',
      disconnected: 'BAĞLANTI KESİLDİ',
      reconnecting: 'YENİDEN BAĞLANIYOR...',
    },
    panels: {
      districts: 'BÖLGELER',
      events: 'ETKİNLİK AKIŞI',
      agents: 'Ajanlar',
      worldSummary: 'DÜNYA ÖZETİ',
    },
    controls: {
      pause: 'DURAKLAT',
      resume: 'DEVAM ET',
      speed: 'HIZ',
      reset: 'SIFIRLA',
      resetConfirm: 'Simülasyonu sıfırla? Bu işlem geri alınamaz.',
      confirm: 'ONAYLA',
      cancel: 'İPTAL',
    },
    metrics: {
      stability: 'KARARLILIK',
      novelty: 'YENİLİK',
      cohesion: 'UYUM',
      expression: 'İFADE',
    },
    districts: {
      tension: 'GERİLİM',
      food: 'YİYECEK',
      water: 'SU',
      energy: 'ENERJİ',
      hotspots: 'SICAK NOKTALAR',
    },
    agents: {
      id: 'KİMLİK',
      location: 'KONUM',
      role: 'ROL',
      mood: 'RUH HALİ',
      needs: 'İHTİYAÇLAR',
      goal: 'HEDEF',
    },
    events: {
      noEvents: 'ETKİNLİK YOK',
      severity: {
        low: 'DÜŞÜK',
        medium: 'ORTA',
        high: 'YÜKSEK',
        critical: 'KRİTİK',
      },
      types: {
        work: 'İŞ',
        social: 'SOSYAL',
        trade: 'TİCARET',
        conflict: 'ÇATIŞMA',
        theft: 'HIRSIZLIK',
        economy: 'EKONOMİ',
      },
    },
    weather: {
      sky: 'GÖKYÜZÜ',
      wind: 'RÜZGAR',
      precip: 'YAĞIŞ',
      temp: 'SICAKLIK',
    },
    time: {
      day: 'GÜN',
      time: 'ZAMAN',
      phase: 'FAZ',
    },
    footer: {
      live: 'CANLI',
      about: 'HAKKINDA',
      github: 'GITHUB',
      why: 'NEDEN',
      faq: 'SSS',
      docs: 'DÖKÜMANLAR',
    },
  },
}

export const locales = ['en', 'tr']
export const defaultLocale = 'en'

export const t = (key, lang = 'en') => {
  const keys = key.split('.')
  let value = dict[lang] || dict[defaultLocale]
  for (const k of keys) {
    value = value?.[k]
  }
  return value ?? key
}
