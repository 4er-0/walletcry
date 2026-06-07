import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { PlaceholderScreen } from '@/components/PlaceholderScreen'
import { HomePage } from '@/routes/HomePage'
import { KitPage } from '@/routes/KitPage'

/**
 * Route skeleton mirroring INFORMATION_ARCHITECTURE.md. Screens that aren't
 * built yet render a HUD-styled PlaceholderScreen so navigation is fully
 * walkable from day one.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'transactions', element: <PlaceholderScreen name="TRANSACTIONS" route="/transactions" /> },
      { path: 'transactions/import', element: <PlaceholderScreen name="IMPORT" route="/transactions/import" /> },
      { path: 'transactions/:id', element: <PlaceholderScreen name="TRANSACTION_DETAIL" route="/transactions/:id" /> },
      { path: 'debts', element: <PlaceholderScreen name="DEBTS" route="/debts" /> },
      { path: 'debts/:id', element: <PlaceholderScreen name="DEBT_DETAIL" route="/debts/:id" /> },
      { path: 'wishlist', element: <PlaceholderScreen name="WISHLIST" route="/wishlist" /> },
      { path: 'wishlist/:id', element: <PlaceholderScreen name="WISHLIST_ITEM" route="/wishlist/:id" /> },
      { path: 'settings', element: <PlaceholderScreen name="SETTINGS" route="/settings" /> },
      { path: 'settings/:area', element: <PlaceholderScreen name="SETTINGS_AREA" route="/settings/:area" /> },
      { path: 'onboarding', element: <PlaceholderScreen name="ONBOARDING" route="/onboarding" /> },
      { path: 'kit', element: <KitPage /> }, // dev: HUD component-kit gallery
      { path: 'share-target', element: <Navigate to="/wishlist/new" replace /> },
      { path: '*', element: <PlaceholderScreen name="404_NOT_FOUND" route="*" /> },
    ],
  },
])
