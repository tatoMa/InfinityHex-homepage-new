'use client'

import { useEffect, useRef } from 'react'
import { lerp, scrollState, useFrame, useMotion } from '../Motion'

const Die = ({
  size,
  dur,
  face,
  pip,
  dark,
}: {
  size: number
  dur: number
  face: string
  pip: string
  dark?: boolean
}) => (
  <div style={{ perspective: size * 7 }}>
    <div
      className={`die${dark ? ' dark' : ''}`}
      style={
        {
          '--s': `${size}px`,
          '--dur': `${dur}s`,
          '--dieface': face,
          '--pipcol': pip,
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

const Cube = ({ size, dur, color }: { size: number; dur: number; color: string }) => (
  <div style={{ perspective: size * 9 }}>
    <div
      className="cube"
      style={{ '--s': `${size}px`, '--dur': `${dur}s`, '--cc': color } as React.CSSProperties}
    >
      <i className="a" />
      <i className="b" />
      <i className="c" />
      <i className="d" />
      <i className="e" />
      <i className="f" />
    </div>
  </div>
)

const MEEPLE =
  'M50 6a17 17 0 0 0-13.4 27.4C24.2 37.6 15.6 45.2 10.4 55.6a5 5 0 0 0 3.2 7.1l16.6 4.1c-3.2 8.9-5 18.2-5.2 27.6a4 4 0 0 0 4 3.6h13.8a4 4 0 0 0 4-3.4c.6-4.4 1.7-8.6 3.2-12.6 1.5 4 2.6 8.2 3.2 12.6a4 4 0 0 0 4 3.4H70.9a4 4 0 0 0 4-3.6c-.2-9.4-2-18.7-5.2-27.6l16.6-4.1a5 5 0 0 0 3.2-7.1C84.4 45.2 75.8 37.6 63.4 33.4A17 17 0 0 0 50 6Z'

const Meeple = ({ size, color }: { size: number; color: string }) => (
  <div className="meeple">
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path fill={color} d={MEEPLE} />
    </svg>
  </div>
)

const Token = ({ size, color, dur }: { size: number; color: string; dur: number }) => (
  <div
    className="token"
    style={{ '--s': `${size}px`, '--tc': color, '--dur': `${dur}s` } as React.CSSProperties}
  />
)

/** Board-game components floating on multiple parallax planes. */
export default function HeroProps() {
  const ref = useRef<HTMLDivElement>(null)
  const items = useRef<{ el: HTMLElement; dep: number; x: number; y: number }[]>([])
  const input = useRef({ mx: 0, my: 0 })
  const { motion } = useMotion()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    items.current = Array.from(root.querySelectorAll<HTMLElement>('.prop')).map((el) => ({
      el,
      dep: parseFloat(el.dataset.dep ?? '0.08'),
      x: 0,
      y: 0,
    }))
    const onMove = (e: PointerEvent) => {
      input.current.mx = (e.clientX / window.innerWidth - 0.5) * 2
      input.current.my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((dt) => {
    if (!motion) {
      for (const p of items.current) p.el.style.transform = ''
      return
    }
    const k = 1 - Math.pow(0.004, dt / 1000)
    const { mx, my } = input.current
    const sy = scrollState.y
    for (const p of items.current) {
      p.x = lerp(p.x, -mx * p.dep * 220, k)
      p.y = lerp(p.y, -my * p.dep * 170 + sy * p.dep * 1.5, k)
      p.el.style.transform = `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0)`
    }
  })

  return (
    <div className="props" ref={ref} aria-hidden="true">
      <div className="prop p1" data-dep=".055">
        <div className="inner" style={{ '--bob': '8.5s', '--bobrot': '6deg' } as React.CSSProperties}>
          <Die size={74} dur={24} face="#FCF8F0" pip="#1B1D24" />
          <span className="die-shadow" style={{ '--dur2': '8.5s' } as React.CSSProperties} />
        </div>
      </div>
      <div className="prop p2" data-dep=".10">
        <div className="inner" style={{ '--bob': '6.4s', '--bobrot': '-7deg' } as React.CSSProperties}>
          <Die size={50} dur={17} face="#23262F" pip="#F3EFE6" dark />
          <span className="die-shadow" style={{ '--dur2': '6.4s' } as React.CSSProperties} />
        </div>
      </div>
      <div className="prop p3" data-dep=".075">
        <div className="inner" style={{ '--bob': '7.8s', '--bobrot': '8deg' } as React.CSSProperties}>
          <Cube size={38} dur={20} color="#D9A441" />
        </div>
      </div>
      <div className="prop p4" data-dep=".13">
        <div className="inner" style={{ '--bob': '5.6s', '--bobrot': '-9deg' } as React.CSSProperties}>
          <Meeple size={46} color="#1F6E64" />
        </div>
      </div>
      <div className="prop p5" data-dep=".115">
        <div className="inner" style={{ '--bob': '9.2s', '--bobrot': '-5deg' } as React.CSSProperties}>
          <Meeple size={38} color="#3D5A80" />
        </div>
      </div>
      <div className="prop p6" data-dep=".16">
        <div className="inner" style={{ '--bob': '6.9s', '--bobrot': '10deg' } as React.CSSProperties}>
          <Token size={34} color="#C8352B" dur={12} />
        </div>
      </div>
      <div className="prop p7" data-dep=".09">
        <div className="inner" style={{ '--bob': '8.1s', '--bobrot': '-6deg' } as React.CSSProperties}>
          <Cube size={28} dur={15} color="#1F6E64" />
        </div>
      </div>
      <div className="prop p8" data-dep=".07">
        <div className="inner" style={{ '--bob': '7.2s', '--bobrot': '7deg' } as React.CSSProperties}>
          <Token size={26} color="#D9A441" dur={9.5} />
        </div>
      </div>
    </div>
  )
}
