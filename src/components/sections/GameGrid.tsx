import Link from 'next/link'
import Reveal from '../Reveal'
import Parallax from '../Parallax'
import { placeholderCover } from '@/lib/cover'
import { formatCount, formatMoney, type Game } from '@/lib/games'
import type { Locale } from '@/i18n/config'
import type { Dict } from '@/i18n/dict'

/**
 * The catalogue grid. Every card is generated from a markdown file in
 * `content/games/` — add a file, get a card and a detail page.
 */
export default function GameGrid({
  games,
  locale,
  t,
}: {
  games: Game[]
  locale: Locale
  t: Dict
}) {
  return (
    <section className="sec" id="games" aria-labelledby="gamesTitle">
      {/* two backdrop washes, each on its own scroll rate. A hex-lattice
          plane used to sit here too and read as a stray black net in the top
          right — the section already has enough geometry in the cards. */}
      <div className="sec-bg" aria-hidden="true">
        <Parallax className="sbg wash-a" y={-120} scale={0.14} />
        <Parallax className="sbg wash-b" y={96} scale={0.1} />
      </div>

      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal as="p" className="eyebrow">
              <span className="hx" />
              {t.games.eyebrow}
            </Reveal>
            <Reveal as="h2" d={1} className="sec-title" id="gamesTitle">
              {t.games.title}
              <span className="alt">{t.games.titleEn}</span>
            </Reveal>
          </div>
          <Reveal as="p" d={2}>
            {t.games.lead}
          </Reveal>
        </div>

        <div className="ggrid">
          {games.map((g, i) => {
            const cover =
              g.cover?.[locale] ??
              placeholderCover({
                title: g.title[locale],
                subtitle: locale === 'zh' ? g.title.en : '',
                tag: g.tags[locale].join(' · '),
                color: g.color,
                index: i,
              })
            return (
              <Reveal key={g.slug} d={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <article className="gcard" style={{ ['--gc' as string]: g.color }}>
                  <div className="gcard-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt=""
                      width={300}
                      height={420}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className="gcard-badges">
                      {g.kind === 'original' ? (
                        <span className="badge b-original">{t.games.original}</span>
                      ) : (
                        <span className="badge">{t.games.localised}</span>
                      )}
                      {g.status !== 'shipping' ? (
                        <span className={`badge b-${g.status}`}>{t.games.status[g.status]}</span>
                      ) : null}
                      {g.sample ? <span className="badge b-sample">{t.games.sample}</span> : null}
                    </div>
                  </div>

                  <div className="gcard-body">
                    <h3>
                      {g.title[locale]}
                      {/* the second line is the ORIGINAL title — only worth
                          showing on the Chinese page, where it adds something */}
                      {locale === 'zh' && g.title.en !== g.title.zh ? (
                        <span className="alt" lang="en">
                          {g.title.en}
                        </span>
                      ) : null}
                    </h3>
                    <p className="gcard-tag">{g.tagline[locale]}</p>

                    <div className="gcard-meta">
                      {g.funding ? (
                        <div>
                          <span>{t.games.raised}</span>
                          <b>{formatMoney(g.funding, locale)}</b>
                        </div>
                      ) : null}
                      {g.funding?.backers ? (
                        <div>
                          <span>{t.games.backers}</span>
                          <b>{formatCount(g.funding.backers, locale)}</b>
                        </div>
                      ) : null}
                      {g.designer ? (
                        <div>
                          <span>{t.games.designer}</span>
                          <b className="txt">{g.designer[locale]}</b>
                        </div>
                      ) : null}
                      {g.publisher ? (
                        <div>
                          <span>{t.games.publisher}</span>
                          <b className="txt">{g.publisher[locale]}</b>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <span className="gcard-arrow" aria-hidden="true">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h13M12 5l7 7-7 7" />
                    </svg>
                  </span>

                  <Link className="gcard-go" href={`/${locale}/games/${g.slug}`}>
                    {g.title[locale]} — {t.games.readMore}
                  </Link>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
