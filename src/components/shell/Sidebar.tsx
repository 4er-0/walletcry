import { NavLink } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import { NAV_ITEMS } from '@/app/nav'
import { cn } from '@/lib/cn'

/** Desktop-only icon rail. Active item gets a bracketed accent. */
export function Sidebar() {
  return (
    <aside
      className="hidden shrink-0 flex-col items-stretch md:flex"
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px dashed var(--color-border-primary)',
        background: 'var(--color-bg-secondary)',
        paddingTop: 'var(--safe-top)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ height: 'var(--topbar-height)', borderBottom: '1px dashed var(--color-border-primary)' }}
      >
        <span className="mono text-accent text-base font-bold tracking-tight">W:</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => (
          <RailLink key={item.to} to={item.to} code={item.code} Icon={item.icon} end={item.to === '/'} />
        ))}
      </nav>

      <div className="p-2">
        <RailLink to="/settings" code="CONF" Icon={Settings2} />
      </div>
    </aside>
  )
}

function RailLink({
  to,
  code,
  Icon,
  end,
}: {
  to: string
  code: string
  Icon: typeof Settings2
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex flex-col items-center gap-1 rounded-none py-3 transition-colors',
          isActive ? 'is-active' : 'text-muted hover:text-[var(--color-text-primary)]',
        )
      }
      style={({ isActive }) =>
        isActive
          ? { color: 'var(--tone-accent)', background: 'var(--tone-accent-muted)' }
          : undefined
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ width: 2, height: 20, background: 'var(--tone-accent)' }}
            />
          )}
          <Icon size={20} strokeWidth={1.5} />
          <span className="label" style={{ color: 'inherit', fontSize: '9px' }}>
            {code}
          </span>
        </>
      )}
    </NavLink>
  )
}
