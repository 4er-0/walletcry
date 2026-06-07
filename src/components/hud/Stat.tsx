import { cn } from '@/lib/cn'

import { SIGN_CLASS, type Sign } from './semantics'

/** Figure size → type-ramp token. `xl` is the Home hero. */
const SIZE: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'var(--font-size-xl)',
  md: 'var(--font-size-2xl)',
  lg: 'var(--font-size-3xl)',
  xl: 'var(--font-size-4xl)',
}

interface StatProps {
  label?: string
  /** Pre-formatted figure (use `formatMoney` from the finance engine). */
  value: string
  /** Small unit/suffix shown next to the figure (e.g. "PLN", "/mo"). */
  unit?: string
  /** Secondary delta line (e.g. "+12,4% vs last month"). */
  delta?: string
  /** Semantic color of the figure. */
  sign?: Sign
  /** Semantic color of the delta (defaults to `sign`). */
  deltaSign?: Sign
  size?: keyof typeof SIZE
  className?: string
}

/** The atomic number block: mono figure + optional unit/delta, semantic color. */
export function Stat({
  label,
  value,
  unit,
  delta,
  sign = 'neutral',
  deltaSign,
  size = 'md',
  className,
}: StatProps) {
  return (
    <div className={className}>
      {label && <div className="label mb-1">{label}</div>}
      <div className="flex items-baseline gap-2">
        <span className={cn('stat-figure', SIGN_CLASS[sign])} style={{ fontSize: SIZE[size] }}>
          {value}
        </span>
        {unit && <span className="label">{unit}</span>}
      </div>
      {delta && <div className={cn('tabnum mt-1 text-sm', SIGN_CLASS[deltaSign ?? sign])}>{delta}</div>}
    </div>
  )
}
