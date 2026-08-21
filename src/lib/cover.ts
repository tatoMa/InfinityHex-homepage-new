/**
 * Placeholder cover art, generated as an inline SVG data-URI.
 *
 * Every cover is rendered through a real <img src>, so replacing a
 * placeholder with final artwork is a one-line change in the game's
 * markdown file (`cover: /games/xxx/cover.jpg`) — no code edits.
 *
 * Pure + deterministic: safe to call on the server and the client.
 */

export function luma(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export interface CoverInput {
  title: string
  subtitle?: string
  tag?: string
  color: string
  index?: number
}

export function placeholderCover({
  title,
  subtitle = '',
  tag = '',
  color,
  index = 0,
}: CoverInput): string {
  const light = luma(color) > 0.62
  const fg = light ? '#16181F' : '#FBF7EF'
  const dim = light ? 'rgba(22,24,31,.44)' : 'rgba(251,247,239,.64)'
  const art = light ? 'rgba(22,24,31,.13)' : 'rgba(255,255,255,.16)'
  const v = index % 5
  let deco = ''

  if (v === 0) {
    deco =
      `<path d="M150 92 235 141v98l-85 49-85-49v-98z" fill="none" stroke="${art}" stroke-width="2.4"/>` +
      `<path d="M150 128 204 159v62l-54 31-54-31v-62z" fill="none" stroke="${art}" stroke-width="2.4"/>` +
      `<circle cx="150" cy="190" r="13" fill="${art}"/>`
  } else if (v === 1) {
    for (let k = 0; k < 7; k++)
      deco += `<circle cx="150" cy="188" r="${22 + k * 17}" fill="none" stroke="${art}" stroke-width="1.6"/>`
    deco += `<path d="M150 108v160M70 188h160" stroke="${art}" stroke-width="1.6"/>`
  } else if (v === 2) {
    for (let k = 0; k < 11; k++)
      deco += `<path d="M${-40 + k * 38} 300 L${60 + k * 38} 70" stroke="${art}" stroke-width="${k % 3 === 0 ? 7 : 2.4}"/>`
  } else if (v === 3) {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 4; c++) {
        const cx = 48 + c * 68 + (r % 2 ? 34 : 0)
        const cy = 104 + r * 48
        deco += `<path d="M${cx} ${cy - 25}l24 14v22l-24 14-24-14v-22z" fill="none" stroke="${art}" stroke-width="1.8"/>`
      }
  } else {
    deco = `<circle cx="150" cy="184" r="74" fill="none" stroke="${art}" stroke-width="3"/>`
    for (let a = 0; a < 12; a++) {
      const rad = (a * Math.PI) / 6
      deco +=
        `<path d="M${(150 + Math.cos(rad) * 80).toFixed(1)} ${(184 + Math.sin(rad) * 80).toFixed(1)}` +
        `L${(150 + Math.cos(rad) * 116).toFixed(1)} ${(184 + Math.sin(rad) * 116).toFixed(1)}" stroke="${art}" stroke-width="2.6"/>`
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0.5" y2="1">` +
    `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0.72"/></linearGradient>` +
    `<linearGradient id="v" x1="0" y1="0.45" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#000" stop-opacity="${light ? 0.16 : 0.42}"/></linearGradient></defs>` +
    `<rect width="300" height="420" fill="url(#g)"/>${deco}` +
    `<rect width="300" height="420" fill="url(#v)"/>` +
    `<rect x="12" y="12" width="276" height="396" fill="none" stroke="${dim}" stroke-width="1.2" rx="6"/>` +
    `<path d="M34 30l13 7.5v15L34 60l-13-7.5v-15z" fill="none" stroke="${fg}" stroke-width="2" opacity=".85"/>` +
    `<text x="56" y="49" font-family="Helvetica,Arial,sans-serif" font-size="10" letter-spacing="2.6" fill="${dim}">INFINITY HEX</text>` +
    `<text x="26" y="336" font-family="${/[\u4e00-\u9fff]/.test(title) ? 'Songti SC,Noto Serif CJK SC,SimSun,serif' : 'Bodoni Moda,Georgia,serif'}" font-weight="700" font-size="${title.length > 16 ? 24 : 31}" fill="${fg}">${esc(title)}</text>` +
    (subtitle
      ? `<text x="26" y="360" font-family="Georgia,serif" font-style="italic" font-size="14" fill="${dim}">${esc(subtitle)}</text>`
      : '') +
    (tag
      ? `<text x="26" y="388" font-family="Helvetica,Arial,sans-serif" font-size="9" letter-spacing="2.2" fill="${dim}">${esc(tag)}</text>`
      : '') +
    `<text x="274" y="49" text-anchor="end" font-family="Georgia,serif" font-size="15" fill="${dim}">${String(index + 1).padStart(2, '0')}</text>` +
    `</svg>`

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
