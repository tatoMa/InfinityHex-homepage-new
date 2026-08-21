import Reveal from '../Reveal'
import Parallax from '../Parallax'
import { SOCIAL, type Dict } from '@/i18n/dict'
import type { Locale } from '@/i18n/config'

const HEX_COLORS = ['var(--cinnabar)', 'var(--dai)', 'var(--indigo)']

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

/* ------------------------------------------------------------------ *
 * Services — the "trio" layout. Three equal columns on desktop; on a
 * tablet the first card becomes a full-width feature and the other two
 * sit beside it, so three cards never leave an orphan. (see .trio in CSS)
 * ------------------------------------------------------------------ */
export function Services({ t }: { t: Dict }) {
  return (
    <section className="sec" id="services" aria-labelledby="svcTitle">
      <div className="sec-bg" aria-hidden="true">
        <Parallax className="sbg wash-c" y={-90} scale={0.12} />
        <Parallax className="sbg hex-ring" y={150} rotate={-14} fade={0.4} />
      </div>

      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal as="p" className="eyebrow">
              <span className="hx" />
              {t.services.eyebrow}
            </Reveal>
            <Reveal as="h2" d={1} className="sec-title" id="svcTitle">
              {t.services.title}
              <span className="alt">{t.services.titleEn}</span>
            </Reveal>
          </div>
          <Reveal as="p" d={2}>
            {t.services.lead}
          </Reveal>
        </div>

        <div className="trio">
          {t.services.items.map((s, i) => (
            <Reveal key={s.k} d={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <article className="pcard" style={{ ['--hc' as string]: HEX_COLORS[i % 3] }}>
                <div className="pcard-in">
                  <div className="hexicon" aria-hidden="true">
                    {s.k}
                  </div>
                  <div>
                    <h3>
                      {s.t}
                      <span className="alt">{s.en}</span>
                    </h3>
                    <p>{s.d}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
export function Story({ t, locale, founder }: { t: Dict; locale: Locale; founder?: string }) {
  return (
    <section className="sec story" id="story" aria-labelledby="storyTitle">
      {/* the founder's portrait now occupies the top right, so the seal
          outline that used to live there has been dropped — it read as a
          stray shape crossing the photo */}
      <div className="sec-bg" aria-hidden="true">
        <Parallax className="sbg wash-a" y={-140} scale={0.16} />
        <Parallax className="sbg wash-b" y={70} scale={0.1} />
      </div>

      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal as="p" className="eyebrow">
              <span className="hx" />
              {t.story.eyebrow}
            </Reveal>
            <Reveal as="h2" d={1} className="sec-title" id="storyTitle">
              {t.story.title}
              <span className="alt">{t.story.titleEn}</span>
            </Reveal>
          </div>
        </div>

        <div className="story-top">
          <Reveal>
            <figure className="quote">
              <blockquote>{t.story.quote}</blockquote>
              <figcaption>
                {founder ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img className="qface" src={founder} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="av" aria-hidden="true">
                    A
                  </span>
                )}
                <span>
                  <b>{t.story.who}</b>
                  <span>{t.story.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>

          {founder ? (
            <Reveal d={1}>
              <figure className="story-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={founder} alt={`${t.story.who} — ${t.story.role}`} loading="lazy" decoding="async" />
                <figcaption>{t.story.photoCaption}</figcaption>
              </figure>
            </Reveal>
          ) : null}
        </div>

        <Reveal as="p" d={1} className="story-body">
          {t.story.body}
        </Reveal>

        <Reveal d={2} style={{ marginTop: 22 }}>
          <a className="btn btn-g" href={`/${locale}/about`}>
            <span>
              {t.story.teamCta}
              <Arrow />
            </span>
          </a>
        </Reveal>

        <div className="trio" style={{ marginTop: 'clamp(30px,4vw,56px)' }}>
          {t.story.values.map((v, i) => (
            <Reveal key={v.t} d={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <article className="pcard" style={{ ['--hc' as string]: HEX_COLORS[(i + 1) % 3] }}>
                <div className="pcard-in">
                  <div className="hexicon" aria-hidden="true">
                    ◆
                  </div>
                  <div>
                    <h3>
                      {v.t}
                      <span className="alt">{v.en}</span>
                    </h3>
                    <p>{v.d}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
export function Contact({ t }: { t: Dict }) {
  return (
    <section className="sec" id="contact" aria-labelledby="contactTitle">
      <div className="wrap">
        <Reveal>
          <div className="band">
            <Parallax className="band-px" y={-64} x={30} />
            <div>
              <p
                className="eyebrow"
                style={{ color: 'rgba(255,246,240,.72)', marginBottom: 12 }}
              >
                <span className="hx" style={{ background: '#FFF6F0' }} />
                {t.contact.eyebrow}
              </p>
              <h2 id="contactTitle">{t.contact.title}</h2>
              <p>{t.contact.body}</p>
            </div>
            <div className="band-acts">
              <a className="btn" href={`mailto:${SOCIAL.email}`}>
                <span>
                  {t.contact.email}
                  <Arrow />
                </span>
              </a>
              <a
                className="btn ghost"
                href={SOCIAL.discord}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t.contact.community}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
