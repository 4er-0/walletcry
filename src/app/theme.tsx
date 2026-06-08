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
export type DisplayFont =
  | 'dotrice'
  | 'technology'
  | 'digitaldream'
  | 'alvera-square'
  | 'alvera-circle'
  | 'mono'

export const TONES: Tone[] = ['green', 'amber', 'cyan', 'mono']

/** Display faces for big titles. `note` flags non-free licensing. */
export const DISPLAY_FONTS: { id: DisplayFont; label: string; note?: string }[] = [
  { id: 'dotrice', label: 'Dotrice', note: 'free · OFL' },
  { id: 'technology', label: 'Technology' },
  { id: 'digitaldream', label: 'Digital Dream' },
  { id: 'alvera-square', label: 'Alvera Square', note: 'demo' },
  { id: 'alvera-circle', label: 'Alvera Circle', note: 'demo' },
  { id: 'mono', label: 'Mono (off)' },
]

interface ThemeState {
  theme: Theme
  tone: Tone
  displayFont: DisplayFont
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setTone: (t: Tone) => void
  setDisplayFont: (f: DisplayFont) => void
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
  const [displayFont, setDisplayFontState] = useState<DisplayFont>(() =>
    readAttr('data-display-font', 'dotrice'),
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-tone', tone)
    document.documentElement.setAttribute('data-display-font', displayFont)
    try {
      localStorage.setItem('wc.theme', theme)
      localStorage.setItem('wc.tone', tone)
      localStorage.setItem('wc.displayFont', displayFont)
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
    // Keep the browser UI chrome in sync with the surface color.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF')
  }, [theme, tone, displayFont])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const setTone = useCallback((t: Tone) => setToneState(t), [])
  const setDisplayFont = useCallback((f: DisplayFont) => setDisplayFontState(f), [])
  const toggleTheme = useCallback(
    () => setThemeState((p) => (p === 'dark' ? 'light' : 'dark')),
    [],
  )

  return (
    <ThemeContext.Provider
      value={{ theme, tone, displayFont, toggleTheme, setTheme, setTone, setDisplayFont }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
