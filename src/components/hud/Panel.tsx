import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface PanelProps {
  /** Machine label rendered as `// LABEL` in the header. */
  label?: string
  /** Right-aligned header slot (buttons, status). */
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/**
 * The bracketed HUD container — dashed frame + corner brackets (from
 * `.hud-panel`), with an optional `//`-prefixed mono label header.
 */
export function Panel({ label, actions, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn('hud-panel p-4 md:p-5', className)}>
      {(label || actions) && (
        <header className="mb-3 flex min-h-6 items-center justify-between gap-2">
          {label ? <span className="label">// {label}</span> : <span aria-hidden />}
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
