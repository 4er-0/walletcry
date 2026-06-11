/**
 * Live-query React hooks. These re-render automatically when the underlying
 * IndexedDB tables change, so screens stay in sync without manual refetching.
 * They read through Dexie directly (the reactive layer); imperative writes go
 * through the {@link store} repository seam.
 */

import { useLiveQuery } from 'dexie-react-hooks'

import { db } from './db'
import { store } from './dexie-store'
import type { TransactionFilter } from './repository'
import type {
  Category,
  Debt,
  IncomeSource,
  MerchantRule,
  Transaction,
  WishlistItem,
} from './types'

export function useTransactions(filter?: TransactionFilter): Transaction[] | undefined {
  // Serialise the filter so the query re-runs when any field changes.
  const key = JSON.stringify(filter ?? {})
  return useLiveQuery(() => store.transactions.query(filter), [key])
}

export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => db.categories.toArray(), [])
}

/** Categories indexed by id for O(1) chip/label lookups. */
export function useCategoryMap(): Map<string, Category> | undefined {
  return useLiveQuery(async () => {
    const cats = await db.categories.toArray()
    return new Map(cats.map((c) => [c.id, c]))
  }, [])
}

export function useRules(): MerchantRule[] | undefined {
  return useLiveQuery(() => db.rules.toArray(), [])
}

export function useDebts(): Debt[] | undefined {
  return useLiveQuery(() => db.debts.toArray(), [])
}

export function useIncome(): IncomeSource[] | undefined {
  return useLiveQuery(() => db.income.toArray(), [])
}

export function useWishlist(): WishlistItem[] | undefined {
  return useLiveQuery(() => db.wishlist.toArray(), [])
}
