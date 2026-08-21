'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** stagger step, 1–5 → 80ms … 400ms */
  d?: 1 | 2 | 3 | 4 | 5
  as?: ElementType
  className?: string
  style?: React.CSSProperties
  id?: string
}

/** Adds `.in` when the element first scrolls into view, then stops observing. */
export default function Reveal({ children, d, as: Tag = 'div', className = '', ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} data-d={d} {...rest}>
      {children}
    </Tag>
  )
}
