import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Bar, EmptyState, Panel, Stat } from '@/components/hud'
import {
  affordability,
  compareFinancing,
  formatMoney,
  formatPercent,
  monthBounds,
  monthlySurplus,
} from '@/finance'
import {
  store,
  useCategoryMap,
  useIncome,
  useTransactions,
  useWishlist,
  type WishlistTier,
} from '@/data'

/**
 * Wishlist item detail — the financing calculator (per IA): save-up vs
 * finance (BNPL: APR + term → monthly + total interest) and the honest cost
 * of impatience. Pending items get a tier-assign + confirm step here.
 */
export function WishlistItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const wishlist = useWishlist()
  const income = useIncome()
  const transactions = useTransactions()
  const categoriesById = useCategoryMap()

  const [apr, setApr] = useState(0.15)
  const [term, setTerm] = useState(12)

  if (!wishlist || !income || !transactions || !categoriesById) {
    return (
      <Screen>
        <div className="label text-faint">// LOADING_ITEM…</div>
      </Screen>
    )
  }

  const item = wishlist.find((w) => w.id === id)
  if (!item) {
    return (
      <Screen>
        <Panel label="ITEM_NOT_FOUND">
          <EmptyState
            title="UNKNOWN_ITEM_ID"
            description="This wishlist item does not exist (or was removed)."
            action={
              <Link to="/wishlist" className="hud-btn hud-btn--primary">
                BACK_TO_WISHLIST
              </Link>
            }
          />
        </Panel>
      </Screen>
    )
  }

  const { from, to } = monthBounds()
  const surplus = monthlySurplus({ income, transactions, categoriesById, from, to })
  const monthly = Math.max(0, surplus.left)
  const hasIncome = surplus.income > 0

  const afford = affordability(item.price, monthly)
  const cmp = compareFinancing({
    price: item.price,
    apr,
    termMonths: term,
    monthlySurplus: monthly,
  })
  const financeShare = monthly > 0 ? cmp.finance.monthlyPayment / monthly : null

  async function assignTier(tier: WishlistTier) {
    await store.wishlist.update(item!.id, { tier, status: 'confirmed' })
  }

  async function remove() {
    await store.wishlist.remove(item!.id)
    navigate('/wishlist')
  }

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="label truncate">WISHLIST // {item.name.toUpperCase()}</h1>
        <Link to="/wishlist" className="label shrink-0" style={{ color: 'var(--tone-accent)' }}>
          ← ALL_ITEMS
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {item.status === 'pending' && (
          <Panel label="PENDING // ASSIGN_TIER" className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="label">confirm as:</span>
              {(['need', 'want', 'dream'] as const).map((t) => (
                <button key={t} type="button" className="hud-btn" onClick={() => void assignTier(t)}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </Panel>
        )}

        {/* Save-up view */}
        <Panel label="SAVE_UP">
          <Stat
            label="PRICE"
            value={formatMoney(item.price, item.currency, { decimals: 0 })}
            size="lg"
            delta={
              !hasIncome
                ? 'set income to estimate'
                : afford.affordableNow
                  ? 'affordable now'
                  : afford.months === null
                    ? 'no surplus this month'
                    : afford.months <= 1
                      ? 'affordable within a month'
                      : `affordable in ${afford.months} months`
            }
          />
          <div className="mt-4">
            <Bar
              label="PROGRESS // ONE_MONTH_SURPLUS"
              value={monthly}
              max={item.price}
              showPercent
              caption={`${formatMoney(monthly, 'PLN', { decimals: 0 })}/mo surplus · interest cost: 0 zł`}
            />
          </div>
          {item.url && (
            <div className="label mt-4 truncate text-faint">
              // src: {item.url}
            </div>
          )}
        </Panel>

        {/* Finance-now view */}
        <Panel label="FINANCE_NOW // BNPL">
          <div className="grid grid-cols-2 gap-5">
            <Stat
              label="MONTHLY"
              value={formatMoney(cmp.finance.monthlyPayment, 'PLN', { decimals: 0 })}
              size="md"
              delta={`for ${term} months`}
            />
            <Stat
              label="INTEREST_PAID"
              value={formatMoney(-cmp.interestPremium, 'PLN', { decimals: 0 })}
              size="md"
              emphasis={cmp.interestPremium > 0 ? 'danger' : 'neutral'}
              delta={`total ${formatMoney(cmp.finance.totalPaid, 'PLN', { decimals: 0 })}`}
            />
          </div>

          <hr className="hud-rule my-4" />

          <div className="flex flex-col gap-4">
            <div>
              <div className="label mb-1 flex items-center justify-between">
                <span>APR</span>
                <span className="tabnum">{formatPercent(apr)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.005}
                value={apr}
                onChange={(e) => setApr(Number(e.target.value))}
                className="hud-range"
                aria-label="Annual percentage rate"
                aria-valuetext={formatPercent(apr)}
              />
            </div>
            <div>
              <div className="label mb-1 flex items-center justify-between">
                <span>TERM</span>
                <span className="tabnum">{term} mo</span>
              </div>
              <input
                type="range"
                min={3}
                max={36}
                step={3}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="hud-range"
                aria-label="Term in months"
                aria-valuetext={`${term} months`}
              />
            </div>
          </div>

          <div className="label mt-4 text-faint">
            {financeShare !== null
              ? `// installment eats ${Math.round(financeShare * 100)}% of monthly surplus — other goals slow down by that much`
              : '// no surplus — financing would run on money you do not have'}
          </div>
        </Panel>

        {/* Verdict */}
        <Panel label="VERDICT" className="lg:col-span-2">
          <div className="label">
            {cmp.interestPremium <= 0 ? (
              <>0% financing — paying in installments costs nothing extra. Take the terms if the monthly fits.</>
            ) : afford.months !== null && afford.months <= term ? (
              <>
                saving up takes {afford.months} mo — financing takes {term} mo and costs{' '}
                <span className="text-neg">{formatMoney(cmp.interestPremium, 'PLN', { decimals: 0 })}</span> extra.
                patience wins.
              </>
            ) : (
              <>
                not reachable by saving alone right now — financing costs{' '}
                <span className="text-neg">{formatMoney(cmp.interestPremium, 'PLN', { decimals: 0 })}</span> in
                interest at these terms.
              </>
            )}
          </div>
        </Panel>

        <div className="lg:col-span-2">
          <button type="button" className="hud-btn" onClick={() => void remove()}>
            REMOVE_ITEM
          </button>
        </div>
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
