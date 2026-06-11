import { Link } from 'react-router-dom'

import { Bar, EmptyState, Panel } from '@/components/hud'
import { affordability, formatMoney, monthBounds, monthlySurplus } from '@/finance'
import {
  useCategoryMap,
  useIncome,
  useTransactions,
  useWishlist,
  type WishlistItem,
  type WishlistTier,
} from '@/data'

const TIERS: Array<{ tier: WishlistTier; label: string; hint: string }> = [
  { tier: 'need', label: 'NEED', hint: 'weighted first' },
  { tier: 'want', label: 'WANT', hint: 'quality of life' },
  { tier: 'dream', label: 'DREAM', hint: 'the long game' },
]

/**
 * Wishlist — Need / Want / Dream tier groups, each item with an affordability
 * bar + "affordable in N months" computed from this month's surplus. Pending
 * (paste-a-link) items surface at the top for tier-assignment + confirm.
 */
export function WishlistPage() {
  const wishlist = useWishlist()
  const income = useIncome()
  const transactions = useTransactions()
  const categoriesById = useCategoryMap()

  if (!wishlist || !income || !transactions || !categoriesById) {
    return (
      <Screen>
        <div className="label text-faint">// LOADING_WISHLIST…</div>
      </Screen>
    )
  }

  const { from, to } = monthBounds()
  const surplus = monthlySurplus({ income, transactions, categoriesById, from, to })
  const monthly = Math.max(0, surplus.left)
  const hasIncome = surplus.income > 0

  const pending = wishlist.filter((w) => w.status === 'pending')
  const confirmed = wishlist.filter((w) => w.status === 'confirmed')

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">WISHLIST // TIERS</h1>
        <Link to="/wishlist/new" className="hud-btn hud-btn--primary">
          ADD_ITEM
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <Panel label="WISHLIST">
          <EmptyState
            title="NOTHING_WISHED_FOR"
            description="Paste a link or add an item to start tracking what you're saving toward."
            action={
              <Link to="/wishlist/new" className="hud-btn hud-btn--primary">
                ADD_ITEM
              </Link>
            }
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pending.length > 0 && (
            <Panel label="PENDING // CONFIRM_TIER">
              <div className="flex flex-col gap-3">
                {pending.map((w) => (
                  <Link key={w.id} to={`/wishlist/${w.id}`} className="label flex items-baseline justify-between gap-3">
                    <span>{w.name}</span>
                    <span className="tabnum text-faint">
                      {formatMoney(w.price, w.currency, { decimals: 0 })} →
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {TIERS.map(({ tier, label, hint }) => {
            const items = confirmed
              .filter((w) => w.tier === tier)
              .sort((a, b) => a.price - b.price)
            if (items.length === 0) return null
            return (
              <Panel key={tier} label={`${label} // ${hint.toUpperCase().replace(/ /g, '_')}`}>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {items.map((w) => (
                    <ItemBar key={w.id} item={w} monthly={monthly} hasIncome={hasIncome} />
                  ))}
                </div>
              </Panel>
            )
          })}
        </div>
      )}
    </Screen>
  )
}

function ItemBar({
  item,
  monthly,
  hasIncome,
}: {
  item: WishlistItem
  monthly: number
  hasIncome: boolean
}) {
  const a = affordability(item.price, monthly)
  const caption = !hasIncome
    ? 'set income to estimate'
    : a.affordableNow
      ? 'affordable now'
      : a.months === null
        ? 'no surplus this month'
        : a.months <= 1
          ? 'affordable within a month'
          : `affordable in ${a.months} months`

  return (
    <Link to={`/wishlist/${item.id}`} className="block">
      <Bar
        label={`${item.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`}
        value={monthly}
        max={item.price}
        showPercent
        caption={`${formatMoney(item.price, item.currency, { decimals: 0 })} · ${caption}`}
      />
    </Link>
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
