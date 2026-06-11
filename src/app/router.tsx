import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { PlaceholderScreen } from '@/components/PlaceholderScreen'
import { DevPage } from '@/routes/DevPage'
import { HomePage } from '@/routes/HomePage'
import { KitPage } from '@/routes/KitPage'
import { TransactionsPage } from '@/routes/TransactionsPage'
import { DebtsPage } from '@/routes/DebtsPage'
import { DebtDetailPage } from '@/routes/DebtDetailPage'

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
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'transactions/import', element: <PlaceholderScreen name="IMPORT" route="/transactions/import" /> },
      { path: 'transactions/:id', element: <PlaceholderScreen name="TRANSACTION_DETAIL" route="/transactions/:id" /> },
      { path: 'debts', element: <DebtsPage /> },
      { path: 'debts/:id', element: <DebtDetailPage /> },
      { path: 'wishlist', element: <PlaceholderScreen name="WISHLIST" route="/wishlist" /> },
      { path: 'wishlist/:id', element: <PlaceholderScreen name="WISHLIST_ITEM" route="/wishlist/:id" /> },
      { path: 'settings', element: <PlaceholderScreen name="SETTINGS" route="/settings" /> },
      { path: 'settings/:area', element: <PlaceholderScreen name="SETTINGS_AREA" route="/settings/:area" /> },
      { path: 'onboarding', element: <PlaceholderScreen name="ONBOARDING" route="/onboarding" /> },
      { path: 'kit', element: <KitPage /> }, // dev: HUD component-kit gallery
      { path: 'dev', element: <DevPage /> }, // dev: primitive tuning playground
      { path: 'share-target', element: <Navigate to="/wishlist/new" replace /> },
      { path: '*', element: <PlaceholderScreen name="404_NOT_FOUND" route="*" /> },
    ],
  },
])
