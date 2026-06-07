import { Moon, Sun } from 'lucide-react'
import { TONES, useTheme } from '@/app/theme'

const TONE_SWATCH: Record<string, string> = {
  green: '#2FE36B',
  amber: '#F5A623',
  cyan: '#35D6E0',
  mono: '#E8E9EC',
}

/** Dark/light toggle + accent-tone cycle. */
export function ThemeControls() {
  const { theme, tone, toggleTheme, setTone } = useTheme()

  const cycleTone = () => {
    const i = TONES.indexOf(tone)
    setTone(TONES[(i + 1) % TONES.length])
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={cycleTone}
        className="flex h-9 w-9 items-center justify-center"
        style={{ border: '1px solid var(--color-border-primary)' }}
        title={`Accent tone: ${tone} (tap to cycle)`}
        aria-label={`Accent tone ${tone}, tap to change`}
      >
        <span
          aria-hidden
          style={{ width: 12, height: 12, background: TONE_SWATCH[tone], display: 'block' }}
        />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center text-muted hover:text-[var(--color-text-primary)]"
        style={{ border: '1px solid var(--color-border-primary)' }}
        title={`Theme: ${theme} (tap to switch)`}
        aria-label={`Theme ${theme}, tap to switch`}
      >
        {theme === 'dark' ? <Moon size={15} strokeWidth={1.5} /> : <Sun size={15} strokeWidth={1.5} />}
      </button>
    </div>
  )
}
