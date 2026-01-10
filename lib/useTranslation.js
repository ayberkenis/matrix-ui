'use client'

import { useLocale } from './localeContext'
import { t } from './i18n'

export function useTranslation() {
  const locale = useLocale()
  return (key) => t(key, locale)
}
