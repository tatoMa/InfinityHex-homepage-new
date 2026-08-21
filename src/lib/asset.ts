import fs from 'node:fs'
import path from 'node:path'

/* ------------------------------------------------------------------ *
 * Extension-agnostic image references.
 *
 * Every image on this site is referenced by a plain path in data — a game's
 * `cover`, a team member's `photo`, a partner's `logo`. This resolver looks
 * that reference up on disk IGNORING the extension it was written with, and
 * returns whatever actually exists, preferring real photography over the
 * generated SVG stand-ins:
 *
 *     photo: "/people/andy.svg"     ← what the JSON says
 *     public/people/andy.png        ← what you dropped in
 *     → /people/andy.png            ← what the page renders
 *
 * So replacing a placeholder is "copy the file in", not "copy the file in
 * AND remember to edit the JSON". Writing the reference without an extension
 * at all (`"/people/andy"`) works too.
 *
 * Runs at build time only — it touches the filesystem, so keep it out of
 * client components.
 * ------------------------------------------------------------------ */

const PUBLIC = path.join(process.cwd(), 'public')

/** Real artwork wins over the generated placeholder; .svg is checked last. */
const EXTENSIONS = ['.webp', '.avif', '.png', '.jpg', '.jpeg', '.gif', '.svg']

/**
 * @returns the public path of the file that exists, or `undefined` when
 *          nothing does — callers fall back to their own placeholder.
 */
export function resolveAsset(ref?: string): string | undefined {
  if (!ref) return undefined
  // absolute URLs and data-URIs are passed straight through
  if (/^[a-z]+:/i.test(ref) || ref.startsWith('//')) return ref

  const clean = ref.split(/[?#]/)[0]
  const dir = path.posix.dirname(clean)
  const stem = path.posix.basename(clean).replace(/\.[a-z0-9]+$/i, '')

  for (const ext of EXTENSIONS) {
    const rel = path.posix.join(dir, stem + ext)
    if (fs.existsSync(path.join(PUBLIC, rel))) return rel
  }
  return undefined
}

/** Same lookup for a `{ zh, en }` pair; drops keys with no file behind them. */
export function resolveAssetMap<K extends string>(
  map?: Record<K, string>,
): Record<K, string> | undefined {
  if (!map) return undefined
  const out = {} as Record<K, string>
  let any = false
  for (const [k, v] of Object.entries(map) as [K, string][]) {
    const hit = resolveAsset(v)
    if (hit) {
      out[k] = hit
      any = true
    }
  }
  return any ? out : undefined
}
