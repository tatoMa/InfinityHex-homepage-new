'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/* ------------------------------------------------------------------ *
 * One rAF loop for the whole page.
 *
 * Every animated component subscribes here instead of starting its own
 * requestAnimationFrame, so N components cost one callback chain, and the
 * loop stops entirely when nothing is subscribed or the tab is hidden.
 * ------------------------------------------------------------------ */

type FrameFn = (dt: number, now: number) => void

const subs = new Set<FrameFn>()
let running = false
let last = 0

function loop(now: number) {
  const dt = Math.min(64, now - last)
  last = now
  for (const fn of subs) fn(dt, now)
  if (subs.size) requestAnimationFrame(loop)
  else running = false
}

function start() {
  if (running || typeof window === 'undefined') return
  running = true
  last = performance.now()
  requestAnimationFrame(loop)
}

/* ------------------------------------------------------------------ *
 * Shared scroll state.
 *
 * Five components used to each attach a scroll listener that called
 * getBoundingClientRect — five forced layouts per scroll event, which is
 * exactly the recipe for stuttery scrolling. Now ONE passive listener does
 * nothing but record a number; every geometry read happens once per frame
 * inside the rAF loop below, where it is naturally batched.
 * ------------------------------------------------------------------ */
export const scrollState = { y: 0, vh: 0, vw: 0, max: 1 }

if (typeof window !== 'undefined') {
  const read = () => {
    scrollState.y = window.scrollY || 0
    scrollState.vh = window.innerHeight
    scrollState.vw = window.innerWidth
    scrollState.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  }
  read()
  window.addEventListener('scroll', () => {
    scrollState.y = window.scrollY || 0
  }, { passive: true })
  window.addEventListener('resize', read, { passive: true })
}

/** Subscribe to the shared frame loop. `fn` is kept in a ref, so it can close
 *  over fresh state without resubscribing. */
export function useFrame(fn: FrameFn, enabled = true) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!enabled) return
    const wrapped: FrameFn = (dt, now) => ref.current(dt, now)
    subs.add(wrapped)
    start()
    return () => {
      subs.delete(wrapped)
    }
  }, [enabled])
}

/* ------------------------------------------------------------------ *
 * Motion gate
 * ------------------------------------------------------------------ */

interface MotionCtx {
  motion: boolean
  ready: boolean
}
const Ctx = createContext<MotionCtx>({ motion: true, ready: false })

export function useMotion() {
  return useContext(Ctx)
}

/**
 * Motion is driven purely by the OS setting (`prefers-reduced-motion`).
 * There is no in-page toggle — visitors who want less motion already told
 * their system so, and we honour that without adding UI noise.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  // Server and first client render agree on `true`; the real preference is
  // applied in an effect, so there is no hydration mismatch.
  const [motion, setMotion] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setMotion(!mq.matches)
    setReady(true)
    const onChange = (e: MediaQueryListEvent) => setMotion(!e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('no-mo', !motion)
  }, [motion])

  return <Ctx.Provider value={{ motion, ready }}>{children}</Ctx.Provider>
}

/* ------------------------------------------------------------------ *
 * Small shared helpers
 * ------------------------------------------------------------------ */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
