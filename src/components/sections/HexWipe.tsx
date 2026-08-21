'use client'

import { useEffect, useRef, useState } from 'react'
import { luma } from '@/lib/cover'

interface Props {
  /** colour of the section ABOVE the seam */
  from: string
  /** colour of the section BELOW the seam */
  to: string
  /** accent for the pieces sitting on the seam */
  rod?: string
  /** which way the tiles get laid down */
  dir?: 'ltr' | 'rtl' | 'center'
  /** which piece lands on the centre tile, slightly larger than the rest */
  piece?: PieceName
}

type PieceName =
  | 'meeple'
  | 'die'
  | 'cube'
  | 'token'
  | 'card'
  | 'pawn'
  | 'hourglass'
  | 'coin'
  | 'sandtimer'
  | 'd8'

/* ------------------------------------------------------------------ *
 * The component drawer. Every tile in the seam gets one — a whole shelf
 * of board-game furniture pressed into the boundary.
 * All drawn in a 100×100 box so they can share one <svg> setup.
 * ------------------------------------------------------------------ */
const PIECES: Record<string, React.ReactNode> = {
  meeple: (
    <path d="M50 6a17 17 0 0 0-13.4 27.4C24.2 37.6 15.6 45.2 10.4 55.6a5 5 0 0 0 3.2 7.1l16.6 4.1c-3.2 8.9-5 18.2-5.2 27.6a4 4 0 0 0 4 3.6h13.8a4 4 0 0 0 4-3.4c.6-4.4 1.7-8.6 3.2-12.6 1.5 4 2.6 8.2 3.2 12.6a4 4 0 0 0 4 3.4H70.9a4 4 0 0 0 4-3.6c-.2-9.4-2-18.7-5.2-27.6l16.6-4.1a5 5 0 0 0 3.2-7.1C84.4 45.2 75.8 37.6 63.4 33.4A17 17 0 0 0 50 6Z" />
  ),
  die: (
    <g>
      <rect x="17" y="17" width="66" height="66" rx="16" fill="none" strokeWidth="7" />
      <circle cx="35" cy="35" r="6.5" />
      <circle cx="50" cy="50" r="6.5" />
      <circle cx="65" cy="65" r="6.5" />
    </g>
  ),
  cube: (
    <g>
      <path d="M50 12 84 31v38L50 88 16 69V31z" fill="none" strokeWidth="7" strokeLinejoin="round" />
      <path d="M50 12v38M50 50 16 31M50 50l34-19" fill="none" strokeWidth="6" />
    </g>
  ),
  token: (
    <g>
      <path d="M50 10 85 30v40L50 90 15 70V30z" fill="none" strokeWidth="7" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="12" />
    </g>
  ),
  card: (
    <g>
      <rect x="22" y="12" width="56" height="76" rx="9" fill="none" strokeWidth="7" />
      <path d="M50 32 66 42v20L50 72 34 62V42z" fill="none" strokeWidth="6" strokeLinejoin="round" />
    </g>
  ),
  pawn: (
    <g>
      <circle cx="50" cy="26" r="14" />
      <path d="M36 44c0 10 6 14 6 22l-6 18h28l-6-18c0-8 6-12 6-22z" />
      <rect x="26" y="84" width="48" height="9" rx="4.5" />
    </g>
  ),
  hourglass: (
    <g>
      <path d="M28 12h44M28 88h44" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M34 16c0 16 16 22 16 34s-16 18-16 34M66 16c0 16-16 22-16 34s16 18 16 34" fill="none" strokeWidth="7" />
    </g>
  ),
  coin: (
    <g>
      <circle cx="50" cy="50" r="34" fill="none" strokeWidth="7" />
      <circle cx="50" cy="50" r="16" fill="none" strokeWidth="6" />
    </g>
  ),
  sandtimer: (
    <g>
      <path d="M50 8 88 30v40L50 92 12 70V30z" fill="none" strokeWidth="6" strokeLinejoin="round" />
      <path d="M50 30v40M31 40v20M69 40v20" strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  ),
  d8: (
    <g>
      <path d="M50 8 88 50 50 92 12 50z" fill="none" strokeWidth="7" strokeLinejoin="round" />
      <path d="M12 50h76M50 8v84" strokeWidth="5" fill="none" />
    </g>
  ),
}
const ORDER = ['meeple', 'die', 'cube', 'card', 'token', 'pawn', 'd8', 'coin', 'hourglass', 'sandtimer']

/**
 * 落子 — the section transition.
 *
 * Two sections meet along an interlocking hexagonal edge: the upper colour
 * ends in a straight slab, and a row of hex tiles in that same colour bites
 * down into the section below. The RESTING state is the design — when the
 * seam scrolls into view those tiles are not there yet, and they drop in one
 * at a time with a short spring until the interlock is complete. Nothing is
 * left over afterwards, because the finished edge is what got animated.
 *
 * Every tile carries a different piece of board-game furniture — meeple,
 * d6, cube, card, token, pawn, d8, coin, hourglass — so the seam reads as a
 * drawer of components tipped into the page rather than a decorative band.
 * The centre tile gets the requested `piece`, drawn a little larger.
 *
 * Cost: one rectangle plus ~20 clipped hexes per seam, animated by a single
 * class toggle and a CSS transition-delay ladder. Nothing per frame.
 */
export default function HexWipe({ from, to, rod = '#B08D4F', dir = 'ltr', piece = 'meeple' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState(96)
  const [cols, setCols] = useState(18)
  const [set, setSet] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // hexagon height derives from width, so the cell has to be a real length
    const measure = () => {
      const w = el.clientWidth || 1200
      const c = w < 480 ? 58 : w < 760 ? 72 : w < 1100 ? 88 : 104
      setCell(c)
      setCols(Math.ceil(w / c) + 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const io = new IntersectionObserver((e) => setSet(e[0].isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const mid = Math.floor(cols / 2)
  // the pieces sit ON the tile, so they must contrast with the tile colour
  const onLight = luma(from) > 0.55

  return (
    <div
      ref={ref}
      className={`seam${set ? ' set' : ''}`}
      aria-hidden="true"
      style={
        {
          '--from': from,
          '--to': to,
          '--rod': rod,
          '--piece': onLight ? rod : 'rgba(248,243,233,.66)',
          '--cw': `${cell}px`,
          '--ch': `${(cell * 1.1547).toFixed(2)}px`,
        } as React.CSSProperties
      }
    >
      {/* the outgoing section, ending in a straight line */}
      <span className="seam-slab" />

      {/* the tiles that complete the interlock, each with its own component */}
      <div className="seam-row">
        {Array.from({ length: cols }).map((_, c) => {
          const order = dir === 'rtl' ? cols - 1 - c : dir === 'center' ? Math.abs(c - mid) : c
          const isMid = c === mid
          const kind = isMid ? piece : ORDER[(c * 3 + 1) % ORDER.length]
          return (
            <span
              key={c}
              className={`seam-tile${isMid ? ' lead' : ''}`}
              style={{ ['--i' as string]: order }}
            >
              <svg
                className="seam-piece"
                viewBox="0 0 100 100"
                fill="currentColor"
                stroke="currentColor"
                strokeLinecap="round"
              >
                {PIECES[kind] ?? PIECES.meeple}
              </svg>
            </span>
          )
        })}
      </div>
    </div>
  )
}
