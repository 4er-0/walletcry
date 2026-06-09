import { useState } from 'react'

import { DISPLAY_FONTS, useTheme } from '@/app/theme'
import {
  Bar,
  BarChart,
  CategoryChip,
  CategoryPicker,
  type Column,
  DataTable,
  EmptyState,
  Gauge,
  LineChart,
  LogFeed,
  Panel,
  Stat,
  type PickerCategory,
} from '@/components/hud'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/finance'

/**
 * Storybook-style demo of the HUD component kit. Switch theme/tone from the top
 * bar to verify every primitive across dark/light × green/amber/cyan/mono.
 */

const CATEGORIES: PickerCategory[] = [
  { id: 'cat_groceries', name: 'Groceries', code: 'GROCERIES', icon: 'ShoppingCart' },
  { id: 'cat_rent', name: 'Rent', code: 'RENT', icon: 'Home' },
  { id: 'cat_transport', name: 'Transport', code: 'TRANSPORT', icon: 'Car' },
  { id: 'cat_dining', name: 'Dining', code: 'DINING', icon: 'Utensils' },
  { id: 'cat_health', name: 'Health', code: 'HEALTH', icon: 'HeartPulse' },
  { id: 'cat_entertainment', name: 'Entertainment', code: 'ENTERTAINMENT', icon: 'Gamepad2' },
  { id: 'cat_subscriptions', name: 'Subscriptions', code: 'SUBSCRIPTIONS', icon: 'Repeat' },
]

interface LedgerRow {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
}

const LEDGER: LedgerRow[] = [
  { id: 't1', date: '2026-06-08', merchant: 'Żabka', category: 'GROCERIES', amount: -23.9 },
  { id: 't2', date: '2026-06-07', merchant: 'Salary // ACME', category: 'INCOME', amount: 8200 },
  { id: 't3', date: '2026-06-06', merchant: 'Bolt', category: 'TRANSPORT', amount: -41.5 },
  { id: 't4', date: '2026-06-05', merchant: 'Biedronka', category: 'GROCERIES', amount: -187.34 },
  { id: 't5', date: '2026-06-04', merchant: 'Netflix', category: 'SUBSCRIPTIONS', amount: -43 },
  { id: 't6', date: '2026-06-02', merchant: 'Orlen', category: 'TRANSPORT', amount: -312.07 },
]

const LEDGER_COLUMNS: Array<Column<LedgerRow>> = [
  {
    key: 'date',
    header: 'DATE',
    render: (r) => <span className="tabnum">{r.date}</span>,
    sortable: true,
    width: '14ch',
    cellClassName: 'whitespace-nowrap',
  },
  { key: 'merchant', header: 'MERCHANT', render: (r) => r.merchant, sortable: true },
  {
    key: 'category',
    header: 'CATEGORY',
    render: (r) => <span className="label">{r.category}</span>,
    sortable: true,
  },
  {
    key: 'amount',
    header: 'AMOUNT',
    numeric: true,
    sortable: true,
    sortAccessor: (r) => r.amount,
    render: (r) => (
      <span className={cn('tabnum', r.amount < 0 ? 'text-neg' : 'text-pos')}>
        {formatMoney(r.amount)}
      </span>
    ),
  },
]

export function KitPage() {
  const [selected, setSelected] = useState('cat_groceries')
  const { displayFont, setDisplayFont } = useTheme()

  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      <div className="label mb-4">// HUD_COMPONENT_KIT — switch theme/tone in the top bar</div>

      {/* Display-font switcher: flips the title face live across the whole app.
          Titles change; the hero money figure stays mono on purpose. */}
      <Panel label="DISPLAY_FONT // TITLE_FACE">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="hud-title text-[2.5rem]">BUDGET</div>
          <div className="hud-title text-[1.25rem] text-[var(--color-text-secondary)]">
            RESOURCE_OVERVIEW
          </div>
          <Stat label="LEFT_THIS_MONTH" value={formatMoney(1400, 'PLN', { decimals: 0 })} size="lg" />
        </div>
        <div className="flex flex-wrap gap-2">
          {DISPLAY_FONTS.map((f) => (
            <button
              key={f.id}
              className={`hud-btn${displayFont === f.id ? ' hud-btn--primary' : ''}`}
              onClick={() => setDisplayFont(f.id)}
            >
              {f.label}
              {f.note ? <span className="ml-2 opacity-60">[{f.note}]</span> : null}
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Hairline data table — sortable, mono figures, collapses on mobile */}
        <Panel label="HAIRLINE_DATA_TABLE" className="lg:col-span-2">
          <DataTable
            caption="// RECENT_LEDGER — click a header to sort, resize below 768px to collapse"
            columns={LEDGER_COLUMNS}
            rows={LEDGER}
            getRowKey={(r) => r.id}
            defaultSort={{ key: 'date', dir: 'desc' }}
            onRowClick={() => undefined}
            empty={
              <EmptyState title="NO_TRANSACTIONS_YET" description="Import a statement to populate the ledger." />
            }
          />
        </Panel>

        {/* Stat / number blocks — only the hero takes color; rest stay neutral */}
        <Panel label="STAT_BLOCKS">
          <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2">
            <Stat
              label="LEFT_THIS_MONTH"
              value={formatMoney(3412.5, 'PLN', { decimals: 0 })}
              emphasis="hero"
              size="lg"
              delta="+12,4% vs prev"
            />
            <Stat
              label="TOTAL_OWED"
              value={formatMoney(-27590, 'PLN', { decimals: 0 })}
              size="lg"
              delta="payoff 2027-08"
            />
            <Stat label="SPENT" value={formatMoney(4087.6)} size="sm" />
            <Stat
              label="OVERSPEND_ALERT"
              value={formatMoney(-612.4)}
              emphasis="danger"
              size="sm"
              delta="budget exceeded"
            />
          </div>
        </Panel>

        {/* Segmented gauge — monochrome, red only for genuine warnings */}
        <Panel label="SEGMENTED_GAUGE">
          <div className="flex flex-col gap-4">
            <Gauge label="CASHFLOW // IN_VS_OUT" value={0.62} caption="62% headroom" />
            <Gauge label="BUDGET_USED" value={0.88} caption="88% of budget" />
            <Gauge label="OVERSPEND" value={1.12} max={1} state="danger" caption="OVER_BUDGET" />
          </div>
        </Panel>

        {/* Progress / affordability bars — all white */}
        <Panel label="AFFORDABILITY_BARS">
          <div className="flex flex-col gap-4">
            <Bar label="KEYCHRON_Q1_PRO" value={890} max={890} showPercent caption="affordable now" />
            <Bar
              label="DELL_ULTRASHARP_4K"
              value={1400}
              max={3400}
              showPercent
              caption="affordable in 6 months"
            />
            <Bar
              label="HERMAN_MILLER_AERON"
              value={900}
              max={6200}
              showPercent
              caption="affordable in 16 months"
            />
          </div>
        </Panel>

        {/* Graphs — thin line/area + segmented bar/spectrum */}
        <Panel label="GRAPHS">
          <div className="flex flex-col gap-5">
            <LineChart
              label="BALANCE // LAST_30_DAYS"
              data={[120, 180, 140, 220, 200, 280, 240, 360, 320, 300, 380, 420]}
              caption="trend ↗"
            />
            <BarChart
              label="SPEND_BY_DAY // LAST_14_DAYS"
              data={[40, 12, 88, 30, 64, 120, 52, 76, 20, 96, 44, 60, 110, 28]}
              caption="PLN per day"
            />
          </div>
        </Panel>

        {/* Category chips + picker */}
        <Panel label="CATEGORY_CHIP / PICKER">
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 5).map((c) => (
              <CategoryChip key={c.id} name={c.name} code={c.code} icon={c.icon} />
            ))}
            <CategoryChip name="Active" code="ACTIVE" icon="Zap" active />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="label">selected:</span>
            <CategoryChip
              name={CATEGORIES.find((c) => c.id === selected)?.name ?? '—'}
              code={CATEGORIES.find((c) => c.id === selected)?.code}
              icon={CATEGORIES.find((c) => c.id === selected)?.icon}
              onClick={() => undefined}
              active
            />
          </div>
          <CategoryPicker categories={CATEGORIES} value={selected} onSelect={setSelected} />
        </Panel>

        {/* Activity log feed */}
        <Panel label="ACTIVITY_LOG">
          <LogFeed
            entries={[
              { time: '09:14:02', message: 'import mBank_2026-06.csv → 142 rows' },
              { time: '09:14:03', message: 'deduped 6 overlapping rows' },
              { time: '11:02:51', message: 'recategorize Żabka → GROCERIES (rule learned)' },
              { time: '18:47:20', message: 'wishlist: KEYCHRON_Q1_PRO now affordable' },
            ]}
          />
        </Panel>

        {/* Empty / ASCII state */}
        <Panel label="EMPTY_STATE">
          <EmptyState
            title="NO_TRANSACTIONS_YET"
            description="Import a bank statement to populate the ledger."
            action={<button className="hud-btn hud-btn--primary">IMPORT_CSV</button>}
          />
        </Panel>

        {/* Buttons */}
        <Panel label="BUTTONS">
          <div className="flex flex-wrap items-center gap-3">
            <button className="hud-btn">SECONDARY</button>
            <button className="hud-btn hud-btn--primary">PRIMARY</button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
