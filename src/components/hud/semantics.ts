/** Shared semantic color mapping for HUD components (token-driven). */

/** Money/health semantics. `accent` follows the active tone; rest are fixed. */
export type HudState = 'pos' | 'neg' | 'accent' | 'warn' | 'neutral'

/** CSS color for filled/strong surfaces (gauges, bars). */
export const STATE_COLOR: Record<HudState, string> = {
  pos: 'var(--color-pos-strong)',
  neg: 'var(--color-neg-strong)',
  accent: 'var(--tone-accent)',
  warn: 'var(--color-status-warning)',
  neutral: 'var(--color-text-secondary)',
}

/** Sign of a figure → the matching text utility class. */
export type Sign = 'pos' | 'neg' | 'neutral'

export const SIGN_CLASS: Record<Sign, string> = {
  pos: 'text-pos',
  neg: 'text-neg',
  neutral: '',
}

/** Derive a sign from a number (0 counts as neutral). */
export function signOf(n: number): Sign {
  if (n > 0) return 'pos'
  if (n < 0) return 'neg'
  return 'neutral'
}
