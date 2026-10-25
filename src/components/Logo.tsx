'use client'

import { useEffect, useRef, useState } from 'react'
import { BRAND } from '@/brand'
import { HEX_INNER, HEX_OUTER, INFINITY } from './mark'

/** Brand mark uses public/logo.png, with an inline fallback on load failure. */
export default function Logo({ size = 40, src = "/logo.png" }: { size?: number; src?: string }) {
  const [failed, setFailed] = useState(!src)
  const imgRef = useRef<HTMLImageElement>(null)

  // Belt and braces: the file could be present but unreadable. A server-
  // rendered <img> can also finish failing before React hydrates, and a
  // replayed error event is not guaranteed — so check on mount too.
  useEffect(() => {
    const el = imgRef.current
    if (el && el.complete && el.naturalWidth === 0) setFailed(true)
  }, [])

  if (src && !failed) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        ref={imgRef}
        className={`brand-mark${BRAND.logoPlate ? ' plated' : ''}`}
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <svg className="brand-mark" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="ihx-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E1594A" />
          <stop offset="1" stopColor="#A3271F" />
        </linearGradient>
      </defs>
      <path d={HEX_OUTER} fill="url(#ihx-mark)" />
      <path d={HEX_INNER} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" />
      <path d={INFINITY} fill="none" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
    </svg>
  )
}
