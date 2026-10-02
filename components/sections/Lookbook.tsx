import { Photo } from '@/components/media/Photo'
import { Focus } from '@/components/motion/Focus'
import { SectionHead } from '@/components/ui/SectionHead'
import { lookbook } from '@/content/copy'

/** Offsets that stagger the four portraits down the grid on wide screens. */
const OFFSET = ['md:mt-0', 'md:mt-24', 'md:mt-8', 'md:mt-32']

/** An editorial strip: four portraits, captioned like plates in a notebook. */
export function Lookbook() {
  return (
    <section aria-labelledby="lookbook-title" className="shell py-24 md:py-40">
      <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-[1fr_auto] md:items-end">
        <SectionHead id="lookbook-title" label={lookbook.label} title={[...lookbook.title]} />
        <Focus index={2}>
          <p className="max-w-[36ch] text-[15px] leading-[1.65] text-ink-2">{lookbook.blurb}</p>
        </Focus>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
        {lookbook.shots.map((shot, i) => (
          <li key={shot.photo} className={OFFSET[i]}>
            <Focus index={i}>
              <figure className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-[4px]" data-cursor="magnify">
                  <Photo photo={shot.photo} ratio="3 / 4" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <figcaption className="flex gap-3">
                  <span className="label text-accent-text">Pl. {String(i + 2).padStart(2, '0')}</span>
                  <span className="label text-ink-3">{shot.caption}</span>
                </figcaption>
              </figure>
            </Focus>
          </li>
        ))}
      </ul>
    </section>
  )
}
