import { useState } from 'react'

import { cn } from '@/lib/cn'

import { categoryIcon } from './icons'

export interface PickerCategory {
  id: string
  name: string
  code: string
  icon: string
}

interface CategoryPickerProps {
  categories: PickerCategory[]
  value?: string
  onSelect: (id: string) => void
  className?: string
}

/** Searchable, mono category picker — the inline recategorize surface. */
export function CategoryPicker({ categories, value, onSelect, className }: CategoryPickerProps) {
  const [q, setQ] = useState('')
  const needle = q.toLowerCase()
  const filtered = categories.filter((c) =>
    `${c.name} ${c.code}`.toLowerCase().includes(needle),
  )

  return (
    <div className={cn('hud-panel', className)} style={{ padding: 'var(--space-3)' }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search…"
        aria-label="Search categories"
        className="mb-2 w-full"
        style={{
          padding: '6px 8px',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-md)',
        }}
      />
      <ul className="flex max-h-56 flex-col gap-0.5 overflow-auto">
        {filtered.map((c) => {
          const Icon = categoryIcon(c.icon)
          const selected = c.id === value
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="label flex w-full items-center gap-2"
                style={{
                  padding: '6px 8px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  color: selected ? 'var(--tone-accent)' : 'var(--color-text-primary)',
                  background: selected ? 'var(--tone-accent-muted)' : 'transparent',
                }}
              >
                <Icon size={14} aria-hidden />
                <span>{c.code}</span>
                <span className="text-faint ml-auto" style={{ textTransform: 'none' }}>
                  {c.name}
                </span>
              </button>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="label" style={{ padding: '6px 8px' }}>
            no_match
          </li>
        )}
      </ul>
    </div>
  )
}
