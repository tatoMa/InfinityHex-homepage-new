/* ------------------------------------------------------------------ *
 * The brand mark, in one place.
 *
 * Both the header logo fallback and the 印章 seal in the hero draw from
 * these paths, so the two can never drift out of shape. All coordinates are
 * in a 100 × 100 box.
 * ------------------------------------------------------------------ */

/** outer hexagon, flat sides left and right */
export const HEX_OUTER = 'M50 3 92 26.5v47L50 97 8 73.5v-47z'

/** inner rule, inset from the outer hexagon */
export const HEX_INNER = 'M50 12 84 31v38L50 88 16 69V31z'

/**
 * The infinity mark.
 *
 * The old one was drawn by hand and was NOT symmetric — the right lobe sat a
 * couple of units low and wide, which is exactly the sort of thing you cannot
 * unsee once someone points at it. This version is two mirrored cubic loops:
 * every control point on the right is the reflection of its partner through
 * x = 50, and the whole figure is symmetric about y = 50 as well.
 */
export const INFINITY =
  'M50 50' +
  'C44 38 30 38 30 50' +
  'C30 62 44 62 50 50' +
  'C56 38 70 38 70 50' +
  'C70 62 56 62 50 50' +
  'Z'
