'use client'

import { useRef, useState } from 'react'
import { scrollState, useFrame } from '../Motion'

/* Which rotation brings each face of a CSS cube to the front. */
const FACES: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -90],
  3: [-90, 0],
  4: [90, 0],
  5: [0, 90],
  6: [0, 180],
}

function Die({ face, spin, size = 46 }: { face: number; spin: number; size?: number }) {
  const [rx, ry] = FACES[face] ?? FACES[1]
  return (
    <div className="stage" style={{ width: size, height: size, perspective: size * 9 }}>
      <div
        className="die"
        style={
          {
            '--s': `${size}px`,
            '--dieface': '#FCF8F0',
            '--pipcol': '#1B1D24',
            transform: `rotateX(${rx + spin * 360}deg) rotateY(${ry + spin * 360}deg)`,
          } as React.CSSProperties
        }
      >
        <span className="fc f1" />
        <span className="fc f2" />
        <span className="fc f3" />
        <span className="fc f4" />
        <span className="fc f5" />
        <span className="fc f6" />
      </div>
    </div>
  )
}

/**
 * Scroll progress, told with dice.
 *
 * A d6 only counts to six, so the rail picks its instrument from the length
 * of the page — the way you would at a real table:
 *
 *   ≤ 6 sections   one d6, its face IS the section number
 *   7–12 sections  two d6 that SUM to the section number (a 9 is 5 + 4)
 *   > 12 sections  a numbered hex token that flips over — the die metaphor
 *                  bows out rather than lying about what it can count
 *
 * Add sections freely; the component switches by itself.
 */
export default function DiceRail({ ids, total }: { ids: string[]; total: number }) {
  const [n, setN] = useState(1)
  const [pct, setPct] = useState(0)
  const [show, setShow] = useState(false)
  const spins = useRef(0)
  const last = useRef(1)

  useFrame(() => {
    const p = Math.min(100, Math.max(0, (scrollState.y / scrollState.max) * 100))
    setPct((prev) => (Math.abs(prev - p) < 0.4 ? prev : p))

    const nextShow = scrollState.y > scrollState.vh * 0.5
    setShow((prev) => (prev === nextShow ? prev : nextShow))

    // geometry read inside the frame, not on the scroll thread
    const mid = scrollState.y + scrollState.vh * 0.4
    let current = 1
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i])
      if (el && el.offsetTop <= mid) current = Math.min(total, i + 1)
    }
    if (current !== last.current) {
      spins.current += current > last.current ? 1 : -1
      last.current = current
      setN(current)
    }
  })

  const mode = total <= 6 ? 'one' : total <= 12 ? 'two' : 'token'
  // split n across two dice the way a table would read it
  const a = Math.min(6, Math.ceil(n / 2))
  const b = Math.max(1, n - a)

  return (
    <div className={`dicerail${show ? ' show' : ''}`} aria-hidden="true">
      {mode === 'one' ? (
        <Die face={n} spin={spins.current} />
      ) : mode === 'two' ? (
        <div className="pair">
          <Die face={a} spin={spins.current} size={34} />
          <Die face={b} spin={-spins.current} size={34} />
        </div>
      ) : (
        <div className="tokencount" style={{ perspective: 420 }}>
          <div className="tokenflip" style={{ transform: `rotateY(${spins.current * 180}deg)` }}>
            <span>{n}</span>
          </div>
        </div>
      )}

      <div className="track">
        <b style={{ ['--p' as string]: `${pct}%` }} />
      </div>
      <span className="lbl">
        {String(n).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  )
}
