import type { ReactNode } from 'react'

import { FILL_COLOR, type FillState } from './semantics'

interface GaugeProps {
  value: number
  /** Full-scale value (default 1, i.e. `value` is already a 0..1 ratio). */
  max?: number
  /** Number of ticks (default from the design tokens: 20). */
  segments?: number
  /** `default` = white ticks; `danger` = red (genuine warning only). */
  state?: FillState
  label?: string
  caption?: ReactNode
  className?: string
}

/**
 * Segmented/ticked HUD gauge — discrete bars filled in proportion to
 * `value/max`. Used for cashflow health, debt progress, etc.
 */
export function Gauge({
  value,
  max = 1,
  segments = 20,
  state = 'default',
  label,
  caption,
  className,
}: GaugeProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const filled = Math.round(ratio * segments)
  const color = FILL_COLOR[state]

  return (
    <div className={className}>
      {label && <div className="label mb-2">{label}</div>}
      <div
        className="flex items-stretch"
        style={{ gap: 'var(--gauge-segment-gap)', height: 'var(--gauge-height)' }}
        role="meter"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ background: i < filled ? color : 'var(--gauge-track)' }}
          />
        ))}
      </div>
      {caption && <div className="label mt-2">{caption}</div>}
    </div>
  )
}
