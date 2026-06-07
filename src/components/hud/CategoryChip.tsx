import { cn } from '@/lib/cn'

import { categoryIcon } from './icons'

interface CategoryChipProps {
  /** Human name, used as the accessible label and chip text fallback. */
  name: string
  /** Mono code shown on the chip (e.g. "GROCERIES"); falls back to `name`. */
  code?: string
  /** Icon name from the registry. */
  icon?: string
  /** Renders as a button when provided (for inline recategorize). */
  onClick?: () => void
  active?: boolean
  className?: string
}

/** Compact category tag: icon + mono code, dashed HUD border. */
export function CategoryChip({ name, code, icon, onClick, active, className }: CategoryChipProps) {
  const Icon = categoryIcon(icon)
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? `Category: ${name}` : undefined}
      className={cn('label inline-flex items-center gap-1.5', onClick && 'cursor-pointer', className)}
      style={{
        padding: '2px 8px',
        minHeight: onClick ? '28px' : undefined,
        borderRadius: 'var(--radius-md)',
        border: `1px ${'var(--hud-border-style)'} ${active ? 'var(--tone-accent)' : 'var(--color-border-primary)'}`,
        background: 'var(--color-bg-tertiary)',
        color: active ? 'var(--tone-accent)' : 'var(--color-text-secondary)',
      }}
    >
      <Icon size={12} aria-hidden />
      <span>{code ?? name}</span>
    </Tag>
  )
}
