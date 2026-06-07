import { Command } from 'lucide-react'
import { ThemeControls } from './ThemeControls'

/** Top status bar — wordmark + sync status (left), command hint + theme (right). */
export function TopBar() {
  return (
    <header
      className="flex shrink-0 items-center justify-between gap-3 px-4"
      style={{
        height: 'calc(var(--topbar-height) + var(--safe-top))',
        paddingTop: 'var(--safe-top)',
        borderBottom: '1px dashed var(--color-border-primary)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="mono text-sm font-bold tracking-tight md:hidden">
          <span className="text-accent">W:</span>
          <span style={{ color: 'var(--color-text-primary)' }}>WALLETCRY</span>
        </span>
        <span className="label hidden md:inline">WALLETCRY // v0.0.0</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="label hidden items-center gap-2 sm:inline-flex">
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: '9999px',
              background: 'var(--color-pos)',
              display: 'inline-block',
            }}
          />
          LOCAL
        </span>
        <button
          type="button"
          className="hud-btn hidden h-9 min-h-0 gap-2 px-3 md:inline-flex"
          title="Command palette (coming soon)"
          aria-label="Open command palette"
        >
          <Command size={13} strokeWidth={1.75} />
          <span style={{ fontSize: '11px' }}>K</span>
        </button>
        <ThemeControls />
      </div>
    </header>
  )
}
