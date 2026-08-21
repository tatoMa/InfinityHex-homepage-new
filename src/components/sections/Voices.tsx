'use client'

import { useEffect, useRef, useState } from 'react'
import Reveal from '../Reveal'
import Parallax from '../Parallax'
import { useFrame, useMotion } from '../Motion'
import type { Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

export interface Voice {
  id: string
  quote: Record<Locale, string>
  name: Record<Locale, string>
  role: Record<Locale, string>
  org: Record<Locale, string>
  project?: Record<Locale, string>
  photo?: string
  color?: string
  /** true → shows a "sample content" chip; delete once the quote is approved */
  sample?: boolean
}

const DWELL = 7200

/**
 * 众口 — what partners say.
 *
 * A round table of speakers: their portraits sit in a row of hex tokens and
 * the quote above cross-fades as the table turns. It advances itself, and the
 * bar under the quote shows how long the current speaker still has — but any
 * token can be clicked or tabbed to, and the moment a visitor touches the row
 * the timer stops, because nothing is ruder than a carousel that moves while
 * you are reading it.
 *
 * The rotation is driven by the shared frame loop (one accumulator, no
 * `setInterval` drifting against the animation clock) and stops entirely when
 * the section is off screen or the OS asks for reduced motion.
 */
export default function Voices({
  t,
  locale,
  items,
}: {
  t: Dict
  locale: Locale
  items: Voice[]
}) {
  const [i, setI] = useState(0)
  const [live, setLive] = useState(false)
  const [held, setHeld] = useState(false)
  const secRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const acc = useRef(0)
  const { motion } = useMotion()

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const io = new IntersectionObserver((e) => setLive(e[0].isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useFrame((dt) => {
    if (!live || held || !motion || items.length < 2) return
    acc.current += dt
    if (barRef.current)
      barRef.current.style.width = `${Math.min(100, (acc.current / DWELL) * 100).toFixed(1)}%`
    if (acc.current >= DWELL) {
      acc.current = 0
      setI((n) => (n + 1) % items.length)
    }
  })

  const pick = (n: number) => {
    acc.current = 0
    if (barRef.current) barRef.current.style.width = '0%'
    setI(n)
  }

  if (!items.length) return null
  const cur = items[i]

  return (
    <section className="sec voices" id="voices" ref={secRef} aria-labelledby="voicesTitle">
      <div className="sec-bg" aria-hidden="true">
        <Parallax className="sbg wash-c" y={-110} scale={0.14} />
        <Parallax className="sbg wash-a" y={90} scale={0.1} />
      </div>

      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal as="p" className="eyebrow">
              <span className="hx" />
              {t.voices.eyebrow}
            </Reveal>
            <Reveal as="h2" d={1} className="sec-title" id="voicesTitle">
              {t.voices.title}
              <span className="alt">{t.voices.titleEn}</span>
            </Reveal>
          </div>
          <Reveal as="p" d={2}>
            {t.voices.lead}
          </Reveal>
        </div>

        <Reveal>
          <div
            className="voices-stage"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
          >
            <div className="voice-quotes">
              {items.map((v, n) => (
                <figure
                  key={v.id}
                  className={`voice${n === i ? ' on' : ''}`}
                  style={{ ['--vc' as string]: v.color ?? 'var(--cinnabar)' }}
                  aria-hidden={n === i ? undefined : true}
                  {...(n === i ? {} : { inert: true as unknown as boolean })}
                >
                  <span className="voice-mark" aria-hidden="true">
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50 6 92 30v48L50 102 8 78V30z" opacity=".14" />
                      <path d="M36 40h12l-6 18h8v18H32V58zm22 0h12l-6 18h8v18H54V58z" />
                    </svg>
                  </span>
                  <blockquote>{v.quote[locale]}</blockquote>
                  <figcaption>
                    {v.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="voice-face" src={v.photo} alt="" loading="lazy" decoding="async" />
                    ) : null}
                    <span className="voice-who">
                      <b>{v.name[locale]}</b>
                      <span>
                        {v.role[locale]} · {v.org[locale]}
                      </span>
                    </span>
                    <span className="voice-tags">
                      {v.project ? <span className="voice-chip">{v.project[locale]}</span> : null}
                      {v.sample ? <span className="ph-chip">{t.voices.sample}</span> : null}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="voice-bar" aria-hidden="true">
              <b ref={barRef} />
            </div>

            <ol className="voice-picks" role="tablist" aria-label={t.voices.title}>
              {items.map((v, n) => (
                <li key={v.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={n === i}
                    className={n === i ? 'on' : ''}
                    style={{ ['--vc' as string]: v.color ?? 'var(--cinnabar)' }}
                    onClick={() => pick(n)}
                  >
                    {v.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={v.photo} alt="" loading="lazy" decoding="async" />
                    ) : null}
                    <span className="vh">
                      {v.name[locale]} — {v.org[locale]}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal style={{ textAlign: 'center', marginTop: 30 }}>
          <a className="btn btn-g" href="#contact">
            <span>{t.voices.cta}</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
