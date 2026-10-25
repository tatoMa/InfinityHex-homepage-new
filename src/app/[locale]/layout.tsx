import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MotionProvider } from '@/components/Motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import { getAllGames } from '@/lib/games'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'

import '@/styles/base.css'
import '@/styles/hero.css'
import '@/styles/sections.css'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDict(locale)
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      languages: { zh: '/zh', en: '/en', 'x-default': '/zh' },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const l = locale as Locale
  const t = getDict(l)
  const games = await getAllGames()
  // Use the supplied PNG explicitly, even when other logo formats exist.
  const logo = '/logo.png'

  return (
    <html lang={l === 'zh' ? 'zh-CN' : 'en'} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@400;500;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;1,6..96,500&display=swap"
        />
        <meta name="theme-color" content="#F8F3E9" />
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        <MotionProvider>
          <a className="skip" href="#main">
            {t.a11y.skip}
          </a>
          <Header locale={l} t={t} logo={logo} />
          <main id="main">{children}</main>
          <Footer
            logo={logo}
            locale={l}
            t={t}
            games={games.map((g) => ({ slug: g.slug, title: g.title[l] }))}
          />
          <CookieConsent locale={l} t={t} />
        </MotionProvider>
      </body>
    </html>
  )
}
