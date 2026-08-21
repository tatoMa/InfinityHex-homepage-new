/* ------------------------------------------------------------------ *
 * Brand switches.
 *
 * Small, deliberate knobs that a non-developer might reasonably want to flip
 * without going hunting through components.
 * ------------------------------------------------------------------ */

export const BRAND = {
  /**
   * Put the logo on the cinnabar hexagon plate.
   *
   * Turn this on when the supplied logo is WHITE or a single light colour —
   * on its own it would vanish against the 宣纸 paper background of the
   * header. The plate gives it the brand-red hexagon to sit on, which is
   * also how the mark reads on the seal in the hero.
   *
   * Leave it off for a full-colour or dark logo.
   */
  logoPlate: false,

  /**
   * What the 印章 seal beside the headline shows.
   *
   *   'auto'  → 向量之印 on the Chinese page, the ∞ mark on the English one
   *   'mark'  → the ∞ brand mark in both languages
   *   'seal'  → 向量之印 in both languages
   */
  sealGlyph: 'auto' as 'auto' | 'mark' | 'seal',
}
