import { Photo } from '@/components/media/Photo'
import { Pill } from '@/components/ui/Pill'
import { notFound } from '@/content/copy'

/** Out of focus — literally: the page that is not there, shown through the wrong lens. */
export default function NotFound() {
  return (
    <div className="relative isolate grid min-h-svh place-items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 scale-110 opacity-50 [filter:blur(18px)] motion-reduce:[filter:blur(18px)]">
        <Photo photo="floating" sizes="100vw" alt="" />
      </div>
      <div className="shell flex flex-col items-center gap-8 py-32 text-center">
        <h1 className="display-italic text-[clamp(96px,16vw,240px)] leading-none">{notFound.title}</h1>
        <p className="max-w-[40ch] text-ink-2">{notFound.blurb}</p>
        <Pill href={notFound.cta.href}>{notFound.cta.label}</Pill>
      </div>
    </div>
  )
}
