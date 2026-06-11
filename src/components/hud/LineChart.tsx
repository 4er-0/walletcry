import type { ReactNode } from 'react'

import { FILL_COLOR, type FillState } from './semantics'

interface LineChartProps {
  /** Series values, oldest → newest. */
  data: number[]
  /** Pixel height of the plot (width is fluid). */
  height?: number
  /** Fill the area under the line with a faint wash. */
  area?: boolean
  /** `default` = white line; `danger` = red. */
  state?: FillState
  label?: string
  caption?: ReactNode
  className?: string
}

/**
 * Thin HUD line/area chart for trends (balance over time, cashflow). Stroke is
 * kept hairline-thin regardless of width via non-scaling-stroke.
 */
export function LineChart({
  data,
  height = 64,
  area = true,
  state = 'default',
  label,
  caption,
  className,
}: LineChartProps) {
  const W = 100
  const H = height
  const color = FILL_COLOR[state]

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const n = Math.max(1, data.length - 1)

  const pts = data.map((v, i) => {
    const x = (i / n) * W
    const y = H - ((v - min) / span) * (H - 2) - 1 // 1px inset top/bottom
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const areaPath = `${line} L${W} ${H} L0 ${H} Z`

  return (
    <div className={className}>
      {label && <div className="label mb-2">{label}</div>}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {area && <path d={areaPath} fill={color} opacity={0.1} />}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {caption && <div className="label mt-2">{caption}</div>}
    </div>
  )
}
