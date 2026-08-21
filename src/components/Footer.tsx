'use client'

import Link from 'next/link'
import Logo from './Logo'
import { openCookieSettings } from './CookieConsent'
import { SOCIAL, type Dict } from '@/i18n/dict'
import type { Locale } from '@/i18n/config'

const Icon = ({ d }: { d: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
)

const PATHS = {
  discord:
    'M20.3 4.4A19 19 0 0 0 15.7 3l-.2.4a14 14 0 0 1 3.9 2 15 15 0 0 0-12.8 0 14 14 0 0 1 3.9-2L10.3 3a19 19 0 0 0-4.6 1.4C2.8 8.7 2 12.9 2.4 17a19 19 0 0 0 5.7 2.9l1.2-1.7a12 12 0 0 1-1.9-.9l.5-.4a13.5 13.5 0 0 0 11.6 0l.5.4c-.6.4-1.2.7-1.9.9l1.2 1.7a19 19 0 0 0 5.7-2.9c.5-4.8-.8-9-3.7-12.6ZM9 14.6c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Zm6 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Z',
  x: 'M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1-5.7 6.1H1.6l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3Zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3Z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9a3.7 3.7 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.2.4-.3 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.1 3.4c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.3.1-1.7.1-3.4s0-2.1-.1-3.4c-.1-1.1-.2-1.7-.4-2.1a3 3 0 0 0-.8-1.2 3 3 0 0 0-1.2-.8c-.4-.2-1-.3-2.1-.4-1.3-.1-1.7-.1-4.8-.1Zm0 3.1a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.3 3.2 3.2 0 0 0 0-6.3Zm5.2-3.2a1.2 1.2 0 1 1 0 2.3 1.2 1.2 0 0 1 0-2.3Z',
  facebook:
    'M22 12a10 10 0 1 0-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12Z',
}

export default function Footer({
  t,
  locale,
  games,
  logo,
}: {
  t: Dict
  locale: Locale
  games: { slug: string; title: string }[]
  logo?: string
}) {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <Link className="brand" href={`/${locale}`} aria-label={t.a11y.toTop}>
              <Logo src={logo} />
              <span className="brand-txt">
                <span className="brand-cn">{locale === 'zh' ? t.brand.cn : t.brand.en}</span>
                <span className="brand-en">{locale === 'zh' ? t.brand.en : t.brand.tag}</span>
              </span>
            </Link>
            <p style={{ marginTop: 16, color: 'var(--ink-3)', fontSize: 14, maxWidth: '34ch' }}>
              {t.footer.tagline}
            </p>
            <div className="ftr-social">
              <a href={SOCIAL.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <Icon d={PATHS.discord} />
              </a>
              <a href={SOCIAL.x} target="_blank" rel="noopener noreferrer" aria-label="X">
                <Icon d={PATHS.x} />
              </a>
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Icon d={PATHS.instagram} />
              </a>
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Icon d={PATHS.facebook} />
              </a>
            </div>
          </div>

          <div>
            <h4>{t.footer.colGames}</h4>
            <ul>
              {games.slice(0, 5).map((g) => (
                <li key={g.slug}>
                  <Link href={`/${locale}/games/${g.slug}`}>{g.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{t.footer.colCompany}</h4>
            <ul>
              <li>
                <Link href={`/${locale}/about`}>{t.nav.about}</Link>
              </li>
              <li>
                <Link href={`/${locale}#story`}>{t.nav.story}</Link>
              </li>
              <li>
                <Link href={`/${locale}#services`}>{t.nav.services}</Link>
              </li>
              <li>
                <Link href={`/${locale}#history`}>{t.nav.history}</Link>
              </li>
              <li>
                <Link href={`/${locale}#voices`}>{t.nav.voices}</Link>
              </li>
              <li>
                <Link href={`/${locale}#partners`}>{t.nav.partners}</Link>
              </li>
              <li>
                <a href={`mailto:${SOCIAL.email}`}>{SOCIAL.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t.footer.colLegal}</h4>
            <ul>
              <li>
                <Link href={`/${locale}/legal/privacy`}>{t.footer.privacy}</Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/cookies`}>{t.footer.cookies}</Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms`}>{t.footer.terms}</Link>
              </li>
              <li>
                <button type="button" onClick={openCookieSettings}>
                  {t.footer.manageCookies}
                </button>
              </li>
              <li>
                <button type="button" onClick={openCookieSettings}>
                  {locale === 'zh'
                    ? '不出售或共享我的个人信息'
                    : 'Do Not Sell or Share My Personal Information'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="ftr-bot">
          <span>
            © {new Date().getFullYear()}{' '}
            {locale === 'zh' ? `${t.brand.en} ${t.brand.cn}` : t.brand.en} · {t.footer.rights}
          </span>
          <span>{t.footer.madeWith}</span>
        </div>
      </div>
    </footer>
  )
}
