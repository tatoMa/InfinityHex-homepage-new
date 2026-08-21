'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { clamp, easeOutExpo, lerp, useFrame, useMotion } from '../Motion'

export interface FanItem {
  slug: string
  title: string
  sub: string
  tag: string
  cover: string
}

/* Where a card is fully faded out, and how long the fade takes — in arc
   slots. A wide fade is what removes the "pop" at the wrap seam. */
const EDGE = 3.2
const FADE = 1.9

interface CardState {
  el: HTMLButtonElement
  i: number
  dp: number
  hot: number
  delay: number
}

/**
 * 发牌弧 — the deck deals itself into an arc, breathes on a slightly tilted
 * table plane, parts around whichever card you point at, and can be dragged
 * or driven with the arrow keys. Geometry is derived from the container so it
 * never spills out of its column.
 */
export default function CardFan({
  items,
  locale,
  hint,
  label,
}: {
  items: FanItem[]
  locale: string
  hint: string
  label: string
}) {
  const fanRef = useRef<HTMLDivElement>(null)
  const swayRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<CardState[]>([])
  const router = useRouter()
  const { motion } = useMotion()

  const s = useRef({
    offset: 0,
    target: 0,
    vel: 0,
    hover: -1,
    paused: false,
    dragging: false,
    moved: false,
    px: 0,
    born: 0,
    step: 8.8,
    onScreen: true,
  })

  useEffect(() => {
    s.current.born = performance.now()
    const el = fanRef.current
    if (!el || !('IntersectionObserver' in window)) return
    // threshold 0: as long as ANY part of the deck is on screen it keeps
    // living. It idles only once it is fully gone.
    const io = new IntersectionObserver((en) => (s.current.onScreen = en[0].isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const N = items.length

  function geo() {
    const fan = fanRef.current
    if (!fan) return 400
    const w = fan.clientWidth || 1
    s.current.step = w < 460 ? 10.5 : w < 760 ? 11.8 : 12.6
    return clamp(Math.min(w * 0.78, fan.clientHeight * 1.9), 360, 980)
  }

  const wrap = (p: number) => (((p + N / 2) % N) + N) % N - N / 2

  /* Smooth in, smooth out. A linear ramp makes a card "appear"; an eased one
     makes it arrive. */
  const smooth = (t: number) => {
    const x = clamp(t, 0, 1)
    return x * x * (3 - 2 * x)
  }

  function place(c: CardState, p: number, R: number, dp: number, hot: number) {
    const pp = p * dp
    const th = (pp * s.current.step * Math.PI) / 180
    const x = Math.sin(th) * R
    const y = (1 - Math.cos(th)) * R
    const ad = Math.abs(pp)

    // How "present" this card is: 1 at the front of the arc, easing to 0 well
    // before the wrap seam. Everything else rides on this one value, so a card
    // fades, shrinks and recedes together instead of blinking in at full size.
    const life = smooth((EDGE - ad) / FADE)

    const z = -ad * 46 + hot * 120 - (1 - life) * 190
    const sc = (0.9 + 0.1 * dp - ad * 0.016 + hot * 0.06) * (0.84 + 0.16 * life)
    const op = life * dp

    const el = c.el
    el.style.opacity = op.toFixed(3)
    // No z-index. The fan lives in a preserve-3d context, so the browser sorts
    // the cards by their actual translateZ — which changes continuously as the
    // arc drifts. Stepping an integer z-index instead is what made cards
    // visibly pop between layers mid-scroll.
    el.style.visibility = op < 0.004 ? 'hidden' : 'visible'
    el.style.transform =
      `translate3d(${x.toFixed(2)}px,${(y - hot * 30).toFixed(2)}px,${z.toFixed(1)}px)` +
      ` translate(-50%,-50%) rotate(${(pp * s.current.step).toFixed(2)}deg) scale(${sc.toFixed(4)})`
  }

  useFrame((dt, now) => {
    const cards = cardsRef.current
    const sway = swayRef.current
    if (!cards.length || !sway || !s.current.onScreen) return
    const R = geo()
    const st = s.current

    if (!motion) {
      for (const c of cards) place(c, wrap(c.i), R, 1, 0)
      sway.style.transform = 'rotateX(6deg)'
      return
    }

    if (!st.paused && !st.dragging) st.target += dt * 0.00019 * N
    st.offset = lerp(st.offset, st.target, 1 - Math.pow(0.0022, dt / 1000))

    const rz = Math.sin(now / 2600) * 1.15
    const ty = Math.sin(now / 3100) * 6
    const rx = 7 + Math.sin(now / 4300) * 1.6
    sway.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(3)}deg)`

    for (const c of cards) {
      const age = now - st.born - c.delay
      c.dp = clamp(easeOutExpo(clamp(age / 1150, 0, 1)), 0, 1)
      c.hot = lerp(c.hot, c.i === st.hover ? 1 : 0, 1 - Math.pow(0.0009, dt / 1000))

      let p = wrap(c.i - st.offset)
      if (st.hover > -1 && c.i !== st.hover) {
        const gap = p - wrap(st.hover - st.offset)
        if (Math.abs(gap) < 3.2) p += (gap > 0 ? 1 : -1) * 0.34 * (1 - Math.abs(gap) / 3.2)
      }
      place(c, p, R, c.dp, c.hot)
    }
  })

  function setHot() {
    for (const c of cardsRef.current) c.el.classList.toggle('is-hot', c.i === s.current.hover)
  }

  return (
    <div className="hero-stage">
      <div
        ref={fanRef}
        className="fan"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={-1}
        onPointerEnter={() => (s.current.paused = true)}
        onPointerLeave={() => {
          s.current.paused = false
          s.current.hover = -1
          fanRef.current?.classList.remove('hovering')
          setHot()
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return
          s.current.dragging = true
          s.current.moved = false
          s.current.px = e.clientX
          s.current.vel = 0
          fanRef.current?.classList.add('dragging')
          try {
            fanRef.current?.setPointerCapture(e.pointerId)
          } catch {}
        }}
        onPointerMove={(e) => {
          if (!s.current.dragging) return
          const dx = e.clientX - s.current.px
          s.current.px = e.clientX
          if (Math.abs(dx) > 1) s.current.moved = true
          const d = -dx / 74
          s.current.target += d
          s.current.offset += d
          s.current.vel = d
        }}
        onPointerUp={() => {
          if (!s.current.dragging) return
          s.current.dragging = false
          fanRef.current?.classList.remove('dragging')
          s.current.target = s.current.offset + s.current.vel * 11
        }}
        onPointerCancel={() => {
          s.current.dragging = false
          fanRef.current?.classList.remove('dragging')
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            s.current.target += 1
            e.preventDefault()
          } else if (e.key === 'ArrowLeft') {
            s.current.target -= 1
            e.preventDefault()
          }
        }}
      >
        <span className="fan-plate" aria-hidden="true" />
        <div ref={swayRef} className="fan-sway">
          {items.map((g, i) => (
            <button
              key={g.slug}
              type="button"
              className="card"
              aria-label={`${g.title} ${g.sub} — ${g.tag}`}
              ref={(el) => {
                if (!el) return
                const found = cardsRef.current.find((c) => c.i === i)
                if (found) found.el = el
                else cardsRef.current.push({ el, i, dp: 0, hot: 0, delay: 260 + i * 74 })
              }}
              onPointerEnter={() => {
                s.current.hover = i
                fanRef.current?.classList.add('hovering')
                setHot()
              }}
              onPointerMove={(e) => {
                if (!motion) return
                const el = e.currentTarget
                const r = el.getBoundingClientRect()
                const nx = (e.clientX - r.left) / r.width - 0.5
                const ny = (e.clientY - r.top) / r.height - 0.5
                el.style.setProperty('--tiltY', `${(nx * 16).toFixed(2)}deg`)
                el.style.setProperty('--tiltX', `${(-ny * 18).toFixed(2)}deg`)
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty('--tiltY', '0deg')
                e.currentTarget.style.setProperty('--tiltX', '0deg')
              }}
              onFocus={() => {
                s.current.hover = i
                s.current.paused = true
                s.current.target = i
                fanRef.current?.classList.add('hovering')
                setHot()
              }}
              onBlur={() => {
                if (!fanRef.current?.matches(':hover')) {
                  s.current.paused = false
                  s.current.hover = -1
                  fanRef.current?.classList.remove('hovering')
                  setHot()
                }
              }}
              onClick={() => {
                if (s.current.moved) return
                router.push(`/${locale}/games/${g.slug}`)
              }}
            >
              <span className="cardface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover}
                  alt=""
                  width={300}
                  height={420}
                  loading={i < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <span className="rim" />
                <span className="gloss" />
                <span className="cap">
                  <b>{g.title}</b>
                  <i>{g.sub}</i>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="fan-hint" aria-hidden="true">
        {hint}
      </p>
    </div>
  )
}
