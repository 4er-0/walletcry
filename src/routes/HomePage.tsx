/**
 * Home stub. The real "boot-up readout" dashboard (safe-to-spend hero, cashflow
 * gauge, alerts, debts/wishlist summary, activity log) lands once the data layer,
 * finance calc engine, and HUD kit are in place — see TASKS.md.
 */
export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">HOME // DASHBOARD</h1>
        <span className="label text-faint">PLN</span>
      </div>

      <div className="hud-panel p-6 md:p-8">
        <div className="label">LEFT_THIS_MONTH</div>
        <div className="stat-figure mt-2 text-pos" style={{ fontSize: 'var(--font-size-3xl)' }}>
          —
        </div>
        <hr className="hud-rule my-5" />
        <p className="mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Boot-up readout pending data layer + calc engine.
        </p>
      </div>
    </div>
  )
}
