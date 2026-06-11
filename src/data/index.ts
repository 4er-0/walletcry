/** Public surface of the local-first data layer. */

export * from './types'
export type {
  DataStore,
  Repository,
  TransactionFilter,
  TransactionRepository,
} from './repository'
export { store } from './dexie-store'
export { initData } from './init'
export { buildSeedData, seedDatabase } from './seed'
export * from './hooks'
