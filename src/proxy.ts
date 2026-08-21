import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALE_COOKIE, isLocale, locales, matchLocale } from './i18n/config'

const PUBLIC_FILE = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|webmanifest|json)$/i

/**
 * Locale routing (Next 16 renamed `middleware` → `proxy`).
 *
 *   /            → /zh or /en, chosen from a saved cookie, else Accept-Language
 *   /games/x     → /<locale>/games/x
 *
 * Also mirrors the Global Privacy Control signal into a request header so
 * server components can treat GPC as a valid opt-out (required by CPRA and
 * several US state privacy laws).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const gpc = request.headers.get('sec-gpc') === '1'
  const withGpc = (res: NextResponse) => {
    if (gpc) res.headers.set('x-gpc', '1')
    return res
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return withGpc(NextResponse.next())
  }

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (hasLocale) {
    const res = NextResponse.next()
    const current = pathname.split('/')[1]
    // Remember an explicit choice so the next visit skips detection.
    if (isLocale(current) && request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      res.cookies.set(LOCALE_COOKIE, current, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
    return withGpc(res)
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = isLocale(saved)
    ? saved
    : matchLocale(request.headers.get('accept-language'))

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search
  return withGpc(NextResponse.redirect(url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
