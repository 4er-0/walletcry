import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Panel } from '@/components/hud'
import { store, type WishlistTier } from '@/data'

/**
 * Add a wishlist item — paste-a-link (mock fetch-proxy, per brief: the real
 * proxy is scaffold-only) or manual entry, then assign a Need/Want/Dream tier
 * and confirm.
 */
export function WishlistNewPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [tier, setTier] = useState<WishlistTier>('want')
  const [fetched, setFetched] = useState(false)

  /** MOCK proxy: derive a readable title from the URL slug. No network. */
  function mockFetch() {
    try {
      const u = new URL(url)
      const slug = decodeURIComponent(
        u.pathname.split('/').filter(Boolean).pop() ?? u.hostname,
      )
      const title = slug
        .replace(/[-_+]+/g, ' ')
        .replace(/\.\w+$/, '')
        .trim()
      setName(title ? title.replace(/\b\w/g, (c) => c.toUpperCase()) : u.hostname)
      setFetched(true)
    } catch {
      setName('')
      setFetched(false)
    }
  }

  async function confirm() {
    const parsed = Number(price.replace(',', '.'))
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0) return
    const id = `wish_${Date.now()}`
    await store.wishlist.put({
      id,
      name: name.trim(),
      price: parsed,
      currency: 'PLN',
      tier,
      status: 'confirmed',
      url: url || undefined,
      createdAt: new Date().toISOString(),
    })
    navigate(`/wishlist/${id}`)
  }

  const valid = name.trim().length > 0 && Number(price.replace(',', '.')) > 0

  return (
    <Screen>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="label">WISHLIST // ADD_ITEM</h1>
        <Link to="/wishlist" className="label" style={{ color: 'var(--tone-accent)' }}>
          ← BACK
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:max-w-2xl">
        <Panel label="PASTE_A_LINK // MOCK_PROXY">
          <div className="flex flex-col gap-3 min-[480px]:flex-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://allegro.pl/oferta/…"
              aria-label="Product URL"
              className="hud-input min-w-0 flex-1"
            />
            <button type="button" className="hud-btn" onClick={mockFetch} disabled={!url}>
              FETCH
            </button>
          </div>
          {fetched && (
            <div className="label mt-3 text-faint">
              // proxy is mocked — title parsed from the URL, set the price yourself
            </div>
          )}
        </Panel>

        <Panel label="ITEM">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="label">NAME</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Herman Miller Aeron"
                className="hud-input"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label">PRICE_PLN</span>
              <input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="6200"
                className="hud-input tabnum"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="label">TIER</span>
              <div className="flex gap-2" role="radiogroup" aria-label="Tier">
                {(['need', 'want', 'dream'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tier === t}
                    onClick={() => setTier(t)}
                    className="hud-btn flex-1"
                    style={
                      tier === t
                        ? { borderColor: 'var(--tone-accent)', color: 'var(--tone-accent)' }
                        : undefined
                    }
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="hud-btn hud-btn--primary"
              disabled={!valid}
              style={!valid ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              onClick={() => void confirm()}
            >
              CONFIRM_ITEM
            </button>
          </div>
        </Panel>
      </div>
    </Screen>
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
