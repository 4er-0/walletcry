import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  CategoryChip,
  CategoryPicker,
  type Column,
  DataTable,
  EmptyState,
  Panel,
} from '@/components/hud'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/finance'
import {
  store,
  useCategories,
  useCategoryMap,
  useTransactions,
  type Transaction,
  type TransactionFilter,
} from '@/data'

/**
 * Transactions — the ledger (per IA): filter/search bar driven by URL params
 * (`?q/category/from/to`, shareable/bookmarkable), the hairline table with
 * signed mono amounts, inline recategorize with "apply to all matching
 * <merchant>?" rule-learning, and the recurring-bills rail.
 */
export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filter: TransactionFilter = {
    q: searchParams.get('q') ?? undefined,
    categoryId: searchParams.get('category') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  }

  const transactions = useTransactions(filter)
  const categories = useCategories()
  const categoriesById = useCategoryMap()

  /** Transaction currently being recategorized (drives the picker dialog). */
  const [editing, setEditing] = useState<Transaction | null>(null)

  function setParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  if (!transactions || !categories || !categoriesById) {
    return (
      <Screen>
        <div className="label text-faint">// LOADING_LEDGER…</div>
      </Screen>
    )
  }

  // Recurring rail: distinct recurring merchants with their latest charge.
  const recurring = new Map<string, Transaction>()
  for (const t of transactions) {
    if (t.recurring && !recurring.has(t.merchant)) recurring.set(t.merchant, t)
  }

  const columns: Array<Column<Transaction>> = [
    {
      key: 'date',
      header: 'DATE',
      render: (t) => <span className="tabnum">{t.date}</span>,
      sortable: true,
      width: '12ch',
      cellClassName: 'whitespace-nowrap',
    },
    {
      key: 'description',
      header: 'DESCRIPTION',
      render: (t) => (
        <span>
          {t.description}
          {t.recurring && <span className="label text-faint"> //R</span>}
        </span>
      ),
      sortable: true,
      sortAccessor: (t) => t.description,
    },
    {
      key: 'category',
      header: 'CATEGORY',
      render: (t) => {
        const cat = categoriesById.get(t.categoryId)
        return (
          <CategoryChip
            name={cat?.name ?? 'Uncategorized'}
            code={cat?.code}
            icon={cat?.icon}
            onClick={() => setEditing(t)}
          />
        )
      },
      sortable: true,
      sortAccessor: (t) => categoriesById.get(t.categoryId)?.code ?? '',
      width: '18ch',
    },
    {
      key: 'amount',
      header: 'AMOUNT',
      numeric: true,
      sortable: true,
      sortAccessor: (t) => t.amount,
      render: (t) => (
        <span className={cn('tabnum', t.amount < 0 ? 'text-neg' : 'text-pos')}>
          {formatMoney(t.amount, t.currency, { signed: true })}
        </span>
      ),
      width: '14ch',
    },
  ]

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">TRANSACTIONS // LEDGER</h1>
        <Link to="/transactions/import" className="hud-btn hud-btn--primary">
          IMPORT_CSV
        </Link>
      </div>

      <Panel label="FILTER" className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
          <input
            type="search"
            value={filter.q ?? ''}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="search description / merchant…"
            aria-label="Search transactions"
            className="hud-input"
          />
          <select
            value={filter.categoryId ?? ''}
            onChange={(e) => setParam('category', e.target.value)}
            aria-label="Filter by category"
            className="hud-input label"
          >
            <option value="">ALL_CATEGORIES</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filter.from ?? ''}
            onChange={(e) => setParam('from', e.target.value)}
            aria-label="From date"
            className="hud-input tabnum"
          />
          <input
            type="date"
            value={filter.to ?? ''}
            onChange={(e) => setParam('to', e.target.value)}
            aria-label="To date"
            className="hud-input tabnum"
          />
        </div>
      </Panel>

      {recurring.size > 0 && (
        <Panel label="RECURRING_BILLS // DETECTED" className="mb-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[...recurring.values()].map((t) => (
              <span key={t.merchant} className="label">
                {t.merchant}{' '}
                <span className="tabnum text-faint">
                  {formatMoney(t.amount, t.currency, { decimals: 0 })}/mo
                </span>
              </span>
            ))}
          </div>
        </Panel>
      )}

      <Panel label="LEDGER" bodyClassName="overflow-x-auto">
        <DataTable
          caption={`// ${transactions.length} TRANSACTIONS`}
          columns={columns}
          rows={transactions}
          getRowKey={(t) => t.id}
          defaultSort={{ key: 'date', dir: 'desc' }}
          empty={
            <EmptyState
              title="NO_MATCHING_TRANSACTIONS"
              description="Adjust the filters, or import a statement to populate the ledger."
              action={
                <Link to="/transactions/import" className="hud-btn hud-btn--primary">
                  IMPORT_CSV
                </Link>
              }
            />
          }
        />
      </Panel>

      {editing && (
        <RecategorizeDialog
          transaction={editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
    </Screen>
  )
}

/**
 * Inline recategorize dialog. Picking a category updates the one transaction
 * immediately, then offers "apply to all matching <merchant>?" — yes saves a
 * MerchantRule (silent learning) and recategorizes every matching row.
 */
function RecategorizeDialog({
  transaction,
  categories,
  onClose,
}: {
  transaction: Transaction
  categories: Array<{ id: string; name: string; code: string; icon: string }>
  onClose: () => void
}) {
  /** Category chosen this session — drives the apply-to-all step. */
  const [chosen, setChosen] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function pick(categoryId: string) {
    await store.transactions.update(transaction.id, { categoryId })
    if (categoryId === transaction.categoryId) return onClose()
    setChosen(categoryId)
  }

  async function applyToAll() {
    if (!chosen) return
    const merchant = transaction.merchant.toLowerCase()
    await store.rules.put({
      id: `rule_${merchant.replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`,
      merchant,
      categoryId: chosen,
      createdAt: new Date().toISOString(),
    })
    const all = await store.transactions.query()
    const matching = all.filter(
      (t) => t.merchant.toLowerCase() === merchant && t.categoryId !== chosen,
    )
    await store.transactions.putMany(matching.map((t) => ({ ...t, categoryId: chosen })))
    onClose()
  }

  const code = categories.find((c) => c.id === chosen)?.code

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--color-bg-primary) 70%, transparent)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Recategorize ${transaction.merchant}`}
        className="hud-panel w-full max-w-sm p-4"
        style={{ background: 'var(--color-bg-secondary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!chosen ? (
          <>
            <div className="label mb-3">
              // RECATEGORIZE — {transaction.merchant}{' '}
              <span className="tabnum text-faint">
                {formatMoney(transaction.amount, transaction.currency, { signed: true })}
              </span>
            </div>
            <CategoryPicker
              categories={categories}
              value={transaction.categoryId}
              onSelect={(id) => void pick(id)}
            />
          </>
        ) : (
          <>
            <div className="label mb-2">// RULE_LEARNING</div>
            <p className="mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Apply <span className="label">{code}</span> to all matching{' '}
              <span style={{ color: 'var(--color-text-primary)' }}>{transaction.merchant}</span>{' '}
              going forward?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" className="hud-btn" onClick={onClose}>
                JUST_THIS_ONE
              </button>
              <button type="button" className="hud-btn hud-btn--primary" onClick={() => void applyToAll()}>
                ALL_{transaction.merchant.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Shared page container (width clamp + responsive padding). */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      {children}
    </div>
  )
}
