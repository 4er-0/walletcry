import {
  LayoutGrid,
  Receipt,
  Landmark,
  Star,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  code: string // mono label shown in the HUD
  icon: LucideIcon
}

/** The 4 primary destinations (Settings is utility, reached from the top bar). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', code: 'HOME', icon: LayoutGrid },
  { to: '/transactions', label: 'Transactions', code: 'TXNS', icon: Receipt },
  { to: '/debts', label: 'Debts', code: 'DEBTS', icon: Landmark },
  { to: '/wishlist', label: 'Wishlist', code: 'WISH', icon: Star },
]
