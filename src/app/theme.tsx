import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light'
export type Tone = 'green' | 'amber' | 'cyan' | 'mono'

export const TONES: Tone[] = ['green', 'amber', 'cyan', 'mono']

interface ThemeState {
  theme: Theme
  tone: Tone
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setTone: (t: Tone) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

function readAttr<T extends string>(name: string, fallback: T): T {
  if (typeof document === 'undefined') return fallback
  return (document.documentElement.getAttribute(name) as T) || fallback
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialised from the <html> attributes the inline boot script already set.
  const [theme, setThemeState] = useState<Theme>(() => readAttr('data-theme', 'dark'))
  const [tone, setToneState] = useState<Tone>(() => readAttr('data-tone', 'green'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-tone', tone)
    try {
      localStorage.setItem('wc.theme', theme)
      localStorage.setItem('wc.tone', tone)
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
    // Keep the browser UI chrome in sync with the surface color.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF')
  }, [theme, tone])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const setTone = useCallback((t: Tone) => setToneState(t), [])
  const toggleTheme = useCallback(
    () => setThemeState((p) => (p === 'dark' ? 'light' : 'dark')),
    [],
  )

  return (
    <ThemeContext.Provider value={{ theme, tone, toggleTheme, setTheme, setTone }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
