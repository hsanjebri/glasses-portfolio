'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { DUR } from '@/lib/motion'

type Theme = 'day' | 'sun'

type Ctx = {
  theme: Theme
  /** Register a request for SUN MODE. Returns the release function. */
  requestSun: () => () => void
}

const ThemeContext = createContext<Ctx>({ theme: 'day', requestSun: () => () => {} })

export const useTheme = () => useContext(ThemeContext).theme

/**
 * Owns the data-theme attribute on <html>. Pages ask for SUN MODE by mounting
 * <SunMode active />; when the last request is released the page returns to
 * day. Each switch adds a short-lived class that crossfades every colour on
 * the page over DUR.theme, so nothing carries a permanent transition.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState(0)
  const theme: Theme = requests > 0 ? 'sun' : 'day'

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.theme === theme) return
    root.classList.add('theme-shifting')
    root.dataset.theme = theme
    const t = window.setTimeout(() => root.classList.remove('theme-shifting'), DUR.theme * 1000 + 100)
    return () => window.clearTimeout(t)
  }, [theme])

  const requestSun = useCallback(() => {
    setRequests((n) => n + 1)
    return () => setRequests((n) => Math.max(0, n - 1))
  }, [])

  const value = useMemo(() => ({ theme, requestSun }), [theme, requestSun])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Mount with `active` to put the whole page into SUN MODE. Renders nothing. */
export function SunMode({ active }: { active: boolean }) {
  const { requestSun } = useContext(ThemeContext)
  useEffect(() => (active ? requestSun() : undefined), [active, requestSun])
  return null
}
