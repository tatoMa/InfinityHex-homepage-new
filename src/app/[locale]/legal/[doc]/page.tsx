import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { legal, legalDocs, type LegalDoc } from '@/content/legal'
import { isLocale, locales, type Locale } from '@/i18n/config'
import { getDict } from '@/i18n/dict'

export function generateStaticParams() {
  return locales.flatMap((locale) => legalDocs.map((doc) => ({ locale, doc })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>
}): Promise<Metadata> {
  const { locale, doc } = await params
  if (!isLocale(locale) || !(legalDocs as readonly string[]).includes(doc)) return {}
  return { title: `${legal[locale][doc as LegalDoc].title} · Infinity Hex Games` }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>
}) {
  const { locale, doc } = await params
  if (!isLocale(locale) || !(legalDocs as readonly string[]).includes(doc)) notFound()
  const l = locale as Locale
  const t = getDict(l)
  const d = legal[l][doc as LegalDoc]

  return (
    <article className="legal">
      <div className="wrap">
        <p style={{ marginBottom: 20 }}>
          <Link className="btn btn-g btn-sm" href={`/${l}`}>
            <span>← {t.legal.back}</span>
          </Link>
        </p>
        <h1>{d.title}</h1>
        <p className="updated">
          {t.legal.updated}：{d.updated}
        </p>
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
      </div>
    </article>
  )
}
