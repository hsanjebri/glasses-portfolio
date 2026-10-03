import { brands } from '@/content/brands'
import { labels } from '@/content/copy'
import { photos } from '@/content/photos'
import { priceBounds } from '@/content/products'
import { brandWord, formatPrice, site } from '@/content/site'
import type { Product } from '@/content/types'

/** The shop, as an Optician — name, address, position, hours, phone. */
export function opticianSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Optician',
    '@id': `${site.url}/#shop`,
    name: site.brand.full,
    alternateName: brandWord,
    description: site.summary,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    telephone: site.phone,
    priceRange: `${formatPrice(priceBounds.min)} – ${formatPrice(priceBounds.max)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.line1,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
    hasMap: site.mapsUrl,
    openingHoursSpecification: site.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.dayOfWeek}`,
        opens: h.opens,
        closes: h.closes,
      })),
    sameAs: site.socials.map((s) => s.href),
  }
}

/** One product: brand, reference, photo, price in TND, sold in the shop. */
export function productSchema(p: Product) {
  const photo = photos[p.photo]
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brands[p.brand].name} ${p.name}`,
    brand: { '@type': 'Brand', name: brands[p.brand].name },
    sku: p.reference ?? p.slug,
    category: labels[p.category],
    description: p.description,
    image: [`${photo.src}?w=1200&q=72&auto=format`],
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'TND',
      availability: 'https://schema.org/InStoreOnly',
      url: `${site.url}/catalogue/${p.slug}`,
      seller: { '@id': `${site.url}/#shop` },
    },
  }
}
