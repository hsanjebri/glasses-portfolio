import type { Metadata } from 'next'

import { Focus } from '@/components/motion/Focus'
import { SplitLines } from '@/components/motion/SplitLines'
import { a11y, credits } from '@/content/copy'
import { photos } from '@/content/photos'

export const metadata: Metadata = {
  title: credits.title,
  description: credits.blurb,
  alternates: { canonical: '/credits' },
}

/** Photographers, footage and trademarks — one line each. */
export default function CreditsPage() {
  // One line per photographer, with every photo of theirs used on the site.
  const byAuthor = new Map<string, { url: string; pages: string[] }>()
  for (const p of Object.values(photos)) {
    const entry = byAuthor.get(p.author) ?? { url: p.authorUrl, pages: [] }
    entry.pages.push(p.page)
    byAuthor.set(p.author, entry)
  }
  const authors = [...byAuthor.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'))

  return (
    <div className="shell pb-32 pt-28 md:pt-40">
      <header className="mb-16 flex max-w-[60ch] flex-col gap-6">
        <SplitLines as="h1" immediate lines={[credits.title]} className="font-display text-[clamp(64px,10vw,150px)] leading-[0.9]" />
        <Focus immediate index={1}>
          <p className="text-[16px] leading-[1.65] text-ink-2">{credits.blurb}</p>
        </Focus>
      </header>

      <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {credits.videos.map((v) => (
          <li key={v.href} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
            <span className="label text-ink-3">{v.label}</span>
            <a href={v.href} target="_blank" rel="noreferrer noopener" className="text-ink underline-offset-4 hover:underline">
              {v.author}
              <span className="sr-only"> {a11y.newTab}</span>
            </a>
          </li>
        ))}
        {authors.map(([name, { url, pages }]) => (
          <li key={name} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
            <a href={`${url}?utm_source=regard&utm_medium=referral`} target="_blank" rel="noreferrer noopener" className="text-ink underline-offset-4 hover:underline">
              {name}
              <span className="sr-only"> {a11y.newTab}</span>
            </a>
            <span className="label tnum text-ink-3">
              {pages.length} {credits.photoBy.toLowerCase()}
              {pages.length > 1 ? 's' : ''} {credits.on}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-[60ch] text-[14px] leading-[1.6] text-ink-3">{credits.logos}</p>
    </div>
  )
}
