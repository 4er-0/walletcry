import type { EntityTable } from 'dexie'

import { db } from './db'
import type {
  DataStore,
  Repository,
  TransactionFilter,
  TransactionRepository,
} from './repository'
import type { Transaction } from './types'

/** Generic Dexie-backed implementation of {@link Repository}. */
class DexieRepository<T extends { id: string }> implements Repository<T> {
  constructor(protected table: EntityTable<T, 'id'>) {}

  getAll(): Promise<T[]> {
    return this.table.toArray()
  }

  get(id: string): Promise<T | undefined> {
    return this.table.get(id as never)
  }

  async put(item: T): Promise<string> {
    await this.table.put(item)
    return item.id
  }

  async putMany(items: T[]): Promise<void> {
    await this.table.bulkPut(items)
  }

  async update(id: string, changes: Partial<T>): Promise<void> {
    await this.table.update(id as never, changes as never)
  }

  async remove(id: string): Promise<void> {
    await this.table.delete(id as never)
  }

  async clear(): Promise<void> {
    await this.table.clear()
  }

  count(): Promise<number> {
    return this.table.count()
  }
}

class DexieTransactionRepository
  extends DexieRepository<Transaction>
  implements TransactionRepository
{
  async query(filter: TransactionFilter = {}): Promise<Transaction[]> {
    const { q, categoryId, account, from, to } = filter
    let rows = await this.table.orderBy('date').reverse().toArray()

    if (categoryId) rows = rows.filter((t) => t.categoryId === categoryId)
    if (account) rows = rows.filter((t) => t.account === account)
    if (from) rows = rows.filter((t) => t.date >= from)
    if (to) rows = rows.filter((t) => t.date <= to)
    if (q) {
      const needle = q.toLowerCase()
      rows = rows.filter(
        (t) =>
          t.description.toLowerCase().includes(needle) ||
          t.merchant.toLowerCase().includes(needle),
      )
    }
    return rows
  }
}

/** The single Dexie-backed store the app runs against. */
export const store: DataStore = {
  transactions: new DexieTransactionRepository(db.transactions),
  categories: new DexieRepository(db.categories),
  rules: new DexieRepository(db.rules),
  debts: new DexieRepository(db.debts),
  income: new DexieRepository(db.income),
  wishlist: new DexieRepository(db.wishlist),

  async reset() {
    await db.transaction(
      'rw',
      [db.transactions, db.categories, db.rules, db.debts, db.income, db.wishlist, db.meta],
      async () => {
        await Promise.all([
          db.transactions.clear(),
          db.categories.clear(),
          db.rules.clear(),
          db.debts.clear(),
          db.income.clear(),
          db.wishlist.clear(),
          db.meta.clear(),
        ])
      },
    )
  },
}
