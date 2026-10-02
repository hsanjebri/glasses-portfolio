import { site } from '@/content/site'

/** The brand word with its last syllable set in italic. Copy comes from site.ts. */
export function BrandWord({ className = '' }: { className?: string }) {
  const [roman, italic] = site.brand.display
  return (
    <span className={className}>
      {roman}
      <em className="display-italic">{italic}</em>
    </span>
  )
}

/** The two-circle mark: a pair of lenses, nothing else. */
export function BrandMark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 40 20"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="30" cy="10" r="7.5" />
      <path d="M17.5 9.5q2.5-2 5 0" />
    </svg>
  )
}
