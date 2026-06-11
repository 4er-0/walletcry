import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { NAV_ITEMS } from '@/app/nav'
import { cn } from '@/lib/cn'

/**
 * Mobile-only bottom navigation. Four core tabs split around a center "+"
 * quick-add (the single entry point for add expense / paste link / import).
 */
export function BottomTabBar() {
  const left = NAV_ITEMS.slice(0, 2)
  const right = NAV_ITEMS.slice(2)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 md:hidden"
      style={{
        height: 'calc(var(--tab-bar-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        borderTop: '1px dashed var(--color-border-primary)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {left.map((item) => (
        <Tab key={item.to} to={item.to} code={item.code} Icon={item.icon} end={item.to === '/'} />
      ))}

      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-label="Quick add (expense, wishlist link, or import)"
          title="Quick add"
          className="flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            background: 'var(--tone-accent)',
            color: 'var(--color-bg-primary)',
          }}
        >
          <Plus size={22} strokeWidth={2} />
        </button>
      </div>

      {right.map((item) => (
        <Tab key={item.to} to={item.to} code={item.code} Icon={item.icon} />
      ))}
    </nav>
  )
}

function Tab({
  to,
  code,
  Icon,
  end,
}: {
  to: string
  code: string
  Icon: typeof Plus
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1',
          isActive ? '' : 'text-dim',
        )
      }
      style={({ isActive }) => (isActive ? { color: 'var(--tone-accent)' } : undefined)}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="label" style={{ color: 'inherit', fontSize: '8px' }}>
        {code}
      </span>
    </NavLink>
  )
}
