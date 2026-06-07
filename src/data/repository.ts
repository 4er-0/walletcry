/**
 * Repository seam. Screens and the calc engine depend only on these
 * interfaces — never on Dexie directly — so a sync/cloud-backed adapter can
 * be dropped in later without touching callers.
 */

import type {
  Category,
  Debt,
  IncomeSource,
  MerchantRule,
  Transaction,
  WishlistItem,
} from './types'

/** Generic CRUD over an entity keyed by `id`. */
export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  /** Insert or replace by id; returns the id. */
  put(item: T): Promise<string>
  putMany(items: T[]): Promise<void>
  update(id: string, changes: Partial<T>): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
  count(): Promise<number>
}

export interface TransactionFilter {
  /** Free-text match against description/merchant. */
  q?: string
  categoryId?: string
  account?: string
  /** Inclusive ISO date bounds. */
  from?: string
  to?: string
}

export interface TransactionRepository extends Repository<Transaction> {
  /** Filtered, date-descending query backing the ledger + URL params. */
  query(filter?: TransactionFilter): Promise<Transaction[]>
}

/** Aggregate handle to every repository, plus lifecycle helpers. */
export interface DataStore {
  transactions: TransactionRepository
  categories: Repository<Category>
  rules: Repository<MerchantRule>
  debts: Repository<Debt>
  income: Repository<IncomeSource>
  wishlist: Repository<WishlistItem>
  /** Wipe all data (used by "reset to sample data" / tests). */
  reset(): Promise<void>
}
