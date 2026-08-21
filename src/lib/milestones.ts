import fs from 'node:fs'
import path from 'node:path'
import type { Locale } from '@/i18n/config'
import { formatCount, formatMoney, getAllGames } from './games'

/* ------------------------------------------------------------------ *
 * Company milestones.
 *
 * The whole timeline is `content/milestones.json` — add, remove or reorder
 * entries there and everything downstream follows on the next build:
 *
 *   · the 01…NN tokens and the year pips are numbered from the array
 *   · the progress bar and the scroll length scale with the count
 *     (`--rows` on the section drives its height in CSS)
 *   · figures marked `{ game, field }` are read out of content/games/*.md,
 *     so a campaign number is never typed in twice and can never go stale
 *
 * Nothing here is hard-coded to six entries; the component reads whatever
 * the file contains.
 * ------------------------------------------------------------------ */

type Bi = Record<Locale, string>

/** Either a literal figure, or a pointer at a number that already exists. */
type RawStat =
  | { label: Bi; value: Bi }
  | { game: string; field: 'raised' | 'backers' | 'stretch' }

interface RawMilestone {
  id: string
  year: string
  quarter: Bi
  title: Bi
  alt: Bi
  body: Bi
  stats?: RawStat[]
}

export interface MilestoneStat {
  /** dictionary key when the figure came from a game file, else undefined */
  field?: 'raised' | 'backers' | 'stretch'
  label?: Bi
  value: Bi
}

export interface Milestone {
  id: string
  year: string
  quarter: Bi
  title: Bi
  alt: Bi
  body: Bi
  stats: MilestoneStat[]
}

const FILE = path.join(process.cwd(), 'content', 'milestones.json')

export async function getMilestones(): Promise<Milestone[]> {
  if (!fs.existsSync(FILE)) return []
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8')) as RawMilestone[]
  const games = await getAllGames()

  return raw.map((m) => ({
    id: m.id,
    year: m.year,
    quarter: m.quarter,
    title: m.title,
    alt: m.alt,
    body: m.body,
    stats: (m.stats ?? [])
      .map((s): MilestoneStat | null => {
        if ('value' in s) return { label: s.label, value: s.value }

        const g = games.find((x) => x.slug === s.game)
        if (!g?.funding) return null
        const per = (locale: Locale) => {
          if (s.field === 'raised') return formatMoney(g.funding!, locale)
          if (s.field === 'backers')
            return g.funding!.backers ? formatCount(g.funding!.backers, locale) : ''
          return g.funding!.stretch != null ? String(g.funding!.stretch) : ''
        }
        const value = { zh: per('zh'), en: per('en') }
        if (!value.en && !value.zh) return null
        return { field: s.field, value }
      })
      .filter((s): s is MilestoneStat => s !== null),
  }))
}
