import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'
import type { Locale } from '@/i18n/config'
import { resolveAssetMap } from './asset'

/* ------------------------------------------------------------------ *
 * Markdown-driven game catalogue.
 *
 * Drop a new `.md` file into `content/games/` and it appears on the home
 * page and gets its own detail route on the next build. Nothing else to
 * touch — no imports, no registry, no rebuild of any index.
 *
 * One file holds BOTH languages. Frontmatter fields that differ per
 * language are objects `{ zh, en }`; the body is split on a marker line:
 *
 *     中文正文……
 *
 *     <!-- @en -->
 *
 *     English body……
 *
 * If the English half is missing the Chinese one is reused (and vice versa).
 * ------------------------------------------------------------------ */

export type GameStatus = 'shipping' | 'funding' | 'upcoming' | 'licensing'
export type GameKind = 'original' | 'localised'

export interface Funding {
  amount: number
  currency: string
  backers?: number
  stretch?: number
  platform?: Record<Locale, string>
}

export interface Game {
  slug: string
  order: number
  kind: GameKind
  status: GameStatus
  /** brand-palette hex used for the placeholder cover + accent */
  color: string
  /** key art per language, `{ en, zh }`; zh falls back to en. Landscape,
   *  portrait or square all work — cards crop to a fixed ratio, the detail
   *  page shows the image at its natural shape. The path is resolved against
   *  `public/` ignoring the extension, so dropping `cover-en.png` next to a
   *  generated `cover-en.svg` swaps the artwork with no edit here. */
  cover?: Record<Locale, string>
  /** true → the card shows a "sample data" chip; delete once real */
  sample: boolean
  designer?: Record<Locale, string>
  publisher?: Record<Locale, string>
  players?: string
  time?: string
  age?: string
  weight?: number
  year?: number
  funding?: Funding
  title: Record<Locale, string>
  tagline: Record<Locale, string>
  tags: Record<Locale, string[]>
  body: Record<Locale, string>
}

const DIR = path.join(process.cwd(), 'content', 'games')
const SPLIT = /^<!--\s*@en\s*-->\s*$/m

type Bi = string | Partial<Record<Locale, string>> | undefined

function bi(value: Bi, fallback = ''): Record<Locale, string> {
  if (typeof value === 'string') return { zh: value, en: value }
  const zh = value?.zh ?? value?.en ?? fallback
  const en = value?.en ?? value?.zh ?? fallback
  return { zh, en }
}

function biList(
  value: string[] | Partial<Record<Locale, string[]>> | undefined,
): Record<Locale, string[]> {
  if (Array.isArray(value)) return { zh: value, en: value }
  const zh = value?.zh ?? value?.en ?? []
  const en = value?.en ?? value?.zh ?? []
  return { zh, en }
}

async function parseFile(file: string): Promise<Game> {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8')
  const { data, content } = matter(raw)

  const [zhRaw, enRaw] = content.split(SPLIT)
  const zhHtml = await marked.parse((zhRaw ?? '').trim())
  const enHtml = enRaw ? await marked.parse(enRaw.trim()) : zhHtml

  const slug = String(data.slug ?? file.replace(/\.md$/, ''))

  return {
    slug,
    order: Number(data.order ?? 999),
    kind: (data.kind as GameKind) ?? 'localised',
    status: (data.status as GameStatus) ?? 'shipping',
    color: String(data.color ?? '#1F6E64'),
    // resolved against public/ so the extension written here does not have
    // to match the file that is actually there — see src/lib/asset.ts
    cover: data.cover ? resolveAssetMap(bi(data.cover as Bi)) : undefined,
    sample: Boolean(data.sample),
    designer: data.designer ? bi(data.designer as Bi) : undefined,
    publisher: data.publisher ? bi(data.publisher as Bi) : undefined,
    players: data.players ? String(data.players) : undefined,
    time: data.time ? String(data.time) : undefined,
    age: data.age ? String(data.age) : undefined,
    weight: data.weight != null ? Number(data.weight) : undefined,
    year: data.year != null ? Number(data.year) : undefined,
    funding: data.funding
      ? {
          amount: Number(data.funding.amount ?? 0),
          currency: String(data.funding.currency ?? 'CNY'),
          backers: data.funding.backers != null ? Number(data.funding.backers) : undefined,
          stretch: data.funding.stretch != null ? Number(data.funding.stretch) : undefined,
          platform: data.funding.platform ? bi(data.funding.platform as Bi) : undefined,
        }
      : undefined,
    title: bi(data.title as Bi, slug),
    tagline: bi(data.tagline as Bi),
    tags: biList(data.tags),
    body: { zh: zhHtml as string, en: enHtml as string },
  }
}

let cache: Promise<Game[]> | null = null

export function getAllGames(): Promise<Game[]> {
  if (!cache) {
    cache = (async () => {
      if (!fs.existsSync(DIR)) return []
      const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'))
      const games = await Promise.all(files.map(parseFile))
      return games.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
    })()
  }
  return cache
}

export async function getGame(slug: string): Promise<Game | undefined> {
  return (await getAllGames()).find((g) => g.slug === slug)
}

/** Compact money for cards: ¥1,995,595.5 → ¥199.6万 (zh) / ¥2.0M (en) */
export function formatMoney(f: Funding, locale: Locale): string {
  const symbol = f.currency === 'CNY' ? '¥' : f.currency === 'USD' ? '$' : f.currency === 'EUR' ? '€' : ''
  if (locale === 'zh') {
    if (f.amount >= 1e8) return `${symbol}${(f.amount / 1e8).toFixed(2)}亿`
    if (f.amount >= 1e4) return `${symbol}${(f.amount / 1e4).toFixed(1)}万`
    return `${symbol}${f.amount.toLocaleString('zh-CN')}`
  }
  if (f.amount >= 1e6) return `${symbol}${(f.amount / 1e6).toFixed(2)}M`
  if (f.amount >= 1e3) return `${symbol}${(f.amount / 1e3).toFixed(1)}K`
  return `${symbol}${f.amount.toLocaleString('en-US')}`
}

export function formatCount(n: number, locale: Locale): string {
  return n.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')
}

/* ------------------------------------------------------------------ *
 * Headline figures, derived from the catalogue.
 *
 * The hero numbers used to be hand-typed in the dictionary and drifted the
 * moment a title shipped. They are now summed from the markdown at build
 * time — add a game, the hero updates itself.
 *
 * Entries flagged `sample: true` are EXCLUDED from money/backers/stretch:
 * placeholder figures must never end up in a headline total. They still
 * count towards `titles`, which is just how many entries the catalogue has.
 * ------------------------------------------------------------------ */
export interface CatalogueTotals {
  raised: number
  currency: string
  backers: number
  stretch: number
  titles: number
  campaigns: number
}

export async function getTotals(): Promise<CatalogueTotals> {
  const games = await getAllGames()
  const real = games.filter((g) => !g.sample && g.funding)
  return {
    raised: real.reduce((n, g) => n + (g.funding?.amount ?? 0), 0),
    currency: real[0]?.funding?.currency ?? 'CNY',
    backers: real.reduce((n, g) => n + (g.funding?.backers ?? 0), 0),
    stretch: real.reduce((n, g) => n + (g.funding?.stretch ?? 0), 0),
    titles: games.length,
    campaigns: real.length,
  }
}

/** Split a total into the number + the unit the locale would say it in. */
export function shortMoney(
  amount: number,
  currency: string,
  locale: Locale,
): { n: number; suffix: string; decimals: number } {
  const sym = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : ''
  if (locale === 'zh') {
    if (amount >= 1e8) return { n: amount / 1e8, suffix: `亿${sym ? '' : ''}`, decimals: 2 }
    if (amount >= 1e4) return { n: amount / 1e4, suffix: '万+', decimals: 0 }
    return { n: amount, suffix: '', decimals: 0 }
  }
  if (amount >= 1e6) return { n: amount / 1e6, suffix: 'M+', decimals: 2 }
  if (amount >= 1e3) return { n: amount / 1e3, suffix: 'K+', decimals: 0 }
  return { n: amount, suffix: '', decimals: 0 }
}
