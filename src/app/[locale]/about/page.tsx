import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Reveal from '@/components/Reveal'
import Parallax from '@/components/Parallax'
import { getTeam } from '@/lib/team'
import { getTotals } from '@/lib/games'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getDict, SOCIAL } from '@/i18n/dict'
import eventPhotos from '../../../../content/events.json'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDict(locale as Locale)
  return { title: `${t.about.title} · ${t.brand.en}`, description: t.about.lead }
}

const Arrow = () => (
  <svg
    className="arw"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h13M12 5l7 7-7 7" />
  </svg>
)

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const l = locale as Locale
  const t = getDict(l)
  const team = getTeam()
  const totals = await getTotals()

  return (
    <article className="about">
      {/* ---------------- masthead ---------------- */}
      <header className="about-top">
        <div className="sec-bg" aria-hidden="true">
          <Parallax className="sbg wash-a" y={-90} scale={0.14} />
          <Parallax className="sbg wash-c" y={110} scale={0.1} />
        </div>

        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            <span className="hx" />
            {t.about.eyebrow}
          </Reveal>
          <Reveal as="h1" d={1} className="about-title">
            {t.about.title}
            <span className="alt">{t.about.titleEn}</span>
          </Reveal>
          <Reveal as="p" d={2} className="about-lead">
            {t.about.lead}
          </Reveal>

          <Reveal d={3}>
            <dl className="about-facts">
              {t.about.facts.map((f) => (
                <div key={f.k}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
              <div>
                <dt>{t.about.teamTitle}</dt>
                <dd className="num">{team.length}</dd>
              </div>
              <div>
                <dt>{t.nav.games}</dt>
                <dd className="num">{totals.titles}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </header>

      {/* ---------------- team ---------------- */}
      <section className="sec about-team" aria-labelledby="teamTitle">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <Reveal as="h2" className="sec-title" id="teamTitle">
                {t.about.teamTitle}
                <span className="alt">{t.about.teamLead}</span>
              </Reveal>
            </div>
          </div>

          <div className="tgrid">
            {team.map((m, i) => (
              <Reveal key={m.id} d={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <article
                  className={`tcard${m.lead ? ' lead' : ''}`}
                  style={{ ['--tc' as string]: m.color ?? 'var(--dai)' }}
                >
                  <div className="tface">
                    {m.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.photo} alt={m.name[l]} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
                    ) : (
                      <div className="tface-placeholder">
                        <span aria-hidden="true">{m.name[l].slice(0, 1)}</span>
                        <small>{t.about.portraitPending}</small>
                      </div>
                    )}
                  </div>
                  <div className="tbody">
                    <h3>
                      {m.name[l]}
                      <span className="alt">{m.role[l]}</span>
                    </h3>
                    <p>{m.bio[l]}</p>
                    {m.focus ? (
                      <ul className="tfocus" aria-label={t.about.focusLabel}>
                        {m.focus[l].map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="tmeta">
                      {m.since ? (
                        <span>
                          {t.about.since} <b>{m.since}</b>
                        </span>
                      ) : null}
                      {m.email ? (
                        <a href={`mailto:${m.email}`} className="tmail">
                          {m.email}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec about-events" aria-labelledby="eventsTitle">
        <div className="wrap">
          <div className="sec-head">
            <Reveal>
              <h2 className="sec-title" id="eventsTitle">
                {t.about.galleryTitle}
                <span className="alt">{t.about.gallerySubtitle}</span>
              </h2>
            </Reveal>
            <Reveal as="p">{t.about.galleryLead}</Reveal>
          </div>
          <div className="event-gallery">
            {eventPhotos.map((photo) => (
              <figure className="event-photo" key={photo.id}>
                <a href={photo.src} target="_blank" rel="noopener noreferrer"
                  aria-label={`${t.about.galleryOpen}: ${photo.caption[l]}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.caption[l]} width={photo.width}
                    height={photo.height} loading="lazy" decoding="async" />
                </a>
                <figcaption>{photo.caption[l]}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- contact ---------------- */}
      <section className="sec" aria-labelledby="aboutContact">
        <div className="wrap">
          <Reveal>
            <div className="band">
              <Parallax className="band-px" y={-64} x={30} />
              <div>
                <h2 id="aboutContact">{t.about.contactTitle}</h2>
                <p>{t.about.contactBody}</p>
              </div>
              <div className="band-acts">
                <a className="btn" href={`mailto:${SOCIAL.email}`}>
                  <span>
                    {t.contact.email}
                    <Arrow />
                  </span>
                </a>
                <Link className="btn ghost" href={`/${l}`}>
                  <span>{t.about.back}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
