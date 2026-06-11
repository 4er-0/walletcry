import { db } from './db'
import { store } from './dexie-store'
import { seedDatabase } from './seed'

const SEED_KEY = 'seeded.v1'

/**
 * Ask the browser to make our IndexedDB storage persistent (won't be evicted
 * under storage pressure). Best-effort — silently no-ops where unsupported.
 */
async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    /* not supported / blocked — non-fatal */
  }
}

/** Seed the database on first run only. Idempotent across reloads. */
async function ensureSeeded(): Promise<void> {
  const marker = await db.meta.get(SEED_KEY)
  if (marker) return
  await seedDatabase(store)
  await db.meta.put({ key: SEED_KEY, value: new Date().toISOString() })
}

let initPromise: Promise<void> | null = null

/**
 * Run once at startup: request persistence and seed if empty. Returns a shared
 * promise so concurrent callers don't double-seed.
 */
export function initData(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await requestPersistentStorage()
      await ensureSeeded()
    })()
  }
  return initPromise
}
