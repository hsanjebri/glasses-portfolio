import Link from 'next/link'

import { Focus } from '@/components/motion/Focus'
import { FitWord } from '@/components/ui/FitWord'
import { a11y, footer } from '@/content/copy'
import { site } from '@/content/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer aria-label={a11y.footerLabel} className="relative overflow-hidden border-t border-line bg-bg pt-20 text-ink md:pt-28">
      <div className="shell grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="max-w-[28ch] font-display text-[28px] leading-[1.1] text-ink">{site.tagline}.</p>
          <address className="label not-italic leading-[1.9] text-ink-3">
            {site.address.line1}
            <br />
            {site.address.city}
            <br />
            <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-ink">
              {site.phone}
            </a>
          </address>
        </div>

        {footer.columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="label mb-5 font-mono text-ink-3">{col.title}</h2>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-ink-2 transition-colors duration-300 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="label mb-5 font-mono text-ink-3">{footer.socialsLabel}</h2>
          <ul className="flex flex-col gap-3">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[15px] text-ink-2 transition-colors duration-300 hover:text-ink"
                >
                  {s.label}
                  <span className="sr-only"> {a11y.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="shell mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
        <p className="label text-ink-3">
          © {year} {site.brand.name}. {footer.rights}
        </p>
        <p className="label text-ink-3">{site.coordinates}</p>
      </div>

      <Focus className="shell mt-10 select-none pb-4 text-ink">
        <FitWord />
      </Focus>
    </footer>
  )
}
