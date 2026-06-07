import { EMPHASIS_COLOR, type Emphasis } from './semantics'

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
  /**
   * `neutral` (default) → white/black; `hero` → the active tone (use sparingly,
   * e.g. "Left this month"); `danger` → red (genuine warnings only).
   */
  emphasis?: Emphasis
  size?: keyof typeof SIZE
  className?: string
}

/** The atomic number block: mono figure + optional unit/delta. */
export function Stat({
  label,
  value,
  unit,
  delta,
  emphasis = 'neutral',
  size = 'md',
  className,
}: StatProps) {
  const deltaColor =
    emphasis === 'danger' ? 'var(--color-neg)' : 'var(--color-text-secondary)'
  return (
    <div className={className}>
      {label && <div className="label mb-1">{label}</div>}
      <div className="flex items-baseline gap-2">
        <span className="stat-figure" style={{ fontSize: SIZE[size], color: EMPHASIS_COLOR[emphasis] }}>
          {value}
        </span>
        {unit && <span className="label">{unit}</span>}
      </div>
      {delta && (
        <div className="tabnum mt-1 text-sm" style={{ color: deltaColor }}>
          {delta}
        </div>
      )}
    </div>
  )
}
