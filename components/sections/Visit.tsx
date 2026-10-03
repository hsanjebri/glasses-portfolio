import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { SectionHead } from '@/components/ui/SectionHead'
import { a11y, visit } from '@/content/copy'
import { hoursLabel, site } from '@/content/site'

import { BookingForm } from './BookingForm'

export function Visit() {
  return (
    <section id="visite" aria-labelledby="visit-title" className="shell scroll-mt-20 py-24 md:py-40">
      <SectionHead id="visit-title" label={visit.label} title={[visit.title]} blurb={visit.blurb} className="mb-14 md:mb-20" />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Focus className="grid grid-cols-[1.4fr_1fr] gap-4">
            <div className="overflow-hidden rounded-[4px]" data-cursor="magnify">
              <Photo photo="door" ratio="3 / 4" sizes="(max-width: 1024px) 58vw, 32vw" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-[4px]" data-cursor="magnify">
                <Photo photo="port" ratio="1 / 1" sizes="(max-width: 1024px) 40vw, 22vw" />
              </div>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="label group mt-auto flex items-center justify-between gap-3 border-t border-line-strong pt-4 text-ink transition-colors hover:text-accent-text"
              >
                {visit.mapsLabel}
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
                  ↗
                </span>
                <span className="sr-only">{a11y.newTab}</span>
              </a>
            </div>
          </Focus>

          <Focus index={1} className="grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="label mb-3 font-mono text-ink-3">{visit.addressLabel}</h3>
                <address className="not-italic leading-[1.7] text-ink">
                  {site.address.line1}
                  <br />
                  {site.address.district}
                  <br />
                  {site.address.city}, {site.address.country}
                </address>
              </div>
              <div>
                <h3 className="label mb-3 font-mono text-ink-3">{visit.phoneLabel}</h3>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="tnum border-b border-line-strong pb-0.5 text-ink transition-colors hover:border-ink">
                  {site.phone}
                </a>
              </div>
            </div>
            <div>
              <h3 className="label mb-3 font-mono text-ink-3">{visit.hoursLabel}</h3>
              <table className="w-full text-[14px]">
                <caption className="sr-only">{visit.hoursLabel}</caption>
                <tbody>
                  {site.hours.map((h) => (
                    <tr key={h.day} className="border-b border-line last:border-0">
                      <th scope="row" className="py-2 text-left font-normal text-ink-2">
                        {h.day}
                      </th>
                      <td className={`tnum py-2 text-right ${h.opens ? 'text-ink' : 'text-ink-3'}`}>{hoursLabel(h) ?? visit.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Focus>
        </div>

        <Focus index={2} className="rounded-[4px] border border-line bg-paper p-5 sm:p-8 md:p-10">
          <BookingForm />
        </Focus>
      </div>
    </section>
  )
}
