import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  type Column,
  DataTable,
  EmptyState,
  Panel,
  Stat,
} from '@/components/hud'
import { cn } from '@/lib/cn'
import {
  addMonths,
  amortize,
  type AmortizationRow,
  compareStrategies,
  formatMoney,
  formatPercent,
} from '@/finance'
import { useDebts } from '@/data'
import { isoMonth } from '@/lib/dates'

/**
 * Debt detail — the payoff exploration surface (per IA): amortization schedule
 * for this debt, an extra-payment slider that live-recomputes the payoff date
 * and total interest (the honest dopamine: the date visibly moves closer), and
 * a snowball-vs-avalanche comparison across all debts at the chosen extra.
 */
export function DebtDetailPage() {
  const { id } = useParams()
  const debts = useDebts()
  const [extra, setExtra] = useState(0)

  if (!debts) {
    return (
      <Screen>
        <div className="label text-faint">// LOADING_DEBT…</div>
      </Screen>
    )
  }

  const debt = debts.find((d) => d.id === id)
  if (!debt) {
    return (
      <Screen>
        <Panel label="DEBT_NOT_FOUND">
          <EmptyState
            title="UNKNOWN_DEBT_ID"
            description="This debt does not exist (or was removed)."
            action={
              <Link to="/debts" className="hud-btn hud-btn--primary">
                BACK_TO_DEBTS
              </Link>
            }
          />
        </Panel>
      </Screen>
    )
  }

  const atMin = amortize(debt.balance, debt.apr, debt.minPayment)
  const withExtra = amortize(debt.balance, debt.apr, debt.minPayment + extra)
  const monthsSaved = atMin.neverPaysOff || withExtra.neverPaysOff ? 0 : atMin.months - withExtra.months
  const interestSaved =
    atMin.neverPaysOff || withExtra.neverPaysOff ? 0 : atMin.totalInterest - withExtra.totalInterest

  const compare = compareStrategies(
    debts.map((d) => ({ id: d.id, balance: d.balance, apr: d.apr, minPayment: d.minPayment })),
    extra,
  )
  const avalancheWins = compare.avalanche.totalInterest <= compare.snowball.totalInterest

  const columns: Array<Column<AmortizationRow>> = [
    {
      key: 'month',
      header: 'MONTH',
      render: (r) => <span className="tabnum">{isoMonth(addMonths(new Date(), r.month))}</span>,
      width: '10ch',
      cellClassName: 'whitespace-nowrap',
    },
    { key: 'payment', header: 'PAYMENT', numeric: true, render: (r) => money(r.payment) },
    {
      key: 'interest',
      header: 'INTEREST',
      numeric: true,
      render: (r) => <span className="text-neg">{money(r.interest)}</span>,
    },
    { key: 'principal', header: 'PRINCIPAL', numeric: true, render: (r) => money(r.principal) },
    { key: 'balance', header: 'BALANCE', numeric: true, render: (r) => money(r.balance) },
  ]

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h1 className="label truncate">DEBTS // {debt.name.toUpperCase()}</h1>
        <Link to="/debts" className="label shrink-0" style={{ color: 'var(--tone-accent)' }}>
          ← ALL_DEBTS
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Payoff explorer — slider + the numbers that move */}
        <Panel label="PAYOFF_EXPLORER" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <div className="grid grid-cols-2 gap-5 min-[480px]:grid-cols-3">
                <Stat label="BALANCE" value={formatMoney(-debt.balance, debt.currency, { decimals: 0 })} size="md" />
                <Stat
                  label="PAID_OFF"
                  value={withExtra.neverPaysOff ? '∞' : isoMonth(addMonths(new Date(), withExtra.months))}
                  size="md"
                  emphasis={extra > 0 && !withExtra.neverPaysOff ? 'hero' : 'neutral'}
                  delta={monthsSaved > 0 ? `${monthsSaved} months sooner` : `${withExtra.months || '∞'} months`}
                />
                <Stat
                  label="TOTAL_INTEREST"
                  value={formatMoney(-withExtra.totalInterest, debt.currency, { decimals: 0 })}
                  size="md"
                  delta={interestSaved > 0 ? `saves ${formatMoney(interestSaved, debt.currency, { decimals: 0 })}` : `APR ${formatPercent(debt.apr)}`}
                />
              </div>
            </div>
            <div>
              <div className="label mb-1 flex items-center justify-between">
                <span>EXTRA_PAYMENT</span>
                <span className="tabnum" style={{ color: 'var(--tone-accent)' }}>
                  +{formatMoney(extra, debt.currency, { decimals: 0 })}/mo
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={extra}
                onChange={(e) => setExtra(Number(e.target.value))}
                className="hud-range"
                aria-label="Extra monthly payment"
                aria-valuetext={`${extra} złotych extra per month`}
              />
              <div className="label flex justify-between text-faint">
                <span>min {formatMoney(debt.minPayment, debt.currency, { decimals: 0 })}/mo</span>
                <span>+2000</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Strategy comparison across all debts at the chosen extra */}
        <Panel label="STRATEGY // ALL_DEBTS">
          <div className="grid grid-cols-2 gap-5">
            <StrategyBlock
              name="SNOWBALL"
              hint="smallest balance first"
              months={compare.snowball.months}
              interest={compare.snowball.totalInterest}
              neverPaysOff={compare.snowball.neverPaysOff}
              best={!avalancheWins}
            />
            <StrategyBlock
              name="AVALANCHE"
              hint="highest APR first"
              months={compare.avalanche.months}
              interest={compare.avalanche.totalInterest}
              neverPaysOff={compare.avalanche.neverPaysOff}
              best={avalancheWins}
            />
          </div>
          <div className="label mt-4 text-faint">
            // at minimums + {formatMoney(extra, 'PLN', { decimals: 0 })} extra, applied to one target debt at a time
          </div>
        </Panel>

        {/* This debt's vitals */}
        <Panel label="TERMS">
          <dl className="flex flex-col gap-2 text-sm">
            <Row k="APR" v={formatPercent(debt.apr)} />
            <Row k="MIN_PAYMENT" v={`${formatMoney(debt.minPayment, debt.currency, { decimals: 0 })}/mo`} />
            <Row k="PAYMENT_NOW" v={`${formatMoney(debt.minPayment + extra, debt.currency, { decimals: 0 })}/mo`} />
            {debt.openedAt && <Row k="OPENED" v={debt.openedAt} />}
            <Row k="PAYMENTS_LEFT" v={withExtra.neverPaysOff ? '∞' : String(withExtra.months)} />
            <Row k="TOTAL_TO_PAY" v={formatMoney(-withExtra.totalPaid, debt.currency, { decimals: 0 })} />
          </dl>
        </Panel>

        {/* Full amortization schedule at the current payment */}
        <Panel label="AMORTIZATION_SCHEDULE" className="lg:col-span-2" bodyClassName="overflow-x-auto">
          {withExtra.neverPaysOff ? (
            <EmptyState
              title="PAYMENT_TOO_LOW"
              description="This payment doesn't cover monthly interest — the balance never reaches zero. Raise the payment."
            />
          ) : (
            <DataTable
              caption={`// ${withExtra.months} PAYMENTS AT ${formatMoney(debt.minPayment + extra, debt.currency, { decimals: 0 })}/MO`}
              columns={columns}
              rows={withExtra.rows}
              getRowKey={(r) => String(r.month)}
            />
          )}
        </Panel>
      </div>
    </Screen>
  )
}

function money(n: number): React.ReactNode {
  return <span className="tabnum">{formatMoney(n, 'PLN')}</span>
}

function StrategyBlock({
  name,
  hint,
  months,
  interest,
  neverPaysOff,
  best,
}: {
  name: string
  hint: string
  months: number
  interest: number
  neverPaysOff: boolean
  best: boolean
}) {
  return (
    <div className={cn(best && 'pl-3')} style={best ? { borderLeft: '2px solid var(--tone-accent)' } : undefined}>
      <div className="label" style={{ color: best ? 'var(--tone-accent)' : undefined }}>
        {name} {best && '// BEST'}
      </div>
      <div className="label mb-2 text-faint">{hint}</div>
      <Stat
        value={neverPaysOff ? '∞' : isoMonth(addMonths(new Date(), months))}
        size="sm"
        delta={neverPaysOff ? 'never pays off' : `${months} mo · ${formatMoney(interest, 'PLN', { decimals: 0 })} interest`}
      />
    </div>
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
