'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { clamp, scrollState, useFrame, useMotion } from './Motion'

/**
 * A decorative layer that travels at its own rate as the page scrolls.
 *
 * `q` is the layer's signed distance from the middle of the viewport measured
 * in screens: −1 when the layer sits a full screen below the centre, 0 when it
 * is centred, +1 a screen above. Everything else is a multiple of q, so a
 * stack of these separates into planes with a single number each.
 *
 * The element's resting position is measured once (and again whenever the
 * document reflows) rather than every frame — `getBoundingClientRect()`
 * *includes* transforms, so reading it after we have written one would feed
 * the layer's own displacement back into the next frame. Per frame we then
 * write only `transform` / `opacity`, both compositor-only.
 */
export default function Parallax({
  y = 0,
  x = 0,
  rotate = 0,
  scale = 0,
  fade = 0,
  className,
  style,
  children,
  as: As = 'div',
}: {
  /** px of vertical travel per screen of scroll */
  y?: number
  /** px of horizontal travel per screen of scroll */
  x?: number
  /** deg of rotation per screen of scroll */
  rotate?: number
  /** extra scale at the extremes, e.g. 0.12 → 1 … 1.12 */
  scale?: number
  /** opacity lost at the extremes, e.g. 0.4 → 1 … 0.6 */
  fade?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
  as?: 'div' | 'span'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const base = useRef(0)
  const { motion } = useMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const prev = el.style.transform
      el.style.transform = 'none'
      const r = el.getBoundingClientRect()
      base.current = r.top + window.scrollY + r.height / 2
      el.style.transform = prev
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useFrame(() => {
    const el = ref.current
    if (!el) return
    if (!motion) {
      el.style.transform = ''
      el.style.opacity = ''
      return
    }
    const q = clamp(
      (scrollState.y + scrollState.vh / 2 - base.current) / Math.max(1, scrollState.vh),
      -1.4,
      1.4,
    )
    let tf = `translate3d(${(q * x).toFixed(1)}px,${(q * y).toFixed(1)}px,0)`
    if (rotate) tf += ` rotate(${(q * rotate).toFixed(2)}deg)`
    if (scale) tf += ` scale(${(1 + Math.abs(q) * scale).toFixed(4)})`
    el.style.transform = tf
    if (fade) el.style.opacity = (1 - Math.min(1, Math.abs(q)) * fade).toFixed(3)
  })

  return (
    <As
      ref={ref as React.Ref<HTMLDivElement & HTMLSpanElement>}
      className={className}
      style={{ willChange: 'transform', ...style }}
      aria-hidden="true"
    >
      {children}
    </As>
  )
}
