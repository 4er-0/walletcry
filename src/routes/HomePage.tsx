import { Link } from 'react-router-dom'

import {
  Bar,
  BarChart,
  EmptyState,
  Gauge,
  LineChart,
  LogFeed,
  Panel,
  Stat,
  type LogEntry,
} from '@/components/hud'
import { cn } from '@/lib/cn'
import {
  type Affordability,
  addMonths,
  affordability,
  amortize,
  formatMoney,
  lastNDays,
  monthBounds,
  monthlySurplus,
  netPositionTrend,
  spendByDay,
} from '@/finance'
import {
  useCategoryMap,
  useDebts,
  useIncome,
  useTransactions,
  useWishlist,
} from '@/data'
import type { Debt, WishlistItem } from '@/data'

/**
 * Home / Dashboard — the 80% view, a calm "boot-up readout" (per IA):
 *   1. "Left this month" hero + supporting figures
 *   2. Cashflow gauge (in vs out)
 *   3. Alerts — rendered ONLY when a genuine trigger fires (full-tactical red)
 *   4. Debts summary — total owed + nearest payoff date
 *   5. Closest wishlist item — affordability bar + "affordable in N months"
 *   6. Recent activity — terminal log feed
 *
 * All math comes from the pure finance engine; data is live-queried from
 * IndexedDB so the readout re-renders as the underlying tables change.
 */
export function HomePage() {
  const income = useIncome()
  const transactions = useTransactions()
  const debts = useDebts()
  const wishlist = useWishlist()
  const categoriesById = useCategoryMap()

  // Live queries return `undefined` until IndexedDB responds.
  const booting =
    !income || !transactions || !debts || !wishlist || !categoriesById
  if (booting) {
    return (
      <Screen>
        <div className="label text-faint">// BOOTING_READOUT…</div>
      </Screen>
    )
  }

  // Genuine empty state — no data yet (e.g. user skipped the sample seed).
  if (transactions.length === 0) {
    return (
      <Screen>
        <Panel label="HOME // DASHBOARD">
          <EmptyState
            title="NO_DATA_YET"
            description="Import a bank statement to boot up your dashboard."
            action={
              <Link to="/transactions/import" className="hud-btn hud-btn--primary">
                IMPORT_CSV
              </Link>
            }
          />
        </Panel>
      </Screen>
    )
  }

  // ── 1+2. Left this month & cashflow ──────────────────────────────────────
  const { from, to } = monthBounds()
  const surplus = monthlySurplus({ income, transactions, categoriesById, from, to })
  const hasIncome = surplus.income > 0
  const overspent = hasIncome && surplus.left < 0
  // Headroom = share of planned income still unspent. Gauge clamps to its rails.
  const headroom = hasIncome ? surplus.left / surplus.income : 0

  // ── 3. Alerts — only genuine triggers; silent (unrendered) when all is well.
  const alerts: string[] = []
  if (overspent) {
    alerts.push(
      `OVERSPEND // budget exceeded by ${formatMoney(-surplus.left, 'PLN', { decimals: 0 })} this month`,
    )
  }

  // ── Trends — per-day series for the mini-charts (dense, oldest→newest). ──
  const trendWindow = lastNDays(30)
  const spendWindow = lastNDays(14)
  const trend = netPositionTrend(transactions, trendWindow)
  const dailySpend = spendByDay(transactions, spendWindow)
  const trendNet = trend[trend.length - 1] ?? 0
  const trendArrow = trendNet > 0 ? '↗' : trendNet < 0 ? '↘' : '→'
  const spendingDays = dailySpend.filter((v) => v > 0).length
  const avgSpend = spendingDays > 0
    ? dailySpend.reduce((sum, v) => sum + v, 0) / spendingDays
    : 0

  // ── 4. Debts — total owed + the soonest single payoff. ───────────────────
  const totalOwed = debts.reduce((sum, d) => sum + d.balance, 0)
  const nearest = nearestPayoff(debts)

  // ── 5. Closest wishlist item — nearest to affording on this month's surplus.
  const closest = closestWishlist(wishlist, Math.max(0, surplus.left))

  // ── 6. Recent activity — last few transactions as a terminal feed. ───────
  const activity: LogEntry[] = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 6)
    .map((t) => {
      const code = categoriesById.get(t.categoryId)?.code ?? 'UNCATEGORIZED'
      return {
        time: t.date,
        message: (
          <span>
            {t.merchant}{' '}
            <span className={cn('tabnum', t.amount < 0 ? 'text-neg' : 'text-pos')}>
              {formatMoney(t.amount, t.currency, { signed: true })}
            </span>{' '}
            <span className="text-faint">// {code}</span>
          </span>
        ),
      }
    })

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">HOME // DASHBOARD</h1>
        <span className="label text-faint">PLN</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 1+2 — the readout band: hero figure, supporting numbers, cashflow */}
        <Panel label="LEFT_THIS_MONTH" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <Stat
                value={
                  hasIncome
                    ? formatMoney(surplus.left, 'PLN', { decimals: 0 })
                    : '—'
                }
                emphasis={overspent ? 'danger' : 'hero'}
                size="xl"
                delta={
                  hasIncome
                    ? `${formatMoney(surplus.spent, 'PLN', { decimals: 0 })} spent of ${formatMoney(surplus.income, 'PLN', { decimals: 0 })} planned`
                    : 'set income in settings to estimate'
                }
              />
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-4">
                <Stat label="PLANNED_IN" value={formatMoney(surplus.income, 'PLN', { decimals: 0 })} size="sm" />
                <Stat label="RECEIVED" value={formatMoney(surplus.incomeReceived, 'PLN', { decimals: 0 })} size="sm" />
                <Stat label="SPENT" value={formatMoney(surplus.spent, 'PLN', { decimals: 0 })} size="sm" />
              </div>
              <Gauge
                label="CASHFLOW // IN_VS_OUT"
                value={overspent ? 1 : headroom}
                state={overspent ? 'danger' : 'default'}
                caption={
                  overspent
                    ? 'OVER_BUDGET'
                    : hasIncome
                      ? `${Math.round(headroom * 100)}% unspent · essentials ${formatMoney(surplus.essentials, 'PLN', { decimals: 0 })} · disc. ${formatMoney(surplus.discretionary, 'PLN', { decimals: 0 })}`
                      : 'awaiting income'
                }
              />
            </div>
          </div>
        </Panel>

        {/* 3 — alerts: present only when earned. */}
        {alerts.length > 0 && (
          <Panel label="ALERTS" className="lg:col-span-2">
            <div className="flex flex-col gap-2">
              {alerts.map((a) => (
                <div key={a} className="label text-neg">
                  {'> '}
                  {a}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Trends — relative net position + the month's spending rhythm */}
        <Panel label="TRENDS">
          <LineChart
            label="NET_POSITION // LAST_30D"
            data={trend}
            caption={`net ${formatMoney(trendNet, 'PLN', { signed: true, decimals: 0 })} over 30d ${trendArrow}`}
          />
        </Panel>
        <Panel label="RHYTHM">
          <BarChart
            label="SPEND_BY_DAY // LAST_14D"
            data={dailySpend}
            caption={`PLN per day · avg ${formatMoney(avgSpend, 'PLN', { decimals: 0 })} on spending days`}
          />
        </Panel>

        {/* 4 — debts summary */}
        <Panel label="DEBTS">
          <Stat
            label="TOTAL_OWED"
            value={formatMoney(-totalOwed, 'PLN', { decimals: 0 })}
            size="lg"
            delta={
              nearest
                ? `next free: ${nearest.debt.name} // ${isoMonth(nearest.date)}`
                : 'no active payoff schedule'
            }
          />
          <hr className="hud-rule my-4" />
          <div className="flex flex-col gap-2">
            {debts.map((d) => {
              const r = amortize(d.balance, d.apr, d.minPayment)
              return (
                <div key={d.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{d.name}</span>
                  <span className="tabnum text-faint shrink-0">
                    {formatMoney(-d.balance, d.currency, { decimals: 0 })}
                    {' · '}
                    {r.neverPaysOff ? '∞' : isoMonth(addMonths(new Date(), r.months))}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* 5 — closest wishlist item */}
        <Panel label="WISHLIST // CLOSEST">
          {closest ? (
            <Bar
              label={hudCode(closest.item.name)}
              value={Math.max(0, surplus.left)}
              max={closest.item.price}
              showPercent
              caption={affordCaption(closest.afford, hasIncome)}
            />
          ) : (
            <EmptyState
              title="NO_WISHLIST_ITEMS"
              description="Paste a link to start tracking something to save for."
              action={
                <Link to="/wishlist/new" className="hud-btn hud-btn--primary">
                  ADD_ITEM
                </Link>
              }
            />
          )}
        </Panel>

        {/* 6 — recent activity log */}
        <Panel label="RECENT_ACTIVITY" className="lg:col-span-2">
          <LogFeed entries={activity} />
        </Panel>
      </div>
    </Screen>
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

/** The debt that clears soonest (by amortization at its minimum payment). */
function nearestPayoff(debts: Debt[]): { debt: Debt; date: Date } | null {
  let best: { debt: Debt; months: number } | null = null
  for (const debt of debts) {
    const r = amortize(debt.balance, debt.apr, debt.minPayment)
    if (r.neverPaysOff || r.months <= 0) continue
    if (!best || r.months < best.months) best = { debt, months: r.months }
  }
  return best ? { debt: best.debt, date: addMonths(new Date(), best.months) } : null
}

/** The confirmed item nearest to being affordable on the current surplus. */
function closestWishlist(
  items: WishlistItem[],
  monthlySurplusValue: number,
): { item: WishlistItem; afford: Affordability } | null {
  const confirmed = items.filter((w) => w.status === 'confirmed')
  if (confirmed.length === 0) return null
  const ranked = confirmed.map((item) => ({
    item,
    afford: affordability(item.price, monthlySurplusValue),
  }))
  // Reachable items first (fewest months, then smallest remaining); if nothing
  // is reachable (no surplus), fall back to the cheapest item.
  const reachable = ranked
    .filter((r) => r.afford.months !== null)
    .sort(
      (a, b) =>
        (a.afford.months ?? 0) - (b.afford.months ?? 0) ||
        a.afford.remaining - b.afford.remaining,
    )
  if (reachable.length > 0) return reachable[0]
  return [...ranked].sort((a, b) => a.item.price - b.item.price)[0]
}

/** "affordable now" / "affordable in N months" / income-needed fallback. */
function affordCaption(a: Affordability, hasIncome: boolean): string {
  if (!hasIncome) return 'set income to estimate'
  if (a.affordableNow) return 'affordable now'
  if (a.months === null) return 'no surplus this month'
  if (a.months <= 1) return 'affordable within a month'
  return `affordable in ${a.months} months`
}

/** A free-text name → mono HUD code, e.g. "Keychron Q1 Pro" → "KEYCHRON_Q1_PRO". */
function hudCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/** Date → `YYYY-MM` (the "free by" payoff month). */
function isoMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
