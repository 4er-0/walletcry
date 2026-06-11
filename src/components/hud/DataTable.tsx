import { useMemo, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type SortDir = 'asc' | 'desc'

export interface Column<T> {
  /** Stable column id (used as React key + default sort accessor on `row[key]`). */
  key: string
  /** Machine label shown in the header (and as the row label on mobile). */
  header: string
  /** Cell content. Receives the row; return a string or any node. */
  render: (row: T) => ReactNode
  /** Numeric column → right-aligned + tabular mono figures. */
  numeric?: boolean
  /** Allow sorting by this column. Pair with `sortAccessor` for non-string data. */
  sortable?: boolean
  /** Value used to sort this column (defaults to `row[key]`). */
  sortAccessor?: (row: T) => number | string
  /** Extra classes on the `<td>` (e.g. semantic color). */
  cellClassName?: string
  /** Header width hint, e.g. "12ch" or "30%". */
  width?: string
}

interface DataTableProps<T> {
  columns: Array<Column<T>>
  rows: T[]
  /** Stable key per row. */
  getRowKey: (row: T) => string
  /** Initial sort. Omit to render in source order. */
  defaultSort?: { key: string; dir: SortDir }
  /** Row affordance — adds hover + pointer; cell content stays the focus target. */
  onRowClick?: (row: T) => void
  /** Accessible table caption (visually muted, like a `// LABEL`). */
  caption?: string
  /** Rendered in place of the body when `rows` is empty. */
  empty?: ReactNode
  className?: string
}

/** Sort arrow glyphs — terminal-flavored, neutral until active. */
const ARROW: Record<SortDir, string> = { asc: '↑', desc: '↓' }

/**
 * Hairline data table — dense, sortable, mono figures, hard (radius-0) edges.
 * Single semantic `<table>` that collapses to stacked key/value cards below the
 * `md` breakpoint (CSS in `.hud-table`, see globals.css). Sortable headers are
 * real `<button>`s, so the table is keyboard-navigable, and `<th scope>` +
 * visually-hidden `<thead>` keep header associations intact on mobile.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  defaultSort,
  onRowClick,
  caption,
  empty,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(
    defaultSort ?? null,
  )

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return rows
    const accessor =
      col.sortAccessor ?? ((row: T) => (row as Record<string, unknown>)[col.key] as number | string)
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [rows, columns, sort])

  function toggleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  return (
    <table className={cn('hud-table', className)}>
      {caption && <caption className="label hud-table__caption">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col) => {
            const active = sort?.key === col.key
            const ariaSort = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'
            return (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sortable ? ariaSort : undefined}
                className={cn(col.numeric && 'is-num')}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="hud-table__sort"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span>{col.header}</span>
                    <span aria-hidden className={cn('hud-table__arrow', active && 'is-active')}>
                      {active ? ARROW[sort!.dir] : '↕'}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr className="hud-table__empty-row">
            <td colSpan={columns.length}>{empty}</td>
          </tr>
        ) : (
          sorted.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cn(onRowClick && 'is-clickable')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-label={col.header}
                  className={cn(col.numeric && 'is-num', col.cellClassName)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
