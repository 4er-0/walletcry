import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Settings, Sun } from 'lucide-react'

import { DISPLAY_FONTS, TONES, type Tone, useTheme } from '@/app/theme'
import { cn } from '@/lib/cn'

const TONE_SWATCH: Record<Tone, string> = {
  green: '#2FE36B',
  amber: '#F5A623',
  cyan: '#35D6E0',
  mono: '#E8E9EC',
}

/**
 * Appearance settings — a cog in the top bar that opens a popover with theme,
 * dark-surface, accent tone, display-font, and shortcuts to the /kit + /dev
 * reference routes. Consolidates the controls that used to live only in those
 * dev pages. Closes on outside-click or Escape.
 */
export function SettingsMenu() {
  const { theme, setTheme, tone, setTone, surface, setSurface, displayFont, setDisplayFont } =
    useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center text-dim hover:text-[var(--color-text-primary)]"
        style={{
          border: '1px solid var(--color-border-primary)',
          color: open ? 'var(--tone-accent)' : undefined,
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Appearance settings"
        title="Appearance settings"
      >
        <Settings size={15} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="hud-panel absolute right-0 z-50 mt-2 w-[264px] p-4"
          style={{ borderStyle: 'solid' }}
        >
          <div className="label mb-3">// APPEARANCE</div>

          <Section label="THEME">
            <div className="grid grid-cols-2 gap-2">
              <Seg active={theme === 'dark'} onClick={() => setTheme('dark')}>
                <Moon size={13} strokeWidth={1.5} /> Dark
              </Seg>
              <Seg active={theme === 'light'} onClick={() => setTheme('light')}>
                <Sun size={13} strokeWidth={1.5} /> Light
              </Seg>
            </div>
          </Section>

          <Section label="SURFACE">
            <div className="grid grid-cols-2 gap-2">
              <Seg
                active={surface === 'charcoal'}
                disabled={theme !== 'dark'}
                onClick={() => setSurface('charcoal')}
              >
                Charcoal
              </Seg>
              <Seg
                active={surface === 'black'}
                disabled={theme !== 'dark'}
                onClick={() => setSurface('black')}
              >
                Black
              </Seg>
            </div>
            {theme !== 'dark' && (
              <div className="label mt-1 text-[var(--color-text-tertiary)]">dark mode only</div>
            )}
          </Section>

          <Section label="ACCENT_TONE">
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  title={t}
                  aria-label={`Tone ${t}`}
                  className="flex h-8 flex-1 items-center justify-center"
                  style={{
                    border: `1px solid ${t === tone ? 'var(--tone-accent)' : 'var(--color-border-primary)'}`,
                    borderRadius: 'var(--radius-control)',
                  }}
                >
                  <span
                    aria-hidden
                    style={{ width: 12, height: 12, background: TONE_SWATCH[t], display: 'block' }}
                  />
                </button>
              ))}
            </div>
          </Section>

          <Section label="DISPLAY_FONT">
            <div className="flex flex-col gap-1">
              {DISPLAY_FONTS.map((f) => {
                const on = displayFont === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDisplayFont(f.id)}
                    className="flex items-center justify-between px-2 py-1.5 text-left"
                    style={{
                      border: '1px solid',
                      borderColor: on ? 'var(--tone-accent)' : 'transparent',
                      borderRadius: 'var(--radius-control)',
                      color: on ? 'var(--tone-accent)' : 'var(--color-text-primary)',
                    }}
                  >
                    <span className="hud-title text-[0.95rem]">{f.label}</span>
                    {f.note && <span className="label">[{f.note}]</span>}
                  </button>
                )
              })}
            </div>
          </Section>

          <div className="hud-rule my-3" />
          <div className="label mb-2">// REFERENCE</div>
          <div className="flex gap-2">
            <Link
              to="/kit"
              className="hud-btn h-8 min-h-0 flex-1 px-2"
              onClick={() => setOpen(false)}
            >
              /kit
            </Link>
            <Link
              to="/dev"
              className="hud-btn h-8 min-h-0 flex-1 px-2"
              onClick={() => setOpen(false)}
            >
              /dev
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="label mb-2">{label}</div>
      {children}
    </div>
  )
}

function Seg({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn('hud-btn h-9 min-h-0 gap-2 px-2', active && 'hud-btn--primary')}
    >
      {children}
    </button>
  )
}
