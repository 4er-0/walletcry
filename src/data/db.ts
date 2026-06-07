import Dexie, { type EntityTable } from 'dexie'

import type {
  Category,
  Debt,
  IncomeSource,
  MerchantRule,
  Transaction,
  WishlistItem,
} from './types'

/** Small key/value table for app-level flags (seed marker, schema notes). */
export interface MetaRow {
  key: string
  value: string
}

/**
 * The IndexedDB schema. Index strings list the indexed columns only — `id` is
 * the primary key everywhere. Bump the version + add an `.upgrade()` when the
 * shape changes.
 */
export class WalletCryDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  rules!: EntityTable<MerchantRule, 'id'>
  debts!: EntityTable<Debt, 'id'>
  income!: EntityTable<IncomeSource, 'id'>
  wishlist!: EntityTable<WishlistItem, 'id'>
  meta!: EntityTable<MetaRow, 'key'>

  constructor() {
    super('walletcry')
    this.version(1).stores({
      transactions: 'id, date, categoryId, merchant, account',
      categories: 'id, kind',
      rules: 'id, merchant, categoryId',
      debts: 'id',
      income: 'id',
      wishlist: 'id, tier, status',
      meta: 'key',
    })
  }
}

export const db = new WalletCryDB()
