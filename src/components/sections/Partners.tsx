'use client'

import { useEffect, useRef, useState } from 'react'
import Reveal from '../Reveal'
import Parallax from '../Parallax'

/**
 * Rows alternate `cols` and `cols − 1`, so the number of columns decides how
 * ragged the last row ends up. Rather than guess, try every width that fits
 * and keep the widest one that leaves at most one empty seat — which is what
 * we want anyway, since one open seat is part of the message.
 */
function pickCols(seats: number, maxCols: number) {
  let best = maxCols
  let bestWaste = Infinity
  for (let c = Math.min(2, maxCols); c <= maxCols; c++) {
    let left = seats
    let row = 0
    while (left > 0) {
      left -= row % 2 ? c - 1 : c
      row++
    }
    const waste = -left
    if (waste <= 1) best = c // widest layout that is essentially full wins
    if (waste < bestWaste) bestWaste = waste
  }
  if (bestWaste > 1) {
    // nothing fits neatly — take the widest with the smallest remainder
    for (let c = Math.min(2, maxCols); c <= maxCols; c++) {
      let left = seats
      let row = 0
      while (left > 0) {
        left -= row % 2 ? c - 1 : c
        row++
      }
      if (-left === bestWaste) best = c
    }
  }
  return Math.max(2, best)
}

export interface Partner {
  /** plain string, or { zh, en } when the partner reads differently per language */
  name: string | { zh: string; en: string }
  logo?: string
  url?: string
  since?: number
  sample?: boolean
}

/** Wordmark stand-in used until a real logo file is dropped in. */
function Mark({ name }: { name: string }) {
  const cjk = name.match(/[\u4e00-\u9fff]{1,2}/)
  const initials = cjk
    ? cjk[0]
    : name
        .split(/[\s·-]+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
  return (
    <span className="mark" aria-hidden="true">
      <svg viewBox="0 0 120 44" width="100%" height="100%">
        <text
          x="60"
          y="21"
          textAnchor="middle"
          fontFamily="Bodoni Moda, Georgia, serif"
          fontSize="22"
          fontWeight="600"
          fill="#16181F"
        >
          {initials}
        </text>
        <text
          x="60"
          y="36"
          textAnchor="middle"
          fontFamily="Helvetica, Arial, sans-serif"
          fontSize="7"
          letterSpacing="1.6"
          fill="#5A6070"
        >
          {name.slice(0, 16).toUpperCase()}
        </text>
      </svg>
    </span>
  )
}

/**
 * 蜂巢 — partners laid into an interlocking honeycomb.
 *
 * Rows are built in JS so alternate rows can be offset by exactly half a
 * cell and pulled up to interlock; a slow glint travels across the comb, and
 * each cell lifts out of greyscale on hover. Empty cells are left in the comb
 * on purpose — the comb is not full, and it reads that way.
 */
export default function Partners({
  partners,
  locale,
  eyebrow,
  title,
  titleAlt,
  lead,
  cta,
  note,
}: {
  partners: Partner[]
  locale: 'zh' | 'en'
  eyebrow: string
  title: string
  titleAlt: string
  lead: string
  cta: string
  note: string
}) {
  const nameOf = (p: Partner) => (typeof p.name === 'string' ? p.name : p.name[locale])

  const ref = useRef<HTMLDivElement>(null)
  const seatCount = partners.length + 1
  const [cols, setCols] = useState(4)
  const [cw, setCw] = useState(240)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // A hexagon's height comes from its width, so the cell has to be a real
    // length — a percentage would resolve against the wrong axis.
    //
    // Cells are deliberately large: these are logos, and a logo that has to
    // survive being cropped to the waist of a hexagon needs the room. We take
    // the widest column count the container allows, then let pickCols pull it
    // back if that would leave a ragged last row.
    const measure = () => {
      const w = el.clientWidth || 900
      const maxCols = w < 460 ? 2 : w < 760 ? 3 : w < 1120 ? 4 : w < 1480 ? 5 : 6
      const c = pickCols(seatCount, maxCols)
      setCols(c)
      setCw(Math.min(w / c, 268))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const io = new IntersectionObserver((e) => setLit(e[0].isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [seatCount])

  // Rows alternate cols / cols-1 so they interlock. We add exactly one empty
  // cell at the end — an open seat, not a wall of blanks.
  const seats: (Partner | null)[] = [...partners, null]
  const rows: (Partner | null)[][] = []
  let idx = 0
  let r = 0
  while (idx < seats.length) {
    const n = r % 2 ? cols - 1 : cols
    rows.push(seats.slice(idx, idx + n))
    idx += n
    r++
  }

  return (
    <section className="sec partners" id="partners" aria-labelledby="partnersTitle">
      {/* no hex lattice plane here — the comb itself is the hexagons */}
      <div className="sec-bg" aria-hidden="true">
        <Parallax className="sbg wash-b" y={-110} scale={0.12} />
        <Parallax className="sbg wash-c" y={150} scale={0.1} />
      </div>

      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal as="p" className="eyebrow">
              <span className="hx" />
              {eyebrow}
            </Reveal>
            <Reveal as="h2" d={1} className="sec-title" id="partnersTitle">
              {title}
              <span className="alt">{titleAlt}</span>
            </Reveal>
          </div>
          <Reveal as="p" d={2}>
            {lead}
          </Reveal>
        </div>

        <Reveal>
          <div
            ref={ref}
            className={`comb${lit ? ' lit' : ''}`}
            style={{
              ['--cw' as string]: `${cw.toFixed(2)}px`,
              ['--ch' as string]: `${(cw * 1.1547).toFixed(2)}px`,
              ['--cols' as string]: cols,
            }}
          >
            {rows.map((row, ri) => (
              <div key={ri} className={`comb-row${ri % 2 ? ' odd' : ''}`}>
                {row.map((p, ci) => (
                  <div
                    key={ci}
                    className={`comb-cell ${p ? 'filled' : 'blank'}`}
                    style={{ ['--i' as string]: ri * cols + ci }}
                  >
                    <span className="face">
                      {p ? (
                        p.logo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.logo} alt={nameOf(p)} loading="lazy" decoding="async" />
                        ) : (
                          <Mark name={nameOf(p)} />
                        )
                      ) : null}
                    </span>
                    <span className="glint" aria-hidden="true" />
                    {p ? (
                      <>
                        {/* the stand-in wordmark already spells the name — a
                            caption under it would just repeat itself */}
                        {p.logo ? <span className="name">{nameOf(p)}</span> : null}
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={nameOf(p)}
                          />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="p" className="partners-note">
          {note}
        </Reveal>

        <Reveal style={{ textAlign: 'center', marginTop: 26 }}>
          <a className="btn btn-g" href="#contact">
            <span>{cta}</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
