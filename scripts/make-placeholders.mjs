/**
 * Generates the placeholder artwork that ships with the repo:
 *
 *   public/games/<slug>/cover-{en,zh}.svg   key art stand-ins
 *   public/people/<id>.svg                  portrait stand-ins (team, quotes)
 *
 * Run with:  node scripts/make-placeholders.mjs
 *
 * Two rules make these safe to drop into any slot on the site:
 *
 * 1. EVERYTHING THAT MATTERS LIVES IN THE CENTRE. Covers are used at three
 *    different aspect ratios (5:7 cards, 3:2 phone cards, natural size on the
 *    detail page) and `object-fit: cover` centre-crops. So the title sits in
 *    the middle 56% of the width and the middle third of the height — crop it
 *    to a square, a portrait or a letterbox and the words survive. The first
 *    version of these files set the title flush left near the bottom, which
 *    is exactly the part a 5:7 crop throws away.
 *
 * 2. NO BARE `&`. An SVG is XML: an unescaped ampersand is a parse error and
 *    the whole file fails to render, silently, as a broken image.
 */

import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CJK = /[一-鿿]/
const serif = (s) =>
  CJK.test(s) ? 'Songti SC,Noto Serif CJK SC,SimSun,serif' : 'Bodoni Moda,Georgia,serif'

/* ------------------------------------------------------------------ *
 * Key art
 * ------------------------------------------------------------------ */

/** decorative field, drawn edge to edge so the crop always has texture */
function field(w, h, art, variant) {
  let out = ''
  if (variant === 0) {
    const r = Math.min(w, h) * 0.42
    for (let k = 0; k < 6; k++)
      out += `<path d="M${w / 2} ${h / 2 - r + k * 26} l${(r - k * 22) * 0.87} ${(r - k * 22) * 0.5} v${(r - k * 22)} l-${(r - k * 22) * 0.87} ${(r - k * 22) * 0.5} l-${(r - k * 22) * 0.87} -${(r - k * 22) * 0.5} v-${(r - k * 22)} z" fill="none" stroke="${art}" stroke-width="1.6"/>`
  } else if (variant === 1) {
    for (let k = 0; k < 9; k++)
      out += `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${40 + k * Math.max(w, h) * 0.055}" fill="none" stroke="${art}" stroke-width="1.4"/>`
  } else if (variant === 2) {
    const step = Math.max(w, h) / 13
    for (let k = -4; k < 18; k++)
      out += `<path d="M${k * step} ${h + 40} L${k * step + h * 0.9} -40" stroke="${art}" stroke-width="${k % 3 === 0 ? 6 : 2}"/>`
  } else if (variant === 3) {
    const s = Math.max(w, h) / 11
    for (let r = -1; r * s * 0.75 < h + s; r++)
      for (let c = -1; c * s < w + s; c++) {
        const cx = c * s + (r % 2 ? s / 2 : 0)
        const cy = r * s * 0.78
        out += `<path d="M${cx} ${cy - s * 0.4} l${s * 0.35} ${s * 0.2} v${s * 0.4} l-${s * 0.35} ${s * 0.2} l-${s * 0.35} -${s * 0.2} v-${s * 0.4} z" fill="none" stroke="${art}" stroke-width="1.3"/>`
      }
  } else {
    const R = Math.min(w, h) * 0.34
    out += `<circle cx="${w / 2}" cy="${h / 2}" r="${R}" fill="none" stroke="${art}" stroke-width="2.4"/>`
    for (let a = 0; a < 16; a++) {
      const rad = (a * Math.PI) / 8
      out +=
        `<path d="M${(w / 2 + Math.cos(rad) * R * 1.08).toFixed(1)} ${(h / 2 + Math.sin(rad) * R * 1.08).toFixed(1)} ` +
        `L${(w / 2 + Math.cos(rad) * R * 1.46).toFixed(1)} ${(h / 2 + Math.sin(rad) * R * 1.46).toFixed(1)}" stroke="${art}" stroke-width="2.2"/>`
    }
  }
  return out
}

/** wrap a title so it never runs outside the centre-safe column */
function wrap(title, maxChars) {
  if (CJK.test(title)) {
    const out = []
    for (let i = 0; i < title.length; i += maxChars) out.push(title.slice(i, i + maxChars))
    return out.slice(0, 3)
  }
  const words = title.split(/\s+/)
  const lines = ['']
  for (const word of words) {
    const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word
    if (next.length > maxChars && lines[lines.length - 1]) lines.push(word)
    else lines[lines.length - 1] = next
  }
  return lines.slice(0, 3)
}

export function cover({ w, h, color, title, kicker = 'INFINITY HEX', studio, variant = 0 }) {
  const cjk = CJK.test(title)
  const base = Math.min(w, h)
  // the safe column: middle 56% of the width, centred band of the height
  const safe = w * 0.56
  const maxChars = cjk ? Math.max(4, Math.floor(safe / (base * 0.088))) : Math.max(9, Math.floor(safe / (base * 0.042)))
  const lines = wrap(title, maxChars)
  const size = cjk ? base * 0.085 : base * 0.075
  const lead = size * 1.18
  const top = h / 2 - ((lines.length - 1) * lead) / 2 + size * 0.34

  const art = 'rgba(255,255,255,.15)'
  const dim = 'rgba(251,247,239,.62)'

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2=".55" y2="1">` +
    `<stop offset="0" stop-color="${color}"/>` +
    `<stop offset="1" stop-color="${color}" stop-opacity=".62"/></linearGradient>` +
    `<radialGradient id="c" cx=".5" cy=".5" r=".62">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    field(w, h, art, variant) +
    `<rect width="${w}" height="${h}" fill="url(#c)"/>` +
    /* mark + kicker, centred above the title so a square crop keeps them */
    `<g transform="translate(${w / 2} ${top - lead - base * 0.1})">` +
    `<path d="M0 ${-base * 0.038} l${base * 0.033} ${base * 0.019} v${base * 0.038} l-${base * 0.033} ${base * 0.019} l-${base * 0.033} -${base * 0.019} v-${base * 0.038} z" fill="none" stroke="#FBF7EF" stroke-width="${base * 0.005}" opacity=".8"/>` +
    `<text y="${base * 0.075}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${base * 0.026}" letter-spacing="${base * 0.008}" fill="${dim}">${esc(kicker)}</text>` +
    `</g>` +
    lines
      .map(
        (l, i) =>
          `<text x="${w / 2}" y="${top + i * lead}" text-anchor="middle" font-family="${serif(title)}" font-weight="700" font-size="${size}" fill="#FBF7EF">${esc(l)}</text>`,
      )
      .join('') +
    (studio
      ? `<text x="${w / 2}" y="${top + (lines.length - 1) * lead + size * 0.95}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${base * 0.032}" fill="${dim}">${esc(studio)}</text>`
      : '') +
    `</svg>`
  )
}

/* ------------------------------------------------------------------ *
 * Portraits — square, centre-weighted, safe to crop to a circle
 * ------------------------------------------------------------------ */
export function portrait({ name, color, id = '' }) {
  const S = 640
  const seed = [...(id || name)].reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 9973, 7)
  const cjk = CJK.test(name)
  const initials = cjk
    ? name.slice(-2)
    : name
        .split(/[\s·-]+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
  const tilt = ((seed % 7) - 3) * 1.6
  const shoulder = 0.66 + ((seed >> 3) % 5) * 0.025
  const mono = cjk ? S * 0.2 : S * 0.24

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs>` +
    `<linearGradient id="b" x1="0" y1="0" x2=".45" y2="1">` +
    `<stop offset="0" stop-color="${color}"/>` +
    `<stop offset="1" stop-color="${color}" stop-opacity=".68"/></linearGradient>` +
    `<radialGradient id="l" cx=".5" cy=".34" r=".62">` +
    `<stop offset="0" stop-color="#FDFAF3" stop-opacity=".26"/>` +
    `<stop offset="1" stop-color="#FDFAF3" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="k"><rect width="${S}" height="${S}"/></clipPath>` +
    `</defs>` +
    `<rect width="${S}" height="${S}" fill="url(#b)"/>` +
    /* hex weave, low contrast — the studio texture, not a pattern swatch */
    Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 6 }, (_, c) => {
        const s = 132
        const cx = c * s + (r % 2 ? s / 2 : 0) - 50
        const cy = r * s * 0.78 - 40
        return `<path d="M${cx} ${cy - s * 0.4} l${s * 0.35} ${s * 0.2} v${s * 0.4} l-${s * 0.35} ${s * 0.2} l-${s * 0.35} -${s * 0.2} v-${s * 0.4} z" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="2"/>`
      }).join(''),
    ).join('') +
    /* the silhouette is a HINT that a photograph belongs here — deliberately
       faint, so the monogram stays the thing you actually read */
    `<g clip-path="url(#k)" transform="rotate(${tilt} ${S / 2} ${S / 2})" fill="#FDFAF3" opacity=".17">` +
    `<ellipse cx="${S / 2}" cy="${S * 1.02}" rx="${S * shoulder * 0.5}" ry="${S * 0.38}"/>` +
    `<circle cx="${S / 2}" cy="${S * 0.42}" r="${S * 0.175}"/>` +
    `</g>` +
    `<rect width="${S}" height="${S}" fill="url(#l)"/>` +
    /* the aperture: a hex frame around the monogram */
    `<path d="M${S / 2} ${S * 0.17} L${S * 0.79} ${S * 0.335} V${S * 0.665} L${S / 2} ${S * 0.83} L${S * 0.21} ${S * 0.665} V${S * 0.335} z" fill="none" stroke="#FDFAF3" stroke-opacity=".38" stroke-width="2.4"/>` +
    `<text x="${S / 2}" y="${S * 0.5 + mono * 0.35}" text-anchor="middle" font-family="${serif(initials)}" font-weight="700" font-size="${mono}" fill="#FDFAF3">${esc(initials)}</text>` +
    `<text x="${S / 2}" y="${S * 0.9}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${S * 0.028}" letter-spacing="${S * 0.011}" fill="#FDFAF3" fill-opacity=".55">PORTRAIT</text>` +
    `</svg>`
  )
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */
if (process.argv[1] && process.argv[1].endsWith('make-placeholders.mjs')) {
  const matter = (await import('gray-matter')).default
  const { readFileSync } = await import('node:fs')

  /* ---- game covers, from the markdown front matter ---- */
  const gamesDir = join(ROOT, 'content/games')
  const shapes = [
    [1600, 900],
    [1200, 1600],
    [1400, 1400],
  ]
  // The markdown is the source of truth: whatever `cover.en` / `cover.zh`
  // point at is what gets generated, so the two can never drift apart.
  if (existsSync(join(ROOT, 'public/games'))) rmSync(join(ROOT, 'public/games'), { recursive: true })
  let i = 0
  let files = 0
  for (const file of readdirSync(gamesDir).filter((f) => f.endsWith('.md'))) {
    const { data } = matter(readFileSync(join(gamesDir, file), 'utf8'))
    if (!data.cover) continue
    const [w, h] = shapes[i % shapes.length]
    const color = data.color || '#1F6E64'
    const title = (l) => (typeof data.title === 'string' ? data.title : data.title[l])
    for (const [locale, path] of Object.entries(data.cover)) {
      const out = join(ROOT, 'public', path.replace(/^\//, ''))
      mkdirSync(dirname(out), { recursive: true })
      // the zh plate is deliberately the transposed shape of the en plate,
      // so both orientations of the same title are exercised on the site
      const [cw, ch] = locale === 'zh' ? [h, w] : [w, h]
      writeFileSync(
        out,
        cover({
          w: cw,
          h: ch,
          color,
          title: title(locale),
          kicker: locale === 'zh' ? '向量桌游' : 'INFINITY HEX',
          studio: locale === 'zh' ? '简体中文版' : 'Infinity Hex Games',
          variant: (i + (locale === 'zh' ? 2 : 0)) % 5,
        }),
      )
      files++
    }
    i++
  }
  console.log(`covers: ${files} files across ${i} titles`)

  /* ---- portraits, from team + testimonials ---- */
  const peopleDir = join(ROOT, 'public/people')
  mkdirSync(peopleDir, { recursive: true })
  const sources = ['content/team.json', 'content/testimonials.json']
  const seen = new Set()
  for (const src of sources) {
    const p = join(ROOT, src)
    if (!existsSync(p)) continue
    for (const person of JSON.parse(readFileSync(p, 'utf8'))) {
      const id = person.id || person.photo?.split('/').pop()?.replace('.svg', '')
      if (!id || seen.has(id)) continue
      seen.add(id)
      const name = typeof person.name === 'string' ? person.name : person.name.en
      writeFileSync(
        join(peopleDir, `${id}.svg`),
        portrait({ name, color: person.color || '#3D5A80', id }),
      )
    }
  }
  console.log(`portraits: ${seen.size}`)
}
