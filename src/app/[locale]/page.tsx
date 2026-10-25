import { notFound } from 'next/navigation'
import Hero, { type HeroStat } from '@/components/hero/Hero'
import Catalogue from '@/components/sections/Catalogue'
import GameGrid from '@/components/sections/GameGrid'
import Partners, { type Partner } from '@/components/sections/Partners'
import Process from '@/components/sections/Process'
import History from '@/components/sections/History'
import HexWipe from '@/components/sections/HexWipe'
import DiceRail from '@/components/sections/DiceRail'
import { Contact, Services, Story } from '@/components/sections/Blocks'
import { getAllGames, getTotals, shortMoney } from '@/lib/games'
import { getMilestones } from '@/lib/milestones'
import { getFounder } from '@/lib/team'
import { resolveAsset } from '@/lib/asset'
import { placeholderCover } from '@/lib/cover'
import { isLocale, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'
import partnersData from '../../../content/partners.json'

const PAPER = '#F8F3E9'
const PAPER_HI = '#FDFAF3'
const INK = '#16181F'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const l = locale as Locale
  const t = getDict(l)
  const games = await getAllGames()
  const totals = await getTotals()
  const milestones = await getMilestones()
  const founder = getFounder()

  const money = shortMoney(totals.raised, totals.currency, l)
  const heroStats: HeroStat[] = [
    { key: 'raised',  n: money.n,        decimals: money.decimals, suffix: money.suffix,
      label: t.stats.raised.label,  sub: t.stats.raised.sub },
    { key: 'backers', n: totals.backers, decimals: 0, suffix: '',
      label: t.stats.backers.label, sub: t.stats.backers.sub },
    { key: 'stretch', n: totals.stretch, decimals: 0, suffix: '',
      label: t.stats.stretch.label, sub: t.stats.stretch.sub },
    { key: 'response', n: t.stats.response.n, decimals: 0, suffix: t.stats.response.suffix,
      label: t.stats.response.label, sub: t.stats.response.sub },
  ]

  const withCover = games.map((g, i) => ({
    ...g,
    resolvedCover:
      g.cover?.[l] ??
      placeholderCover({
        title: g.title[l],
        subtitle: l === 'zh' ? g.title.en : '',
        tag: g.tags[l].join(' · '),
        color: g.color,
        index: i,
      }),
  }))

  const fanItems = withCover.map((g) => ({
    slug: g.slug,
    title: g.title[l],
    sub: g.tags[l].join(' · '),
    tag: g.tags[l].join(' · '),
    cover: g.resolvedCover,
  }))

  const tiles = withCover.map((g) => ({
    slug: g.slug,
    title: g.title[l],
    cover: g.resolvedCover,
    href: `/${l}/games/${g.slug}`,
  }))

  // placeholder art is swapped by dropping a file in, not by editing JSON
  const partners = (partnersData as Partner[]).map((p) => ({ ...p, logo: resolveAsset(p.logo) }))

  return (
    <>
      {/* one pip per anchored section, in document order */}
      <DiceRail
        ids={[
          'top',
          'catalogue',
          'games',
          'process',
          'services',
          'history',
          'partners',
          'story',
          'contact',
        ]}
        total={9}
      />

      <Hero t={t} locale={l} items={fanItems} stats={heroStats} titles={totals.titles} campaigns={totals.campaigns} />

      <HexWipe from={PAPER} to={INK} dir="ltr" piece="meeple" />

      <Catalogue
        tiles={tiles}
        eyebrow={t.games.eyebrow}
        title={t.games.title}
        titleAlt={t.games.titleEn}
        lead={t.games.lead}
        cta={t.games.all}
        ctaHref="#games"
      />

      <HexWipe from={INK} to={PAPER} dir="rtl" piece="die" />

      <GameGrid games={games} locale={l} t={t} />

      <HexWipe from={PAPER} to={PAPER_HI} dir="center" rod="#C8352B" piece="meeple" />

      <div className="tint">
        <Process t={t} />
        <Services t={t} />
      </div>

      <HexWipe from={PAPER_HI} to={INK} dir="rtl" piece="hourglass" />

      <History t={t} locale={l} items={milestones} />

      <HexWipe from={INK} to={PAPER_HI} dir="center" rod="#D9A441" piece="card" />

      <div className="tint">
        <Partners
          partners={partners}
          locale={l}
          eyebrow={t.partners.eyebrow}
          title={t.partners.title}
          titleAlt={t.partners.titleEn}
          lead={t.partners.lead}
          cta={t.partners.cta}
          note={t.partners.note}
        />
      </div>

      <HexWipe from={PAPER_HI} to={PAPER} dir="rtl" piece="die" />

      <Story t={t} locale={l} founder={founder?.photo} />
      <Contact t={t} />
    </>
  )
}
