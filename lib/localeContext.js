'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const LocaleContext = createContext('en')

export function LocaleProvider({ children }) {
  const pathname = usePathname()
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    // Extract locale from pathname
    if (pathname.startsWith('/tr')) {
      setLocale('tr')
    } else {
      setLocale('en')
    }
  }, [pathname])

  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
