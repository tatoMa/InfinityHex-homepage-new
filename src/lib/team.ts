import fs from 'node:fs'
import path from 'node:path'
import type { Locale } from '@/i18n/config'
import { resolveAsset } from './asset'

/* ------------------------------------------------------------------ *
 * The studio roster.
 *
 * `content/team.json` is the whole thing: add a person, get a card on
 * /about on the next build. Portraits are generated to match by
 * `scripts/make-placeholders.mjs`, so a new entry does not need artwork to
 * look finished — point `photo` at a real headshot whenever you have one.
 * ------------------------------------------------------------------ */

type Bi = Record<Locale, string>
type BiList = Record<Locale, string[]>

export interface Member {
  id: string
  name: Bi
  role: Bi
  bio: Bi
  focus?: BiList
  photo?: string
  color?: string
  email?: string
  since?: number
  /** true → rendered first, at feature size */
  lead?: boolean
}

const FILE = path.join(process.cwd(), 'content', 'team.json')

export function getTeam(): Member[] {
  if (!fs.existsSync(FILE)) return []
  const raw = (JSON.parse(fs.readFileSync(FILE, 'utf8')) as Member[]).map((m) => ({
    ...m,
    // drop a real headshot into public/people/ under the same name in any
    // format and it replaces the generated placeholder with no edit here
    photo: resolveAsset(m.photo),
  }))
  // leads first, then by joining year, then by file order
  return raw
    .map((m, i) => ({ m, i }))
    .sort((a, b) => {
      if (!!a.m.lead !== !!b.m.lead) return a.m.lead ? -1 : 1
      const y = (a.m.since ?? 9999) - (b.m.since ?? 9999)
      return y || a.i - b.i
    })
    .map((x) => x.m)
}

export function getFounder(): Member | undefined {
  return getTeam().find((m) => m.lead)
}
