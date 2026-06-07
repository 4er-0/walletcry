import type { ReactNode } from 'react'

import { FILL_COLOR, type FillState } from './semantics'

interface BarChartProps {
  /** Values rendered left → right as vertical bars. */
  data: number[]
  /** Full-scale value (defaults to the series max). */
  max?: number
  /** Pixel height of the plot. */
  height?: number
  /** `default` = white bars; `danger` = red. */
  state?: FillState
  label?: string
  caption?: ReactNode
  className?: string
}

/**
 * Segmented bar / spectrum chart (spending-by-category, activity histograms).
 * The EQ-style vertical-bar readout from the brief's HUD references.
 */
export function BarChart({
  data,
  max,
  height = 64,
  state = 'default',
  label,
  caption,
  className,
}: BarChartProps) {
  const top = max ?? Math.max(...data, 1)
  const color = FILL_COLOR[state]

  return (
    <div className={className}>
      {label && <div className="label mb-2">{label}</div>}
      <div
        className="flex items-end"
        style={{ height, gap: 'var(--gauge-segment-gap)' }}
        role="img"
        aria-label={label}
      >
        {data.map((v, i) => (
          <span
            key={i}
            className="flex-1"
            style={{ height: `${Math.max(2, (v / top) * 100)}%`, background: color }}
          />
        ))}
      </div>
      {caption && <div className="label mt-2">{caption}</div>}
    </div>
  )
}
