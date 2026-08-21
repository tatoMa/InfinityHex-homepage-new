import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Reveal from '@/components/Reveal'
import Parallax from '@/components/Parallax'
import { formatCount, formatMoney, getAllGames, getGame } from '@/lib/games'
import { placeholderCover } from '@/lib/cover'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getDict, SOCIAL } from '@/i18n/dict'

export async function generateStaticParams() {
  const games = await getAllGames()
  return locales.flatMap((locale) => games.map((g) => ({ locale, slug: g.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const g = await getGame(slug)
  if (!g) return {}
  const l = locale as Locale
  return {
    title: `${g.title[l]} · Infinity Hex Games`,
    description: g.tagline[l],
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const l = locale as Locale
  const t = getDict(l)

  const games = await getAllGames()
  const idx = games.findIndex((x) => x.slug === slug)
  const g = games[idx]
  if (!g) notFound()

  const prev = games[idx - 1]
  const next = games[idx + 1]

  const cover =
    g.cover?.[l] ??
    placeholderCover({
      title: g.title[l],
      subtitle: l === 'zh' ? g.title.en : '',
      tag: g.tags[l].join(' · '),
      color: g.color,
      index: idx,
    })

  const facts: { k: string; v: string; num?: boolean }[] = []
  if (g.players) facts.push({ k: t.games.players, v: g.players, num: true })
  if (g.time) facts.push({ k: t.games.time, v: `${g.time}′`, num: true })
  if (g.age) facts.push({ k: t.games.age, v: g.age, num: true })
  if (g.weight != null) facts.push({ k: t.games.weight, v: g.weight.toFixed(1), num: true })
  if (g.designer) facts.push({ k: t.games.designer, v: g.designer[l] })
  if (g.publisher) facts.push({ k: t.games.publisher, v: g.publisher[l] })

  return (
    <article className="detail" style={{ ['--gc' as string]: g.color }}>
      {/* ---------------- masthead ---------------- */}
      <header className="detail-top">
        <div className="detail-tint" aria-hidden="true">
          <Parallax className="dt-wash" y={-90} scale={0.14} />
          <Parallax className="dt-mesh" y={120} />
        </div>

        <div className="wrap">
          <Reveal as="p" className="detail-back">
            <Link className="btn btn-g btn-sm" href={`/${l}#games`}>
              <span>← {t.games.back}</span>
            </Link>
          </Reveal>

          <div className="detail-hero">
            <Reveal className="detail-artwrap">
              <figure className="detail-art">
                {/* the cover keeps its own shape — landscape, portrait or
                    square all sit correctly on the tinted plate */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={`${g.title[l]} ${g.title.en}`} width={1200} height={1600} />
              </figure>
            </Reveal>

            <Reveal d={1} className="detail-head">
              <div className="detail-badges">
                {g.kind === 'original' ? (
                  <span className="badge b-original">{t.games.original}</span>
                ) : (
                  <span className="badge b-line">{t.games.localised}</span>
                )}
                <span className={`badge b-${g.status}`}>{t.games.status[g.status]}</span>
                {g.year ? <span className="badge b-line">{g.year}</span> : null}
                {g.sample ? <span className="badge b-sample">{t.games.sample}</span> : null}
              </div>

              <h1>
                {g.title[l]}
                {l === 'zh' && g.title.en !== g.title.zh ? (
                  <span className="alt" lang="en">
                    {g.title.en}
                  </span>
                ) : null}
              </h1>
              <p className="detail-tag">{g.tagline[l]}</p>

              {g.funding ? (
                <div className="fund">
                  <div>
                    <span>{t.games.raised}</span>
                    <b>{formatMoney(g.funding, l)}</b>
                  </div>
                  {g.funding.backers ? (
                    <div>
                      <span>{t.games.backers}</span>
                      <b>{formatCount(g.funding.backers, l)}</b>
                    </div>
                  ) : null}
                  {g.funding.stretch ? (
                    <div>
                      <span>{t.games.stretch}</span>
                      <b>{g.funding.stretch}</b>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <ul className="detail-tags">
                {g.tags[l].map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ---------------- body + spec sheet ---------------- */}
      <div className="wrap detail-body">
        <Reveal>
          {/* Markdown comes from our own content directory, not user input. */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: g.body[l] }} />
        </Reveal>

        <aside className="detail-side">
          <div className="specsheet">
            <h2>{g.title[l]}</h2>
            {facts.length ? (
              <dl className="factgrid">
                {facts.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd className={f.num ? 'num' : ''}>{f.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <a className="btn btn-p btn-sm spec-cta" href={`mailto:${SOCIAL.email}`}>
              <span>{t.contact.email}</span>
            </a>
          </div>
        </aside>
      </div>

      <div className="wrap">
        <nav className="detail-nav" aria-label={t.games.all}>
          {prev ? (
            <Link className="detail-step" href={`/${l}/games/${prev.slug}`}>
              <span>←</span>
              <b>{prev.title[l]}</b>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="detail-step next" href={`/${l}/games/${next.slug}`}>
              <b>{next.title[l]}</b>
              <span>→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  )
}
