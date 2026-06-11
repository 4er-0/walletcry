import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { CategoryChip, EmptyState, Panel, Stat } from '@/components/hud'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/finance'
import {
  seedDatabase,
  store,
  useCategories,
  useCategoryMap,
  useIncome,
  useRules,
  type IncomeKind,
} from '@/data'
import { DISPLAY_FONTS, TONES, useTheme } from '@/app/theme'

const AREAS = [
  { id: 'income', label: 'INCOME_SOURCES', hint: 'streams that fund the math' },
  { id: 'categories', label: 'CATEGORIES_&_RULES', hint: 'buckets + learned merchants' },
  { id: 'currency', label: 'CURRENCY', hint: 'PLN base, multi-ready' },
  { id: 'appearance', label: 'APPEARANCE', hint: 'theme · tone · type' },
  { id: 'data', label: 'DATA', hint: 'export · reset · sync scaffold' },
] as const

/**
 * Settings — set-once configuration (per IA): income sources (drive every
 * calculation), categories & merchant rules, currency, appearance, and the
 * data area (export, reset, scaffolded sync/bank-link stubs).
 */
export function SettingsPage() {
  const { area } = useParams()
  const active = AREAS.find((a) => a.id === area)?.id

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">SETTINGS{active ? ` // ${active.toUpperCase()}` : ''}</h1>
        {active && (
          <Link to="/settings" className="label lg:hidden" style={{ color: 'var(--tone-accent)' }}>
            ← ALL
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Area list: the whole page on /settings; a side rail on desktop */}
        <nav className={cn('flex flex-col gap-1', active && 'hidden lg:flex')} aria-label="Settings areas">
          {AREAS.map((a) => (
            <Link
              key={a.id}
              to={`/settings/${a.id}`}
              aria-current={active === a.id ? 'page' : undefined}
              className="label flex flex-col gap-0.5 px-3 py-2.5"
              style={{
                border: '1px dashed',
                borderColor: active === a.id ? 'var(--tone-accent)' : 'var(--color-border-primary)',
                color: active === a.id ? 'var(--tone-accent)' : undefined,
              }}
            >
              <span>{a.label}</span>
              <span className="text-faint" style={{ textTransform: 'none' }}>
                {a.hint}
              </span>
            </Link>
          ))}
        </nav>

        {active && (
          <div className="min-w-0">
            {active === 'income' && <IncomeArea />}
            {active === 'categories' && <CategoriesArea />}
            {active === 'currency' && <CurrencyArea />}
            {active === 'appearance' && <AppearanceArea />}
            {active === 'data' && <DataArea />}
          </div>
        )}
      </div>
    </Screen>
  )
}

// ── Income sources — the inputs every surplus/affordability figure reads ────

function IncomeArea() {
  const income = useIncome()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<IncomeKind>('fixed')

  if (!income) return <div className="label text-faint">// LOADING…</div>

  const total = income.reduce((s, i) => s + i.amount, 0)
  const valid = name.trim().length > 0 && Number(amount.replace(',', '.')) > 0

  async function add() {
    await store.income.put({
      id: `inc_${Date.now()}`,
      name: name.trim(),
      amount: Number(amount.replace(',', '.')),
      kind,
      currency: 'PLN',
      createdAt: new Date().toISOString(),
    })
    setName('')
    setAmount('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel label="MONTHLY_PLANNED">
        <Stat
          value={formatMoney(total, 'PLN', { decimals: 0 })}
          size="lg"
          delta={`${income.length} source${income.length === 1 ? '' : 's'} — feeds "Left this month" + affordability`}
        />
      </Panel>

      <Panel label="SOURCES">
        {income.length === 0 ? (
          <EmptyState
            title="NO_INCOME_SET"
            description="Add a source below — affordability shows estimates once income exists."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {income.map((s) => (
              <div key={s.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">
                  {s.name} <span className="label text-faint">// {s.kind.toUpperCase()}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-3">
                  <span className="tabnum">{formatMoney(s.amount, s.currency, { decimals: 0 })}/mo</span>
                  <button
                    type="button"
                    className="label"
                    style={{ color: 'var(--color-neg)' }}
                    onClick={() => void store.income.remove(s.id)}
                    aria-label={`Remove ${s.name}`}
                  >
                    [×]
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel label="ADD_SOURCE">
        <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name (e.g. Salary)"
            aria-label="Source name"
            className="hud-input"
          />
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="PLN/mo"
            aria-label="Monthly amount"
            className="hud-input tabnum"
          />
          <button
            type="button"
            className="hud-btn"
            onClick={() => setKind(kind === 'fixed' ? 'variable' : 'fixed')}
            aria-label={`Kind: ${kind}, click to toggle`}
          >
            {kind.toUpperCase()}
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--primary"
            disabled={!valid}
            style={!valid ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => void add()}
          >
            ADD
          </button>
        </div>
        <div className="label mt-3 text-faint">// variable sources count as monthly estimates</div>
      </Panel>
    </div>
  )
}

// ── Categories & learned merchant rules ─────────────────────────────────────

function CategoriesArea() {
  const categories = useCategories()
  const rules = useRules()
  const categoriesById = useCategoryMap()

  if (!categories || !rules || !categoriesById)
    return <div className="label text-faint">// LOADING…</div>

  async function cycleKind(id: string, kind: string) {
    // income categories stay income; spend buckets toggle essential↔discretionary
    if (kind === 'income') return
    await store.categories.update(id, {
      kind: kind === 'essential' ? 'discretionary' : 'essential',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel label="CATEGORIES">
        <div className="label mb-3 text-faint">
          // tap a spend bucket to flip essential ↔ discretionary — recalculates "Left this month" splits
        </div>
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3">
              <CategoryChip name={c.name} code={c.code} icon={c.icon} />
              <button
                type="button"
                className="label"
                onClick={() => void cycleKind(c.id, c.kind)}
                disabled={c.kind === 'income'}
                style={{
                  color:
                    c.kind === 'income'
                      ? 'var(--color-text-tertiary)'
                      : c.kind === 'essential'
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                  cursor: c.kind === 'income' ? 'default' : 'pointer',
                }}
              >
                {c.kind.toUpperCase()}
                {c.kind !== 'income' && ' ⇄'}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel label="MERCHANT_RULES // LEARNED">
        {rules.length === 0 ? (
          <EmptyState
            title="NO_RULES_YET"
            description="Recategorize a transaction and choose 'apply to all' to teach one."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">
                  {r.merchant} <span className="label text-faint">→ {categoriesById.get(r.categoryId)?.code ?? '?'}</span>
                </span>
                <button
                  type="button"
                  className="label shrink-0"
                  style={{ color: 'var(--color-neg)' }}
                  onClick={() => void store.rules.remove(r.id)}
                  aria-label={`Forget rule for ${r.merchant}`}
                >
                  FORGET
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

// ── Currency (PLN base; multi-currency is data-model-ready, UI later) ───────

function CurrencyArea() {
  return (
    <Panel label="BASE_CURRENCY">
      <Stat value="PLN" size="lg" delta="złoty — all figures format via pl-PL" />
      <hr className="hud-rule my-4" />
      <div className="label text-faint">
        // entities carry their own currency field (EUR/USD/GBP ready) — switching the base
        and FX conversion arrive with the sync layer
      </div>
    </Panel>
  )
}

// ── Appearance — same controls as the top-bar cog, at a settings address ────

function AppearanceArea() {
  const { theme, setTheme, tone, setTone, surface, setSurface, displayFont, setDisplayFont } =
    useTheme()

  const Btn = ({
    on,
    children,
    onClick,
  }: {
    on: boolean
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button
      type="button"
      className="hud-btn"
      aria-pressed={on}
      onClick={onClick}
      style={on ? { borderColor: 'var(--tone-accent)', color: 'var(--tone-accent)' } : undefined}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      <Panel label="THEME">
        <div className="flex flex-wrap gap-2">
          <Btn on={theme === 'dark'} onClick={() => setTheme('dark')}>DARK</Btn>
          <Btn on={theme === 'light'} onClick={() => setTheme('light')}>LIGHT</Btn>
        </div>
      </Panel>
      <Panel label="SURFACE">
        <div className="flex flex-wrap gap-2">
          <Btn on={surface === 'charcoal'} onClick={() => setSurface('charcoal')}>CHARCOAL</Btn>
          <Btn on={surface === 'black'} onClick={() => setSurface('black')}>BLACK</Btn>
        </div>
      </Panel>
      <Panel label="ACCENT_TONE">
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <Btn key={t} on={tone === t} onClick={() => setTone(t)}>
              {t.toUpperCase()}
            </Btn>
          ))}
        </div>
      </Panel>
      <Panel label="DISPLAY_FONT">
        <div className="flex flex-wrap gap-2">
          {DISPLAY_FONTS.map((f) => (
            <Btn key={f.id} on={displayFont === f.id} onClick={() => setDisplayFont(f.id)}>
              {f.label.toUpperCase()}
              {f.note ? ` [${f.note.toUpperCase()}]` : ''}
            </Btn>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ── Data — export, reset, and the scaffolded sync/bank entry points ─────────

function DataArea() {
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)

  async function exportJson() {
    const [categories, rules, income, debts, wishlist, transactions] = await Promise.all([
      store.categories.getAll(),
      store.rules.getAll(),
      store.income.getAll(),
      store.debts.getAll(),
      store.wishlist.getAll(),
      store.transactions.getAll(),
    ])
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), categories, rules, income, debts, wishlist, transactions }, null, 2)],
      { type: 'application/json' },
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `walletcry-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function resetToSample() {
    setResetting(true)
    await store.reset()
    await seedDatabase(store)
    setResetting(false)
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel label="CSV_MAPPINGS // PER_BANK">
        <EmptyState
          title="NO_MAPPINGS_SAVED"
          description="Column mappings are remembered per bank after your first CSV import."
        />
      </Panel>

      <Panel label="EXPORT">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="hud-btn hud-btn--primary" onClick={() => void exportJson()}>
            EXPORT_JSON
          </button>
          <span className="label text-faint">// full local snapshot, all tables</span>
        </div>
      </Panel>

      <Panel label="SAMPLE_DATA">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="hud-btn"
            disabled={resetting}
            onClick={() => {
              if (window.confirm('Wipe ALL local data and restore the sample dataset?')) {
                void resetToSample()
              }
            }}
          >
            {resetting ? 'RESETTING…' : 'RESET_TO_SAMPLE'}
          </button>
          <span className="label" style={{ color: 'var(--color-neg)' }}>
            // destructive — replaces everything
          </span>
        </div>
      </Panel>

      <Panel label="SYNC // SCAFFOLD">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="hud-btn" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
              GOOGLE_SIGN_IN
            </button>
            <button type="button" className="hud-btn" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
              CONNECT_BANK // PSD2
            </button>
          </div>
          <div className="label text-faint">
            // coming later — the repository seam means these drop in without touching screens
          </div>
        </div>
      </Panel>
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
