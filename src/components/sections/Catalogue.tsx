'use client'

import { useRef } from 'react'
import Reveal from '../Reveal'
import { clamp, lerp, scrollState, useFrame, useMotion } from '../Motion'

export interface Tile {
  slug: string
  title: string
  cover: string
  href: string
}

const ROWS = [
  { d: '74s', rev: false, off: 0 },
  { d: '98s', rev: true, off: 5 },
  { d: '82s', rev: false, off: 9 },
  { d: '110s', rev: true, off: 3 },
  { d: '88s', rev: false, off: 12 },
]

/**
 * The catalogue wall: rows of covers drifting in alternating directions on a
 * stage whose camera rotates and pushes in as you scroll through it — as if
 * you were walking past a wall of boxes that breathes.
 */
export default function Catalogue({
  tiles,
  eyebrow,
  title,
  titleAlt,
  lead,
  cta,
  ctaHref,
}: {
  tiles: Tile[]
  eyebrow: string
  title: string
  titleAlt: string
  lead: string
  cta: string
  ctaHref: string
}) {
  const secRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const p = useRef({ cur: 0, tgt: 0 })
  const { motion } = useMotion()

  useFrame((dt) => {
    const stage = stageRef.current
    const view = viewRef.current
    const sec = secRef.current
    if (!stage || !view || !sec) return
    // geometry is read here, inside the frame, rather than on every scroll event
    const top = sec.offsetTop - scrollState.y
    p.current.tgt = clamp(
      (scrollState.vh - top) / (scrollState.vh + sec.offsetHeight),
      0,
      1,
    )
    if (!motion) {
      stage.style.transform = ''
      view.style.opacity = '1'
      return
    }
    p.current.cur = lerp(p.current.cur, p.current.tgt, 1 - Math.pow(0.002, dt / 1000))
    const t = p.current.cur * 2 - 1
    stage.style.transform =
      `translate3d(0,${(t * 34).toFixed(1)}px,${(-300 * Math.abs(t)).toFixed(1)}px)` +
      ` rotateX(${(-t * 11 + 2.5).toFixed(2)}deg) rotateY(${(t * 13).toFixed(2)}deg)`
    view.style.opacity = (0.35 + 0.65 * (1 - Math.min(1, Math.abs(t) * 1.25))).toFixed(3)
  })

  if (!tiles.length) return null

  return (
    <section className="wall on-dark" id="catalogue" ref={secRef} aria-labelledby="wallTitle">
      <div className="wall-glow" aria-hidden="true" />

      <div className="wall-head">
        <Reveal as="p" className="eyebrow">
          <span className="hx" />
          {eyebrow}
        </Reveal>
        <Reveal as="h2" d={1} className="sec-title" id="wallTitle">
          {title}
          <span className="alt">{titleAlt}</span>
        </Reveal>
        <Reveal as="p" d={2}>
          {lead}
        </Reveal>
      </div>

      <div className="wall-view" ref={viewRef} aria-hidden="true">
        <div className="wall-stage" ref={stageRef}>
          {ROWS.map((cfg, ri) => {
            const seq = Array.from(
              { length: Math.max(8, tiles.length + 2) },
              (_, k) => tiles[(k + cfg.off + ri * 2) % tiles.length],
            )
            return (
              <div
                key={ri}
                className={`wrow${cfg.rev ? ' rev' : ''}`}
                style={{ ['--d' as string]: cfg.d }}
              >
                {[0, 1].map((pass) =>
                  seq.map((it, j) => (
                    /* Every tile goes to its title. The wall is a decorative
                       duplicate of the accessible card grid directly below
                       (#games), so it stays out of the tab order rather than
                       adding ~100 focus stops for the same ten destinations —
                       keyboard and screen-reader users get the real list. */
                    <a
                      className="tile"
                      key={`${pass}-${j}`}
                      href={it.href}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.cover}
                        alt=""
                        width={300}
                        height={420}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="tcap">
                        {it.title}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h13M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </a>
                  )),
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="wall-foot">
        <Reveal>
          <a className="btn btn-g" href={ctaHref}>
            <span>
              {cta}
              <svg
                className="arw"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
