'use client'

import { useEffect, useRef, useState } from 'react'
import { clamp, lerp, scrollState, useFrame, useMotion } from '../Motion'
import type { Milestone } from '@/lib/milestones'
import type { Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

/**
 * 长桌 — the company history, laid out along a table.
 *
 * The section is tall; its stage is sticky. Vertical scroll drives the rail
 * horizontally, so the milestones travel past a fixed playhead in the middle
 * of the screen. Each card knows its own signed distance from that playhead
 * (`--d`) and uses it to rotate, recede in Z and fade — so the row behaves
 * like a real perspective row of objects rather than a list that slides.
 *
 * EVERYTHING SCALES WITH THE DATA. The content is `content/milestones.json`;
 * the token numbers, the year pips, the progress bar and the scroll length
 * (`--rows`) are all derived from the array length, and the campaign figures
 * come out of the game files. Add a seventh milestone and the section gets
 * longer by itself.
 */
export default function History({
  t,
  locale,
  items,
}: {
  t: Dict
  locale: Locale
  items: Milestone[]
}) {
  const secRef = useRef<HTMLElement>(null)
  const vpRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const meshRef = useRef<HTMLDivElement>(null)
  const washRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLElement>(null)

  const [step, setStep] = useState(0)
  const { motion } = useMotion()

  const p = useRef({ cur: 0, tgt: 0 })
  /** measured once per resize: node pitch, side padding, total travel */
  const geo = useRef({ nw: 320, gap: 24, pad: 0, travel: 1, vpw: 1 })

  useEffect(() => {
    const vp = vpRef.current
    const rail = railRef.current
    if (!vp || !rail) return

    const measure = () => {
      const first = rail.querySelector('.hist-node') as HTMLElement | null
      if (!first) return
      const vpw = vp.clientWidth || 1
      const nw = first.offsetWidth
      const gap = parseFloat(getComputedStyle(rail).columnGap || '24') || 24
      // Centre the first and last card under the playhead at p = 0 and p = 1.
      const pad = Math.max(0, (vpw - nw) / 2)
      rail.style.setProperty('--pad', `${pad.toFixed(1)}px`)
      const total = pad * 2 + items.length * nw + (items.length - 1) * gap
      geo.current = { nw, gap, pad, vpw, travel: Math.max(1, total - vpw) }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(vp)
    return () => ro.disconnect()
  }, [items.length])

  useFrame((dt) => {
    const sec = secRef.current
    const rail = railRef.current
    const vp = vpRef.current
    if (!sec || !rail || !vp) return

    const travelY = sec.offsetHeight - scrollState.vh
    const raw = travelY > 0 ? (scrollState.y - sec.offsetTop) / travelY : 0
    // A short lead-in and lead-out keeps the first and last card readable
    // instead of snapping the moment the section pins.
    p.current.tgt = clamp((raw - 0.08) / 0.84, 0, 1)

    if (!motion) {
      const n = clamp(Math.round(p.current.tgt * (items.length - 1)), 0, items.length - 1)
      setStep((s) => (s === n ? s : n))
      return
    }

    p.current.cur = lerp(p.current.cur, p.current.tgt, 1 - Math.pow(0.0022, dt / 1000))
    const v = p.current.cur
    const g = geo.current

    rail.style.transform = `translate3d(${(-v * g.travel).toFixed(1)}px,0,0)`

    // playhead position, expressed in rail coordinates
    const head = v * g.travel + g.vpw / 2
    const nodes = rail.children
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i] as HTMLElement
      const idx = Number(el.dataset.i)
      if (Number.isNaN(idx)) continue
      const centre = g.pad + idx * (g.nw + g.gap) + g.nw / 2
      const d = (centre - head) / g.vpw
      const ad = Math.abs(d)
      el.style.setProperty('--d', d.toFixed(4))
      el.style.setProperty('--ad', ad.toFixed(4))
      if (ad < bestD) {
        bestD = ad
        best = idx
      }
    }
    setStep((s) => (s === best ? s : best))

    if (barRef.current) barRef.current.style.width = `${(v * 100).toFixed(2)}%`
    if (meshRef.current)
      meshRef.current.style.transform = `translate3d(${(-v * 240).toFixed(1)}px,0,0)`
    if (washRef.current)
      washRef.current.style.transform =
        `translate3d(${(v * 140 - 70).toFixed(1)}px,${(v * 36 - 18).toFixed(1)}px,0) scale(1.12)`
  })

  if (!items.length) return null

  const statLabel = (s: Milestone['stats'][number]) =>
    s.field ? t.games[s.field] : (s.label?.[locale] ?? '')

  return (
    <section
      className="sec hist on-dark"
      id="history"
      ref={secRef}
      aria-labelledby="histTitle"
      /* scroll length follows the number of milestones */
      style={{ ['--rows' as string]: items.length }}
    >
      <div className="hist-sticky">
        <div className="hist-bg" aria-hidden="true">
          <div className="hist-wash" ref={washRef} />
          <div className="hist-mesh" ref={meshRef} />
        </div>

        {/* the year, set large, sitting in the band above the cards */}
        <div className="hist-ghost" aria-hidden="true">
          {items.map((it, i) => (
            <span key={it.id} className={i === step ? 'on' : i < step ? 'past' : ''}>
              {it.year}
            </span>
          ))}
        </div>

        <div className="wrap hist-head">
          <p className="eyebrow">
            <span className="hx" />
            {t.history.eyebrow}
          </p>
          <h2 className="sec-title" id="histTitle">
            {t.history.title}
            <span className="alt">{t.history.titleEn}</span>
          </h2>
          <p className="hist-lead">{t.history.lead}</p>
        </div>

        <div className="hist-viewport" ref={vpRef}>
          <div className="hist-rail" ref={railRef}>
            {items.map((it, i) => (
              <article className="hist-node" key={it.id} data-i={i}>
                <span className="hist-tok" aria-hidden="true">
                  <i>{String(i + 1).padStart(2, '0')}</i>
                </span>
                <div className="hist-card">
                  <span className="hist-when">
                    {it.year}
                    <em>{it.quarter[locale]}</em>
                  </span>
                  <h3>
                    {it.title[locale]}
                    <span className="alt">{it.alt[locale]}</span>
                  </h3>
                  <p>{it.body[locale]}</p>
                  {it.stats.length ? (
                    <dl className="hist-figs">
                      {it.stats.map((s, k) => (
                        <div key={k}>
                          <dt>{statLabel(s)}</dt>
                          <dd>{s.value[locale]}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {/* the playhead: the rail moves, this does not */}
          <span className="hist-playhead" aria-hidden="true" />
        </div>

        <div className="hist-foot">
          <ol className="hist-pips" aria-hidden="true">
            {items.map((it, i) => (
              <li key={it.id} className={i <= step ? 'on' : ''}>
                <span>{it.year}</span>
              </li>
            ))}
          </ol>
          <div className="hist-bar">
            <b ref={barRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
