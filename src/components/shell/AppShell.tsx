import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomTabBar } from './BottomTabBar'

/**
 * Responsive shell — desktop: HUD icon-rail sidebar + content; mobile: content
 * with a bottom tab bar and center quick-add. Honors safe-area insets.
 */
export function AppShell() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          className="min-h-0 flex-1 overflow-y-auto"
          style={{
            paddingLeft: 'var(--safe-left)',
            paddingRight: 'var(--safe-right)',
            // leave room for the mobile tab bar (hidden on desktop via the bar itself)
            paddingBottom: 'calc(var(--tab-bar-height) + var(--safe-bottom))',
          }}
        >
          <Outlet />
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
