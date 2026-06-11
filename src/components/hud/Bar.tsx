import type { ReactNode } from 'react'

import { FILL_COLOR, type FillState } from './semantics'

interface BarProps {
  value: number
  max?: number
  /** `default` = white fill; `danger` = red (genuine warning only). */
  state?: FillState
  label?: string
  /** Show the percentage on the right of the label row. */
  showPercent?: boolean
  /** Caption beneath the bar, e.g. "affordable in 4 months". */
  caption?: ReactNode
  className?: string
}

/**
 * Continuous progress / affordability bar. Fills toward a target; pair with a
 * caption like "affordable in N months".
 */
export function Bar({
  value,
  max = 1,
  state = 'default',
  label,
  showPercent,
  caption,
  className,
}: BarProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const pct = Math.round(ratio * 100)

  return (
    <div className={className}>
      {label && (
        <div className="label mb-2 flex items-center justify-between gap-2">
          <span>{label}</span>
          {showPercent && <span className="tabnum">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{
          height: 'var(--gauge-height)',
          background: 'var(--gauge-track)',
          border: '1px solid var(--color-border-secondary)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: FILL_COLOR[state],
            transition: 'width var(--duration-normal) var(--easing-out)',
          }}
        />
      </div>
      {caption && <div className="label mt-2">{caption}</div>}
    </div>
  )
}
