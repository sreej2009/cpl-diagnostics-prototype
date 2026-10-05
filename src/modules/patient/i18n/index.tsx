import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { usePersistentState } from '@/lib/usePersistentState'
import { en } from './en'
import type { Dictionary, TranslationKey } from './en'
import { hi } from './hi'

export type Language = 'en' | 'hi'
export type { TranslationKey }

/** Every Patient App string lives in these two dictionaries — nowhere else. */
const dictionaries: Record<Language, Dictionary> = { en, hi }

export const languages: { code: Language; tag: string; name: string; english: string }[] = [
  { code: 'en', tag: 'EN', name: 'English', english: 'English' },
  { code: 'hi', tag: 'HI', name: 'हिन्दी', english: 'Hindi' },
]

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string

interface I18nValue {
  lang: Language
  setLang: (lang: Language) => void
  t: Translate
}

const I18nContext = createContext<I18nValue | null>(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}

export function translate(lang: Language, key: TranslationKey, params?: Record<string, string | number>) {
  const template = dictionaries[lang][key] ?? en[key]
  return params ? template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)) : template
}

/** English by default; the choice lasts for the browser session only. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [stored, setLang] = usePersistentState<Language>('cpl.patient.lang', 'en')
  // a language saved earlier that is no longer offered falls back to English
  const lang: Language = stored in dictionaries ? stored : 'en'
  const t = useCallback<Translate>((key, params) => translate(lang, key, params), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <I18nContext.Provider value={value}>
      {/* `lang` lets the browser pick the right font and line-breaking for Hindi. */}
      <div lang={lang} className="h-full">
        {children}
      </div>
    </I18nContext.Provider>
  )
}
