'use client'

import { useEffect, useRef, useState } from 'react'
import CardFan, { type FanItem } from './CardFan'
import HexField from './HexField'
import HeroProps from './HeroProps'
import { clamp, easeOutExpo, lerp, scrollState, useFrame, useMotion } from '../Motion'
import { HEX_INNER, HEX_OUTER, INFINITY } from '../mark'
import { BRAND } from '@/brand'
import type { Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

const Arrow = () => (
  <svg
    className="arw"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h13M12 5l7 7-7 7" />
  </svg>
)

function Line({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span className="h1-wrap">
      <span className={`h1-line${accent ? ' h1-accent' : ''}`}>
        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            className={`ch${ch === ' ' ? ' sp' : ''}`}
            style={{ transitionDelay: `${(0.18 + (accent ? 0.13 : 0) + i * 0.055).toFixed(3)}s` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </span>
  )
}

export interface HeroStat {
  key: string
  n: number
  decimals: number
  suffix: string
  label: string
  sub: string
}

export default function Hero({
  t,
  locale,
  items,
  stats,
  titles,
  campaigns,
}: {
  t: Dict
  locale: Locale
  items: FanItem[]
  /** derived from content/games/*.md, not hand-typed */
  stats: HeroStat[]
  titles: number
  campaigns: number
}) {
  const [ready, setReady] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rollerRef = useRef<HTMLSpanElement>(null)
  const { motion } = useMotion()

  /* ---- entrance ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  /* ---- one continuous ink gradient across the accent line ----
     background-clip:text cannot reach through child spans, so each glyph
     paints its own slice with a JS-computed offset. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const layout = () => {
      root.querySelectorAll<HTMLElement>('.h1-accent').forEach((line) => {
        const box = line.getBoundingClientRect()
        if (!box.width) return
        line.querySelectorAll<HTMLElement>('.ch').forEach((ch) => {
          const off = ch.getBoundingClientRect().left - box.left
          ch.style.setProperty('--lw', `${(box.width * 2).toFixed(1)}px`)
          ch.style.setProperty('--bp0', `${(-off).toFixed(1)}px`)
          ch.style.setProperty('--bp1', `${(-off - box.width).toFixed(1)}px`)
        })
      })
    }
    layout()
    const timers = [setTimeout(layout, 400), setTimeout(layout, 1600)]
    document.fonts?.ready.then(layout).catch(() => {})
    let rt: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(layout, 140)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
    }
  }, [locale])

  /* ---- word roller ---- */
  useEffect(() => {
    const el = rollerRef.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('span'))
    if (!nodes.length) return
    let idx = 0
    let widths: number[] = []

    const measure = () => {
      widths = nodes.map((n) => {
        const prev = n.getAttribute('style') ?? ''
        n.setAttribute(
          'style',
          'position:absolute;visibility:hidden;transform:none;opacity:0;white-space:nowrap',
        )
        const w = n.getBoundingClientRect().width
        n.setAttribute('style', prev)
        return Math.ceil(w + 1)
      })
      if (widths[idx]) el.style.width = `${widths[idx]}px`
    }
    measure()
    document.fonts?.ready.then(measure).catch(() => {})
    let rt: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(measure, 160)
    }
    window.addEventListener('resize', onResize, { passive: true })

    nodes[0].classList.add('is-in')
    const iv = setInterval(() => {
      if (document.hidden) return
      const prev = nodes[idx]
      idx = (idx + 1) % nodes.length
      const next = nodes[idx]
      if (widths[idx]) el.style.width = `${widths[idx]}px`
      prev.classList.remove('is-in')
      prev.classList.add('is-out')
      next.classList.remove('is-out')
      requestAnimationFrame(() => next.classList.add('is-in'))
      setTimeout(() => prev.classList.remove('is-out'), 700)
    }, 2900)

    return () => {
      clearInterval(iv)
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
    }
  }, [locale])

  /* ---- number count-up ---- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nums = Array.from(root.querySelectorAll<HTMLElement>('.num'))
    if (!motion) {
      nums.forEach((n) => (n.textContent = n.dataset.to ?? ''))
      return
    }
    const timers = nums.map((n) => {
      const to = parseFloat(n.dataset.to ?? '0')
      const dec = parseInt(n.dataset.dec ?? '0', 10)
      let st: number | null = null
      const run = (now: number) => {
        if (st === null) st = now
        const p = clamp((now - st) / 1700, 0, 1)
        n.textContent = (to * easeOutExpo(p)).toFixed(dec)
        if (p < 1) requestAnimationFrame(run)
      }
      return setTimeout(() => requestAnimationFrame(run), 1250)
    })
    return () => timers.forEach(clearTimeout)
  }, [motion, locale])

  /* ---- scroll hand-off: the hero recedes as the dark catalogue rises ---- */
  const exit = useRef({ cur: 0, tgt: 0, active: false })
  useFrame((dt) => {
    const copy = copyRef.current
    const stage = stageRef.current
    const root = rootRef.current
    if (!copy || !stage || !root) return
    const e = exit.current
    const h = root.offsetHeight || 1
    e.tgt = clamp((scrollState.y - h * 0.35) / (h * 0.65), 0, 1)
    if (!motion) {
      if (e.active) {
        copy.style.cssText = ''
        stage.style.cssText = ''
        stage.style.opacity = '1'
        root.style.setProperty('--field-op', '1')
        e.active = false
      }
      return
    }
    e.cur = lerp(e.cur, e.tgt, 1 - Math.pow(0.0015, dt / 1000))
    if (e.cur < 0.002 && !e.active) return
    e.active = true
    const q = e.cur * e.cur
    copy.style.transform = `translate3d(0,${(-q * 74).toFixed(1)}px,0)`
    copy.style.opacity = clamp(1 - e.cur * 1.1, 0, 1).toFixed(3)
    // The deck does NOT fade. It drifts up with the page and stays fully
    // opaque, so even a sliver of it at the top of the screen still reads as
    // the deck — it only ever leaves by scrolling out of frame.
    stage.style.transform = `translate3d(0,${(-q * 34).toFixed(1)}px,0) scale(${(1 - q * 0.05).toFixed(4)})`
    stage.style.opacity = '1'
    root.style.setProperty('--field-op', clamp(1 - e.cur * 0.9, 0, 1).toFixed(3))
  })

  const [l1, l2] = [t.hero.l1, t.hero.l2]
  // The seal is a 印章, not the logo — but the glyph inside it is the same ∞
  // as the brand mark, so the two always agree. See BRAND.sealGlyph.
  const sealShowsSeal =
    BRAND.sealGlyph === 'seal' || (BRAND.sealGlyph === 'auto' && locale === 'zh')

  return (
    <section
      ref={rootRef}
      className={`hero${ready ? ' ready' : ''}`}
      id="top"
      aria-labelledby="heroTitle"
      style={{ ['--field-op' as string]: 1 }}
    >
      <span className="meander" aria-hidden="true" />
      <div style={{ opacity: 'var(--field-op,1)', position: 'absolute', inset: 0, zIndex: -1 }}>
        <HexField />
      </div>
      <HeroProps />

      <div className="hero-grid">
        <div className="hero-copy" ref={copyRef}>
          <p className="hero-kicker">
            <span className="pill">{t.hero.est.replace('{c}', String(campaigns))}</span>
            <span className="txt">{t.hero.kicker.replace('{n}', String(titles))}</span>
          </p>

          <h1 className="hero-h1" id="heroTitle">
            <Line text={l1} />
            <br />
            <Line text={l2} accent />
            <span className="seal" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <path d={HEX_OUTER} fill="#C8352B" />
                <path d={HEX_INNER} fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.8" />
                {sealShowsSeal ? (
                  <>
                    <text x="50" y="43" textAnchor="middle" fontFamily="Noto Serif SC,Songti SC,serif" fontWeight="900" fontSize="27" fill="#fff">
                      向量
                    </text>
                    <text x="50" y="73" textAnchor="middle" fontFamily="Noto Serif SC,Songti SC,serif" fontWeight="900" fontSize="27" fill="#fff">
                      之印
                    </text>
                  </>
                ) : (
                  /* the same ∞ as the logo mark — one source of truth, and
                     symmetric now that it is generated rather than eyeballed */
                  <path d={INFINITY} fill="none" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" />
                )}
              </svg>
            </span>
            <span className="vh">{locale === 'zh' ? `${t.brand.en} ${t.brand.cn}` : t.brand.en}</span>
          </h1>

          <p className="h1-en" lang={locale === 'zh' ? 'en' : 'zh'}>
            {t.hero.en}
          </p>

          <p className="hero-sub">
            <b>{t.hero.lead}</b>
            <br />
            {t.hero.body}
            <span className="roller" ref={rollerRef} aria-hidden="true">
              {t.hero.rollers.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </span>
            {t.hero.bodyTail}
            <span className="vh">{t.hero.rollers.join('、')}</span>
          </p>

          <div className="hero-cta">
            <a className="btn btn-p" href="#games">
              <span>
                {t.hero.ctaPrimary}
                <Arrow />
              </span>
            </a>
            <a className="btn btn-g" href="#contact">
              <span>{t.hero.ctaSecondary}</span>
            </a>
          </div>

          <div className="hero-stats">
            {stats.map((s) => (
              <div className="stat" key={s.key}>
                <b>
                  <span className="num" data-to={String(s.n)} data-dec={String(s.decimals)}>
                    0
                  </span>
                  <span className="suf">{s.suffix}</span>
                </b>
                <span>
                  {s.label}
                  <em>{s.sub}</em>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div ref={stageRef}>
          <CardFan items={items} locale={locale} hint={t.hero.dragHint} label={t.games.title} />
        </div>
      </div>

      <div className="cue" aria-hidden="true">
        <span>{t.hero.scroll}</span>
        <span className="rail" />
      </div>
    </section>
  )
}
