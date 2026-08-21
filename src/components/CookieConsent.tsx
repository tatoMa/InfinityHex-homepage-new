'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

/* ------------------------------------------------------------------ *
 * Cookie consent
 *
 * Built to satisfy the strict (EU/UK) reading as the baseline, which also
 * covers the US state laws:
 *
 *  - Nothing non-essential is set, or loaded, before an explicit opt-in.
 *  - Categories are granular and default to OFF (no pre-ticked boxes).
 *  - "Reject all" is exactly as prominent and as easy as "Accept all".
 *  - The choice is revocable at any time from a persistent footer link.
 *  - Consent is versioned and time-stamped so it can be re-collected.
 *  - A Global Privacy Control signal is treated as a valid opt-out
 *    (CPRA / Colorado / Connecticut), applied automatically.
 *
 * Wire your analytics to the `ihx:consent` event or read
 * `window.__ihxConsent` — never load a tag unconditionally.
 * ------------------------------------------------------------------ */

export const CONSENT_COOKIE = 'ihx_consent'
const CONSENT_VERSION = 1

export interface Consent {
  v: number
  ts: number
  analytics: boolean
  marketing: boolean
  gpc?: boolean
}

declare global {
  interface Window {
    __ihxConsent?: Consent
  }
}

function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  if (!m) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(m[1])) as Consent
    return parsed.v === CONSENT_VERSION ? parsed : null
  } catch {
    return null
  }
}

function writeConsent(c: Consent) {
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax` +
    (location.protocol === 'https:' ? '; secure' : '')
  window.__ihxConsent = c
  window.dispatchEvent(new CustomEvent<Consent>('ihx:consent', { detail: c }))
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('ihx:open-cookies'))
}

export default function CookieConsent({ t, locale }: { t: Dict; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [gpc, setGpc] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const signal =
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
    setGpc(signal)

    const saved = readConsent()
    if (saved) {
      window.__ihxConsent = saved
      setAnalytics(saved.analytics)
      setMarketing(saved.marketing)
      return
    }
    if (signal) {
      // A GPC signal is itself a valid opt-out: record it, do not nag.
      writeConsent({ v: CONSENT_VERSION, ts: Date.now(), analytics: false, marketing: false, gpc: true })
      return
    }
    const id = setTimeout(() => setOpen(true), 700)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const reopen = () => {
      const saved = readConsent()
      setAnalytics(saved?.analytics ?? false)
      setMarketing(saved?.marketing ?? false)
      setDetail(true)
      setOpen(true)
    }
    window.addEventListener('ihx:open-cookies', reopen)
    return () => window.removeEventListener('ihx:open-cookies', reopen)
  }, [])

  useEffect(() => {
    if (!open) return
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab') return
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled])',
      )
      if (!nodes?.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        last.focus()
        e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus()
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const decide = useCallback((a: boolean, m: boolean) => {
    writeConsent({ v: CONSENT_VERSION, ts: Date.now(), analytics: a, marketing: m })
    setAnalytics(a)
    setMarketing(m)
    setOpen(false)
    setDetail(false)
  }, [])

  if (!open) return null
  const c = t.cookie

  return (
    <>
      <div className={`cc-scrim${open ? ' show' : ''}`} onClick={() => setOpen(false)} />
      <div
        ref={panelRef}
        className={`cc${open ? ' show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-title"
        aria-describedby="cc-body"
        lang={locale}
      >
        <h2 id="cc-title">{c.title}</h2>
        <p id="cc-body">{c.body}</p>
        {gpc ? <p className="gpc">{c.gpcNotice}</p> : null}

        {detail ? (
          <div className="cc-cats">
            <div className="cc-cat">
              <div>
                <b>{c.categories.necessary.t}</b>
                <p>{c.categories.necessary.d}</p>
              </div>
              <span className="always">{c.categories.necessary.always}</span>
            </div>

            <div className="cc-cat">
              <div>
                <b>{c.categories.analytics.t}</b>
                <p>{c.categories.analytics.d}</p>
              </div>
              <label className="sw">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label={c.categories.analytics.t}
                />
                <span />
              </label>
            </div>

            <div className="cc-cat">
              <div>
                <b>{c.categories.marketing.t}</b>
                <p>{c.categories.marketing.d}</p>
              </div>
              <label className="sw">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  aria-label={c.categories.marketing.t}
                />
                <span />
              </label>
            </div>
          </div>
        ) : null}

        <div className="cc-acts">
          {/* Accept and Reject are the same size, weight and position:
              rejecting must never be harder than accepting. */}
          <button ref={firstRef} type="button" className="btn btn-p" onClick={() => decide(true, true)}>
            <span>{c.acceptAll}</span>
          </button>
          <button type="button" className="btn btn-p" onClick={() => decide(false, false)}>
            <span>{c.rejectAll}</span>
          </button>
          {detail ? (
            <button type="button" className="btn btn-g" onClick={() => decide(analytics, marketing)}>
              <span>{c.save}</span>
            </button>
          ) : (
            <button type="button" className="btn btn-g" onClick={() => setDetail(true)}>
              <span>{c.customise}</span>
            </button>
          )}
        </div>

        <p style={{ marginTop: 14 }}>
          <Link className="cc-link" href={`/${locale}/legal/cookies`}>
            {c.policy}
          </Link>
        </p>
      </div>
    </>
  )
}
