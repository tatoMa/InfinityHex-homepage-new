export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh'

export const LOCALE_COOKIE = 'ihx_locale'

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (locales as readonly string[]).includes(v)
}

/**
 * Pick the best locale from an Accept-Language header.
 * Chinese in any script/region (zh, zh-CN, zh-Hant, ...) → 'zh'; everything
 * else falls back to 'en' so international visitors are not dropped into a
 * language they can't read. Quality values are respected.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.split('=')[1]) || 0 : 1 }
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    if (tag === '*') break
    if (tag.startsWith('zh')) return 'zh'
    if (tag.startsWith('en')) return 'en'
  }
  return ranked.length ? 'en' : defaultLocale
}

export const localeLabel: Record<Locale, { short: string; full: string }> = {
  zh: { short: '中', full: '简体中文' },
  en: { short: 'EN', full: 'English' },
}
