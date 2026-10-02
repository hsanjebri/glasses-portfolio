import type { Metadata } from 'next'

import { Catalogue } from '@/components/catalogue/Catalogue'
import { catalogue } from '@/content/copy'

export const metadata: Metadata = {
  title: catalogue.title,
  description: catalogue.blurb,
  alternates: { canonical: '/catalogue' },
}

/**
 * Rendered per request: reading the search params here means the filtered
 * grid is in the server HTML, not filled in after hydration.
 */
export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await searchParams
  return <Catalogue />
}
