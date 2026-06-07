/**
 * Color model (deliberately spare):
 *   - Bars & gauges are MONOCHROME — white fill on a dark track (inverts on
 *     light). Red appears only for a genuine danger state.
 *   - Figures are neutral (white/black) by default. Only the HERO figure takes
 *     the active tone color; only genuine warnings go red.
 * Everything else relies on sign + label + mono, never hue.
 */

/** Fill color for bars/gauges. */
export type FillState = 'default' | 'danger'

export const FILL_COLOR: Record<FillState, string> = {
  default: 'var(--color-bar-fill)',
  danger: 'var(--color-neg)',
}

/** Emphasis for a number block. */
export type Emphasis = 'neutral' | 'hero' | 'danger'

export const EMPHASIS_COLOR: Record<Emphasis, string> = {
  neutral: 'var(--color-text-primary)',
  hero: 'var(--tone-accent)', // the one place tone colors a figure
  danger: 'var(--color-neg)',
}
