import { useState, type CSSProperties, type ReactNode } from 'react'

import { Panel } from '@/components/hud'
import { cn } from '@/lib/cn'

/**
 * DEV PLAYGROUND — isolate a primitive and tune it live on the preview.
 * Not linked in nav; reach it at /dev. Add a new <section> per primitive.
 *
 * Right-click any effect (loaders, interaction styles) to open its own little
 * settings popover with a COPY_CONFIG button. The segmented bar keeps a full
 * inline control panel (too many knobs for a popover).
 */

const FILL = 'var(--color-text-primary)'
const TRACK = 'var(--gauge-track)'
const DANGER = 'var(--color-neg)'

const GLYPHS = ['▪', '■', '-', '|', '+', '×', '/', '·', '=', '#', '○', '●']

/* ───────────────────────────── shared controls ──────────────────────────────── */

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
      <span className="label w-[96px] shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[var(--tone-accent)]"
      />
      <span className="label w-[58px] shrink-0 text-right text-[var(--color-text-primary)]">
        {value}
        {suffix}
      </span>
    </label>
  )
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-3">
      <span className="label w-[96px] shrink-0">{label}</span>
      <button className={`hud-btn${on ? ' hud-btn--primary' : ''}`} onClick={onToggle}>
        {on ? 'ON' : 'OFF'}
      </button>
    </label>
  )
}

function GlyphPicker({
  label = 'glyph',
  options,
  value,
  onChange,
}: {
  label?: string
  options: string[]
  value: string
  onChange: (g: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label w-[96px] shrink-0">{label}</span>
      {options.map((g) => (
        <button
          key={g}
          className={`hud-btn px-3${value === g ? ' hud-btn--primary' : ''}`}
          onClick={() => onChange(g)}
        >
          {g}
        </button>
      ))}
    </div>
  )
}

function CopyButton({ text, full }: { text: string; full?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={cn('hud-btn', full && 'w-full', copied && 'hud-btn--primary')}
      onClick={() =>
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          },
          () => undefined,
        )
      }
    >
      {copied ? 'COPIED ✓' : 'COPY_CONFIG'}
    </button>
  )
}

/** Wraps an effect: right-click opens a settings popover (at the cursor, clamped
 *  to the viewport) with a copy button. Click anywhere else to dismiss. */
function Tweakable({
  title,
  config,
  controls,
  children,
}: {
  title: string
  config: string
  controls?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div
      className="inline-flex flex-col items-center"
      onContextMenu={(e) => {
        e.preventDefault()
        setPos({ x: e.clientX, y: e.clientY })
        setOpen((o) => !o)
      }}
    >
      <div
        className="tweakable"
        style={{ outline: open ? '1px dashed var(--tone-accent)' : undefined }}
      >
        {children}
      </div>
      {open && (
        <>
          {/* click-away backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onContextMenu={(e) => {
              e.preventDefault()
              setOpen(false)
            }}
          />
          <div
            className="fixed z-50 w-[268px] rounded-[var(--radius-container)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3 text-left"
            style={{
              left: Math.max(8, Math.min(pos.x, window.innerWidth - 284)),
              top: Math.max(8, Math.min(pos.y, window.innerHeight - 340)),
              boxShadow: 'var(--shadow-overlay)',
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="label text-[var(--color-text-primary)]">{title}</span>
              <button className="hud-btn px-2" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            {controls && <div className="mb-3 flex flex-col gap-2">{controls}</div>}
            <CopyButton text={config} full />
          </div>
        </>
      )}
    </div>
  )
}

function LoaderCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[120px] flex-col items-center gap-3">
      <div className="flex h-12 items-center justify-center">{children}</div>
      <span className="label text-[var(--color-text-secondary)]">{label}</span>
    </div>
  )
}

const MONO = 'font-[family-name:var(--font-family-mono)] leading-none'

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
      cells.push(
        glyphMode ? (
          <span
            key={`${r}-${c}`}
            className={`flex items-center justify-center ${MONO}`}
            style={{ fontSize: `${cell}px`, color: filled ? fillColor : TRACK }}
          >
            {glyph}
          </span>
        ) : (
          <span
            key={`${r}-${c}`}
            style={{ background: filled ? fillColor : TRACK, borderRadius: `${radius}px` }}
          />
        ),
      )
    }
  }

  const config =
    `SEGMENTED_GRID\nrows: ${rows}\ncols: ${cols}\ngap: ${gap}px\ncell: ${cell}px\n` +
    `radius: ${radius}px\nfill: ${percent}%\nshape: ${glyphMode ? `glyph "${glyph}"` : 'block'}\n` +
    `danger: ${danger ? 'on' : 'off'}`

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

      <Panel label="CONTROLS" actions={<CopyButton text={config} />}>
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
            <GlyphPicker options={GLYPHS} value={glyph} onChange={setGlyph} />
          )}

          <hr className="hud-rule my-1" />
          <div className="flex flex-wrap gap-2">
            <button
              className="hud-btn"
              onClick={() => {
                setRows(1); setCols(20); setGap(2); setCell(8); setRadius(0); setGlyphMode(false)
              }}
            >
              CURRENT_DEFAULT
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(3); setCols(52); setGap(1); setCell(5); setRadius(0); setGlyphMode(false)
              }}
            >
              REF_DENSE_3ROW
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(2); setCols(40); setGap(2); setCell(8); setRadius(3); setGlyphMode(false)
              }}
            >
              ROUNDED
            </button>
            <button
              className="hud-btn"
              onClick={() => {
                setRows(1); setCols(36); setGap(3); setCell(14); setGlyphMode(true); setGlyph('|')
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

function SpinLoader() {
  const [glyph, setGlyph] = useState('×')
  const [spin, setSpin] = useState(1.2)
  const [hueOn, setHueOn] = useState(true)
  const [hue, setHue] = useState(3)
  const config =
    `LOADER spin\nglyph: "${glyph}"\nspin: ${spin}s\nhue: ${hueOn ? `${hue}s` : 'off'}`
  const animation = hueOn
    ? `wc-spin ${spin}s linear infinite, wc-hue ${hue}s linear infinite`
    : `wc-spin ${spin}s linear infinite`
  return (
    <Tweakable
      title={hueOn ? 'SPIN + HUE' : 'SPIN'}
      config={config}
      controls={
        <>
          <Slider label="spin" value={spin} min={0.3} max={3} step={0.1} suffix="s" onChange={setSpin} />
          <Toggle label="hue" on={hueOn} onToggle={() => setHueOn((v) => !v)} />
          {hueOn && (
            <Slider label="hue rate" value={hue} min={1} max={6} step={0.5} suffix="s" onChange={setHue} />
          )}
          <GlyphPicker options={['×', '+', '|', '/', '○', '◐', '▪']} value={glyph} onChange={setGlyph} />
        </>
      }
    >
      <LoaderCell label={hueOn ? 'SPIN + HUE' : 'SPIN'}>
        <span
          className={MONO}
          style={{
            fontSize: 36,
            display: 'inline-block',
            color: hueOn ? undefined : 'var(--color-text-primary)',
            animation,
          }}
        >
          {glyph}
        </span>
      </LoaderCell>
    </Tweakable>
  )
}

function BlinkSlowLoader() {
  const [period, setPeriod] = useState(1.6)
  const config = `LOADER blink_slow\nperiod: ${period}s`
  return (
    <Tweakable
      title="BLINK_SLOW"
      config={config}
      controls={<Slider label="period" value={period} min={0.6} max={3} step={0.1} suffix="s" onChange={setPeriod} />}
    >
      <LoaderCell label="BLINK_SLOW">
        <span className={`${MONO} text-[18px] uppercase tracking-[0.18em]`} style={{ animation: `wc-blink-slow ${period}s ease-in-out infinite` }}>
          loading
        </span>
      </LoaderCell>
    </Tweakable>
  )
}

function CursorLoader() {
  const [rate, setRate] = useState(1)
  const config = `LOADER cursor\nblink: ${rate}s`
  return (
    <Tweakable
      title="CURSOR"
      config={config}
      controls={<Slider label="blink" value={rate} min={0.4} max={1.6} step={0.1} suffix="s" onChange={setRate} />}
    >
      <LoaderCell label="CURSOR">
        <span className={`${MONO} text-[18px] uppercase tracking-[0.12em]`}>
          loading
          <span style={{ animation: `wc-blink-hard ${rate}s steps(1) infinite` }}>█</span>
        </span>
      </LoaderCell>
    </Tweakable>
  )
}

function EllipsisLoader() {
  const [cycle, setCycle] = useState(1.4)
  const config = `LOADER ellipsis\ncycle: ${cycle}s`
  return (
    <Tweakable
      title="ELLIPSIS"
      config={config}
      controls={<Slider label="cycle" value={cycle} min={0.6} max={3} step={0.1} suffix="s" onChange={setCycle} />}
    >
      <LoaderCell label="ELLIPSIS">
        <span className={`${MONO} text-[18px] uppercase tracking-[0.12em]`}>
          loading
          <span className="wc-ellipsis" style={{ ['--ell' as string]: `${cycle}s` } as CSSProperties} />
        </span>
      </LoaderCell>
    </Tweakable>
  )
}

function ShimmerLoader() {
  const [count, setCount] = useState(16)
  const [speed, setSpeed] = useState(1.1)
  const [stagger, setStagger] = useState(0.07)
  const config = `LOADER shimmer_wave\ncount: ${count}\nspeed: ${speed}s\nstagger: ${stagger}s`
  return (
    <Tweakable
      title="SHIMMER_WAVE"
      config={config}
      controls={
        <>
          <Slider label="count" value={count} min={6} max={28} onChange={setCount} />
          <Slider label="speed" value={speed} min={0.5} max={2} step={0.1} suffix="s" onChange={setSpeed} />
          <Slider label="stagger" value={stagger} min={0.02} max={0.2} step={0.01} suffix="s" onChange={setStagger} />
        </>
      }
    >
      <LoaderCell label="SHIMMER_WAVE">
        <div className="flex gap-[2px]">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} style={{ width: 8, height: 14, background: 'var(--tone-accent)', animation: `wc-shimmer ${speed}s linear ${i * stagger}s infinite` }} />
          ))}
        </div>
      </LoaderCell>
    </Tweakable>
  )
}

function TextWaveLoader() {
  const [speed, setSpeed] = useState(1.2)
  const [stagger, setStagger] = useState(0.1)
  const config = `LOADER text_wave\nspeed: ${speed}s\nstagger: ${stagger}s`
  return (
    <Tweakable
      title="TEXT_WAVE"
      config={config}
      controls={
        <>
          <Slider label="speed" value={speed} min={0.5} max={2} step={0.1} suffix="s" onChange={setSpeed} />
          <Slider label="stagger" value={stagger} min={0.04} max={0.25} step={0.01} suffix="s" onChange={setStagger} />
        </>
      }
    >
      <LoaderCell label="TEXT_WAVE">
        <div className={`${MONO} flex gap-[6px] text-[18px]`}>
          {'LOADING'.split('').map((ch, i) => (
            <span key={i} style={{ animation: `wc-shimmer ${speed}s linear ${i * stagger}s infinite` }}>
              {ch}
            </span>
          ))}
        </div>
      </LoaderCell>
    </Tweakable>
  )
}

function LoadingLab() {
  return (
    <section className="mt-4">
      <Panel label="LOADERS // ANIMATED — right-click any to tweak + copy">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
          <SpinLoader />
          <BlinkSlowLoader />
          <CursorLoader />
          <EllipsisLoader />
          <ShimmerLoader />
          <TextWaveLoader />
        </div>
      </Panel>
    </section>
  )
}

/* ───────────────────────────── Hover + click styles ─────────────────────────── */

function IxDemo({ label, cls, recipe }: { label: string; cls: string; recipe: string }) {
  const [dur, setDur] = useState(140)
  const config = `INTERACTION ${label}\n${recipe}\ntransition: ${dur}ms`
  return (
    <Tweakable
      title={label}
      config={config}
      controls={<Slider label="transition" value={dur} min={60} max={400} step={10} suffix="ms" onChange={setDur} />}
    >
      <button className={`ix ${cls}`} style={{ transitionDuration: `${dur}ms` }}>
        {label}
      </button>
    </Tweakable>
  )
}

function GlowDemo() {
  const [dur, setDur] = useState(140)
  const [strength, setStrength] = useState(14)
  const blur = strength
  const spread = Math.round((-6 + strength * 0.2) * 10) / 10
  const config =
    `INTERACTION GLOW\n:hover → accent ring + glow\n` +
    `strength: ${strength} (blur ${blur}px / spread ${spread}px)\ntransition: ${dur}ms`
  return (
    <Tweakable
      title="GLOW"
      config={config}
      controls={
        <>
          <Slider label="strength" value={strength} min={2} max={40} suffix="px" onChange={setStrength} />
          <Slider label="transition" value={dur} min={60} max={400} step={10} suffix="ms" onChange={setDur} />
        </>
      }
    >
      <button
        className="ix ix-glow"
        style={
          {
            transitionDuration: `${dur}ms`,
            ['--glow-blur']: `${blur}px`,
            ['--glow-spread']: `${spread}px`,
          } as CSSProperties
        }
      >
        GLOW
      </button>
    </Tweakable>
  )
}

function CellHoverDemo() {
  const [scale, setScale] = useState(1.18)
  const [dur, setDur] = useState(120)
  const config = `INTERACTION cell_hover\nhover: scale(${scale}) + fill accent\ntransition: ${dur}ms`
  return (
    <Tweakable
      title="CELL_HOVER"
      config={config}
      controls={
        <>
          <Slider label="scale" value={scale} min={1} max={2} step={0.02} onChange={setScale} />
          <Slider label="transition" value={dur} min={60} max={400} step={10} suffix="ms" onChange={setDur} />
        </>
      }
    >
      <div
        className="flex flex-wrap gap-[3px]"
        style={{ ['--cell-scale' as string]: String(scale), ['--cell-dur' as string]: `${dur}ms` } as CSSProperties}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} className="ix-cell" />
        ))}
      </div>
    </Tweakable>
  )
}

function InteractionsLab() {
  return (
    <section className="mt-4">
      <Panel label="INTERACTIONS // HOVER + CLICK — right-click any to tweak + copy">
        <div className="label mb-2 text-[var(--color-text-secondary)]">hover styles (mouse over)</div>
        <div className="mb-5 flex flex-wrap gap-3">
          <IxDemo label="INVERT" cls="ix-invert" recipe=":hover → bg=text, color=bg" />
          <IxDemo label="ACCENT_BORDER" cls="ix-accent" recipe=":hover → border+color=accent" />
          <IxDemo label="LIFT" cls="ix-lift" recipe=":hover → translateY(-3px) + accent border" />
          <GlowDemo />
          <IxDemo label="FILL_ACCENT" cls="ix-fill" recipe=":hover → bg=accent, color=bg" />
        </div>

        <div className="label mb-2 text-[var(--color-text-secondary)]">click / press styles (hold down)</div>
        <div className="mb-5 flex flex-wrap gap-3">
          <IxDemo label="SCALE_DOWN" cls="ix-accent ix-press" recipe=":active → scale(.93)" />
          <IxDemo label="PUSH_DOWN" cls="ix-accent ix-press-down" recipe=":active → translateY(2px)" />
          <IxDemo label="FLASH_ACCENT" cls="ix-invert ix-press-flash" recipe=":active → bg=accent flash" />
        </div>

        <div className="label mb-2 text-[var(--color-text-secondary)]">cell hover (mouse over the dots)</div>
        <CellHoverDemo />
      </Panel>
    </section>
  )
}

/* ───────────────────────────── page ─────────────────────────────────────────── */

export function DevPage() {
  return (
    <div className="mx-auto w-full max-w-[var(--max-width-wide)] p-4 md:p-6">
      <style>{`
        @keyframes wc-spin { to { transform: rotate(360deg); } }
        @keyframes wc-hue {
          0% { color: var(--color-text-primary); }
          33% { color: var(--tone-accent); }
          66% { color: var(--color-neg); }
          100% { color: var(--color-text-primary); }
        }
        @keyframes wc-shimmer { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
        @keyframes wc-blink-slow { 0%, 100% { opacity: 1; } 50% { opacity: .12; } }
        @keyframes wc-blink-hard { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes wc-ellipsis { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75%, 100% { content: '...'; } }
        .wc-ellipsis::after { content: ''; animation: wc-ellipsis var(--ell, 1.4s) steps(1) infinite; }
        .tweakable { outline-offset: 4px; cursor: context-menu; }

        .ix {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: var(--touch-target-min); padding: 0 var(--space-5);
          font-family: var(--font-family-mono); font-size: var(--font-size-sm);
          text-transform: uppercase; letter-spacing: var(--letter-spacing-wide);
          color: var(--color-text-primary); background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-control); cursor: pointer;
          transition: transform .14s var(--easing-default), background .14s var(--easing-default),
            color .14s var(--easing-default), border-color .14s var(--easing-default),
            box-shadow .14s var(--easing-default);
        }
        .ix-invert:hover { background: var(--color-text-primary); color: var(--color-bg-primary); border-color: var(--color-text-primary); }
        .ix-accent:hover { border-color: var(--tone-accent); color: var(--tone-accent); }
        .ix-lift:hover { transform: translateY(-3px); border-color: var(--tone-accent); }
        .ix-glow:hover { box-shadow: 0 0 0 1px var(--tone-accent), 0 0 var(--glow-blur, 14px) var(--glow-spread, -3px) var(--tone-accent); border-color: var(--tone-accent); }
        .ix-fill:hover { background: var(--tone-accent); color: var(--color-bg-primary); border-color: var(--tone-accent); }
        .ix-press:active { transform: scale(.93); }
        .ix-press-down:active { transform: translateY(2px); }
        .ix-press-flash:active { background: var(--tone-accent); color: var(--color-bg-primary); border-color: var(--tone-accent); }

        .ix-cell { width: 22px; height: 22px; background: var(--gauge-track); border-radius: var(--radius-control);
          transition: background var(--cell-dur, 120ms), transform var(--cell-dur, 120ms); }
        .ix-cell:hover { background: var(--tone-accent); transform: scale(var(--cell-scale, 1.18)); }
      `}</style>

      <div className="hud-title mb-1 text-[1.75rem]">DEV_LAB</div>
      <div className="label mb-5 text-[var(--color-text-secondary)]">
        // isolate + tune primitives live · right-click effects to tweak + copy · /dev
      </div>
      <SegmentedGridLab />
      <LoadingLab />
      <InteractionsLab />
    </div>
  )
}
