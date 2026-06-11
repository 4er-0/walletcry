import { Link } from 'react-router-dom'

import { EmptyState, Panel, Stat } from '@/components/hud'
import {
  addMonths,
  amortize,
  formatMoney,
  formatPercent,
  simulatePayoff,
} from '@/finance'
import { useDebts } from '@/data'
import { isoMonth } from '@/lib/dates'

/**
 * Debts — combined position (total owed, aggregate payoff, total interest at
 * minimum payments) + per-debt cards linking to the amortization detail.
 */
export function DebtsPage() {
  const debts = useDebts()

  if (!debts) {
    return (
      <Screen>
        <div className="label text-faint">// LOADING_DEBTS…</div>
      </Screen>
    )
  }

  if (debts.length === 0) {
    return (
      <Screen>
        <Panel label="DEBTS">
          <EmptyState
            title="NO_DEBTS_TRACKED"
            description="Nothing owed — or nothing entered yet."
          />
        </Panel>
      </Screen>
    )
  }

  const totalOwed = debts.reduce((sum, d) => sum + d.balance, 0)
  // Aggregate payoff at minimums (extra = 0); avalanche = least total interest.
  const combined = simulatePayoff(
    debts.map((d) => ({ id: d.id, balance: d.balance, apr: d.apr, minPayment: d.minPayment })),
    0,
    'avalanche',
  )

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">DEBTS // POSITION</h1>
        <span className="label text-faint">PLN</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Panel label="COMBINED_POSITION">
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-3">
            <Stat
              label="TOTAL_OWED"
              value={formatMoney(-totalOwed, 'PLN', { decimals: 0 })}
              size="lg"
            />
            <Stat
              label="ALL_CLEAR"
              value={combined.neverPaysOff ? '∞' : isoMonth(addMonths(new Date(), combined.months))}
              size="lg"
              delta={combined.neverPaysOff ? 'minimums never clear this' : `${combined.months} months at minimums`}
            />
            <Stat
              label="TOTAL_INTEREST"
              value={formatMoney(-combined.totalInterest, 'PLN', { decimals: 0 })}
              size="lg"
              delta="at minimums // avalanche"
            />
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {debts.map((d) => {
            const r = amortize(d.balance, d.apr, d.minPayment)
            return (
              <Panel
                key={d.id}
                label={d.name.toUpperCase()}
                actions={
                  <Link to={`/debts/${d.id}`} className="label" style={{ color: 'var(--tone-accent)' }}>
                    DETAIL →
                  </Link>
                }
              >
                <Stat value={formatMoney(-d.balance, d.currency, { decimals: 0 })} size="md" />
                <hr className="hud-rule my-3" />
                <dl className="flex flex-col gap-1.5 text-sm">
                  <Row k="APR" v={formatPercent(d.apr)} />
                  <Row k="MIN_PAYMENT" v={`${formatMoney(d.minPayment, d.currency, { decimals: 0 })}/mo`} />
                  <Row
                    k="PAID_OFF"
                    v={r.neverPaysOff ? '∞ // raise payment' : isoMonth(addMonths(new Date(), r.months))}
                  />
                  <Row k="INTEREST_LEFT" v={formatMoney(-r.totalInterest, d.currency, { decimals: 0 })} />
                </dl>
              </Panel>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="label">{k}</dt>
      <dd className="tabnum" style={{ color: 'var(--color-text-secondary)' }}>
        {v}
      </dd>
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
