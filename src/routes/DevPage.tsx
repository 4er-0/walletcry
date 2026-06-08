import { useState, type CSSProperties } from 'react'

import { Panel } from '@/components/hud'

/**
 * DEV PLAYGROUND — isolate a primitive and tune it live on the preview.
 * Not linked in nav; reach it at /dev. Add a new <section> per primitive.
 *
 * Sections:
 *  - SegmentedGridLab : multi-row tick/glyph bar (budget gauges, progress, etc.)
 *  - LoadingLab       : animated character loaders (spinner, shimmer)
 */

const FILL = 'var(--color-text-primary)'
const TRACK = 'var(--gauge-track)'
const DANGER = 'var(--color-neg)'

const GLYPHS = ['▪', '■', '-', '|', '+', '×', '/', '·', '=', '#', '○', '●']

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (n: number) => void
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="label w-[120px] shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--tone-accent)]"
      />
      <span className="label w-[64px] shrink-0 text-right text-[var(--color-text-primary)]">
        {value}
        {suffix}
      </span>
    </label>
  )
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="label w-[120px] shrink-0">{label}</span>
      <button className={`hud-btn${on ? ' hud-btn--primary' : ''}`} onClick={onToggle}>
        {on ? 'ON' : 'OFF'}
      </button>
    </label>
  )
}

/* ───────────────────────────── Segmented / glyph grid ───────────────────────── */

function SegmentedGridLab() {
  const [rows, setRows] = useState(1)
  const [cols, setCols] = useState(40)
  const [gap, setGap] = useState(2)
  const [cell, setCell] = useState(12)
  const [radius, setRadius] = useState(0)
  const [percent, setPercent] = useState(70)
  const [danger, setDanger] = useState(false)
  const [glyphMode, setGlyphMode] = useState(false)
  const [glyph, setGlyph] = useState('▪')

  const ratio = Math.min(1, Math.max(0, percent / 100))
  const filledCols = Math.round(ratio * cols)
  const fillColor = danger ? DANGER : FILL

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${glyphMode ? 'auto' : `${cell}px`})`,
    gridAutoRows: `${cell}px`,
    gap: `${gap}px`,
    justifyContent: 'start',
  }

  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const filled = c < filledCols
      if (glyphMode) {
        cells.push(
          <span
            key={`${r}-${c}`}
            className="flex items-center justify-center font-[family-name:var(--font-family-mono)] leading-none"
            style={{ fontSize: `${cell}px`, color: filled ? fillColor : TRACK }}
          >
            {glyph}
          </span>,
        )
      } else {
        cells.push(
          <span
            key={`${r}-${c}`}
            style={{
              background: filled ? fillColor : TRACK,
              borderRadius: `${radius}px`,
            }}
          />,
        )
      }
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel label="SEGMENTED_GRID // PREVIEW">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="label">SPENT: $1400</span>
          <span className="label">LIMIT: $2000</span>
        </div>
        <div style={gridStyle}>{cells}</div>
        <div className="label mt-3 text-[var(--color-text-secondary)]">
          {rows}×{cols} · {gap}px gap · {cell}px cell · {radius}px radius ·{' '}
          {glyphMode ? `glyph "${glyph}"` : 'block'} · {percent}%{danger ? ' · DANGER' : ''}
        </div>
      </Panel>

      <Panel label="CONTROLS">
        <div className="flex flex-col gap-3">
          <Slider label="rows" value={rows} min={1} max={8} onChange={setRows} />
          <Slider label="cols" value={cols} min={8} max={64} onChange={setCols} />
          <Slider label="gap" value={gap} min={0} max={6} suffix="px" onChange={setGap} />
          <Slider label="cell" value={cell} min={4} max={28} suffix="px" onChange={setCell} />
          <Slider label="radius" value={radius} min={0} max={14} suffix="px" onChange={setRadius} />
          <Slider label="fill %" value={percent} min={0} max={100} suffix="%" onChange={setPercent} />
          <Toggle label="danger" on={danger} onToggle={() => setDanger((d) => !d)} />
          <Toggle label="glyph mode" on={glyphMode} onToggle={() => setGlyphMode((g) => !g)} />

          {glyphMode && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="label w-[120px] shrink-0">glyph</span>
              {GLYPHS.map((g) => (
                <button
                  key={g}
                  className={`hud-btn px-3${glyph === g ? ' hud-btn--primary' : ''}`}
                  onClick={() => setGlyph(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <hr className="hud-rule my-1" />
          <div className="label mb-1 text-[var(--color-text-secondary)]">presets</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="hud-btn"
              onClick={() => {
                setRows(1)
                setCols(20)
                setGap(2)
                setCell(8)
                setRadius(0)
                setGlyphMode(false)
              }}
            >
              CURRENT_DEFAULT
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(3)
                setCols(52)
                setGap(1)
                setCell(5)
                setRadius(0)
                setGlyphMode(false)
              }}
            >
              REF_DENSE_3ROW
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(2)
                setCols(40)
                setGap(2)
                setCell(8)
                setRadius(3)
                setGlyphMode(false)
              }}
            >
              ROUNDED
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(1)
                setCols(36)
                setGap(3)
                setCell(14)
                setGlyphMode(true)
                setGlyph('|')
              }}
            >
              GLYPH_BARS
            </button>
          </div>
        </div>
      </Panel>
    </section>
  )
}

/* ───────────────────────────── Animated loaders ─────────────────────────────── */

function LoadingLab() {
  const [glyph, setGlyph] = useState('×')
  const [speed, setSpeed] = useState(1.2)

  return (
    <section className="mt-4">
      {/* scoped keyframes for the dev loaders */}
      <style>{`
        @keyframes wc-spin { to { transform: rotate(360deg); } }
        @keyframes wc-hue {
          0%   { color: var(--color-text-primary); }
          33%  { color: var(--tone-accent); }
          66%  { color: var(--color-neg); }
          100% { color: var(--color-text-primary); }
        }
        @keyframes wc-shimmer { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
      `}</style>

      <Panel label="LOADERS // ANIMATED">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
          {/* spinning glyph that cycles color */}
          <div className="flex flex-col items-center gap-3">
            <span
              className="font-[family-name:var(--font-family-mono)] leading-none"
              style={{
                fontSize: '40px',
                display: 'inline-block',
                animation: `wc-spin ${speed}s linear infinite, wc-hue 3s linear infinite`,
              }}
            >
              {glyph}
            </span>
            <span className="label text-[var(--color-text-secondary)]">SPIN + HUE</span>
          </div>

          {/* traveling shimmer bar */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-[2px]">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 14,
                    background: 'var(--tone-accent)',
                    animation: `wc-shimmer 1.1s linear ${i * 0.07}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="label text-[var(--color-text-secondary)]">SHIMMER_WAVE</span>
          </div>

          {/* glyph shimmer wave */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-[6px] font-[family-name:var(--font-family-mono)] text-[20px]">
              {'LOADING'.split('').map((ch, i) => (
                <span
                  key={i}
                  style={{ animation: `wc-shimmer 1.2s linear ${i * 0.1}s infinite` }}
                >
                  {ch}
                </span>
              ))}
            </div>
            <span className="label text-[var(--color-text-secondary)]">TEXT_WAVE</span>
          </div>
        </div>

        <hr className="hud-rule my-4" />
        <div className="flex flex-col gap-3">
          <Slider label="spin speed" value={speed} min={0.3} max={3} step={0.1} suffix="s" onChange={setSpeed} />
          <div className="flex flex-wrap items-center gap-2">
            <span className="label w-[120px] shrink-0">spinner glyph</span>
            {['×', '+', '|', '/', '○', '◐', '▪'].map((g) => (
              <button
                key={g}
                className={`hud-btn px-3${glyph === g ? ' hud-btn--primary' : ''}`}
                onClick={() => setGlyph(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </Panel>
    </section>
  )
}

export function DevPage() {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      <div className="hud-title mb-1 text-[1.75rem]">DEV_LAB</div>
      <div className="label mb-5 text-[var(--color-text-secondary)]">
        // isolate + tune primitives live · not in nav · /dev
      </div>
      <SegmentedGridLab />
      <LoadingLab />
    </div>
  )
}
