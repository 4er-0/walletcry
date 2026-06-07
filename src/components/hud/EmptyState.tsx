import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Default dotted/pointillist HUD art for empty views. */
const DEFAULT_ART = `· · · · · · · · · · ·
· ∙ · ∙ · ∙ · ∙ · ∙ ·
· · ▒ ▒ ▒ ▒ ▒ ▒ · · ·
· ∙ ▒ · · · · ▒ ∙ · ·
· · ▒ ▒ ▒ ▒ ▒ ▒ · · ·
· ∙ · ∙ · ∙ · ∙ · ∙ ·
· · · · · · · · · · ·`

interface EmptyStateProps {
  title: string
  description?: string
  /** Single CTA (per brief, empties have exactly one). */
  action?: ReactNode
  /** Override the ASCII art. */
  art?: string
  className?: string
}

/** Dotted-ASCII empty state with a single call to action — never a dead end. */
export function EmptyState({ title, description, action, art = DEFAULT_ART, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center text-center', className)}
      style={{ padding: 'var(--space-9) var(--space-5)' }}
    >
      <pre
        aria-hidden
        className="mono"
        style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.4, fontSize: 'var(--font-size-sm)' }}
      >
        {art}
      </pre>
      <div className="label mt-4" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </div>
      {description && (
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)', maxWidth: '40ch' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
