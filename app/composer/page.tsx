import type { Metadata } from 'next'

import { Builder } from '@/components/builder/Builder'
import { builder } from '@/content/copy'

export const metadata: Metadata = {
  title: builder.title,
  description: builder.blurb,
  alternates: { canonical: '/composer' },
}

export default function BuildPage() {
  return <Builder />
}
