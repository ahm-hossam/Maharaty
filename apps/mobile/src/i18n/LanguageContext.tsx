import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { strings, Language } from './strings'

interface LanguageContextValue {
  language: Language
  isRTL: boolean
  ready: boolean
  setLanguage: (lang: Language) => void
  t: (path: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function resolve(obj: any, path: string): string {
  const value = path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
  return typeof value === 'string' ? value : path
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replaceAll(`{${key}}`, String(value)),
    template,
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    SecureStore.getItemAsync('app_language').then((stored) => {
      if (stored === 'en' || stored === 'ar') setLanguageState(stored)
      setReady(true)
    })
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    SecureStore.setItemAsync('app_language', lang)
  }

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    isRTL: language === 'ar',
    ready,
    setLanguage,
    t: (path: string, params?: Record<string, string | number>) => interpolate(resolve(strings[language], path), params),
  }), [language, ready])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
