/**
 * Terminal-styled stand-in for routes not yet built. Keeps the whole IA
 * walkable while the real screens land task by task.
 */
export function PlaceholderScreen({ name, route }: { name: string; route: string }) {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      <div className="hud-panel p-6 md:p-8">
        <div className="label">MODULE // {name}</div>
        <hr className="hud-rule my-4" />
        <pre
          className="mono overflow-x-auto text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >{`> route   ${route}
> status  NOT_YET_INITIALISED
> note    screen scaffolded — implementation pending`}</pre>
        <div className="mt-6 flex items-center gap-2">
          <span
            aria-hidden
            style={{ width: 8, height: 8, background: 'var(--tone-accent)', display: 'inline-block' }}
            className="animate-pulse"
          />
          <span className="label">AWAITING_BUILD</span>
        </div>
      </div>
    </div>
  )
}
