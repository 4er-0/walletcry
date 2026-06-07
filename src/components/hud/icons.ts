/**
 * Icon registry for category icons. Named imports keep lucide tree-shakeable
 * (vs. dynamic indexing, which would bundle the whole icon set). Add new
 * category icons here as categories grow.
 */

import {
  Car,
  CircleHelp,
  Gamepad2,
  HeartPulse,
  Home,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Utensils,
  ShoppingBag,
  Gamepad2,
  Repeat,
  CircleHelp,
}

/** Resolve a category icon by name, falling back to a neutral glyph. */
export function categoryIcon(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || CircleHelp
}
