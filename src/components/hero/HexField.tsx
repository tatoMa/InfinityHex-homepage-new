'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useMotion } from '../Motion'

interface Cell {
  x: number
  y: number
  ph: number
}
interface Ripple {
  x: number
  y: number
  t: number
  sp: number
  amp: number
  life: number
  c: string
}

const COLS = ['200,53,43', '31,110,100', '217,164,65', '61,90,128']

/**
 * The soft vignette that keeps the lattice out of the headline's way.
 * It used to be a CSS mask-image; that made the browser re-composite a
 * full-viewport masked layer on every frame and was, by a wide margin, the
 * most expensive thing on the page. Same curve, now baked into the alpha we
 * paint with — free.
 */
function fade(x: number, y: number, W: number, H: number): number {
  const narrow = W < 680
  const cx = (narrow ? 0.5 : 0.24) * W
  const cy = (narrow ? 0.3 : 0.44) * H
  const rx = (narrow ? 1.2 : 0.86) * W
  const ry = (narrow ? 0.6 : 0.66) * H
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  const d = Math.sqrt(dx * dx + dy * dy)
  if (d >= 0.88) return 1
  if (d <= 0.38) return 0.06 + (d / 0.38) * (0.34 - 0.06)
  if (d <= 0.66) return 0.34 + ((d - 0.38) / 0.28) * (0.8 - 0.34)
  return 0.8 + ((d - 0.66) / 0.22) * 0.2
}

/**
 * The living hex table.
 *
 * Two canvases: `hexbase` holds the static lattice and is painted once per
 * resize; `hexfield` above it repaints only the cells that are lit. That keeps
 * the per-frame cost proportional to the *light*, not to the grid.
 */
export default function HexField() {
  const baseRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    dpr: 1,
    W: 0,
    H: 0,
    S: 32,
    cells: [] as Cell[],
    rip: [] as Ripple[],
    px: -9999,
    py: -9999,
    on: false,
    visible: true,
    auto: 0,
    painted: false,
    t0: 0,
  })
  const { motion } = useMotion()

  useEffect(() => {
    const base = baseRef.current
    const field = fieldRef.current
    if (!base || !field) return
    const s = state.current
    s.t0 = performance.now()
    const bctx = base.getContext('2d')
    if (!bctx) return

    function path(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      c.moveTo(x + r * Math.cos(-Math.PI / 2), y + r * Math.sin(-Math.PI / 2))
      for (let i = 1; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 90)
        c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a))
      }
      c.closePath()
    }

    function build() {
      const el = fieldRef.current
      const bs = baseRef.current
      if (!el || !bs || !bctx) return
      // a decorative layer does not need full retina density
      s.dpr = Math.min(1.5, window.devicePixelRatio || 1)
      const r = el.getBoundingClientRect()
      s.W = Math.max(1, r.width)
      s.H = Math.max(1, r.height)
      el.width = bs.width = Math.round(s.W * s.dpr)
      el.height = bs.height = Math.round(s.H * s.dpr)
      s.S = s.W < 680 ? 26 : s.W < 1200 ? 30 : 34

      const hw = Math.sqrt(3) * s.S
      const vh = 1.5 * s.S
      const cells: Cell[] = []
      for (let row = -1; row * vh < s.H + s.S * 2; row++) {
        const oy = row * vh
        const ox = row % 2 ? hw / 2 : 0
        for (let col = -1; col * hw + ox < s.W + hw; col++) {
          const x = col * hw + ox
          cells.push({ x, y: oy, ph: x * 0.0055 + oy * 0.0072 })
        }
      }
      s.cells = cells

      bctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
      bctx.clearRect(0, 0, s.W, s.H)
      bctx.lineWidth = 1
      // one stroke pass per fade band keeps this to a handful of draw calls
      for (let band = 0; band < 6; band++) {
        const lo = band / 6
        const hi = (band + 1) / 6
        const a = ((lo + hi) / 2) * 0.055
        bctx.beginPath()
        let any = false
        for (const c of cells) {
          const fv = fade(c.x, c.y, s.W, s.H)
          if (fv < lo || fv >= hi) continue
          path(bctx, c.x, c.y, s.S * 0.94)
          any = true
        }
        if (!any) continue
        bctx.strokeStyle = `rgba(22,24,31,${a.toFixed(4)})`
        bctx.stroke()
      }
    }
    ;(build as unknown as { path?: unknown }).path = path

    build()
    window.addEventListener('resize', build, { passive: true })

    let lastSpawn = 0
    const spawn = (x: number, y: number, strong: boolean) => {
      if (s.rip.length > 5) s.rip.shift()
      s.rip.push({
        x,
        y,
        t: 0,
        sp: strong ? 0.62 : 0.34,
        amp: strong ? 1 : 0.62,
        life: strong ? 1500 : 2600,
        c: COLS[(Math.random() * COLS.length) | 0],
      })
    }
    const onMove = (e: PointerEvent) => {
      const el = fieldRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      s.px = e.clientX - r.left
      s.py = e.clientY - r.top
      s.on = s.py > -60 && s.py < s.H + 60
      const n = performance.now()
      if (s.on && n - lastSpawn > 340) {
        lastSpawn = n
        spawn(s.px, s.py, false)
      }
    }
    const onDown = (e: PointerEvent) => {
      const el = fieldRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (e.clientY - r.top < s.H) spawn(e.clientX - r.left, e.clientY - r.top, true)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })

    const io = new IntersectionObserver(
      (en) => {
        s.visible = en[0].isIntersecting
        // hide the layers outright when the hero is gone, so the compositor
        // stops carrying two viewport-sized surfaces around
        fieldRef.current?.classList.toggle('off', !s.visible)
        baseRef.current?.classList.toggle('off', !s.visible)
      },
      { threshold: 0 },
    )
    io.observe(field)

    const onHide = () => {
      if (document.hidden) s.rip.length = 0
    }
    document.addEventListener('visibilitychange', onHide)

    return () => {
      window.removeEventListener('resize', build)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onHide)
      io.disconnect()
    }
  }, [])

  useFrame((dt, now) => {
    const el = fieldRef.current
    const s = state.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx || !s.visible) return

    if (!motion) {
      if (s.painted) {
        ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
        ctx.clearRect(0, 0, s.W, s.H)
        s.painted = false
      }
      return
    }

    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
    ctx.clearRect(0, 0, s.W, s.H)
    s.painted = true

    s.auto += dt
    if (s.auto > 2200) {
      s.auto = 0
      if (s.rip.length > 5) s.rip.shift()
      s.rip.push({
        x: Math.random() * s.W,
        y: Math.random() * s.H,
        t: 0,
        sp: 0.34,
        amp: 0.62,
        life: 2600,
        c: COLS[(Math.random() * COLS.length) | 0],
      })
    }
    for (let i = s.rip.length - 1; i >= 0; i--) {
      s.rip[i].t += dt
      if (s.rip[i].t > s.rip[i].life) s.rip.splice(i, 1)
    }

    const tm = (now - s.t0) / 1000
    const nR = s.rip.length
    for (const cell of s.cells) {
      let v = 0
      let col = '22,24,31'

      const wave = Math.sin(cell.ph - tm * 0.55)
      if (wave > 0.86) v += (wave - 0.86) * 1.9

      if (s.on) {
        const dx = cell.x - s.px
        const dy = cell.y - s.py
        const d2 = dx * dx + dy * dy
        if (d2 < 30000) v += (1 - Math.sqrt(d2) / 173) * 0.55
      }
      for (let k = 0; k < nR; k++) {
        const R = s.rip[k]
        const rad = R.t * R.sp
        const dx = cell.x - R.x
        const dy = cell.y - R.y
        const band = Math.abs(Math.sqrt(dx * dx + dy * dy) - rad)
        if (band < 46) {
          const e = (1 - band / 46) * (1 - R.t / R.life) * R.amp
          if (e > 0.02) {
            v += e
            col = R.c
          }
        }
      }
      if (v < 0.03) continue
      if (v > 1) v = 1
      v *= fade(cell.x, cell.y, s.W, s.H)
      if (v < 0.02) continue

      const r = s.S * 0.9 * (0.72 + 0.28 * v)
      ctx.beginPath()
      ctx.moveTo(cell.x, cell.y - r)
      for (let i = 1; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 90)
        ctx.lineTo(cell.x + r * Math.cos(a), cell.y + r * Math.sin(a))
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(${col},${(v * 0.2).toFixed(3)})`
      ctx.fill()
      ctx.strokeStyle = `rgba(${col},${(v * 0.5).toFixed(3)})`
      ctx.lineWidth = 1.1
      ctx.stroke()
    }
  })

  return (
    <>
      <canvas ref={baseRef} className="hexbase" aria-hidden="true" />
      <canvas ref={fieldRef} className="hexfield" aria-hidden="true" />
    </>
  )
}
