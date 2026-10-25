'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'
import { scrollState, useFrame } from './Motion'
import { LOCALE_COOKIE, type Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

const Arrow = () => (
  <svg
    className="arw"
    width="15"
    height="15"
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

export default function Header({
  locale,
  t,
  logo,
}: {
  locale: Locale
  t: Dict
  logo?: string
}) {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const burgerRef = useRef<HTMLButtonElement>(null)

  // The desktop bar stops before "contact" because the CTA button next to it
  // already goes there; the drawer, which has no CTA, gets the full list.
  // On the home page the anchors work as-is; anywhere else they have to be
  // sent back to the home page first, or "#games" resolves against /about.
  const home = `/${locale}`
  const onHome = pathname === home || pathname === `${home}/`
  const a = (hash: string) => (onHome ? hash : `${home}${hash}`)
  const links = [
    { href: a('#games'), label: t.nav.games },
    { href: a('#services'), label: t.nav.services },
    { href: a('#history'), label: t.nav.history },
    { href: a('#partners'), label: t.nav.partners },
    { href: `${home}/about`, label: t.nav.about },
  ]
  const menuLinks = [
    ...links,
    { href: a('#process'), label: t.nav.process },
    { href: a('#story'), label: t.nav.story },
    { href: a('#contact'), label: t.nav.contact },
  ]

  // reads the shared scroll value in the frame loop — no extra listener,
  // no layout read on the scroll thread
  useFrame(() => {
    const next = scrollState.y > 14
    setStuck((prev) => (prev === next ? prev : next))
  })

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        burgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function switchLocale() {
    const next: Locale = locale === 'zh' ? 'en' : 'zh'
    // 1 year, lax — this is a strictly-necessary preference cookie.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    const rest = pathname.replace(/^\/(zh|en)(?=\/|$)/, '') || '/'
    router.push(`/${next}${rest === '/' ? '' : rest}`)
    router.refresh()
  }

  return (
    <>
      <header className={`hdr${stuck ? ' stuck' : ''}`}>
        <Link className="brand" href={`/${locale}`} aria-label={t.a11y.home}>
          <Logo src={logo} />
          <span className="brand-txt">
            <span className="brand-cn">{locale === 'zh' ? t.brand.cn : t.brand.en}</span>
            <span className="brand-en">{locale === 'zh' ? t.brand.en : t.brand.tag}</span>
          </span>
        </Link>

        <nav className="nav" aria-label={t.a11y.mainNav}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hdr-act">
          <button
            type="button"
            className="lang"
            data-l={locale}
            onClick={switchLocale}
            aria-label={t.a11y.switchTo}
          >
            <span className="knob" aria-hidden="true" />
            <i className={locale === 'zh' ? 'on' : ''} aria-hidden="true">
              中
            </i>
            <i className={locale === 'en' ? 'on' : ''} aria-hidden="true">
              EN
            </i>
          </button>


          <a className="btn btn-p btn-sm" href={a('#contact')}>
            <span>
              {t.nav.contact}
              <Arrow />
            </span>
          </a>

          <button
            ref={burgerRef}
            type="button"
            className="icon-btn burger"
            aria-expanded={open}
            aria-controls="mmenu"
            aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </header>

      <div id="mmenu" className={`mmenu${open ? ' open' : ''}`} inert={!open ? true : undefined}>
        {menuLinks.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <div className="m-foot">
          <button type="button" className="btn btn-g btn-sm" onClick={switchLocale}>
            <span>{t.a11y.switchTo}</span>
          </button>
        </div>
      </div>
    </>
  )
}
