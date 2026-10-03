import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { ProductCard } from '@/components/catalogue/ProductCard'
import { ProductView } from '@/components/catalogue/ProductView'
import { JsonLd } from '@/components/seo/JsonLd'
import { Focus } from '@/components/motion/Focus'
import { brands } from '@/content/brands'
import { product as copy } from '@/content/copy'
import { photos } from '@/content/photos'
import { getProduct, products, relatedTo } from '@/content/products'
import { productSchema } from '@/lib/structured-data'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProduct((await params).slug)
  if (!p) return {}
  const title = `${brands[p.brand].name} ${p.name}`
  const photo = photos[p.photo]
  return {
    title,
    description: p.description,
    alternates: { canonical: `/catalogue/${p.slug}` },
    openGraph: {
      title,
      description: p.description,
      images: [{ url: `${photo.src}?w=1200&h=630&fit=crop&q=72`, width: 1200, height: 630, alt: photo.alt }],
    },
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const related = relatedTo(slug, 3)

  return (
    <div className="shell pb-28 pt-24 md:pt-32">
      <JsonLd data={productSchema(product)} />
      <ProductView product={product} />

      <section aria-labelledby="related-title" className="mt-28 md:mt-40">
        <Focus>
          <h2 id="related-title" className="mb-8 font-display text-[clamp(40px,5vw,72px)] leading-none">
            {copy.related}
          </h2>
        </Focus>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:gap-4 lg:grid-cols-3">
          {related.map((p, i) => (
            <li key={p.slug}>
              <Suspense>
                <Focus index={i} className="h-full">
                  <ProductCard product={p} />
                </Focus>
              </Suspense>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
