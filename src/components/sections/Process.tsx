'use client'

import { useRef, useState } from 'react'
import { clamp, lerp, scrollState, useFrame, useMotion } from '../Motion'
import type { Dict } from '@/i18n/dict'

const MEEPLE =
  'M50 6a17 17 0 0 0-13.4 27.4C24.2 37.6 15.6 45.2 10.4 55.6a5 5 0 0 0 3.2 7.1l16.6 4.1c-3.2 8.9-5 18.2-5.2 27.6a4 4 0 0 0 4 3.6h13.8a4 4 0 0 0 4-3.4c.6-4.4 1.7-8.6 3.2-12.6 1.5 4 2.6 8.2 3.2 12.6a4 4 0 0 0 4 3.4H70.9a4 4 0 0 0 4-3.6c-.2-9.4-2-18.7-5.2-27.6l16.6-4.1a5 5 0 0 0 3.2-7.1C84.4 45.2 75.8 37.6 63.4 33.4A17 17 0 0 0 50 6Z'

/* A 19-cell hex board, axial coords → pixel offsets in a 100×100 box. */
const BOARD: [number, number][] = []
for (let q = -2; q <= 2; q++) {
  for (let r = -2; r <= 2; r++) {
    if (Math.abs(q + r) > 2) continue
    BOARD.push([q, r])
  }
}
/** deal the tiles from the middle outwards, so the board grows */
const ORDER = BOARD.map((c, i) => ({ c, i, d: Math.abs(c[0]) + Math.abs(c[1]) + Math.abs(c[0] + c[1]) }))
  .sort((a, b) => a.d - b.d || a.i - b.i)
  .map((x) => x.i)

const TILE_COLORS = ['#1F6E64', '#D9A441', '#C8352B', '#3D5A80', '#4A7C59', '#B33A5B']

/**
 * 铺开一局 — the scroll-driven set piece.
 *
 * A tall section with a sticky stage. As you scroll through it:
 *   · the hex board deals itself out from the centre, one tile at a time
 *   · five layers of components drift at different rates, so the composition
 *     has real depth
 *   · the copy beside it advances through the four production steps, each one
 *     driven by its OWN sub-progress (`--sp`) rather than a binary on/off, so
 *     the numerals, rails and underlines all move continuously
 *
 * Because the page is pinned while all this happens, the stage also carries a
 * live scroll cue — a caret, a step counter and a progress bar — so it is
 * never ambiguous whether scrolling is doing anything.
 *
 * All of it hangs off ONE scroll progress number read in the shared frame
 * loop. With reduced motion it collapses to a plain, complete board and a
 * normal four-item list.
 */
export default function Process({ t }: { t: Dict }) {
  const secRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLOListElement>(null)
  const [step, setStep] = useState(0)
  const p = useRef({ cur: 0, tgt: 0 })
  const { motion } = useMotion()
  const steps = t.process.steps

  useFrame((dt) => {
    const sec = secRef.current
    const stage = stageRef.current
    const layers = layersRef.current
    if (!sec || !stage || !layers) return

    const travel = sec.offsetHeight - scrollState.vh
    const raw = travel > 0 ? (scrollState.y - sec.offsetTop) / travel : 0
    p.current.tgt = clamp(raw, 0, 1)

    if (!motion) {
      stage.style.setProperty('--p', '1')
      setStep((s) => (s === steps.length - 1 ? s : steps.length - 1))
      return
    }

    p.current.cur = lerp(p.current.cur, p.current.tgt, 1 - Math.pow(0.0025, dt / 1000))
    const v = p.current.cur
    stage.style.setProperty('--p', v.toFixed(4))
    // 0 → 1 across the whole pinned stretch, used by the cue and the rail
    stage.style.setProperty('--pp', `${(v * 100).toFixed(2)}%`)
    // fade the cue in once we are properly pinned, out again at the end
    stage.style.setProperty(
      '--cue',
      clamp(Math.min(v / 0.06, (1 - v) / 0.08), 0, 1).toFixed(3),
    )

    // Parallax travel scales with the viewport. A phone gets roughly a third
    // of the desktop displacement, so the composition still separates into
    // planes without any layer sliding out of its box.
    const w = scrollState.vw
    const k = w < 560 ? 0.34 : w < 900 ? 0.52 : w < 1180 ? 0.72 : 1
    const kids = layers.children
    for (let i = 0; i < kids.length; i++) {
      const el = kids[i] as HTMLElement
      const depth = parseFloat(el.dataset.depth ?? '0')
      const spin = parseFloat(el.dataset.spin ?? '0')
      el.style.transform =
        `translate3d(0,${((0.5 - v) * depth * 220 * k).toFixed(1)}px,${(depth * 60 * k).toFixed(0)}px)` +
        ` rotate(${((v - 0.5) * spin * k).toFixed(2)}deg)`
    }

    // Per-step sub-progress: 0 before it starts, 0→1 while it is current,
    // 1 once it is done. Four writes, no reads.
    const list = stepsRef.current
    if (list) {
      const scaled = v * steps.length
      for (let i = 0; i < list.children.length; i++) {
        const li = list.children[i] as HTMLElement
        li.style.setProperty('--sp', clamp(scaled - i, 0, 1).toFixed(4))
      }
    }

    const next = clamp(Math.floor(v * steps.length), 0, steps.length - 1)
    setStep((s) => (s === next ? s : next))
  })

  return (
    <section className="sec process" id="process" ref={secRef} aria-labelledby="processTitle">
      <div className="process-sticky">
        <div className="wrap process-grid" ref={stageRef}>
          {/* ---- heading ---- */}
          <div className="process-head">
            <p className="eyebrow">
              <span className="hx" />
              {t.process.eyebrow}
            </p>
            <h2 className="sec-title" id="processTitle">
              {t.process.title}
              <span className="alt">{t.process.titleEn}</span>
            </h2>
          </div>

          {/* ---- steps ---- */}
          <div className="process-track">
            {/* phones show one step at a time, so they get a position marker */}
            <div className="process-dots" aria-hidden="true">
              {steps.map((s, i) => (
                <span key={s.k} className={i === step ? 'on' : ''} />
              ))}
            </div>
            <div className="process-rail" aria-hidden="true">
              <b />
            </div>
            <ol className="process-steps" ref={stepsRef}>
              {steps.map((s, i) => (
                <li key={s.k} className={i === step ? 'on' : ''} aria-current={i === step}>
                  <span className="k" aria-hidden="true">
                    <i>{s.k}</i>
                  </span>
                  <div>
                    <h3>
                      {s.t}
                      <span className="alt">{s.en}</span>
                    </h3>
                    <p>{s.d}</p>
                  </div>
                  <span className="fill" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>

          {/* ---- parallax stage ---- */}
          <div className="process-art" aria-hidden="true">
            <span className="process-ghost">{steps[step]?.k}</span>
            <div className="px-layers" ref={layersRef}>
              {/* 0 — the table, barely moves */}
              <div className="px-layer" data-depth="0.12" data-spin="-2">
                <div className="px-table" />
              </div>

              {/* 1 — the board, dealt from the middle out */}
              <div className="px-layer" data-depth="0.3" data-spin="3">
                <div className="px-board">
                  {BOARD.map(([q, r], i) => {
                    const x = 50 + (q + r / 2) * 17
                    const y = 50 + r * 14.7
                    return (
                      <span
                        key={i}
                        className="px-cell"
                        style={
                          {
                            left: `${x}%`,
                            top: `${y}%`,
                            '--t': (ORDER.indexOf(i) / BOARD.length) * 0.62,
                            '--c': TILE_COLORS[i % TILE_COLORS.length],
                          } as React.CSSProperties
                        }
                      />
                    )
                  })}
                </div>
              </div>

              {/* 2 — cards */}
              <div className="px-layer" data-depth="0.52" data-spin="-5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`px-card c${i}`} />
                ))}
              </div>

              {/* 3 — wooden components */}
              <div className="px-layer" data-depth="0.74" data-spin="6">
                <svg className="px-meeple m0" viewBox="0 0 100 100">
                  <path d={MEEPLE} fill="#1F6E64" />
                </svg>
                <svg className="px-meeple m1" viewBox="0 0 100 100">
                  <path d={MEEPLE} fill="#C8352B" />
                </svg>
                <span className="px-cube k0" />
                <span className="px-cube k1" />
              </div>

              {/* 4 — the die, closest to camera */}
              <div className="px-layer" data-depth="1" data-spin="-9">
                <span className="px-die" />
              </div>
            </div>
          </div>

          {/* ---- "the page is pinned, but you ARE scrolling" cue ---- */}
          <div className="process-cue" aria-hidden="true">
            <span className="pc-count">
              {String(step + 1).padStart(2, '0')}
              <i>/{String(steps.length).padStart(2, '0')}</i>
            </span>
            <span className="pc-bar">
              <b />
            </span>
            <span className="pc-hint">
              {t.process.hint}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
