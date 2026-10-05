import { useEffect, useState } from 'react'

/** useState that survives a page refresh (sessionStorage), so a demo isn't bounced back to login. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode) — state just won't persist
    }
  }, [key, value])

  return [value, setValue] as const
}
